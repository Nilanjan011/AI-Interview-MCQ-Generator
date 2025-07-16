
"use client";

import { useState, FormEvent } from 'react';
import { z, ZodError } from 'zod';
import { endpoint } from "../../../hepler/endpoint";
import { useRouter } from 'next/navigation';
// Define the schema for form validation using Zod
const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters long" }),
});

type FormData = z.infer<typeof loginSchema>;

export default function AdminLoginPage() {
  // State for form inputs
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
  });

  const router = useRouter();

  // State for form validation errors
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  // State for backend-related errors (e.g., invalid credentials)
  const [serverError, setServerError] = useState<string | null>(null);
  // State for loading status
  const [isLoading, setIsLoading] = useState<boolean>(false);
  // State for successful login
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear the specific field's error when user starts typing
    if (errors[name as keyof FormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
    // Clear server error on new input
    setServerError(null);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});
    setServerError(null);
    setIsSuccess(false);

    // 1. Client-side validation
    const validationResult = loginSchema.safeParse(formData);

    if (!validationResult.success) {
      const fieldErrors = validationResult.error.flatten().fieldErrors;
      const formattedErrors: Partial<Record<keyof FormData, string>> = {};
      
      // Extract the first error message for each field
      for (const key in fieldErrors) {
          const typedKey = key as keyof FormData;
          if (fieldErrors[typedKey]) {
               formattedErrors[typedKey] = fieldErrors[typedKey]![0];
          }
      }
      setErrors(formattedErrors);
      return; // Stop the submission
    }

    // 2. Send data to backend if validation is successful
    setIsLoading(true);
    try {
      const response = await fetch(endpoint.adminLogin, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(validationResult.data), // Use validated data
      });

      const result = await response.json();

      if (!response.ok) {
        
        // Handle HTTP errors (e.g., 401, 500)
        setServerError(result.message || 'An unexpected error occurred.');
      } else {
        // Handle success
        setIsSuccess(true);
        setServerError(null);
        console.log('Login successful:', result);
        // In a real app, you would redirect the user or store the auth token
        router.push('/admin');
      }
    } catch (error) {
      // Handle network errors
      setServerError('Failed to connect to the server. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Admin Login</h1>
          <p className="mt-2 text-sm text-gray-600">Access your admin dashboard</p>
        </div>

        {isSuccess && (
          <div className="p-4 text-sm text-green-700 bg-green-100 border border-green-400 rounded-lg">
            Login successful! Redirecting...
          </div>
        )}

        {serverError && (
          <div className="p-4 text-sm text-red-700 bg-red-100 border border-red-400 rounded-lg">
            {serverError}
          </div>
        )}

        <form className="space-y-6" onSubmit={handleSubmit} noValidate>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email Address
            </label>
            <div className="mt-1">
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 ${
                  errors.email ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-indigo-500'
                }`}
              />
              {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <div className="mt-1">
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={formData.password}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 ${
                  errors.password ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-indigo-500'
                }`}
              />
              {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password}</p>}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 disabled:cursor-not-allowed cursor-pointer"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
