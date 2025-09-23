import axios from "axios";
import { baseUri } from "../config/config";

axios.defaults.headers.post["Content-Type"] = "application/json";

export async function invokeApi({
  path,
  method = "GET",
  headers = {},
  queryParams = {},
  postData = {},
  isAuth = true,
  responseType = "json", // ✅ allow responseType to be passed
}) {
  const reqObj = {
    method,
    url: baseUri + path,
    headers,
    params: queryParams,
    responseType, // ✅ this is critical for CSV export
  };

  if (method !== "GET") {
    reqObj.data = postData;
    if (postData instanceof FormData) {
      reqObj.headers["Content-Type"] = "multipart/form-data";
    }
  }

  if (isAuth) {
    reqObj.headers.Authorization = `Bearer ${localStorage.getItem("token")}`;
  }

  try {
    const results = await axios(reqObj);

    // ✅ If this was a blob request, return full response so we can access headers
    if (responseType === "blob") {
      return results;
    }

    // Otherwise return data as before (backward compatibility)
    return results.data;
  } catch (error) {
    console.error("<===Api-Error===>", error.response?.data);

    if (error.response?.status === 401) {
      localStorage.clear();
      window.location.reload("/login");
    }

    return {
      code: error.response?.status,
      message: error.response?.data?.message || "Something went wrong",
      errors: error.response?.data?.errors || {},
    };
  }
}
