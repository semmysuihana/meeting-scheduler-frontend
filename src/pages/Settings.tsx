import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import ApiClient from "../api/ApiClient";
import Loading from "../component/Loading";
import ShowAlert from "../component/ShowAlert";

// ==========================
// TYPE DEFINITIONS
// ==========================
interface WorkingHours {
  [day: string]: string; // contoh: "monday": "09:00 - 17:00"
}

interface SettingData {
  name: string;
  timezone: string;
  meeting_duration: number;
  min_notice_minutes: number;
  buffer_before: number;
  buffer_after: number;
  working_hours: WorkingHours;
  blackouts: string[];
}

// ==========================
// COMPONENT
// ==========================
export default function Setting() {
  const { id } = useParams<{ id: string }>();
  const [showAlert, setShowAlert] = useState(false);

  const { data, loading, alert, setAlert, fetchData } = ApiClient();

  // Fetch ketika ID valid
  useEffect(() => {
    if (id && !isNaN(Number(id))) {
      fetchData(`book/${id}`);
    } else {
      setAlert("Invalid ID");
    }
  }, [id]);

  // Reset alert ketika alert box ditutup
  useEffect(() => {
    if (!showAlert) {
      setAlert("");
    }
  }, [showAlert]);

  // Tampilkan alert otomatis ketika alert berubah
  useEffect(() => {
    if (alert) setShowAlert(true);
  }, [alert]);

  // Pastikan data array dan ambil index 0
  const setting: SettingData | null =
    Array.isArray(data) && data.length > 0 ? data[0] : null;

  return (
    <>
      {showAlert && <ShowAlert alert={alert} setShowAlert={setShowAlert} />}
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
                {setting.blackouts.map((date, index) => (
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
