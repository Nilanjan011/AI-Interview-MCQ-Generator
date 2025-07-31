'use client'

import React, { useState, ChangeEvent, FormEvent, useEffect } from 'react';
import axios from 'axios';
import { endpoint } from '@/hepler/endpoint';
import {  useParams } from 'next/navigation';

// Define an interface for the structure of a single MCQ object
interface MCQ {
    question: string;
    options: { [key: string]: string }; // e.g., { A: 'Answer 1', B: 'Answer 2' }
    correct_answer: string;
    explanation: string;
}

const MCQGeneratorPage = () => {
    // State variables with explicit types
    const [jobDescription, setJobDescription] = useState<string>('');
    const [resumeFile, setResumeFile] = useState<File | null>(null);
    const [mcqs, setMcqs] = useState<MCQ[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: string }>({});
    const [userDetails, setUserDetails] = useState<{ [key: string]: string }>({});
    const [showResults, setShowResults] = useState<boolean>(false);
    const params = useParams();
    const jobId = params.id as string; // Ensure jobId is treated as a string

    useEffect(() => {
       fetch(endpoint.jobs + '/' + jobId)
        .then(res => res.json())
        .then(res => setJobDescription(res.job.description))
    }, [])

    // Event handler with typed event object
    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setResumeFile(e.target.files[0]);
        }
    };

    // --- NEW: Function to calculate score and save results ---
    const handleCheckAnswers = async () => {
        // 1. Calculate the score
        let correctCount = 0;
        mcqs.forEach((mcq, index) => {
            if (selectedAnswers[index] === mcq.correct_answer) {
                correctCount++;
            }
        });

        // 2. Prepare data for the backend
        const resultData = {
            jobId: jobId,
            name: userDetails.name,
            email: userDetails.email,
            phone: userDetails.phone,
            score: correctCount,
            totalQuestions: mcqs.length
        };
        
        // 3. Post data to the new backend endpoint
        try {
            await axios.post(endpoint.saveResult, resultData);
        } catch (err) {
            console.error("Could not save results:", err);
            // Optionally show an error to the user that results couldn't be saved
        }

        // 4. Show results on the frontend
        setShowResults(true);
    };

    // Form submission handler with typed event object
    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!jobDescription || !resumeFile) {
            setError('Please provide both a job description and a resume file.');
            return;
        }

        setLoading(true);
        setError('');
        setMcqs([]);
        setShowResults(false);
        setSelectedAnswers({});

        const formData = new FormData();
        formData.append('jobDescription', jobDescription);
        formData.append('resume', resumeFile);

        try {
            // Specify the expected response data type with axios
            const response:any = await axios.post<MCQ[]>(endpoint.generateMcqs, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            
            let candidate_details:any = response.data.candidate_details;
            setUserDetails({
                name:candidate_details?.name,
                email: candidate_details?.email,
                phone: candidate_details?.phone,
                total_experience: candidate_details?.total_experience

            })
            
            setMcqs(response.data.questions);
        } catch (err) {
            setError('Failed to generate MCQs. The model might be busy. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Function with typed parameters
    const handleAnswerChange = (questionIndex: number, optionKey: string) => {
        setSelectedAnswers({
            ...selectedAnswers,
            [questionIndex]: optionKey,
        });
    };

    // Function with typed parameters and return type
    const getOptionClassName = (mcq: MCQ, optionKey: string, questionIndex: number): string => {
        if (!showResults) return '';
        if (optionKey === mcq.correct_answer) return 'correct';
        if (selectedAnswers[questionIndex] === optionKey) return 'incorrect';
        return '';
    };

    return (
        <div className="font-sans max-w-4xl mx-auto p-5">
            <h1 className="text-4xl font-bold text-center text-black mb-6">Job Interview MCQ Generator</h1>
            <p className="text-center text-lg text-black mb-8">Paste a job description, upload your resume, and get personalized MCQs to prepare for your interview.</p>

            <form onSubmit={handleSubmit} className="mb-10 p-6 bg-white shadow-lg rounded-lg">
                <div className="mb-6">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="job-description">Job Description</label>
                    <textarea
                        id="job-description"
                        rows={10}
                        className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={jobDescription}
                        readOnly
                        placeholder="Paste the full job description here..."
                    ></textarea>
                </div>
                <div className="mb-6">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="resume-upload">Upload Resume (PDF or DOCX)</label>
                    <input
                        type="file"
                        id="resume-upload"
                        accept=".pdf,.docx"
                        onChange={handleFileChange}
                        className="block w-full text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:shadow-outline transition duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                    {loading ? 'Generating...' : 'Generate MCQs'}
                </button>
            </form>

            {error && <p className="text-red-600 text-center mb-4">{error}</p>}

            {loading && <p className="text-center text-blue-600 text-lg">AI is thinking... Please wait.</p>}

            {mcqs.length > 0 && (
                <div>
                    <h2 className="text-3xl font-bold text-center mb-6">Your Personalized Questions</h2>
                    {mcqs.map((mcq, index) => (
                        <div key={index} className="bg-white shadow-md rounded-lg p-6 mb-6 border border-gray-200">
                            <p className="text-lg font-semibold mb-4"><strong>{index + 1}. {mcq.question}</strong></p>
                            <div className="space-y-3">
                                {Object.entries(mcq.options).map(([key, value]) => (
                                    <div key={key} className={getOptionClassName(mcq, key, index)}>
                                        <input
                                            type="radio"
                                            id={`q${index}-option${key}`}
                                            name={`question-${index}`}
                                            value={key}
                                            checked={selectedAnswers[index] === key}
                                            onChange={() => handleAnswerChange(index, key)}
                                            disabled={showResults}
                                            className="form-radio h-4 w-4 text-blue-600 transition duration-150 ease-in-out cursor-pointer"
                                        />
                                        <label htmlFor={`q${index}-option${key}`} className="ml-3 text-gray-800 cursor-pointer">
                                            <span className="font-medium">{key}:</span> {value}
                                        </label>
                                    </div>
                                ))}
                            </div>
                            {showResults && (
                                <div className="mt-5 p-4 bg-gray-100 rounded-md border border-gray-300">
                                    <p className="text-green-700 font-bold mb-2">Correct Answer: {mcq.correct_answer}</p>
                                    <p className="text-gray-700 italic">Explanation: {mcq.explanation}</p>
                                </div>
                            )}
                        </div>
                    ))}
                    <div className="text-center mt-8">
                        <button
                            onClick={handleCheckAnswers}
                            disabled={showResults}
                            className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg focus:outline-none focus:shadow-outline transition duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Check Answers & Save
                        </button>
                        
                    </div>
                </div>
            )}

            {/* Tailwind CSS classes for results */}
            <style>{`
        .correct { background-color: #d4edda; color: #155724; padding: 5px; border-radius: 0.375rem; }
        .incorrect { background-color: #f8d7da; color: #721c24; padding: 5px; text-decoration: line-through; border-radius: 0.375rem; }
    `}</style>
        </div>
    );
};

export default MCQGeneratorPage;