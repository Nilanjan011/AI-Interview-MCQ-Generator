// File: app/admin/jobs/create/page.tsx

"use client";

import { useState, FormEvent } from 'react';
import { LayoutDashboard, Briefcase, Users, Settings, ChevronLeft, Menu } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { z, ZodError } from 'zod';
import { endpoint } from '@/hepler/endpoint';

// Define the schema for form validation using Zod
const jobSchema = z.object({
    title: z.string().min(3, { message: "Title must be at least 3 characters long." }),
    description: z.string().min(10, { message: "Description must be at least 10 characters long." }),
    date: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "A valid date is required." }),
});

type JobFormData = z.infer<typeof jobSchema>;

export default function EditJob({ params }: { params: { id: string } }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const router = useRouter();

    const [jobData, setJobData] = useState<JobFormData>({
        title: '',
        description: '',
        date: new Date().toISOString().split('T')[0], // Default to today
    });

    const [errors, setErrors] = useState<Partial<Record<keyof JobFormData, string>>>({});
    const [isLoading, setIsLoading] = useState(false);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setJobData(prev => ({ ...prev, [name]: value }));
        // Clear error when user starts typing
        if (errors[name as keyof JobFormData]) {
            setErrors(prev => ({ ...prev, [name]: undefined }));
        }
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setErrors({});

        // 1. Client-side validation
        const validationResult = jobSchema.safeParse(jobData);

        if (!validationResult.success) {
            const fieldErrors = validationResult.error.flatten().fieldErrors;
            const formattedErrors: Partial<Record<keyof JobFormData, string>> = {};

            for (const key in fieldErrors) {
                const typedKey = key as keyof JobFormData;
                if (fieldErrors[typedKey]) {
                    formattedErrors[typedKey] = fieldErrors[typedKey]![0];
                }
            }
            setErrors(formattedErrors);
            return; // Stop submission if validation fails
        }

        setIsLoading(true);
        console.log('New Job Data:', validationResult.data);

        // Send this data to your Flask API.
        try {
            const response = await fetch(endpoint.jobs, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json', // Importa\nt: Specify content type for JSON body
                },
                body: JSON.stringify(validationResult.data)
            });
        
            // Check if the response status is 201 (Created)
            if (response.status === 201) {
                // Optional: If your API returns data on success, you can parse it here
                // const data = await response.json(); 
                setIsLoading(false);
                alert('Job created successfully!');
                router.push('/admin'); // Redirect only on success
            } else {
                // Handle other status codes (e.g., 400 for bad request, 500 for server error)
                const errorData = await response.json(); // Assuming your API sends error details in JSON
                setIsLoading(false);
                alert(`Failed to create job: ${errorData.message || 'Unknown error'}`);
            }
        } catch (error) {
            // Handle network errors or issues before the server responds
            setIsLoading(false);
            alert('An unexpected error occurred. Please try again.');
            console.error('Fetch error:', error);
        }
    };

    return (

        <div className="bg-white p-8 rounded-lg shadow-md max-w-2xl mx-auto">
            <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                {/* Job Title */}
                <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                        Job Title
                    </label>
                    <div className="mt-1">
                        <input
                            type="text"
                            id="title"
                            name="title"
                            value={jobData.title}
                            onChange={handleInputChange}
                            className={`w-full text-gray-500 px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 ${errors.title ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-indigo-500'}`}
                            placeholder="e.g., Senior Software Engineer"
                        />
                        {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title}</p>}
                    </div>
                </div>

                {/* Job Description */}
                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                        Job Description
                    </label>
                    <div className="mt-1">
                        <textarea
                            id="description"
                            name="description"
                            rows={8}
                            value={jobData.description}
                            onChange={handleInputChange}
                            className={`w-full text-gray-500 px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 ${errors.description ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-indigo-500'}`}
                            placeholder="Describe the role, responsibilities, and requirements..."
                        />
                        {errors.description && <p className="mt-1 text-xs text-red-600">{errors.description}</p>}
                    </div>
                </div>

                {/* Date */}
                <div>
                    <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                        Posting Date
                    </label>
                    <div className="mt-1">
                        <input
                            type="date"
                            id="date"
                            name="date"
                            value={jobData.date}
                            onChange={handleInputChange}
                            className={`w-full text-gray-500 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 ${errors.date ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-indigo-500'}`}
                        />
                        {errors.date && <p className="mt-1 text-xs text-red-600">{errors.date}</p>}
                    </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end pt-4">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="inline-flex justify-center py-2 px-6 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
                    >
                        {isLoading ? 'Creating...' : 'Create Job'}
                    </button>
                </div>
            </form>
        </div>

    );
}
