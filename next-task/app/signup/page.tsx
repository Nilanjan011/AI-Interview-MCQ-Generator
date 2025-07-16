"use client"

import { useState } from "react";

export default function SignUp() {
    const [form, setForm] = useState({
        name: "",
        email: "",
        
        password: "",
        confirmPassword: "",
    });

    const [errors, setErrors] = useState({ 
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
    });
    const [submitted, setSubmitted] = useState(false);

    // Basic email regex for demonstration
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const validate = () => {
        const newErrors:any = {};

        if (!form.name.trim()) newErrors.name = "Name is required.";
        if (!form.email) newErrors.email = "Email is required.";
        else if (!emailPattern.test(form.email)) newErrors.email = "Invalid email address.";
        if (!form.password) newErrors.password = "Password is required.";
        else if (form.password.length < 6) newErrors.password = "Password must be at least 6 characters.";
        if (!form.confirmPassword) newErrors.confirmPassword = "Please confirm your password.";
        else if (form.password !== form.confirmPassword) newErrors.confirmPassword = "Passwords do not match.";

        return newErrors;
    };

    const handleChange = (e:React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e:React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const validationErrors = validate();
        setErrors(validationErrors);

        if (Object.keys(validationErrors).length === 0) {
            // Submit form logic here (API call, etc.)
            
            setSubmitted(true);
        } else {
            setSubmitted(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="bg-gray-700 p-8 rounded-lg shadow-md w-full max-w-md">
                <h2 className="text-2xl font-bold mb-6 text-gray-500 text-center">Create an Account</h2>
                <form className="space-y-5" onSubmit={handleSubmit} noValidate>
                    <div>
                        <label className="block text-gray-700 mb-1" htmlFor="name">Name</label>
                        <input
                            id="name"
                            name="name"
                            type="text"
                            value={form.name}
                            onChange={handleChange}
                            className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.name ? "border-red-500" : ""}`}
                        />
                        {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                    </div>
                    <div>
                        <label className="block text-gray-700 mb-1" htmlFor="email">Email</label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            value={form.email}
                            onChange={handleChange}
                            className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.email ? "border-red-500" : ""}`}
                        />
                        {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                    </div>
                    <div>
                        <label className="block text-gray-700 mb-1" htmlFor="password">Password</label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            value={form.password}
                            onChange={handleChange}
                            className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.password ? "border-red-500" : ""}`}
                        />
                        {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                    </div>
                    <div>
                        <label className="block text-gray-700 mb-1" htmlFor="confirmPassword">Confirm Password</label>
                        <input
                            id="confirmPassword"
                            name="confirmPassword"
                            type="password"
                            value={form.confirmPassword}
                            onChange={handleChange}
                            className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.confirmPassword ? "border-red-500" : ""}`}
                        />
                        {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
                    </div>
                    <button
                        type="submit"
                        className="w-full cursor-pointer bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
                    >
                        Sign Up
                    </button>
                </form>
                {submitted && (
                    <p className="mt-4 text-green-600 text-center">Sign up successful!</p>
                )}
                <p className="mt-4 text-center text-sm text-gray-600">
                    Already have an account? <a href="/login" className="text-blue-600 hover:underline">Log in</a>
                </p>
            </div>
        </div>
    );
}
