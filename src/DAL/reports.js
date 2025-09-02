import { invokeApi } from "../utils/invokeApi";

export const getAllReports = (page=1, per_page=15) => {
    return invokeApi({ path: `api/reports?page=${page}&per_page=${per_page}`});
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
