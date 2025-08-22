import { invokeApi } from "../utils/invokeApi";

export const createAppointment = (data) => {
    const reqObj = {
        method: "POST",
        path: "api/appoinments", 
        postData: data
    };
    return invokeApi(reqObj);
};

export const getAppoinments = () => {
    return invokeApi({ path: "api/appoinments" });
};

export const getAppoinmentById = (id) => {
    return invokeApi({ path: `api/appoinments/${id}` });
};

export const deleteAppoinment = (id) => {
    return invokeApi({ method: "DELETE", path: `api/appoinments/${id}` });
};

export const updateAppoinment = (id, data) => {
    const reqObj = {
        method: "PUT",
        postData: data,
        path: `api/appoinments/${id}`,
    };
    return invokeApi(reqObj);
};
 
