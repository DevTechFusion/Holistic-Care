import { invokeApi } from "../utils/invokeApi";

export const getAllReports = () => {
    return invokeApi({ path: "api/reports" });
};

export const createReport = ( data ) => {
    const reqObj = {
    method: "POST",
    postData: data,
    path: "api/reports",
  };
  return invokeApi(reqObj);
};

export const updateReport = ( id, data ) => {
    const reqObj = {
    method: "PUT",
    postData: data,
    path: `api/reports/${id}`,
  };
  return invokeApi(reqObj);
};
