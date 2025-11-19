import RealtimeClock from "./../component/RealtimeClock";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Navbar({
  timezones,
  onSelectTimezone
}: {
  timezones?: string | null;
  onSelectTimezone?: (value: string) => void;
}) {
  const navigate = useNavigate();

  // Timezone dari props atau localStorage atau default
  const initialTZ =
    timezones ||
    localStorage.getItem("timezone") ||
    Intl.DateTimeFormat().resolvedOptions().timeZone;

  const [open, setOpen] = useState<boolean>(false);
  const [selectedTZ, setSelectedTZ] = useState<string>(initialTZ);

  const allTimezones = Intl.supportedValuesOf("timeZone");

  // Sync ke props (kalau berubah)
  useEffect(() => {
    if (timezones) setSelectedTZ(timezones);
  }, [timezones]);

  // Open modal
  const openModalTimezone = () => {
    setSelectedTZ(initialTZ); // Set dropdown sesuai timezone sekarang
    setOpen(true);
  };

  const applyTimezone = () => {
    localStorage.setItem("timezone", selectedTZ);
    onSelectTimezone?.(selectedTZ);
    setOpen(false);
    navigate(0); // refresh state halaman tanpa reload full
  };

  // ============================
  // Modal
  // ============================
  const ModalTimezone = () => {
    if (!open) return null;

    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
        <div className="bg-gray-900 p-6 rounded-xl shadow-lg w-96 text-white">
          <h2 className="text-lg font-semibold mb-4 text-center">
            Select Your Timezone
          </h2>

          <select
            value={selectedTZ}
            onChange={(e) => setSelectedTZ(e.target.value)}
            className="w-full p-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:ring-2 focus:ring-indigo-500"
          >
            {allTimezones.map((tz) => (
              <option key={tz} value={tz}>
                {tz}
              </option>
            ))}
          </select>

          <div className="flex justify-end mt-5 gap-3">
            <button
              onClick={() => setOpen(false)}
              className="py-2 px-4 bg-gray-700 hover:bg-gray-600 rounded"
            >
              Cancel
            </button>

            <button
              onClick={applyTimezone}
              className="py-2 px-4 bg-indigo-600 hover:bg-indigo-500 rounded"
            >
              Select
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <ModalTimezone />

      <header className="bg-white shadow-sm dark:bg-gray-800">
        <nav className="mx-auto max-w-7xl px-6 lg:px-8" aria-label="Global">
          <div className="flex flex-col sm:flex-row items-center justify-between h-auto sm:h-16 py-3 sm:py-0">

            {/* Title */}
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <span className="text-indigo-500 text-2xl font-bold">
                Meeting Scheduler
              </span>
            </div>

            {/* Clock */}
            <div className="mt-3 sm:mt-0 text-center">
              <RealtimeClock timezone={selectedTZ} />
            </div>

            {/* Button */}
            <div className="mt-3 sm:mt-0 text-center sm:text-right">
              <button
                onClick={openModalTimezone}
                className="py-1 px-3 bg-indigo-600 hover:bg-indigo-500 rounded text-white"
              >
                Choose Timezone
              </button>
            </div>

          </div>
        </nav>
      </header>
    </>
  );
}
