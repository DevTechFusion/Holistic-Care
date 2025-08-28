import { invokeApi } from "../utils/invokeApi";

export const createUser = (data) => {
  const reqObj = {
    method: "POST",
    postData: data,
    path: "api/users",
  };
  return invokeApi(reqObj);
};

export const getUsers = (page = 1, perPage = 15) => {
  return invokeApi({ path: `api/users?page=${page}&per_page=${perPage}` });
};

export const  getUsersById = (id) => {
  return invokeApi({ path: `api/users/${id}` });
};

export const updateUser = (id, data) => {
  const reqObj = {
    method: "PUT",
    postData: data,
    path: `api/users/${id}`,
  };
  return invokeApi(reqObj);
};

export const deleteUser = (id) => {
  return invokeApi({ method: "DELETE", path: `api/users/${id}` });
};