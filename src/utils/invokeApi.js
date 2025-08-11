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
}) {
  const reqObj = {
    method,
    url: baseUri + path,
    headers,
  };

  reqObj.params = queryParams;

  if (method !== "GET") {
    reqObj.data = postData;
    if (postData instanceof FormData) {
      reqObj.headers["Content-Type"] = "multipart/form-data";
    }
  }

  if (isAuth) {
    reqObj.headers.Authorization = `Bearer ${localStorage.getItem
      ("token")}`;
  }

  let results;

  // console.log("<===REQUEST-OBJECT===>", reqObj);

  try {
    results = await axios(reqObj);
    // console.log("<===Api-Success-Result===>", results);

    return results.data;
  } catch (error) {
    console.log("<===Api-Error===>", error);

    if (error.response.status === 401) {
      sessionStorage.clear();
      window.location.reload();
    }
    return {
      code: error.response.status,
      message: error.response.data.message ? error.response.data.message : "",
    };
  }
}