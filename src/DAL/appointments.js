import { invokeApi } from "../utils/invokeApi";

export const createAppointment = (data) => {
    const reqObj = {
        method: "POST",
        path: "api/appointments", 
        postData: data
    };
    return invokeApi(reqObj);
};

export const getAppointments = (page = 1, per_page = 15, start_date = "", end_date = "", doctor_id = "", agent_id = "", department_id = "", procedure_id = "", order_by = "created_at", order_direction = "desc") => {
  return invokeApi({
    path: `api/appointments?page=${page}&per_page=${per_page}&start_date=${start_date}&end_date=${end_date}&doctor_id=${doctor_id}&agent_id=${agent_id}&department_id=${department_id}&procedure_id=${procedure_id}&order_by=${order_by}&order_direction= ${order_direction}`,
  });
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
 


