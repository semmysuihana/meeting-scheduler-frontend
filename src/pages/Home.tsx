import { useState, useEffect } from "react";
import ApiClient from "../api/ApiClient";
import { Link } from "react-router-dom";
import Navbar from "./../component/Navbar";
import Timepicker from "./../component/Timepicker";
import Loading from "./../component/Loading";
import ShowAlert from "../component/ShowAlert";

interface Organizer {
  id: number;
  name: string;
  timezone: string;
  working_hours?: Record<string, string>;
  meeting_duration?: number;
}

export default function Home() {
  const { data, alert, loading, fetchData } = ApiClient();
  const { timezones, handleTimezone } = Timepicker();
  const [showAlert, setShowAlert] = useState(false);

  // show alert when alert updated
  useEffect(() => {
    if (alert) setShowAlert(true);
  }, [alert]);

  // fetch data at start
  useEffect(() => {
    fetchData();
  }, []);

  return (
    <>
      {/* Alert */}
      {showAlert && (
        <ShowAlert setShowAlert={setShowAlert} alert={alert} />
      )}

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
              data.map((organizer: Organizer) => (
                <div
  key={organizer.id}
  className="p-6 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 
             shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
>
                  <h5 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
  {organizer.name}
</h5>

<div className="space-y-2">
  <p className="text-sm text-gray-500 dark:text-gray-400">
    <span className="font-medium text-gray-700 dark:text-gray-300">
      Timezone:
    </span>{" "}
    {organizer.timezone}
  </p>

  <div>
    <span className="font-medium text-gray-700 dark:text-gray-300">
      Working Hours:
    </span>

    <ul className="mt-1 ml-4 list-disc text-gray-600 dark:text-gray-400 text-sm space-y-1">
      {organizer.working_hours ? (
        Object.entries(organizer.working_hours).map(([day, hours]) => (
          <li key={day}>
            {handleTimezone(organizer.timezone, day, timezones, hours)}
          </li>
        ))
      ) : (
        <li>No working hours specified</li>
      )}
    </ul>
  </div>

  <p className="text-sm text-gray-600 dark:text-gray-400">
    <span className="font-medium text-gray-700 dark:text-gray-300">
      Duration:
    </span>{" "}
    {organizer.meeting_duration
      ? `${organizer.meeting_duration} minutes`
      : "Not specified"}
  </p>
</div>

<Link
  to={`/book/${organizer.id}`}
  className="inline-flex items-center gap-2 px-4 py-2 mt-5 text-sm font-medium
             rounded-xl bg-blue-600 hover:bg-blue-700 text-white 
             transition-colors focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800"
>
  Book
  <svg
    className="w-4 h-4"
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
