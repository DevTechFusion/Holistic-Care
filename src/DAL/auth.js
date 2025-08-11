import { invokeApi } from "../utils/invokeApi";

export const login = (data) => {
  const reqObj = {
    method: "POST",
    postData: data,
    isAuth: false,
    path: "api/login",
  };
  return invokeApi(reqObj);
};

export const userDetail = () => {
  return invokeApi({ path: "api/profile" });
};
