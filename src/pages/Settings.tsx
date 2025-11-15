import ApiClient from "../api/ApiClient";
import Loading from "../component/Loading";
import ShowAlert from "../component/ShowAlert";
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";

function Setting() {
  const { id } = useParams();
  const [showAlert, setShowAlert] = useState(false);

  const { data, loading, alert, setAlert, fetchData } = ApiClient();

  useEffect(() => {
    if (id && !isNaN(Number(id))) {
      fetchData(`book/${id}`);
    } else {
      setAlert("Invalid ID");
    }
  }, [id]);

  useEffect(() => {
    if (alert) setShowAlert(true);
  }, [alert]);

  const setting = data && data[0];

  return (
    <>
      {showAlert && <ShowAlert message={alert} setShowAlert={setShowAlert} />}
      {loading && <Loading />}

      <div className="container mx-auto text-white">

        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Settings</h1>

        </div>

        {/* DATA */}
        {setting ? (
          <div className="space-y-6">

            {/* General Info */}
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-xl font-semibold">General</h2>
                 {id && (
            <Link
              to={`/organizer/${id}/settings/edit/general`}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium"
            >
              Edit General
            </Link>
          )}
              </div>

              <p><span className="font-semibold">Name:</span> {setting.name}</p>
              <p><span className="font-semibold">Timezone:</span> {setting.timezone}</p>
              <p><span className="font-semibold">Meeting Duration:</span> {setting.meeting_duration} minutes</p>
              <p><span className="font-semibold">Min Notice:</span> {setting.min_notice_minutes} minutes</p>
              <p><span className="font-semibold">Buffer Before:</span> {setting.buffer_before} min</p>
              <p><span className="font-semibold">Buffer After:</span> {setting.buffer_after} min</p>
            </div>

            {/* Working Hours */}
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-xl font-semibold">Working Hours</h2>
                 {id && (
            <Link
              to={`/organizer/${id}/settings/edit/working_hours`}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium"
            >
              Edit Working Hours
            </Link>
          )}
              </div>

              <table className="w-full text-left text-gray-300">
                <thead>
                  <tr>
                    <th className="pb-2">Day</th>
                    <th className="pb-2">Hours</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(setting.working_hours).map(([day, time]) => (
                    <tr key={day} className="border-t border-gray-700">
                      <td className="py-2 capitalize">{day}</td>
                      <td>{time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Blackouts */}
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-xl font-semibold">Blackouts</h2>
                {id && (
            <Link
              to={`/organizer/${id}/settings/edit/blackouts`}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium"
            >
              Edit Blackouts
            </Link>
          )}
              </div>

              <ul className="list-disc list-inside text-gray-300 space-y-1">
                {setting.blackouts.map((date: string, index: number) => (
                  <li key={index}>{date}</li>
                ))}
              </ul>
            </div>

          </div>
        ) : (
          <p className="text-gray-400">No data found.</p>
        )}
      </div>
    </>
  );
}

export default Setting;
