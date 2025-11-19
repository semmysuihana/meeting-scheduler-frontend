import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import ApiClient from "../api/ApiClient";
import Navbar from "./../component/Navbar";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { DateTime } from "luxon";
import Timepicker from "./../component/Timepicker";
import ShowAlert from "../component/ShowAlert";
import Loading from "../component/Loading";

/* ============================================================
   TYPE DEFINITIONS (semua disimpan dalam file ini saja)
   ============================================================ */

type LuxonDateTime = InstanceType<typeof DateTime>;

interface WorkingHour {
  start: string;
  end: string;
}

interface WorkingHoursMap {
  [day: string]: WorkingHour;
}

interface BlackoutRange {
  id?: number;
  start: string;
  end: string;
}

interface ConvertedBlackout {
  startUser: LuxonDateTime;
  endUser: LuxonDateTime;
}

interface MeetingDetail {
  id: number;
  name: string;
  timezone: string;
  meeting_duration: number;
  buffer_before: number;
  buffer_after: number;
  min_notice_minutes: number;
  working_hours: WorkingHoursMap;
  blackouts: BlackoutRange[];
}

interface FormDataProps {
  meeting: MeetingDetail;
  tzOption: string[];
  timezones: string;
  handleDayLabel: (...args: any[]) => any[];
  convertBlackoutToUserRange: (
    blackouts: BlackoutRange[],
    tzFrom: string,
    tzTo: string
  ) => ConvertedBlackout[];
  getTimeOption: (...args: any[]) => string[];
  getSelectedTimeRange: (
    date: Date,
    time: string,
    timezone: string
  ) => { start: LuxonDateTime; end: LuxonDateTime } | null;
  isTimeOverlap: (...args: any[]) => boolean;
}

/* ============================================================
   FORM DATA COMPONENT
   ============================================================ */

function FormData({
  meeting,
  tzOption,
  timezones,
  handleDayLabel,
  convertBlackoutToUserRange,
  getTimeOption,
  getSelectedTimeRange,
  isTimeOverlap
}: FormDataProps) {
  const [selectedTimezone, setSelectedTimezone] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [timeOption, setTimeOption] = useState<string[]>([]);
  const [organizerId, setOrganizerId] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const [dayLabel, setDayLabel] = useState<string[]>([]);
  const [blackout, setBlackout] = useState<ConvertedBlackout[]>([]);
  const [message, setMessage] = useState<string>("");
  const [showAlert, setShowAlert] = useState<boolean>(false);
  const [workingHours, setWorkingHours] = useState<any[]>([]);

  const { loading, alert, setAlert, postData } = ApiClient();

  /* Meeting ID */
  useEffect(() => {
    if (meeting.id) setOrganizerId(String(meeting.id));
  }, [meeting.id]);

  /* Show alert when message muncul */
  useEffect(() => {
    if (message) setShowAlert(true);
  }, [message]);

  /* Alert handling */
  useEffect(() => {
    if (alert) {
      setShowAlert(true);
      setMessage(alert);
    }
  }, [alert]);

  useEffect(() => {
    if (!showAlert) {
      setMessage("");
      setAlert("");
    }
  }, [showAlert]);

  // useEffect(()=>{

  // },[setMessage])

  /* Convert blackout */
  useEffect(() => {
    if (meeting) {
      const result = convertBlackoutToUserRange(
        meeting.blackouts,
        meeting.timezone,
        timezones
      );
      setBlackout(result);
    }
  }, [meeting]);

  /* Date change -> generate time option */
  useEffect(() => {
    if (selectedDate) {
      const dateString = DateTime.fromJSDate(selectedDate).toFormat("yyyy-MM-dd");
      const dayName = DateTime.fromISO(dateString, { zone: timezones }).toFormat("cccc");
      const selected = DateTime.fromJSDate(selectedDate).setZone(timezones);

      const timeOptions = getTimeOption(
        dayName,
        workingHours,
        meeting.meeting_duration,
        meeting.buffer_before,
        meeting.buffer_after,
        meeting.min_notice_minutes,
        selected
      );
      setTimeOption(timeOptions);
    }
  }, [selectedDate]);

  /* Working hours convert */
  useEffect(() => {
    if (timezones && meeting.timezone && meeting.working_hours) {
      const converted = handleDayLabel(
        meeting.timezone,
        timezones,
        meeting.working_hours
      );

      setWorkingHours(converted);

      const allowedDays = converted.map((d: any) => d.dayLabel.toLowerCase());
      setDayLabel(allowedDays);
    }
  }, [meeting]);

  /* Set default timezone */
  useEffect(() => {
    setSelectedTimezone(timezones);
  }, []);

 

  /* Submit */
  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!organizerId) return setMessage("organizer id empty");
    if (!name) return setMessage("Please enter your name");
    if (!email || !email.includes("@"))
      return setMessage("Please enter your email correctly");
    if (!selectedDate) return setMessage("Please select your date");
    if (!selectedTime) return setMessage("Please select your time");
    if (!selectedTimezone) return setMessage("Please select your time zone");

    const range = getSelectedTimeRange(selectedDate, selectedTime, selectedTimezone);
    if (!range) return setMessage("Invalid time selection format");

    const { start: userStart, end: userEnd } = range;

    const isBlocked = blackout.some((b) =>
      isTimeOverlap(userStart, userEnd, b.startUser, b.endUser)
    );
    if (isBlocked) return setMessage("The selected time is unavailable blackout.");

    const startUTC =
      timezones !== "Europe/London" ? userStart.toUTC().toISO() : userStart.toISO();
    const endUTC =
      timezones !== "Europe/London" ? userEnd.toUTC().toISO() : userEnd.toISO();

    const payload = {
      organizer_id: organizerId,
      name,
      email,
      start_time_utc: startUTC,
      end_time_utc: endUTC,
      user_timezone: timezones,
    };

    postData("book", payload);
  }

  if (loading) return <Loading />;

  /* Render */
  return (
    <>
      <form>
        <div className="space-y-12">
          <div className="border-b border-white/10 pb-12">
            <h2 className="text-base/7 font-semibold text-white">
              Personal Information
            </h2>

            {showAlert && <ShowAlert setShowAlert={setShowAlert} alert={alert || message} />}

            {/* Form */}
            <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
              <div className="sm:col-span-4">
                <label className="block text-sm/6 font-medium text-white">Name</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white"
                />
              </div>

              <div className="sm:col-span-4">
                <label className="block text-sm/6 font-medium text-white">
                  Email
                </label>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  className="block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white"
                />
              </div>

              {/* Timezone */}
              <div className="sm:col-span-4">
                <label className="block text-sm/6 font-medium text-white">
                  Time Zone
                </label>

                <select
                  disabled
                  value={selectedTimezone}
                  onChange={(e) => setSelectedTimezone(e.target.value)}
                  className="w-full rounded-md bg-gray-900 py-2 pl-3 text-sm text-white"
                >
                  {tzOption.map((tz, i) => (
                    <option key={i} value={tz}>
                      {tz}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date */}
              <div className="sm:col-span-3">
                <label className="block text-sm/6 font-medium text-white">Date</label>

                <DatePicker
                  selected={selectedDate}
                  onChange={(date) => setSelectedDate(date)}
                  minDate={new Date()}
                  maxDate={new Date(Date.now() + 14 * 86400000)}
                  filterDate={(date) => {
                    const dayName = date
                      .toLocaleDateString("en-US", { weekday: "long" })
                      .toLowerCase();
                    return dayLabel.includes(dayName);
                  }}
                  className="bg-gray-900 text-white border border-gray-700 rounded-md p-2"
                  placeholderText="Choose a date"
                />
              </div>

              {/* Time */}
              {selectedDate && (
                <div className="sm:col-span-3">
                  <label className="block text-sm/6 font-medium text-white">
                    Time
                  </label>

                  <select
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                    className="w-full rounded-md bg-gray-900 py-2 pl-3 text-sm text-white"
                  >
                    <option value="">Choose a time</option>
                    {timeOption.map((t, i) => (
                      <option key={i}>{t}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end">
          <button
            type="submit"
            onClick={handleSubmit}
            className="rounded-md bg-indigo-500 px-3 py-2 text-sm font-semibold text-white"
          >
            Submit
          </button>
        </div>
      </form>
    </>
  );
}

/* ============================================================
   LOADING COMPONENT
   ============================================================ */



/* ============================================================
   DETAIL BOOK PAGE
   ============================================================ */

function DetailBook() {
  const { id } = useParams();
  const { data, loading, alert, setAlert, fetchData } = ApiClient();
  const [showAlert, setShowAlert] = useState(false);

  const {
    handleTimezone,
    timezones,
    tzOption,
    handleDayLabel,
    convertBlackoutToUserRange,
    getTimeOption,
    getSelectedTimeRange,
    isTimeOverlap
  } = Timepicker();

  useEffect(() => {
    if (alert) setShowAlert(true);
  }, [alert]);

  useEffect(() => {
    if (id && !isNaN(Number(id))) fetchData(`book/${id}`);
    else setAlert("Invalid ID");
  }, [id]);

  if (loading) return <Loading />;

  const meeting: MeetingDetail | undefined = data?.[0];

  return (
    <>
    {/* <Navbar timezones={timezones} /> */}
    <Navbar timezones={timezones} />
    <div className="min-h-screen bg-gray-900 text-white py-20 px-6">
      {/* Alert */}
      {showAlert && <ShowAlert setShowAlert={setShowAlert} alert={alert}/>}
      
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
                   {meeting.blackouts.map((blackout: any) => (
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
             <FormData meeting={meeting} tzOption={tzOption} timezones={timezones} handleDayLabel={handleDayLabel} convertBlackoutToUserRange={convertBlackoutToUserRange} getTimeOption={getTimeOption} getSelectedTimeRange={getSelectedTimeRange} isTimeOverlap={isTimeOverlap}/>
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
