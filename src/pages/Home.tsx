import { useState, useEffect } from "react";
import ApiClient from "../api/ApiClient";
import { Link } from "react-router-dom";
import Navbar from "./../component/Navbar";
import Timepicker from "./../component/Timepicker";
import Loading from "./../component/Loading";
import ShowAlert from "../component/ShowAlert";
export default function Home() {
  const { data,alert, loading, fetchData } = ApiClient();
  const { timezones, handleTimezone } = Timepicker();
  const [showAlert, setShowAlert] = useState(false);
  
    useEffect(() => {
    if (alert) setShowAlert(true);
  }, [alert]);

   useEffect(() => {
        fetchData();
    }, []);

  return (
    <>
      {/* Alert */}
      {showAlert && <ShowAlert message={alert} setShowAlert={setShowAlert} />}

      {/* Loading */}
      {loading && <Loading />}

     <Navbar timezones={timezones} />
      <div className="bg-gray-900 py-24 sm:py-32">
        
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-base font-semibold text-indigo-400">
              Meeting your needs
            </h2>
            <p className="mt-2 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              Show available slots for the next 14 days based on your preferences
            </p>
            <p className="mt-6 text-lg text-gray-300">
              Meeting Scheduler is a web application that allows users to book
              and manage their own meetings. The app provides a simple and
              easy-to-use interface that allows users to create and manage
              their own meetings.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {data &&
              data.map((organizer) => (
                <div
                  key={organizer.id}
                  className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700 hover:scale-105 transition-transform duration-200"
                >
                  <h5 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
                    {organizer.name}
                  </h5>
                  <p className="mb-1 text-gray-500 dark:text-gray-400">
                    Timezone: {organizer.timezone}
                  </p>
                  <div className="mb-3">
                    <span className="font-semibold text-gray-700 dark:text-gray-300">
                      Working Hours:
                    </span>
                    <ul className="ml-2 list-disc list-inside text-gray-600 dark:text-gray-400">
                      {organizer.working_hours ? Object.entries(organizer.working_hours).map(
                        ([day, hours]) => (
                           <li key={day}>
                          
                          {handleTimezone(organizer.timezone, day, timezones, hours)}
                        </li>
                        )
                      ) : (
                        <li>No working hours specified</li>
                      )}
                    </ul>
                    <span className="font-semibold text-gray-700 dark:text-gray-300">
                      Duration : {organizer.meeting_duration ? organizer.meeting_duration + " minutes" : "Not specified"} 
                    </span>
                  </div>
                  <Link
                    to={`/book/${organizer.id}`}
                    className="inline-flex items-center px-4 py-2 mt-2 text-sm font-medium text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                  >
                    Book
                    <svg
                      className="w-3.5 h-3.5 ms-2"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 14 10"
                    >
                      <path
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M1 5h12m0 0L9 1m4 4L9 9"
                      />
                    </svg>
                  </Link>
                </div>
              ))}
          </div>
        </div>
      </div>
    </>
  );
}
