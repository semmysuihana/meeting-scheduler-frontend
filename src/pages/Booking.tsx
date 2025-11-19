import ShowAlert from "../component/ShowAlert";
import Loading from "../component/Loading";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Timepicker from "../component/Timepicker";
import DatePicker from "react-datepicker";
import ApiClient from "../api/ApiClient";
import { DateTime } from "luxon";

function Booking() {
  const { id } = useParams();
  const [showAlert, setShowAlert] = useState(false);
  const [selectedTime, setSelectedTime] = useState("");
  const [dataPut, setDataPut] = useState<any>(null);
  const [modalOpenSure, setModalOpenSure] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [modalRescheduleOpen, setModalRescheduleOpen] = useState(false);
  const [workingHours, setWorkingHours] = useState<{ dayLabel: string; hours: string }[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
   
     const [timeOption, setTimeOption] = useState<string[]>([]);
  const {  handleDayLabel, getTimeOption, getSelectedTimeRange } = Timepicker();
  const [dayLabel, setDayLabel] = useState<string[]>([]);


  const { data, loading, alert, setAlert, fetchData, putData } = ApiClient();
  useEffect(() => {
    if(modalRescheduleOpen == false){
      setSelectedTime("");
      setSelectedDate(null);
    }
  }, [modalRescheduleOpen])
    useEffect(() => {
      if( data && data[0] && data[0].organizer_timezone && data[0].working_hours) {
        const dayLabel = handleDayLabel(data[0].organizer_timezone, data[0].organizer_timezone, data[0].working_hours);
        setWorkingHours(dayLabel);
         const allowedDays = dayLabel.map(d => d.dayLabel.toLowerCase()); 
         setDayLabel(allowedDays);
      }
    }, [data]);
  useEffect(() => {
    if (id && !isNaN(Number(id))) {
      fetchData(`book/${id}/booking`);
    } else {
      setAlert("Invalid ID");
    }
  }, [id]);
  useEffect(() => {
    if(showAlert==false) {
      setAlert("");
    }
  }, [showAlert])
  useEffect(() => {
    fetchData(`book/${id}/booking`);
    if (alert) setShowAlert(true);    
  }, [alert]);

   useEffect(() => {
    if (selectedDate) {
     const dateString = DateTime.fromJSDate(selectedDate)
    .toFormat("yyyy-MM-dd");
  const organizerTz = data?.[0]?.organizer_timezone;
  if (!organizerTz) return;
  const dayName = DateTime.fromISO(dateString, { zone: data[0].organizer_timezone })
    .toFormat("cccc");
      const selected = DateTime.fromJSDate(selectedDate).setZone(data[0].organizer_timezone);
      const timeOptions = getTimeOption(dayName, workingHours, data[0].meeting_duration, data[0].buffer_before, data[0].buffer_after, data[0].min_notice_minutes,selected);
      setTimeOption(timeOptions);
    }
  }, [selectedDate]);



  const openModal = (booking: any) => {
  setSelectedBooking(booking);
  setModalOpen(true);
};

function payloadBooking(
  organizerId: number | undefined,
  bookingId: string | undefined,
  date: Date | null,
  time: string,
  timezone: string | undefined
) {
  // --- VALIDASI AWAL ---
  if (!organizerId || !bookingId) return false;
  if (!date) {
    setAlert("Please choose a date first");
    return false;
  }
  if (!time) {
    setAlert("Please choose a time");
    return false;
  }
  if (!timezone) return false;
  const range = getSelectedTimeRange(date, time, timezone);
  if (!range) {
    setAlert("Invalid time selection format");
    return false;
  }

  const { start: userStart, end: userEnd } = range;

  // --- UTC CONVERSION ---
  const startUTC =
    timezone !== "Europe/London"
      ? userStart.toUTC().toISO()
      : userStart.toISO();

  const endUTC =
    timezone !== "Europe/London"
      ? userEnd.toUTC().toISO()
      : userEnd.toISO();

  return {
    organizer_id: organizerId,
    booking_id: bookingId,
    start_time_utc: startUTC,
    end_time_utc: endUTC,
    timezone,
  };
}


function showAlertSure(message: string, bookingId: number, status: string) {
  setDataPut({message, bookingId, status});
  setModalOpenSure(true);
}

const ModalReschedule = () => {
  if(!modalRescheduleOpen) return null;
  const todayUser = DateTime.now().setZone(data[0].organizer_timezone).startOf("day");

  // MAX DATE (hari ke-14 dari sekarang)
  const maxDateUser = todayUser.plus({ days: 14 });
  return (
     <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
      <div className="bg-gray-800 p-6 rounded-xl w-96 shadow-lg text-white space-y-6">

        {/* Title */}
        <h2 className="text-xl font-bold text-center">Reschedule Booking</h2>
        {/* Working hours */}
        <div>
          <label className="block mb-2 font-semibold text-gray-300">
            Working Hours
          </label>

          <div className="grid grid-cols-1 gap-2">
            {workingHours.map((hour: any) => (
              // display working hours
              <div
                key={hour.dayLabel}
                className="flex items-center space-x-2"
              >
                <span>{hour.dayLabel}</span>
                <span>{hour.hours}</span>
              </div>

            ))}
          </div>
        </div>

        {/* Date Picker */}
        <div>
          <label className="block mb-2 font-semibold text-gray-300">
            Choose New Date
          </label>

          <DatePicker
          
            selected={selectedDate}
            onChange={(date) => setSelectedDate(date)}
            minDate={todayUser.toJSDate()}
            maxDate={maxDateUser.toJSDate()}
            filterDate={(date) => {
    // Ambil nama hari dari tanggal (tanpa timezone conversion)
    const dayName = date
      .toLocaleDateString("en-US", { weekday: "long" })
      .toLowerCase();

    // Langsung cocokkan dengan dayLabel
    return dayLabel.includes(dayName);
  }}
            className="w-full p-3 rounded bg-gray-700 focus:ring focus:ring-blue-400 outline-none"
            calendarClassName="bg-gray-800 text-white"
          />
        </div>

        {/* Time Picker */}
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

        {/* Buttons */}
        <div className="flex justify-end gap-2">

        <button
  onClick={() => {
    const payload = payloadBooking(
      selectedBooking?.organizer_id,
      selectedBooking?.id,
      selectedDate,
      selectedTime,
      selectedBooking?.organizer_timezone
    );

    if (payload === false) {
      return;
    }
    putData(
      `book/booked/${selectedBooking?.id}/status`,
      { payload }
    );
    setModalRescheduleOpen(false);
  }}
  className="py-2 px-4 bg-green-600 rounded hover:bg-green-500"
>
  Confirm Booked
</button>


          <button
            onClick={() => {
              setModalRescheduleOpen(false);
              showAlertSure(
                "Are you sure to reschedule this booking later?",
                selectedBooking.id,
                "rescheduled"
              );
            }}
            className="py-2 px-4 bg-yellow-600 rounded hover:bg-yellow-500"
          >
            Later
          </button>

          <button
            onClick={() => {
              setModalRescheduleOpen(false);
            }}
            className="py-2 px-4 bg-gray-600 rounded hover:bg-gray-500"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

const ModalSure = () =>{
  if(!modalOpenSure) return null;
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
      <div className="bg-gray-800 p-6 rounded-lg w-96 shadow-lg text-white">
        <h2 className="text-xl font-bold mb-4">Are you sure to do this?</h2>
        <p className="mb-6">{dataPut?.message}</p>
        <div className="flex justify-end">
          <button
            onClick={() => {
              setModalOpenSure(false);
            }}
            className="mr-2 py-2 px-4 bg-gray-600 rounded hover:bg-gray-500"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              putData(`book/${dataPut?.status}/${dataPut?.bookingId}/status`, {});
              setModalOpenSure(false);
            }}
            className="py-2 px-4 bg-red-600 rounded hover:bg-red-500"
          >
            Yes
          </button>
        </div>
      </div>
    </div>
  );
}




const Modal = () => {
  if (!modalOpen || !selectedBooking) return null;

  const status = selectedBooking.status;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
      <div className="bg-gray-800 p-6 rounded-lg w-96 shadow-lg text-white">
        <h2 className="text-xl font-bold mb-4">
          Edit Booking #{selectedBooking.id} - {selectedBooking.name} - {selectedBooking.email}
        </h2> 

        <p className="mb-6">Pilih tindakan untuk booking ini:</p>

        <div className="flex flex-col gap-3">

          {/* === STATUS: BOOKED === */}
          {status === "booked" && (
            <>
              <button
                onClick={() => {
                  setModalOpen(false);
                  showAlertSure("Are you sure to cancel this booking?", selectedBooking.id, "cancelled");
                }}
                className="w-full bg-red-600 py-2 rounded hover:bg-red-500"
              >
                Cancel Booking
              </button>

              <button
                onClick={() => {
                  setModalOpen(false);
                  setModalRescheduleOpen(true);
              }}
                className="w-full bg-blue-600 py-2 rounded hover:bg-blue-500"
              >
                Reschedule
              </button>
            </>
          )}

          {/* === STATUS: RESCHEDULED === */}
          {status === "rescheduled" && (
            <>
              <button
                onClick={() => {
                  setModalOpen(false);
                  setModalRescheduleOpen(true);   // buka modal kedua
                }}
                className="w-full bg-green-600 py-2 rounded hover:bg-green-500"
              >
                Mark as Booked
              </button>


              <button
                onClick={() => {
                  setModalOpen(false);
                  showAlertSure("Are you sure to cancel this booking?", selectedBooking.id, "cancelled")
                }}

                className="w-full bg-red-600 py-2 rounded hover:bg-blue-500"
              >
                Cancelled
              </button>
            </>
          )}
          {status==="cancelled" && (
            <>
              <button
                onClick={() => {
                  setModalOpen(false);
                  setModalRescheduleOpen(true);   // buka modal kedua
                }}
                className="w-full bg-green-600 py-2 rounded hover:bg-green-500"
              >
                Reschedule
              </button>
            </>
          ) }

          {/* CLOSE BUTTON ALWAYS */}
          <button
            onClick={() => setModalOpen(false)}
            className="w-full bg-gray-600 py-2 rounded hover:bg-gray-500"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

  const formatToOrganizerTime = (utcString: string, timezone: string) => {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(utcString));
};

  return (
    <>
      {showAlert && <ShowAlert setShowAlert={setShowAlert} alert={alert}/>}
      {loading && <Loading />}
      <Modal />
      <ModalSure />
      <ModalReschedule />

      <div className="container mx-auto p-4 text-white">
        <h1 className="text-3xl font-bold mb-6">Bookings</h1>

        <div className="overflow-x-auto">
          <table className="min-w-full bg-gray-800 rounded-lg overflow-hidden">
            <thead className="bg-gray-900">
              <tr>
                <th className="px-4 py-2 text-left">ID</th>
                <th className="px-4 py-2 text-left">Name</th>
                <th className="px-4 py-2 text-left">Email</th>
                <th className="px-4 py-2 text-left">Start</th>
                <th className="px-4 py-2 text-left">End</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {data && data.length > 0 ? (
                data.map((booking: any) => (
                  <tr key={booking.id} className="border-b border-gray-700">
                    <td className="px-4 py-2">{booking.id}</td>
                    <td className="px-4 py-2">{booking.name}</td>
                    <td className="px-4 py-2">{booking.email}</td>
                    <td className="px-4 py-2">
                      {formatToOrganizerTime(booking.slot_start_utc, booking.organizer_timezone)}
                    </td>
                    <td className="px-4 py-2">
                      {formatToOrganizerTime(booking.slot_end_utc, booking.organizer_timezone)}
                    </td>
                    <td className="px-4 py-2">
                      <span
                        className={`px-2 py-1 rounded ${
                          booking.status === "booked"
                            ? "bg-green-600"
                            : "bg-red-600"
                        }`}
                      >
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      <button
                        className="px-3 py-1 bg-blue-700 rounded hover:bg-blue-600"

                        onClick={() => openModal(booking)}

                      >
                        Switch Status
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-4 py-4 text-center text-gray-400">
                    No bookings found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

export default Booking;
