import { endpoint } from "@/hepler/endpoint";
import Link from "next/link";


const MockTestSelectionPage = async () => {
  const res = await fetch(endpoint.jobs, { cache: 'no-store' });
  const availableTests = await res.json();

  return (
    <div className="font-sans bg-gray-50 min-h-screen p-6 sm:p-10">
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-2xl p-6 sm:p-10 border border-gray-200">
        <h1 className="text-5xl font-extrabold text-center text-gray-900 mb-4 bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
          Select Your Mock Tests
        </h1>
        <p className="text-xl text-center text-gray-600 mb-12">
          Choose the tests you want to prepare for and add them to your selection.
        </p>

        {/* Available Tests Section */}
        <h2 className="text-3xl font-bold text-gray-800 mb-8 border-b-2 pb-3 border-blue-300">Available Tests</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {availableTests.map(test => (
            <div
              key={test._id}
              className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out p-6 flex flex-col items-center text-center border border-gray-100 transform hover:-translate-y-1"
            >
              <div className="mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-yellow-500" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm3.5 14h-7a.5.5 0 0 1-.5-.5v-7a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-.5.5zM12 6a6 6 0 1 0 0 12 6 6 0 0 0 0-12zM12 7.5a4.5 4.5 0 1 1 0 9 4.5 4.5 0 0 1 0-9zM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6zM12 10.5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{test.title}</h3>
              {/* <p className="text-gray-600 mb-4 flex-grow">{test.description}</p> */}
              {/* <div className="text-sm text-gray-500 mb-4">
                <span className="mr-4">⏱️ {test.duration}</span>
                <span>❓ {test.questions}</span>
              </div> */}
              <Link
                href={`/quiz/${test._id}`}
                className="mt-auto w-full bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white py-3 px-6 rounded-full shadow-md hover:shadow-lg transition duration-300 ease-in-out disabled:bg-gray-400 disabled:cursor-not-allowed disabled:shadow-none"
              >
                Start
              </Link>
            </div>
          ))}
        </div>

       

        {/* Start Tests Button */}
        {/* <div className="text-center mt-12">
          <button
            className="bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white text-2xl font-bold py-4 px-12 rounded-full shadow-lg hover:shadow-xl transition duration-300 ease-in-out transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:from-gray-400 disabled:to-gray-500"
          >
            Start Selected Tests (1)
          </button>
        </div> */}
      </div>
    </div>
  );
};

export default MockTestSelectionPage;
