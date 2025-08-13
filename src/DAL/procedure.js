import { invokeApi } from "../utils/invokeApi";

export const createProcedure = (data) => {
  const reqObj = {
    method: "POST",
    postData: data,
    path: "api/procedures",
  };
  return invokeApi(reqObj);
};

export const getProcedures = () => {
  return invokeApi({ path: "api/procedures" });
};

export const getProcedure = (id) => {
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