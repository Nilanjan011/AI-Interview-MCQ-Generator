from flask import Blueprint, request, jsonify, render_template, send_from_directory
from werkzeug.security import generate_password_hash, check_password_hash
from flask_mail import Message
from . import mail, db
from app.helper import allowed_file
from werkzeug.utils import secure_filename
import datetime
import jwt
from config import Config
from bson.objectid import ObjectId
import PyPDF2
import docx
import os
import google.generativeai as genai

GEMINI_API_KEY = "AIzaSyCKACTJxdIKFvDeRzQW4nHmbwYqKiDWXp0"

admin = Blueprint('admin', __name__)

@admin.route('/api/admin/login', methods=['POST'])
def login():
    """
    Handles the admin login request.
    Authenticates credentials against hardcoded values.
    """
    # Get the JSON data from the request body
    data = request.get_json()

    # Basic validation to ensure data is present
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({"message": "Email and password are required"}), 400

    email = data.get('email')
    password = data.get('password')

    # --- Authentication Logic ---
    # Check if the provided credentials match the hardcoded admin credentials.
    user = db['users'].find_one({'email': email})
    if user and check_password_hash(user['password'], password):
        token_payload = {
            "user_id": str(user["_id"]),
            "exp": datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(hours=1)
        }
        
        token = jwt.encode(token_payload, Config.SECRET_KEY, algorithm='HS256')
        return jsonify({'message': 'Login successful', "token": token}), 200
    return jsonify({'message': 'Invalid email or password'}), 401



@admin.route('/api/admin/jobs', methods=['POST'])
def create_job():
    """
    Creates a new job posting and stores it in the database.
    """
    # Get data from the request
    data = request.get_json()

    # --- Basic Server-Side Validation ---
    if not data or not data.get('title') or not data.get('description') or not data.get('date'):
        return jsonify({"message": "Missing required fields: title, description, date"}), 400
    
    title = data.get('title')
    description = data.get('description')
    date = data.get('date')

    # You can add more robust validation here if needed
    if len(title) < 3:
        return jsonify({"message": "Title must be at least 3 characters long"}), 400
    
    # --- Create Job Document ---
    new_job = {
        "title": title,
        "description": description,
        "posting_date": date,
        # You could add more fields like status, department, etc.
        "status": "Open" 
    }

    try:
        # Insert the new job document into the 'jobs' collection
        result = db.jobs.insert_one(new_job)
        
        # Check if insert was successful
        if result.inserted_id:
            return jsonify({
                "message": "Job created successfully",
                "job_id": str(result.inserted_id) # Convert ObjectId to string for JSON
            }), 201 # 201 Created status code
        else:
            return jsonify({"message": "Failed to create job"}), 500

    except Exception as e:
        print(f"Error inserting job into database: {e}")
        return jsonify({"message": "An internal server error occurred"}), 500
    
@admin.route('/api/admin/jobs/<job_id>', methods=['PUT'])
def update_job(job_id):
    """
    Updates an existing job posting in the database.
    """
    # Get data from the request
    data = request.get_json()

    # Basic validation
    if not data or not data.get('title') or not data.get('description') or not data.get('date'):
        return jsonify({"message": "Missing required fields: title, description, date"}), 400

    title = data.get('title')
    description = data.get('description')
    date = data.get('date')

    if len(title) < 3:
        return jsonify({"message": "Title must be at least 3 characters long"}), 400

    # Prepare the updated data
    updated_job = {
        "title": title,
        "description": description,
        "posting_date": date
    }

    try:
        # Convert job_id to ObjectId
        job_object_id = ObjectId(job_id)

        # Perform the update
        result = db.jobs.update_one(
            {"_id": job_object_id},
            {"$set": updated_job}
        )

        # Check if any document was modified
        if result.matched_count == 0:
            return jsonify({"message": "Job not found"}), 404

        return jsonify({"message": "Job updated successfully"}), 200

    except Exception as e:
        print(f"Error updating job in database: {e}")
        return jsonify({"message": "An internal server error occurred"}), 500


@admin.route('/api/admin/jobs')
def getJobs():
    try:
        jobs_cursor = db.jobs.find()
        jobs = []
        for job in jobs_cursor:
            job['_id'] = str(job['_id'])  # Convert ObjectId to string
            jobs.append(job)

        if not jobs:
            # If no jobs found, return a placeholder
            return jsonify([{ "message": "No jobs available"}]), 404

        return jsonify(jobs)
    except Exception as e:
        print(f"Error inserting job into database: {e}")
        return jsonify({"message": "An internal server error occurred"}), 500
    
    


@admin.route("/api/admin/jobs/<job_id>", methods=["DELETE"])
def delete_job(job_id):
    try:
        result = db.jobs.delete_one({"_id": ObjectId(job_id)})
        
        if result.deleted_count == 1:
            return jsonify({"message": "Job deleted successfully", "job_id": job_id}), 200
        else:
            return jsonify({"message": "Job not found", "job_id": job_id}), 404

    except Exception as e:
        return jsonify({"error": str(e)}), 400

@admin.route("/api/admin/jobs/<job_id>")
def get_job(job_id):
    try:
        job = db.jobs.find_one({"_id": ObjectId(job_id)})

        if job:
            job['_id'] = str(job['_id'])
            job['date'] = job['posting_date']
            return jsonify({"message": "Job deleted successfully", "job": job}), 200
        else:
            return jsonify({"message": "Job not found", "job_id": job_id}), 404

    except Exception as e:
        return jsonify({"error": str(e)}), 400
    




def extract_text_from_pdf(file_stream):
    """Extracts text from a PDF file stream."""
    reader = PyPDF2.PdfReader(file_stream)
    text = ""
    for page in reader.pages:
        text += page.extract_text()
    return text

def extract_text_from_docx(file_stream):
    """Extracts text from a DOCX file stream."""
    doc = docx.Document(file_stream)
    text = "\n".join([para.text for para in doc.paragraphs])
    return text

@admin.route('/api/generate-mcqs', methods=['POST'])
def generate_mcqs():
    # Configure the Gemini API
    genai.configure(api_key=GEMINI_API_KEY)
    # model = genai.GenerativeModel('gemini-1.5-flash-latest')
    model = genai.GenerativeModel('gemini-2.5-flash')
    
    if 'resume' not in request.files:
        return jsonify({"error": "No resume file provided"}), 400

    job_description = request.form.get('jobDescription', '')
    resume_file = request.files['resume']
    resume_text = ""

    if resume_file.filename.endswith('.pdf'):
        resume_text = extract_text_from_pdf(resume_file.stream)
    elif resume_file.filename.endswith('.docx'):
        resume_text = extract_text_from_docx(resume_file.stream)
    else:
        return jsonify({"error": "Unsupported file format. Please upload PDF or DOCX."}), 400

    if not resume_text or not job_description:
        return jsonify({"error": "Missing resume content or job description"}), 400
    
    # --- AI Prompt Engineering ---
    # prompt = f"""
    # As an expert AI hiring assistant, your task is to generate 10 to 15 interview-style multiple-choice questions (MCQs).
    # Analyze the provided job description and the candidate's resume.
    # Identify the key skills and requirements in the job description that are either MISSING or WEAKLY represented in the candidate's resume.
    # The questions should be designed to test the candidate's knowledge and job description on these specific gap areas. Also take candidate's name, phone number, total experience and email

    # **Job Description:**
    # ---
    # {job_description}
    # ---

    # **Candidate's Resume:**
    # ---
    # {resume_text}
    # ---

    # **Instructions:**
    # 1.  Generate 10 technical or situational MCQs.
    # 2.  For each question, provide 4 options (A, B, C, D).
    # 3.  Indicate the correct answer.
    # 4.  Provide a brief explanation for why the correct answer is right.
    # 5.  Take candidate name, email, phone number from Resume and attach json resonse.
    # 6.  Return the output ONLY as a valid JSON array of objects. Do not include any other text or markdown formatting before or after the JSON.

    # **JSON Output Format Example:**
    # [ 
    #     {{
    #         "candidate_name": "John Doe",
    #         "email": "john.doe@example.com",
    #         "phone": "1234567890",
    #         "total_experience":
    #     }},
    #   {{
    #         "question": "What is the primary advantage of using a microservices architecture?",
    #         "options": {{
    #         "A": "Simplified deployment process",
    #         "B": "Reduced network latency",
    #         "C": "Increased fault tolerance and scalability",
    #         "D": "Lower development costs"
    #         }},
    #         "correct_answer": "C",
    #         "explanation": "Microservices allow individual services to be scaled and deployed independently, increasing the overall system's fault tolerance and scalability."
    #    }}
    # ]
    # """

    # Replace the old prompt variable with this new one

    prompt = f"""
    As an expert AI hiring assistant, your task is to generate 15 interview-style multiple-choice questions (MCQs).

    **Step 1: Analyze the Candidate**
    First, read the candidate's resume to determine the following:
    - Candidate's full name.
    - Candidate's email address.s
    - Candidate's phone number.
    - Total years of professional experience.
    - Experience Level: Classify the candidate as 'Beginner' (0-2 years), 'Medium' (2-4 years), or 'Senior ' (4+ years).

    **Step 2: Analyze the Skill Gap**
    Next, compare the resume against the job description. Identify key skills, technologies, or responsibilities mentioned in the job description that are either MISSING or WEAKLY represented in the resume.

    **Step 3: Generate Questions**
    Based on the skill gaps and the candidate's Experience Level identified in Step 1, generate 15 to 20 multiple-choice questions (MCQs).
    - For 'Beginner' level, ask fundamental, coding question, definition-based questions.
    - For 'Medium' level, ask practical application, coding question, system designer and scenario-based questions.
    - For 'Senior ' level, ask complex, strategic, coding question, system designer and architectural questions.

    **Context:**
    ---
    **Job Description:**
    {job_description}
    ---
    **Candidate's Resume:**
    {resume_text}
    ---

    **Output Instructions:**
    Return a single, valid JSON object. Do NOT include any other text or markdown formatting (like ```json). The JSON object must contain the candidate's details and a list of the generated questions.

    **JSON Output Format Example:**
    {{
    "candidate_details": {{
        "name": "Priya Sharma",
        "email": "priya.sharma@example.com",
        "phone": "9876543210",
        "total_experience": "4 years",
        "experience_level": "Senior"
    }},
    "questions": [
        {{
        "question": "In a microservices architecture, what is the primary role of an API Gateway?",
        "options": {{
            "A": "To directly handle business logic for each service",
            "B": "To act as a single entry point, handling routing, authentication, and rate limiting",
            "C": "To store and manage data for all microservices",
            "D": "To replace the need for service discovery"
        }},
        "correct_answer": "B",
        "explanation": "An API Gateway is a crucial component that abstracts the backend services and provides a unified, secure interface for clients."
        }}
    ]
    }}
    """

    try:
        response = model.generate_content(prompt)
        # Clean up the response to ensure it's valid JSON
        clean_response = response.text.strip().replace("```json", "").replace("```", "")
        return clean_response, 200, {'Content-Type': 'application/json'}

    except Exception as e:
        return jsonify({"error": f"An error occurred with the AI model: {str(e)}"}), 500


# Add this code to your existing app.py file

@admin.route('/api/save-results', methods=['POST'])
def save_results():
    """Receives candidate results and saves them to the database."""
    try:
        data = request.get_json()
        
        # --- Database Logic Placeholder ---
        # In a real application, you would use something like SQLAlchemy or a direct DB connection
        # to save this data into a 'results' table.

        db.results.insert_one({
            "jobId": data.get("jobId"),
            "name":data.get('name'),
            "email":data.get('email'),
            "phone":data.get('phone'),
            "score": data.get('score'),
            "totalQuestions": data.get('totalQuestions')
        })
        
        # You would add your database commit logic here, e.g., db.session.commit()
        
        return jsonify({"message": "Results saved successfully!"}), 200

    except Exception as e:
        # You would add database rollback logic here, e.g., db.session.rollback()
        print(f"Error saving results: {e}")
        return jsonify({"error": "An error occurred while saving results."}), 500