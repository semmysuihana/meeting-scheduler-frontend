import { useState, useEffect } from "react";
import axios from "axios";

const serverName = import.meta.env.VITE_SERVER_API;

export default function ApiClient() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [alert, setAlert] = useState<string>("");

  async function fetchData(endpoint: string = "", params: any = {}) {
    setLoading(true);
    
    try {
      const url = endpoint ? `${serverName}/${endpoint}` : serverName;

      const response = await axios.get(url, { params });
      if(response.data.length === 0) throw new Error("Data not found");
      console.log("ini data",response.data);
      setData(response.data);
      setAlert("");
    } catch (err: any) {
      console.error(err);
      setAlert(err.response?.data?.message || err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  async function postData(endpoint: string = "", data: any = {}) {
    
    try {
      setLoading(true);
      const url = endpoint ? `${serverName}/${endpoint}` : serverName;
      const response = await axios.post(url, data);
      console.log("ini data post",response.data);
      if(response.data){
        if(response.data.success) setAlert(response.data.success);
        if(response.data.error) setAlert(response.data.error);
      }
    } catch (err: any) {
      console.error(err);
      setAlert(err.response?.data?.message || err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  return { data, loading, alert, setAlert, fetchData, postData };
}
