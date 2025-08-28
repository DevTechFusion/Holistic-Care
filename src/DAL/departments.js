// src/DAL/departments.js
import { invokeApi } from "../utils/invokeApi";

export const createDepartment = (data) => {
  const reqObj = {
    method: "POST",
    postData: data,
    path: "api/departments",
  };
  return invokeApi(reqObj);
};

export const getAllDepartments = (page = 1, perPage = 15) => {
  return invokeApi({
    path: `api/departments?page=${page}&per_page=${perPage}`
  });
};

export const getDepartmentById = (id) => {
  return invokeApi({ path: `api/departments/${id}` });
};

export const updateDepartment = (id,data) => {
  const reqObj = {
    method: "PUT",
    postData: data,
    path: `api/departments/${id}`,
  };
  return invokeApi(reqObj);
};

export const deleteDepartment = (id) => {
  return invokeApi({ method: "DELETE", path: `api/departments/${id}` });
};