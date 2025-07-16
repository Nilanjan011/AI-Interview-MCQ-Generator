from flask import Blueprint, request, jsonify, render_template, send_from_directory
from werkzeug.security import generate_password_hash, check_password_hash
from flask_mail import Message
from . import mail, db
from app.helper import allowed_file
from werkzeug.utils import secure_filename
import os
from config import Config

main = Blueprint('main', __name__)

@main.route('/users', methods=['POST'])
def create_user():
    data = request.get_json()
    
    # return jsonify({"id": str(user.id)}), 201

@main.route('/users', methods=['GET'])
def list_users():
    pass
    # return jsonify([{"name": u.name, "email": u.email, "age": u.age} for u in users])

@main.route('/mail')
def send_mail():
    recipient = "nilanjan.chakraborty@codeclouds.in"
    name = "Nilanjan Chakraborty"
    # return render_template('email/welcome.html', name=name)

    msg = Message(
        subject='Welcome to Flask App!',
        recipients=[recipient],
        html = render_template('email/welcome.html', name=name)
    )

    try:
        mail.send(msg)
        return jsonify({'message': 'Welcome email sent successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
@main.route('/')
def home():
    users = list(db["users"].find({}, {'_id': 0}))  # Exclude _id if not needed
    return render_template('page/index.html', users=users)




@main.route('/upload/<user_id>', methods=['POST'])
def upload_file(user_id):
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No file selected"}), 400
    if not allowed_file(file.filename):
        return jsonify({"error": "File type not allowed"}), 400
    
    filename = secure_filename(file.filename)
    file.save(os.path.join(Config.UPLOAD_FOLDER, filename))
    

    # db["users"].update_one(
    #     {"_id": ObjectId(user_id)},
    #     {"$set": {"profile_pic": "/uploads/"+filename}}
    # )

    return jsonify({"message": "file upload successfully"}), 200


@main.route('/uploads/<filename>')
def uploaded_file(filename):
    BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
    UPLOAD_FOLDER = os.path.join(BASE_DIR, Config.UPLOAD_FOLDER)
    return send_from_directory(UPLOAD_FOLDER, filename)


@main.route('/user', methods=["post"])
def add_user():
    data = request.get_json()
    data['password'] = generate_password_hash(data['password'])
    result = {}
    # return jsonify({"message": "Data inserted", "id": str(result.inserted_id)}), 201
