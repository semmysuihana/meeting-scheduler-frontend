import { useState, useEffect } from 'react';
import { DateTime } from "luxon";
export default function Timepicker() {
    const [timezones, setTimezones] = useState("");
    async function getTimezones() {
        // const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const userTimeZone = 'Europe/London';
        setTimezones(userTimeZone);
    }

 function convertBlackoutToUserRange(blackouts, userTz, organizerTz) {
  return blackouts.map(item => {
    let startOrg, endOrg;

    // CASE 1: item adalah string tanggal → "2025-11-14"
    if (typeof item === "string") {
      startOrg = DateTime.fromISO(item, { zone: organizerTz }).startOf("day");
      endOrg   = DateTime.fromISO(item, { zone: organizerTz }).endOf("day");
    }

    // CASE 2: item object dengan start / end  
    else if (typeof item === "object" && item.start && item.end) {
      startOrg = DateTime.fromISO(item.start, { zone: organizerTz });
      endOrg   = DateTime.fromISO(item.end, { zone: organizerTz });
    }

    // convert ke user TZ
    const startUser = startOrg.setZone(userTz);
    const endUser   = endOrg.setZone(userTz);

    return {
      startUser,
      endUser,
      startISO: startUser.toISO(),
      endISO: endUser.toISO(),
      startDate: startUser.toFormat("yyyy-MM-dd HH:mm"),
      endDate: endUser.toFormat("yyyy-MM-dd HH:mm"),
    };
  });
}


// 🔹 Fungsi inti: konversi satu hari dan jam
function convertWorkingHours(
  organizerTz: string,
  userTz: string,
  day: string,
  hours: string
) {
  if (!organizerTz || !userTz || !day || !hours) return null;

  const [start, end] = hours.split("-");
  const weekDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const dayIndex = weekDays.findIndex(d => d.toLowerCase() === day.toLowerCase());
  if (dayIndex === -1) return null;

  const baseMonday = DateTime.fromISO("1970-01-05", { zone: organizerTz });
  const baseDate = baseMonday.plus({ days: dayIndex });

  const startDT = DateTime.fromISO(`${baseDate.toISODate()}T${start}`, { zone: organizerTz });
  const endDT = DateTime.fromISO(`${baseDate.toISODate()}T${end}`, { zone: organizerTz });

  let startUser = startDT.setZone(userTz);
  let endUser = endDT.setZone(userTz);

  // ---------------------------------------------
  // ⚡ FIX: Luxon keeps same date → detect & adjust
  // ---------------------------------------------
  let isNextDay = false;

  if (endUser.hour < startUser.hour) {
    endUser = endUser.plus({ days: 1 });
    isNextDay = true;
  }

  const startFormatted = startUser.toFormat("HH:mm");
  const endFormatted = endUser.toFormat("HH:mm");

  const dayLabel = startUser.toFormat("cccc");

  return {
    organizerDay: day,
    dayLabel,
    hours: `${startFormatted}-${endFormatted}`,
    isNextDay
  };
}


function handleTimezone(
  organizerTz: string,
  day: string,
  userTz: string,
  hours: string
) {
  const result = convertWorkingHours(organizerTz, userTz, day, hours);
  if (!result) return "";

  const { organizerDay, dayLabel, hours: newHours, isNextDay } = result;

  return `${organizerDay}: ${hours} -> ${dayLabel} ${newHours}${isNextDay ? " (Next Day)" : ""}`;
}

function handleDayLabel(
  organizerTz: string,
  userTz: string,
  workingHours: Record<string, string>
) {
  if (!organizerTz || !userTz || !workingHours) return [];

  const results: { dayLabel: string; hours: string }[] = [];

  Object.keys(workingHours).forEach(day => {
    const converted = convertWorkingHours(organizerTz, userTz, day, workingHours[day]);
    if (converted) {
      const label = converted.hours + (converted.isNextDay ? " (Next Day)" : "");
      results.push({
        dayLabel: converted.dayLabel,
        hours: label
      });
    }
  });

  // Grouping per dayLabel
  // const grouped = Object.values(
  //   results.reduce((acc, curr) => {
  //     if (!acc[curr.dayLabel]) {
  //       acc[curr.dayLabel] = { dayLabel: curr.dayLabel, hours: [] };
  //     }
  //     acc[curr.dayLabel].hours.push(curr.hours);
  //     return acc;
  //   }, {})
  // );
  // arr object not grouping
  const grouped = results;
  return grouped;
}


const tzOption = [
  { offset: "UTC−12:00", name: "Etc/GMT+12" },
  { offset: "UTC−11:00", name: "Pacific/Midway" },
  { offset: "UTC−10:00", name: "Pacific/Honolulu" },
  { offset: "UTC−09:00", name: "America/Anchorage" },
  { offset: "UTC−08:00", name: "America/Los_Angeles" },
  { offset: "UTC−07:00", name: "America/Denver" },
  { offset: "UTC−06:00", name: "America/Chicago" },
  { offset: "UTC−05:00", name: "America/New_York" },
  { offset: "UTC−04:00", name: "America/Santiago" },
  { offset: "UTC−03:00", name: "America/Sao_Paulo" },
  { offset: "UTC−02:00", name: "Atlantic/South_Georgia" },
  { offset: "UTC−01:00", name: "Atlantic/Azores" },
  { offset: "UTC±00:00", name: "Europe/London" },
  { offset: "UTC+01:00", name: "Europe/Paris" },
  { offset: "UTC+02:00", name: "Europe/Athens" },
  { offset: "UTC+03:00", name: "Europe/Moscow" },
  { offset: "UTC+03:30", name: "Asia/Tehran" },
  { offset: "UTC+04:00", name: "Asia/Dubai" },
  { offset: "UTC+04:30", name: "Asia/Kabul" },
  { offset: "UTC+05:00", name: "Asia/Karachi" },
  { offset: "UTC+05:30", name: "Asia/Kolkata" },
  { offset: "UTC+05:45", name: "Asia/Kathmandu" },
  { offset: "UTC+06:00", name: "Asia/Dhaka" },
  { offset: "UTC+06:30", name: "Asia/Rangoon" },
  { offset: "UTC+07:00", name: "Asia/Jakarta" },
  { offset: "UTC+08:00", name: "Asia/Shanghai" },
  { offset: "UTC+08:45", name: "Australia/Eucla" },
  { offset: "UTC+09:00", name: "Asia/Tokyo" },
  { offset: "UTC+09:30", name: "Australia/Adelaide" },
  { offset: "UTC+10:00", name: "Australia/Sydney" },
  { offset: "UTC+10:30", name: "Australia/Lord_Howe" },
  { offset: "UTC+11:00", name: "Pacific/Noumea" },
  { offset: "UTC+12:00", name: "Pacific/Auckland" },
  { offset: "UTC+13:00", name: "Pacific/Tongatapu" },
  { offset: "UTC+14:00", name: "Pacific/Kiritimati" },
];



    useEffect(() => {
        getTimezones();
    }, []);

    return {
        timezones,
        getTimezones,
        handleTimezone,
        tzOption,
        handleDayLabel,
        convertBlackoutToUserRange
    };
}