import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ApiClient from "../api/ApiClient";
import Loading from "../component/Loading";
import ShowAlert from "../component/ShowAlert";
import Timepicker from "../component/Timepicker";

export default function EditSetting() {
  const { id, edit } = useParams();
  const { data, loading, alert, setAlert, fetchData, putData } = ApiClient();
  const { tzOption } = Timepicker();
  console.log('tzOption', tzOption);

  const [showAlert, setShowAlert] = useState(false);

  const [form, setForm] = useState<any>({
    name: "",
    meeting_duration: "",
    min_notice_minutes: "",
    buffer_before: "",
    buffer_after: "",
    timezone: "",
    working_hours: [],
    blackouts: [],
  });

  const DAYS = [
    "monday", "tuesday", "wednesday", "thursday",
    "friday", "saturday", "sunday"
  ];

  // Reset alert setelah tertutup
  useEffect(() => {
    if (!showAlert) setAlert("");
  }, [showAlert]);

  // Fetch initial data
  useEffect(() => {
    if (id) fetchData(`book/${id}`);
  }, [id]);

  // Tampilkan alert
  useEffect(() => {
    if (alert) setShowAlert(true);
  }, [alert]);

  // Mapping data API → form
  useEffect(() => {
    if (!data || data.length === 0) return;

    const d = data[0];
    const apiHours = d.working_hours || {};

    const fullWorkingHours = DAYS.map((day) => {
      if (apiHours[day]) {
        const [start, end] = apiHours[day].split("-");
        return { day, start, end };
      }
      return { day, start: "", end: "" };
    });

    setForm({
      name: d.name || "",
      meeting_duration: d.meeting_duration || "",
      min_notice_minutes: d.min_notice_minutes || "",
      buffer_before: d.buffer_before || "",
      buffer_after: d.buffer_after || "",
      timezone: d.timezone || "",
      working_hours: fullWorkingHours,
      blackouts: d.blackouts || [],
    });
  }, [data]);

  // ---------------------------
  // FORM HANDLERS
  // ---------------------------
  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ---------------------------
  // NORMALIZERS
  // ---------------------------
  const normalizeGeneral = (f: any) => ({
    name: f.name,
    meeting_duration: Number(f.meeting_duration),
    min_notice_minutes: Number(f.min_notice_minutes),
    buffer_before: Number(f.buffer_before),
    buffer_after: Number(f.buffer_after),
    timezone: f.timezone,
  });

  const dayOrder = [...DAYS];

  const normalizeWorkingHours = (arr: any[]) => {
    const obj: any = {};

    arr.forEach((item) => {
      if (item.start && item.end) {
        obj[item.day] = `${item.start}-${item.end}`;
      }
    });

    const sorted: any = {};
    dayOrder.forEach((day) => {
      if (obj[day]) sorted[day] = obj[day];
    });
    return sorted;
  };

  const normalizeWorkingHoursForm = (input: any) => {
    if (Array.isArray(input.working_hours)) {
      return { working_hours: normalizeWorkingHours(input.working_hours) };
    }

    const obj = input.working_hours || {};
    const sorted: any = {};
    dayOrder.forEach((day) => {
      if (obj[day]) sorted[day] = obj[day];
    });
    return { working_hours: sorted };
  };

  const normalizeBlackouts = (f: any) => ({
    blackouts: f.blackouts,
    timezone: f.timezone,
  });

  // ---------------------------
  // VALIDATIONS
  // ---------------------------
  function checkData(data: any, type: string) {
    const err = (m: string) => ({ failed: true, message: m });

    if (type === "general") {
      if (!data.name) return err("Name is required");
      if (!data.meeting_duration) return err("Meeting duration is required");
      if (data.meeting_duration < 30 || data.meeting_duration > 240)
        return err("Meeting duration must be between 30 minutes and 4 hours");

      if (!data.min_notice_minutes)
        return err("Min notice minutes is required");
      if (data.min_notice_minutes < 0 || data.min_notice_minutes > 120)
        return err("Min notice must be between 0 and 2 hours");

      if (!data.buffer_before) return err("Buffer before is required");
      if (data.buffer_before < 0 || data.buffer_before > 60)
        return err("Buffer before must be 0–60 minutes");

      if (!data.buffer_after) return err("Buffer after is required");
      if (data.buffer_after < 0 || data.buffer_after > 60)
        return err("Buffer after must be 0–60 minutes");

      if (!data.timezone) return err("Timezone is required");
    }

    if (type === "working_hours") {
      const hours = data.working_hours;
      if (!hours || Object.keys(hours).length === 0)
        return err("At least one working hour must be set");

      for (const day in hours) {
        const val = hours[day];
        if (!val) continue;
        if (!/^\d{2}:\d{2}-\d{2}:\d{2}$/.test(val))
          return err(`Invalid time format for ${day}: ${val}`);

        const [start, end] = val
          .split("-")
          .map((t: string) => parseInt(t.replace(":", ""), 10));

        if (start >= end)
          return err(`Start time must be before end time for ${day}`);
      }
    }

    if (type === "blackouts") {
      const dates = data.blackouts;
      if (!dates) return { failed: false, message: "" };

      for (const d of dates) {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(d))
          return err(`Invalid date format: ${d}`);
      }

      const unique = new Set(dates);
      if (unique.size !== dates.length)
        return err("Duplicate dates are not allowed");
    }

    return { failed: false, message: "" };
  }

  // ---------------------------
  // SUBMIT HANDLER
  // ---------------------------
  const handleSubmit = async () => {
    if (!form || !data[0]) return;

    let originalSection: any = {};
    let editedSection: any = {};

    switch (edit) {
      case "general":
        originalSection = normalizeGeneral(data[0]);
        editedSection = normalizeGeneral(form);
        break;
      case "working_hours":
        originalSection = normalizeWorkingHoursForm(data[0]);
        editedSection = normalizeWorkingHoursForm(form);
        break;
      case "blackouts":
        originalSection = normalizeBlackouts(data[0]);
        editedSection = normalizeBlackouts(form);
        break;
      default:
        return;
    }

    if (JSON.stringify(originalSection) === JSON.stringify(editedSection)) {
      return setAlert("Nothing changed!");
    }

    const validation = checkData(editedSection, edit!);
    if (validation.failed) return setAlert(validation.message);

    console.log("editedSection", editedSection);

    putData(`settings/${edit}/${id}`, editedSection);
  };

  // ---------------------------
  // PAGE TITLE
  // ---------------------------
  const Title = () => {
    switch (edit) {
      case "general": return "General Settings";
      case "working_hours": return "Working Hours";
      case "blackouts": return "Blackout Dates";
      default: return "Edit Settings";
    }
  };

  // ---------------------------
  // RENDER
  // ---------------------------
  return (
    <>
      {showAlert && <ShowAlert setShowAlert={setShowAlert} alert={alert} />}
      {loading && <Loading />}

      <div className="container mx-auto text-white">
        <h1 className="text-3xl font-bold mb-6">{Title()}</h1>

        <div className="bg-gray-800 p-6 rounded-xl shadow-md space-y-6">
          
          {/* GENERAL */}
          {edit === "general" && (
            <>
              <FormInput label="Meeting Name" name="name" value={form.name} onChange={handleChange} />

              <FormInput type="number" label="Meeting Duration (minutes)" name="meeting_duration"
                value={form.meeting_duration} onChange={handleChange} />

              <FormInput type="number" label="Minimum Notice (minutes)" name="min_notice_minutes"
                value={form.min_notice_minutes} onChange={handleChange} />

              <FormInput type="number" label="Buffer Before (minutes)" name="buffer_before"
                value={form.buffer_before} onChange={handleChange} />

              <FormInput type="number" label="Buffer After (minutes)" name="buffer_after"
                value={form.buffer_after} onChange={handleChange} />

              <FormOption label="Timezone" name="timezone" value={form.timezone} onChange={handleChange}>
                {tzOption.map((tz: any) => (
                  <option key={tz} value={tz}>
                     {tz}
                  </option>
                ))}
              </FormOption>
            </>
          )}

          {/* WORKING HOURS */}
          {edit === "working_hours" && (
            <div>
              <label className="block mb-4 font-semibold text-lg">Working Hours</label>

              {form.working_hours.map((w: any, i: number) => (
                <div
                  key={i}
                  className="grid grid-cols-4 gap-4 mb-4 items-center bg-gray-700 p-4 rounded-lg"
                >
                  <span className="capitalize font-semibold">{w.day}</span>

                  <input
                    type="time"
                    value={w.start}
                    onChange={(e) => {
                      const copy = [...form.working_hours];
                      copy[i].start = e.target.value;
                      setForm({ ...form, working_hours: copy });
                    }}
                    className="p-3 rounded bg-gray-900"
                  />

                  <input
                    type="time"
                    value={w.end}
                    onChange={(e) => {
                      const copy = [...form.working_hours];
                      copy[i].end = e.target.value;
                      setForm({ ...form, working_hours: copy });
                    }}
                    className="p-3 rounded bg-gray-900"
                  />

                  <button
                    onClick={() => {
                      const copy = [...form.working_hours];
                      copy[i].start = "";
                      copy[i].end = "";
                      setForm({ ...form, working_hours: copy });
                    }}
                    className="px-3 py-2 bg-red-600 hover:bg-red-700 rounded-lg"
                  >
                    Clear
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* BLACKOUTS */}
          {edit === "blackouts" && (
            <div>
              <label className="block mb-2 font-semibold">Blackout Dates</label>

              {form.blackouts.map((date: string, i: number) => (
                <div key={i} className="flex items-center gap-2 mt-2">
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => {
                      const copy = [...form.blackouts];
                      copy[i] = e.target.value;
                      setForm({ ...form, blackouts: copy });
                    }}
                    className="flex-1 p-3 rounded bg-gray-700"
                  />

                  <button
                    onClick={() => {
                      const copy = [...form.blackouts];
                      copy.splice(i, 1);
                      setForm({ ...form, blackouts: copy });
                    }}
                    className="px-3 py-2 bg-red-600 rounded-lg font-bold"
                  >
                    X
                  </button>
                </div>
              ))}

              <button
                onClick={() =>
                  setForm({ ...form, blackouts: [...form.blackouts, ""] })
                }
                className="px-4 py-2 mt-3 bg-blue-700 rounded-lg"
              >
                + Add Blackout Date
              </button>
            </div>
          )}

          {/* SAVE BUTTON */}
          <button
            onClick={handleSubmit}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition"
          >
            Save Changes
          </button>
        </div>
      </div>
    </>
  );
}

/* Small form components */
function FormInput({ label, name, value, onChange, type = "text" }: any) {
  return (
    <div>
      <label className="block text-sm font-semibold mb-1">{label}</label>
      <input
        type={type}
        name={name}
        className="w-full p-3 rounded bg-gray-700 focus:ring focus:ring-blue-400 outline-none"
        value={value}
        onChange={onChange}
      />
    </div>
  );
}

function FormOption({ label, name, value, onChange, children }: any) {
  return (
    <div>
      <label className="block text-sm font-semibold mb-1">{label}</label>
      <select
        name={name}
        className="w-full p-3 rounded bg-gray-700 focus:ring focus:ring-blue-400 outline-none"
        value={value}
        onChange={onChange}
      >
        {children}
      </select>
    </div>
  );
}
