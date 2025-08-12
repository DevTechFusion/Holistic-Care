import { invokeApi } from "../utils/invokeApi";

export const createUser = (data) => {
  const reqObj = {
    method: "POST",
    postData: data,
    path: "/api/users",
  };
  return invokeApi(reqObj);
};
