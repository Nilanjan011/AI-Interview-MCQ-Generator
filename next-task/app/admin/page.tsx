
import DeleteItem from '../../components/deleteItem';
import { endpoint } from '@/hepler/endpoint';
import Link from 'next/link';

// Helper to get status color
const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'open':
      return 'bg-green-100 text-green-800';
    case 'close':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};


export default async function AdminDashboardPage() {

  const res = await fetch(endpoint.jobs, { cache: 'no-store' });
  const data = await res.json();

  return (

    <>
      {/* Table Section */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Recent Jobs</h2>
          <Link href={`/admin/job/create`} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">
            + Create
          </Link>
        </div>


        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3">Title</th>
                <th scope="col" className="px-6 py-3">Description</th>
                <th scope="col" className="px-6 py-3">Date Applied</th>
                <th scope="col" className="px-6 py-3">Status</th>
                <th scope="col" className="px-6 py-3"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody>
              {data.map((job:any) => (
                <tr key={job._id} className="bg-white border-b hover:bg-gray-50">
                  <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                    {job.title}
                  </th>
                  <td className="px-6 py-4">
                    {job.description}
                  </td>
                  <td className="px-6 py-4">
                    {job.posting_date}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(job.status)}`}>
                      {job.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link href={`/admin/job/${job._id}`} className="font-medium p-2 text-indigo-600 hover:underline">Edit</Link>
                    <DeleteItem job_id={job._id} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
