/// <reference types="vite/client" />

import { useState } from "react";
import axios, { AxiosError } from "axios";

const serverName = import.meta.env.VITE_SERVER_API;

// ------------------------------
// TYPE DEFINITIONS
// ------------------------------
interface ApiError {
  message?: string;
  error?: string;
}

interface Booking {
  id: number;
  organizer_id: number;
  organizer_name: string;
  name: string;
  email: string;
  user_timezone: string;
  organizer_timezone: string;
  timezone: string;
  status: string; // "booked" | "rescheduled" | "cancelled"
  meeting_duration: number;
  buffer_before: number;
  buffer_after: number;
  min_notice_minutes: number;
  slot_start_utc: string;
  slot_end_utc: string;
  created_at: string;
  working_hours: Record<string, string>; // { monday: "09:00-17:00", ... }
  blackouts: string[]; // ["2025-11-17", "2025-12-10", ...]
}


// ------------------------------
// API CLIENT HOOK
// ------------------------------

export default function ApiClient() {
  const [data, setData] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState("");

  const buildUrl = (endpoint: string="") =>
    endpoint ? `${serverName}/${endpoint}` : serverName;

  // ------------------------------
  // GET
  // ------------------------------
  async function fetchData(endpoint: string = "", params: object = {}) {
    setLoading(true);
    try {
      const response = await axios.get(buildUrl(endpoint), {
        params,
      });

      if (!response.data) {
        throw new Error("Data not found");
      }
      console.log("API Response:", response.data);
      setData(response.data);
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  }

  // ------------------------------
  // POST
  // ------------------------------
  async function postData(endpoint?: string, body: object = {}) {
    setLoading(true);
    try {
      const response = await axios.post(
        buildUrl(endpoint),
        body
      );
      handleMessage(response.data);
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  }

  // ------------------------------
  // PUT
  // ------------------------------
  async function putData(endpoint?: string, body: object = {}) {
    setLoading(true);
    try {
      const response = await axios.put(
        buildUrl(endpoint),
        body
      );
      handleMessage(response.data);
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  }

  // ------------------------------
  // ERROR HANDLER
  // ------------------------------
  function handleError(error: unknown) {
    const err = error as AxiosError<ApiError>;
    const msg =
      err.response?.data?.message ||
      err.response?.data?.error ||
      err.message ||
      "Unknown error";

    console.error("API Error:", msg);
    setAlert(msg);
  }

  // ------------------------------
  // SUCCESS / ERROR ALERT HANDLER
  // ------------------------------
  interface ApiResponse {
  success?: string;
  error?: string;
}

  function handleMessage(res: ApiResponse) {
    if (res.success) setAlert(res.success);
    if (res.error) setAlert(res.error);
  }

  return { data, loading, alert, setAlert, fetchData, postData, putData };
}
