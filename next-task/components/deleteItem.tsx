"use client"

import { endpoint } from "../hepler/endpoint"
import { useRouter } from 'next/navigation'
type DeleteItemProps = {
    job_id: string;
  };
export default function DeleteItem({job_id}:DeleteItemProps) {
    const router = useRouter();

    const handleDelete = async (jobId: string) => {
        try {
          await deleteJob(jobId);
        } catch (err) {
          alert('Failed to delete job');
        }
      };

     const deleteJob = async (jobId: string): Promise<void> => {
        try {
          const response = await fetch(`${endpoint.jobs}/${jobId}`, {
            method: 'DELETE',
          });
      
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to delete job');
          }
      
          router.refresh()
        } catch (error) {
          console.error('Error deleting job:', error);
          throw error;
        }
      };
  return (
    <a className="font-medium cursor-pointer text-red-600 hover:underline" onClick={() => handleDelete(job_id)}>Delete</a>  )
}
