import { invokeApi } from "../utils/invokeApi";

export const createProcedure = (data) => {
  const reqObj = {
    method: "POST",
    postData: data,
    path: "api/procedures",
  };
  return invokeApi(reqObj);
};

export const getProcedures = (page = 1, per_page=15) => {
  return invokeApi({ path: `api/procedures?page=${page}&per_page=${per_page}` });
};

export const getProcedureById = (id) => {
  return invokeApi({ path: `api/procedures/${id}` });
};

export const updateProcedure = (id, data) => {
  const reqObj = {
    method: "PUT",
    postData: data,
    path: `api/procedures/${id}`,
  };
  return invokeApi(reqObj);
};

export const deleteProcedure = (id) => {
  return invokeApi({ method: "DELETE", path: `api/procedures/${id}` });
};