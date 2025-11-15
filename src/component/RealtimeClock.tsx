import { useEffect, useState } from "react";

export default function RealtimeClock({ timezone }: { timezone?: string | null }) {
  const [time, setTime] = useState("");

  useEffect(() => {
    if (!timezone) return; 

    const updateTime = () => {
      const now = new Date();
      const formattedTime = now.toLocaleTimeString("en-US", {
        timeZone: timezone,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      });
      setTime(formattedTime);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [timezone]);

  if (!timezone) return null;

  return (
    <p className="text-lg font-semibold text-indigo-600 dark:text-indigo-300">
      {time}
      <br />
      <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
        {timezone}
      </span>
    </p>
  );
}
