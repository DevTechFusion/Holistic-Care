import { invokeApi } from "../utils/invokeApi";

export const createMistake = (data) => {
  const reqObj = {
    method: "POST",
    postData: data,
    path: "api/mistakes",
  };
  return invokeApi(reqObj);
};

export const getAllMistakes = (filter = "all", page = 1, per_page = 15) => {
  return invokeApi({
    path: `api/mistakes?filters=${filter}&page=${page}&per_page=${per_page}`,
  });
};

export const updateMistake = (id, data) => {
  const reqObj = {
    method: "PUT",
    postData: data,
    path: `api/mistakes/${id}`,
  };
  return invokeApi(reqObj);
};

export const getAllComplaints = (page = 1, per_page = 15) => {
  return invokeApi({
    path: `api/complaints?page=${page}&per_page=${per_page}`,
  });
};

export const getAllComplaintsTypes = () =>
  invokeApi({ path: "api/complaint-types" });
