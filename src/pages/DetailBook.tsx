import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { PhotoIcon, UserCircleIcon } from '@heroicons/react/24/solid'
import { ChevronDownIcon } from '@heroicons/react/16/solid'
import ApiClient from "../api/ApiClient";
import Navbar from "./../component/Navbar";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { DateTime } from "luxon";
import Timepicker from "./../component/Timepicker";
import ShowAlert from "../component/ShowAlert";

function FormData({
  meeting,
  tzOption = [],
  timezones = "",
  handleDayLabel= {},
  convertBlackoutToUserRange= {}
}: {
  meeting: any;
  tzOption?: any[];
  timezones?: string;
  handleDayLabel?: any;
  convertBlackoutToUserRange?: any
}) {
 
  console.log("ini meeting", meeting);
  const [selectedTimezone, setSelectedTimezone] = useState("");
  
  const [selectedTime, setSelectedTime] = useState("");
  const [timeOption, setTimeOption] = useState([]);
  const [organizerId, setOrganizerId] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [selectedDate, setSelectedDate] = useState();
  const [message, setMessage] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const [workingHours, setWorkingHours] = useState([]);
  const [dayLabel, setDayLabel] = useState([]);
  const [blackout, setBlackout] = useState([]);
  const { loading, alert, setAlert, fetchData, postData } = ApiClient();

    useEffect(() => {
      if(meeting.id){
        setOrganizerId(meeting.id);
      }
    },[meeting.id])
    useEffect(() => {
      if (message) setShowAlert(true); 
      
    },[message])
    useEffect(() => {
      
      if(alert){
        setShowAlert(true);
        setMessage(alert);
      };

    },[alert])

    useEffect(() => {
      if(showAlert === false){
        setMessage(''); 
        setAlert('');
      }
    },[showAlert])
    useEffect(() => {
    if(meeting){
      console.log(meeting.blackouts)
      const result = convertBlackoutToUserRange(meeting.blackouts, meeting.timezone, timezones);
      setBlackout(result);
    }
  }, [meeting]);

 function getTimeOption(
  dayName: string,
  workingHours: any[],
  meetingDuration: number,
  bufferBefore: number = 0,
  bufferAfter: number = 0,
  minNoticeMinutes: number = 0,
  selectedDate: DateTime
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
    let [start, end] = cleanRange.split("-");

    console.log(`[Range ${idx}] Clean start: ${start}, end: ${end}`);

    let startTime = DateTime.fromFormat(start, "HH:mm").set({
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



 useEffect(() => {
  if (selectedDate) {
   const dateString = DateTime.fromJSDate(selectedDate)
  .toFormat("yyyy-MM-dd");

const dayName = DateTime.fromISO(dateString, { zone: timezones })
  .toFormat("cccc");

    
    console.log("selectedDate", selectedDate);
    console.log("timezones", timezones);
    console.log(DateTime.fromJSDate(selectedDate).setZone(timezones).toFormat("cccc"));
    console.log("dayName", dayName);
    console.log("workingHours", workingHours);
    console.log("meetingDuration", meeting.meeting_duration);
    console.log("bufferBefore", meeting.buffer_before);
    console.log("bufferAfter", meeting.buffer_after);
    console.log("minNoticeMinutes", meeting.min_notice_minutes);
    const selected = DateTime.fromJSDate(selectedDate).setZone(timezones);

    const timeOptions = getTimeOption(dayName, workingHours, meeting.meeting_duration, meeting.buffer_before, meeting.buffer_after, meeting.min_notice_minutes,selected);
    console.log("timeOption", timeOptions);
    setTimeOption(timeOptions);
  }
}, [selectedDate]);

  useEffect(() => {
    if(timezones && meeting.timezone && meeting.working_hours) {
      const dayLabel = handleDayLabel(meeting.timezone, timezones, meeting.working_hours);
      // console.log("Day Label",dayLabel);
      setWorkingHours(dayLabel);
       const allowedDays = dayLabel.map(d => d.dayLabel.toLowerCase()); 
       setDayLabel(allowedDays);
       console.log("allowedDays",allowedDays);
    }
  }, [meeting]);

  useEffect(() => {
    setSelectedTimezone(timezones);
  }, []);

  function isTimeOverlap(startA: DateTime, endA: DateTime, startB: DateTime, endB: DateTime) {
      return startA < endB && endA > startB; // overlap logic
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

function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
  e.preventDefault();
  if(!organizerId) return setMessage("organizer id empty");
  if (!name) return setMessage("Please enter your name");
  if (!email || !email.includes('@')) return setMessage("Please enter your email correctly");
  if (!selectedDate) return setMessage("Please select your date");
  if (!selectedTime) return setMessage("Please select your time");
  if (!selectedTimezone) return setMessage("Please select your time zone");

  // Ambil jam user yg dipilih (datetime lengkap)
  const range = getSelectedTimeRange(selectedDate, selectedTime, selectedTimezone);
  if (!range) {
    return setMessage("Invalid time selection format");
  }



  const { start: userStart, end: userEnd } = range;
  console.log("userStart", userStart);
  console.log("userEnd", userEnd);
  // Cek blackout
  const isBlocked = blackout.some(b =>
    isTimeOverlap(userStart, userEnd, b.startUser, b.endUser)
  );

  if (isBlocked) {
    return setMessage("The selected time is unavailable blackout.");
  }

  let startUTC = "";
  let endUTC = "";
  // Konversi ke UTC untuk backend
  if(timezones !== "Europe/London"){
    startUTC = userStart.toUTC().toISO();
    endUTC = userEnd.toUTC().toISO();
  }else{
    startUTC = userStart.toISO();
    endUTC = userEnd.toISO();
  }

  const payload = {
    organizer_id: organizerId,
    name,
    email,
    start_time_utc: startUTC,
    end_time_utc: endUTC,
    user_timezone: timezones, 
  };
  console.log("Payload:", payload);
  postData("book", payload);
}

 if (loading) {
    return (
      <Loading />
    );
  }

  return (
    <>
    
    <form>
      <div className="space-y-12">

        <div className="border-b border-white/10 pb-12">
          <h2 className="text-base/7 font-semibold text-white">Personal Information</h2>
          <p className="mt-1 text-sm/6 text-gray-400">Use a permanent address where you can receive mail.</p>
          
           {showAlert && (
        <ShowAlert message={message} setShowAlert={setShowAlert} />
      )}
      

          <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
            <div className="sm:col-span-4">
              <label htmlFor="first-name" className="block text-sm/6 font-medium text-white">
                Name
              </label>
              <div className="mt-2">
                <input
                  id="first-name"
                  name="first-name"
                  type="text"
                  autoComplete="given-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6"
                />
              </div>
            </div>


            <div className="sm:col-span-4">
              <label htmlFor="email" className="block text-sm/6 font-medium text-white">
                Email address
              </label>
              <div className="mt-2">
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6"
                />
              </div>
            </div>

            <div className="sm:col-span-4">
              <label htmlFor="time-zone" className="block text-sm/6 font-medium text-white">
                Time Zone
              </label>
                

      <select
        disabled
        id="time-zone"
        name="time-zone"
        value={selectedTimezone}
        onChange={(e) => setSelectedTimezone(e.target.value)}
        className="col-start-1 row-start-1 w-full appearance-none rounded-md bg-gray-900 py-2 pr-8 pl-3 text-sm text-white border border-gray-700 focus:border-indigo-500 focus:ring-indigo-500"
      >
        {tzOption.map((tz, index) => (
          <option key={index} value={tz.name} className="bg-gray-800">
            {tz.name}
          </option>
        ))}
         
      </select>

     
 </div>
    <div className="sm:col-span-3">
       <label htmlFor="date" className="block text-sm/6 font-medium text-white">
                Date
              </label>

    <DatePicker
      id="date"
      selected={selectedDate}
      onChange={(date) => setSelectedDate(date)}
      minDate={new Date()}
      maxDate={new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)}
      filterDate={(date) => {
        const userTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const dateInUserTz = DateTime.fromJSDate(date).setZone(userTz);
        const dayName = dateInUserTz.toFormat("cccc").toLowerCase();

        // ✅ 1. Cek apakah hari ini termasuk working day (dari dayLabel)
       
        const isWorkingDay = (dayLabel).includes(dayName);

        

        // hanya tampilkan tanggal yang working day & bukan blackout
        return isWorkingDay;
      }}
      className="bg-gray-900 text-white border border-gray-700 rounded-md p-2"
      placeholderText="Choose a date"
    />

    {/* <DatePicker
      id="date"
      selected={selectedDate}
      onChange={(date) => setSelectedDate(date)}
      minDate={new Date()}
      maxDate={new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)}
      filterDate={(date) => {
        const userTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const dateInUserTz = DateTime.fromJSDate(date).setZone(userTz);
        const dayName = dateInUserTz.toFormat("cccc").toLowerCase();

        // ✅ 1. Cek apakah hari ini termasuk working day (dari dayLabel)
        const isWorkingDay = allowedDays.includes(dayName);

        // ✅ 2. Cek blackout dates
        const isBlackout = blackouts?.some((blackoutDate) => {
          const blackoutInOrganizerTz = DateTime.fromISO(blackoutDate, {
            zone: meeting.timezone,
          });
          const blackoutInUserTz = blackoutInOrganizerTz.setZone(userTz);
          return blackoutInUserTz.toISODate() === dateInUserTz.toISODate();
        });

        // hanya tampilkan tanggal yang working day & bukan blackout
        return isWorkingDay && !isBlackout;
      }}
      className="bg-gray-900 text-white border border-gray-700 rounded-md p-2"
      placeholderText="Choose a date"
    /> */}


    </div>
    {selectedDate && <div className="sm:col-span-3">
      <label htmlFor="time" className="block text-sm/6 font-medium text-white">
        Time
      </label>
      <select
        id="time"
        name="time"
        value={selectedTime}
        onChange={(e) => setSelectedTime(e.target.value)}
        className="col-start-1 row-start-1 w-full appearance-none rounded-md bg-gray-900 py-2 pr-8 pl-3 text-sm text-white border border-gray-700 focus:border-indigo-500 focus:ring-indigo-500"
      >
        <option value="" selected>Choose a time</option>
        {timeOption.map((time, index) => (
          <option key={index} value={time}>
            {time}
          </option>
        ))}
      </select>
    </div>}
           

          </div>
        </div>

      </div>

      <div className="mt-6 flex items-center justify-end gap-x-6">
        <button
          type="submit"
          onClick={handleSubmit}
          className="rounded-md bg-indigo-500 px-3 py-2 text-sm font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
        >
          Submit
        </button>
      </div>
    </form>
    </>
  )
}

function Loading() {
  return(
       <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/75">
          <svg
            aria-hidden="true"
            className="w-12 h-12 animate-spin fill-blue-600 text-gray-200"
            viewBox="0 0 100 101"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
              fill="currentColor"
            />
            <path
              d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
              fill="currentFill"
            />
          </svg>
        </div>
  )
}



function DetailBook() {
  const { id } = useParams();
  const { data, loading, alert, setAlert, fetchData } = ApiClient();
  const [showAlert, setShowAlert] = useState(false);
  const { handleTimezone, timezones, tzOption, handleDayLabel, convertBlackoutToUserRange } = Timepicker();
  


  useEffect(() => {
    if (alert) setShowAlert(true);
  }, [alert]);

  useEffect(() => {
    if (id && !isNaN(Number(id))) {
      fetchData(`book/${id}`);
    } else {
      
      setAlert("Invalid ID");
    }
  }, [id]);

  if (loading) {
    return (
      <Loading />
    );
  }

  const meeting = data && data[0];
  

  return (
    <>
    {/* <Navbar timezones={timezones} /> */}
    <Navbar timezones={timezones} />
    <div className="min-h-screen bg-gray-900 text-white py-20 px-6">
      {/* Alert */}
      {showAlert && (
        <ShowAlert message={alert} setShowAlert={setShowAlert} />
      )}
      
      {/* Header */}
      {meeting ? (
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-indigo-400 text-base font-semibold tracking-wide uppercase">
              Meeting Room Details
            </h2>
            <h1 className="mt-2 text-4xl font-bold text-white">
              {meeting.name}
            </h1>
        <p className="mt-4 text-gray-400">
  {meeting.timezone} (GMT{DateTime.now().setZone(meeting.timezone).toFormat("Z")}) → 
  {timezones} (GMT{DateTime.now().setZone(timezones).toFormat("Z")})
  
  <span className="ml-2">
    {(() => {
      const meetingOffset = DateTime.now().setZone(meeting.timezone).offset;
      const userOffset = DateTime.now().setZone(timezones).offset;
      const diffHours = (meetingOffset - userOffset) / 60;
      return diffHours > 0 ? `+${diffHours} jam` : `${diffHours} jam`;
    })()}
  </span>
</p>



          </div>

          {/* Info Grid */}
          <div className="grid md:grid-cols-2 gap-6 mb-5">
            {/* Working Hours */}
            <div className="bg-gray-800 rounded-xl p-6 shadow-md border border-gray-700">
              <h3 className="text-lg font-semibold text-indigo-300 mb-4">
                Working Hours
              </h3>
              {meeting.working_hours ? (
                <ul className="space-y-2 text-gray-300">
                  {Object.entries(meeting.working_hours).map(([day, hours]: [string, any]) => (
                    <li
                      key={day}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-gray-700 pb-2"
                    >
                      {/* <div className="flex items-center justify-between sm:justify-start w-full sm:w-auto">
                        <span className="capitalize font-medium text-gray-300 w-24">{day}</span>
                        <span className="text-gray-400">{hours}</span>
                      </div> */}
                      {meeting.timezone && (
                        <div className="flex items-center justify-between sm:justify-start w-full sm:w-auto">
                          {handleTimezone(meeting.timezone, day, timezones, hours)}
                         </div>
                      )}
                    </li>
                  ))}
                </ul>

              ) : (
                <p className="text-gray-500 italic">No working hours set</p>
              )}
              {/* Blackout */}
             
                <div className="mt-4">
                  <h4 className="text-sm font-semibold text-indigo-300 mb-2">
                    Blackout
                  </h4>
                   {meeting.blackouts.length > 0 ? (
                  <ul className="space-y-2 text-gray-300">
                   {meeting.blackouts.map((blackout: any, index: number) => (
                    <li
                      key={blackout.id}
                      className="flex justify-between border-b border-gray-700 pb-1"
                    >
                      <span className="capitalize">{blackout}</span>
                    </li> 
                   ))}
                  </ul>
                  ) : (
                    <p className="text-gray-500 italic">No blackout set</p>
                  )}
                </div>
              
            </div>

            {/* Meeting Details */}
            <div className="bg-gray-800 rounded-xl p-6 shadow-md border border-gray-700 space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-indigo-300">
                  Duration
                </h3>
                <p className="text-gray-200">
                  {meeting.meeting_duration} minutes
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-indigo-300">
                  Buffer Before
                </h3>
                <p className="text-gray-200">{meeting.buffer_before} minutes</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-indigo-300">
                  Buffer After
                </h3>
                <p className="text-gray-200">{meeting.buffer_after} minutes</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-indigo-300">
                  Minimum Notice
                </h3>
                <p className="text-gray-200">
                  {meeting.min_notice_minutes} minutes
                </p>
              </div>
            </div>
          </div>
          <div className="grid md:grid-cols-1 gap-6">
            {/* Form */}
            <div className="bg-gray-800 rounded-xl p-6 shadow-md border border-gray-700">
              <h3 className="text-lg font-semibold text-indigo-300 mb-4">
                Form Meeting
              </h3>
             <FormData meeting={meeting} tzOption={tzOption} timezones={timezones} handleDayLabel={handleDayLabel} convertBlackoutToUserRange={convertBlackoutToUserRange} />
            </div>
          </div>
          {/* Footer */}
          <div className="mt-10 text-center">
            <Link
              to="/"
              className="inline-block bg-indigo-600 text-white px-5 py-2.5 rounded-lg hover:bg-indigo-700 transition"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      ) : (
        <p className="text-center text-gray-400 mt-10">
          Data meeting tidak ditemukan.
        </p>
      )}
    </div>
    </>
  );
}

export default DetailBook;
