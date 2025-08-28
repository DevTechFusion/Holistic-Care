import { invokeApi } from "../utils/invokeApi";

export const createAppointment = (data) => {
    const reqObj = {
        method: "POST",
        path: "api/appointments", 
        postData: data
    };
    return invokeApi(reqObj);
};

export const getAppointments = (page = 1, per_page = 15) => {
  return invokeApi({
    path: `api/appointments?page=${page}&per_page=${per_page}`,
  });
};

export const getAppointmentById = (id) => {
    return invokeApi({ path: `api/appointments/${id}` });
};

export const deleteAppointment = (id) => {
    return invokeApi({ method: "DELETE", path: `api/appointments/${id}` });
};

export const updateAppointment = (id) => {
    const reqObj = {
        method: "PUT",
        postData: data,
        path: `api/appointments/${id}`,
    };
    return invokeApi(reqObj);
};
 
export const getAppointmentsByDepartment = (id) => {
    return invokeApi({ path: `api/appointments/department/${id}` });
};

export const getAppointmentsByDoctor = (id) => {
    return invokeApi({ path: `api/appointments/doctor/${id}` });
};  
