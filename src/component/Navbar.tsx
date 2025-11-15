
import RealtimeClock from "./../component/RealtimeClock";
export default function Navbar({ timezones }: { timezones?: string | null }) {
  

  return (
    <header className="bg-white shadow-sm dark:bg-gray-800">
      <nav className="mx-auto max-w-7xl px-6 lg:px-8" aria-label="Global">
        <div className="flex flex-col sm:flex-row items-center justify-between h-auto sm:h-16 py-3 sm:py-0">
          {/* Judul */}
          <div className="flex items-center justify-center sm:justify-start gap-2">
              <span className="text-indigo-500 text-2xl font-bold mr-2">
                Meeting Scheduler
              </span>
          </div>

          {/* Timezone (responsif) */}
          <div className="mt-3 sm:mt-0 text-center sm:text-right">
            {/* <p className="text-gray-700 dark:text-white text-base font-medium">
              {timezones}
            </p>
            <p className="text-gray-500 dark:text-gray-300 text-sm">Timezone</p> */}
            <RealtimeClock timezone={timezones || ""}/>
          </div>
        </div>
      </nav>
    </header>
  );
}
