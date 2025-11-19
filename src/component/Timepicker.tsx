import { useState, useEffect } from 'react';
import { DateTime } from "luxon";

type LuxonDateTime = InstanceType<typeof DateTime>;
export default function Timepicker() {
    const [timezones, setTimezones] = useState("");
        async function getTimezones() {
        // const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        // const userTimeZone = "Asia/Jakarta";
        let userTimeZone = localStorage.getItem("timezone");
        if(!userTimeZone){
          userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        }
        const match = tzOption.includes(userTimeZone);

        if (!match) return setTimezones("");

        setTimezones(userTimeZone);
      }

     const tzOption = Intl.supportedValuesOf("timeZone");
      

type BlackoutInput =
  | string
  | { start: string; end: string };
interface ConvertedBlackout {
  startUser: LuxonDateTime;
  endUser: LuxonDateTime;
  startISO: string;
  endISO: string;
  startDate: string;
  endDate: string;
}
 function convertBlackoutToUserRange(
  blackouts: BlackoutInput[],
  userTz: string,
  organizerTz: string
): ConvertedBlackout[] {
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

 /* Check overlap */
  function isTimeOverlap(startA: LuxonDateTime, endA: LuxonDateTime, startB: LuxonDateTime, endB: LuxonDateTime) {
    return startA < endB && endA > startB;
  }

function convertWorkingHours(
  organizerTz: string,
  userTz: string,
  day: string,
  hours: string
) {
  if (!organizerTz || !userTz || !day || !hours) return null;

  const [startHour, startMinute] = hours.split("-")[0].split(":").map(Number);
  const [endHour, endMinute] = hours.split("-")[1].split(":").map(Number);

  const startDT = DateTime.fromObject(
    { hour: startHour, minute: startMinute },
    { zone: organizerTz }
  );
  let endDT = DateTime.fromObject(
    { hour: endHour, minute: endMinute },
    { zone: organizerTz }
  );

  // Jika end < start, berarti lewat tengah malam
  if (endDT <= startDT) {
    endDT = endDT.plus({ days: 1 });
  }

  // Konversi ke user timezone
  const startUser = startDT.setZone(userTz);
  const endUser = endDT.setZone(userTz);

  const startFormatted = startUser.toFormat("HH:mm");
  const endFormatted = endUser.toFormat("HH:mm");

  // Hari tetap dari input
  const dayLabel = day; // pakai nama hari asli
  const isNextDay = endUser.day !== startUser.day;

  console.log({ day, dayLabel, hours, isNextDay });

  return { organizerDay: day, dayLabel, hours: `${startFormatted}-${endFormatted}`, isNextDay };
}

interface WorkingHourItem {
  dayLabel: string;
  hours: string | string[];
}


 function getTimeOption(
  dayName: string,
  workingHours: WorkingHourItem[],
  meetingDuration: number,
  bufferBefore: number = 0,
  bufferAfter: number = 0,
  minNoticeMinutes: number = 0,
  selectedDate: LuxonDateTime
) {
  console.log("\n============================");
  console.log("RUNNING getTimeOption()");
  console.log("============================");

  console.log("dayName:", dayName);
  console.log("meetingDuration:", meetingDuration);
  console.log("bufferBefore:", bufferBefore);
  console.log("bufferAfter:", bufferAfter);
  console.log("bufferGap:", bufferBefore + bufferAfter);
  console.log("minNoticeMinutes:", minNoticeMinutes);

  console.log("selectedDate:", selectedDate.toISO());
  console.log("selectedDate (Y-M-D):", selectedDate.toFormat("yyyy-MM-dd"));

  if (!dayName || !workingHours || !meetingDuration || !selectedDate) {
    console.log("❌ Missing required parameters → return []");
    return [];
  }

  console.log("\n=== FILTER WORKING HOURS ===");

  let hoursArray: string[] = [];

  workingHours
    .filter(item => item.dayLabel.toLowerCase() === dayName.toLowerCase())
    .forEach(item => {
      console.log("Matched working hours:", item);
      const hrs = Array.isArray(item.hours) ? item.hours : [item.hours];
      hoursArray = [...hoursArray, ...hrs];
    });

  console.log("Combined hoursArray:", hoursArray);

  hoursArray.sort((a, b) => {
    const aStart = a.replace(" (Next Day)", "").split("-")[0];
    const bStart = b.replace(" (Next Day)", "").split("-")[0];
    return aStart.localeCompare(bStart);
  });

  console.log("\nSorted hoursArray:", hoursArray);

  const options: string[] = [];
  const now = DateTime.now();
  console.log("\nCurrent time NOW:", now.toISO());

  console.log("\n=== PROCESS EACH RANGE ===");

  hoursArray.forEach((range, idx) => {
    console.log(`\n[Range ${idx}] ===================`);
    console.log(`[Range ${idx}] Raw Range:`, range);

    const isNextDayLabel = range.includes("(Next Day)");
    console.log(`[Range ${idx}] Has (Next Day) label?`, isNextDayLabel);

    const cleanRange = range.replace(" (Next Day)", "");
    const [start, end] = cleanRange.split("-");

    console.log(`[Range ${idx}] Clean start: ${start}, end: ${end}`);

    const startTime = DateTime.fromFormat(start, "HH:mm").set({
      year: selectedDate.year,
      month: selectedDate.month,
      day: selectedDate.day,
    });

    let endTime = DateTime.fromFormat(end, "HH:mm").set({
      year: selectedDate.year,
      month: selectedDate.month,
      day: selectedDate.day,
    });

    console.log(`[Range ${idx}] startTime:`, startTime.toISO());
    console.log(`[Range ${idx}] endTime before adjust:`, endTime.toISO());

    const crossesMidnight = isNextDayLabel || endTime <= startTime;

    console.log(`[Range ${idx}] crossesMidnight?`, crossesMidnight);

    if (crossesMidnight) {
      endTime = endTime.plus({ days: 1 });
      console.log(`[Range ${idx}] endTime adjusted to next day:`, endTime.toISO());
    }

    let current = startTime;
    const bufferGap = bufferBefore + bufferAfter;

    console.log(`[Range ${idx}] START slot generation`);
    console.log(`[Range ${idx}] Meeting duration:`, meetingDuration);
    console.log(`[Range ${idx}] Buffer gap:`, bufferGap);

    while (current.plus({ minutes: meetingDuration }) <= endTime) {
      const next = current.plus({ minutes: meetingDuration });

      const slotIsNextDay = current.day !== selectedDate.day;

      console.log(
        `[Range ${idx}] Try slot: ${current.toFormat("HH:mm")} - ${next.toFormat("HH:mm")} | next day?`,
        slotIsNextDay
      );

      const diffMinutes = current.diff(now, "minutes").minutes;
      console.log(`[Range ${idx}] diff from NOW (minutes):`, diffMinutes);

      if (diffMinutes >= minNoticeMinutes) {
        const slot = `${current.toFormat("HH:mm")}-${next.toFormat(
          "HH:mm"
        )}${slotIsNextDay ? " (Next Day)" : ""}`;

        console.log(`[Range ${idx}] ✅ ADD SLOT:`, slot);

        options.push(slot);
      } else {
        console.log(
          `[Range ${idx}] ❌ SKIP slot (min notice not met): need ${minNoticeMinutes}, got ${diffMinutes}`
        );
      }

      current = next.plus({ minutes: bufferGap });

      console.log(`[Range ${idx}] Move current to:`, current.toFormat("HH:mm"));
    }
  });

  console.log("\n=== FINAL OPTIONS GENERATED ===");
  console.log(options);
  console.log("=====================================\n");

  return options;
}







function handleTimezone(
  organizerTz: string,
  day: string,
  userTz: string,
  hours: string
) {
  console.log("ini masalaha",{ organizerTz, day, userTz, hours });
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



 function getSelectedTimeRange(selectedDate: Date, selectedTime: string, timezone: string) {
  if (!selectedDate || !selectedTime || !timezone) return null;

  const safe = normalizeTimeString(selectedTime);

  const isNextDayLabel = /\(nextday\)/i.test(safe);
  const cleaned = safe.replace(/\(.*?\)/g, ""); // hapus label

  const [startStr, endStr] = cleaned.split("-");
  if (!startStr || !endStr) return null;

  const [sh, sm] = startStr.split(":").map(Number);
  const [eh, em] = endStr.split(":").map(Number);

  let start = DateTime.fromJSDate(selectedDate)
    .setZone(timezone)
    .set({ hour: sh, minute: sm, second: 0 });

  let end = DateTime.fromJSDate(selectedDate)
    .setZone(timezone)
    .set({ hour: eh, minute: em, second: 0 });

  if (isNextDayLabel) {
    // jika slot Next Day → tambah 1 hari ke start dan end
    start = start.plus({ days: 1 });
    end = end.plus({ days: 1 });
  } else if (end <= start) {
    // jika crossing midnight biasa → tambah 1 hari ke end saja
    end = end.plus({ days: 1 });
  }

  console.log("Final time range:", { startISO: start.toISO(), endISO: end.toISO() });

  return { start, end, isNextDay: isNextDayLabel };
}

function normalizeTimeString(str: string) {
  return str
    .replace(/[–—-]/g, "-")     // semua dash → hyphen
    .replace(/[:：．·]/g, ":")   // semua jenis colon → :
    .replace(/\s+/g, "")        // hapus semua spasi
    .trim();
}


    useEffect(() => {
        getTimezones();
    }, []);

    return {
        timezones,
        getTimezones,
        handleTimezone,
        tzOption,
        handleDayLabel,
        convertBlackoutToUserRange,
        getTimeOption,
        getSelectedTimeRange,
        isTimeOverlap
    };
}