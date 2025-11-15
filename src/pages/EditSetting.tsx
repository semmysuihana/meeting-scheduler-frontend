import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ApiClient from "../api/ApiClient";
import Loading from "../component/Loading";
import ShowAlert from "../component/ShowAlert";
import Timepicker from "../component/Timepicker";
export default function EditSetting() {
  const { id, edit } = useParams();
  const { data, loading, alert, setAlert, fetchData } = ApiClient();
const { tzOption } = Timepicker();
  const [showAlert, setShowAlert] = useState(false);

  const [form, setForm] = useState<any>({
    name: "",
    meeting_duration: "",
    min_notice_minutes: "",
    buffer_before: "",
    buffer_after: "",
    timezone: "",

    // default empty
    working_hours: [],
    blackouts: [],
  });

  useEffect(() => {
    if (id) fetchData(`book/${id}`);
  }, [id]);

  useEffect(() => {
    if (alert) setShowAlert(true);
  }, [alert]);

// daftar hari dalam seminggu (urutan normal)
const DAYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

useEffect(() => {
  if (!data || data.length === 0) return;

  const d = data[0];

  // NORMALISASI DATA DARI API
  const apiHours = d.working_hours || {};

  const fullWorkingHours = DAYS.map((day) => {
    if (apiHours[day]) {
      const [start, end] = apiHours[day].split("-");
      return { day, start, end };
    }

    // jika hari tidak ada di API → tetap tampil tapi kosong
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


  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const checkData = (data: any, type: string) => {
    const result = { failed: false, message: "" };
    if (type === "general") {
      
      if (!data.name) result.failed = true;
      if (!data.meeting_duration) result.failed = true;
      if (!data.min_notice_minutes) result.failed = true;
      if (!data.buffer_before) result.failed = true;
      if (!data.buffer_after) result.failed = true;
      if (!data.timezone) result.failed = true;
    }
    return result;
  }

function normalizeGeneral(form: any) {
  return {
    name: form.name,
    meeting_duration: Number(form.meeting_duration),
    min_notice_minutes: Number(form.min_notice_minutes),
    buffer_before: Number(form.buffer_before),
    buffer_after: Number(form.buffer_after),
    timezone: form.timezone,
  };
}

const dayOrder = ["monday","tuesday","wednesday","thursday","friday","saturday","sunday"];

function normalizeWorkingHours(arr: any[]) {
  const obj: any = {};
  arr.forEach((item) => {
    if (item.start && item.end) {
      obj[item.day] = `${item.start}-${item.end}`;
    }
  });

  // urutkan object berdasarkan dayOrder
  const sortedObj: any = {};
  dayOrder.forEach(day => {
    if (obj[day]) sortedObj[day] = obj[day];
  });

  return sortedObj;
}

function normalizeWorkingHoursForm(input: any) {
  if (Array.isArray(input.working_hours)) {
    return { working_hours: normalizeWorkingHours(input.working_hours) };
  } else {
    // jika dari data[0] sudah object, urutkan juga
    const obj = input.working_hours || {};
    const sortedObj: any = {};
    dayOrder.forEach(day => {
      if (obj[day]) sortedObj[day] = obj[day];
    });
    return { working_hours: sortedObj };
  }
}







function normalizeBlackouts(form: any) {
  return {
    blackouts: form.blackouts,
  };
}

  const handleSubmit = async () => {
  if (!form) return;

  let originalSection = "";
  let editedSection = "";
    console.log("form:", form);
    console.log("edit:", data[0]);
  switch (edit) {
    case "general":
      originalSection = JSON.stringify(normalizeGeneral(data[0]));
      editedSection = JSON.stringify(normalizeGeneral(form));
      break;

    case "working_hours":
      originalSection = JSON.stringify(normalizeWorkingHoursForm(data[0]));
      editedSection = JSON.stringify(normalizeWorkingHoursForm(form));
      break;

    case "blackouts":
      originalSection = JSON.stringify(normalizeBlackouts(data[0]));
      editedSection = JSON.stringify(normalizeBlackouts(form));
      break;

    default:
      return;
  }
  console.log("originalSection:", originalSection);
  console.log("editedSection:", editedSection);

  // cek perubahan
  if (originalSection === editedSection) {
    return setAlert("Nothing changed!");
  }

  console.log("original:", originalSection);
  console.log("edited:", editedSection);

  switch (edit) {
    case "general": {
      const resultCheck = checkData(editedSection, "general");
      if (resultCheck.failed) return setAlert(resultCheck.message);
      console.log("submit general berhasil");
      break;
    }

    case "working_hours":
      console.log("submit working hours");
      break;

    case "blackouts":
      console.log("submit blackouts");
      break;
  }
};


  const Title = () => {
    if (edit === "general") return "General Settings";
    if (edit === "working_hours") return "Working Hours";
    if (edit === "blackouts") return "Blackout Dates";
    return "Edit Settings";
  };

  return (
    <>
      {showAlert && <ShowAlert message={alert} setShowAlert={setShowAlert} />}
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
<FormOption
  label="Timezone"
  name="timezone"
  value={form.timezone}
  onChange={handleChange}
>
  {tzOption.map((tz: any) => (
    <option key={tz.name} value={tz.name}>
      {tz.offset} — {tz.name}
    </option>
  ))}
</FormOption>


            </>
          )}

{edit === "working_hours" && (
  <div>
    <label className="block mb-4 font-semibold text-lg">Working Hours</label>

    {form.working_hours.map((w: any, i: number) => (
      <div
        key={i}
        className="grid grid-cols-4 gap-4 mb-4 items-center bg-gray-700 p-4 rounded-lg"
      >
        {/* DAY NAME */}
        <span className="capitalize font-semibold text-gray-200">
          {w.day}
        </span>

        {/* START TIME */}
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

        {/* END TIME */}
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

        {/* CLEAR BUTTON */}
        <button
          onClick={() => {
            const copy = [...form.working_hours];
            copy[i].start = "";
            copy[i].end = "";
            setForm({ ...form, working_hours: copy });
          }}
          className="px-3 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white"
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
                <input
                  key={i}
                  type="date"
                  value={date}
                  onChange={(e) => {
                    const copy = [...form.blackouts];
                    copy[i] = e.target.value;
                    setForm({ ...form, blackouts: copy });
                  }}
                  className="w-full mt-2 p-3 rounded bg-gray-700"
                />
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

          <button
            onClick={handleSubmit}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 rounded-lg shadow text-white font-semibold transition"
          >
            Save Changes
          </button>
        </div>
      </div>
    </>
  );
}

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
