import { invokeApi } from "../utils/invokeApi";

export const getAllReports = (
  page = 1,
  per_page = 15,
  start_date = "",
  end_date = "",
  isBooking = false,
  doctor_id = "",
  agent_id = "",
  department_id = "",
  procedure_id = "",
  status_id = "",
  remarks_1_id = "",
  remarks_2_id = "",
  payment_method = "",
  order_by = "created_at",
  order_direction = "desc",
  patient_name = "",
  contact_number = ""
) => {
  return invokeApi({
    path: `api/reports?page=${page}&per_page=${per_page}&start_date=${start_date}&end_date=${end_date}&isBooking=${isBooking}&doctor_id=${doctor_id}&agent_id=${agent_id}&department_id=${department_id}&procedure_id=${procedure_id}&status_id=${status_id}&remarks_1_id=${remarks_1_id}&remarks_2_id=${remarks_2_id}&payment_method=${payment_method}&order_by=${order_by}&order_direction=${order_direction}&patient_name=${patient_name}&contact_number=${contact_number}`,
  });
};

export const exportReports = (
  start_date = "",
  end_date = "",
  isBooking = false,
  doctor_id = "",
  agent_id = "",
  department_id = "",
  procedure_id = "",
  status_id = "",
  remarks_1_id = "",
  remarks_2_id = "",
  payment_method = "",
  order_by = "created_at",
  order_direction = "desc",
  patient_name = "",
  contact_number = ""
) => {
  return invokeApi({
    path: `api/reports/export-csv?range=all&start_date=${start_date}&end_date=${end_date}&isBooking=${isBooking}&doctor_id=${doctor_id}&agent_id=${agent_id}&department_id=${department_id}&procedure_id=${procedure_id}&status_id=${status_id}&remarks_1_id=${remarks_1_id}&remarks_2_id=${remarks_2_id}&payment_method=${payment_method}&order_by=${order_by}&order_direction=${order_direction}&patient_name=${patient_name}&contact_number=${contact_number}`,
    responseType: "blob", 
  });
};
