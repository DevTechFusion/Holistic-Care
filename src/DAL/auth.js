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

export const getUserProfile = () => {
  return invokeApi({ path: "api/profile" });
};

export const logout = () => {
  const reqObj = { 
    method: "POST",
    path: "api/logout",
    postData: { token: localStorage.getItem("token") },
  };
  return invokeApi(reqObj); 
};
