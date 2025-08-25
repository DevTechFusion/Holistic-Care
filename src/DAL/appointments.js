import { invokeApi } from "../utils/invokeApi";

export const createAppointment = (data) => {
    const reqObj = {
        method: "POST",
        path: "api/appointments", 
        postData: data
    };
    return invokeApi(reqObj);
};

export const getAppointments = () => {
    return invokeApi({ path: "api/appointments" });
};

export const getAppointmentById = (id) => {
    return invokeApi({ path: `api/appointments/${id}` });
};

export const deleteAppointment = (id) => {
    return invokeApi({ method: "DELETE", path: `api/appointments/${id}` });
};

export const updateAppointment = (id, data) => {
    const reqObj = {
        method: "PUT",
        postData: data,
        path: `api/appointments/${id}`,
    };
    return invokeApi(reqObj);
};
 
