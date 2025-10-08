import { invokeApi } from "../utils/invokeApi";

export const getAllReports = (
  page = 1,
  per_page = 15,
  start_date = "",
  end_date = "",
  doctor_id = "",
  agent_id = "",
  department_id = "",
  procedure_id = "",
  status_id = "",
  remarks_1_id = "",
  remarks_2_id = "",
  payment_method = "",
  order_by = "created_at",
  order_direction = "desc"
) => {
  return invokeApi({
    path: `api/reports?page=${page}&per_page=${per_page}&start_date=${start_date}&end_date=${end_date}&doctor_id=${doctor_id}&agent_id=${agent_id}&department_id=${department_id}&procedure_id=${procedure_id}&status_id=${status_id}&remarks_1_id=${remarks_1_id}&remarks_2_id=${remarks_2_id}&payment_method=${payment_method}&order_by=${order_by}&order_direction=${order_direction}`,
  });
};

export const exportReports = (
  start_date = "",
  end_date = "",
  doctor_id = "",
  agent_id = "",
  department_id = "",
  procedure_id = "",
  status_id = "",
  remarks_1_id = "",
  remarks_2_id = "",
  payment_method = "",
  order_by = "created_at",
  order_direction = "desc"
) => {
  return invokeApi({
    path: `api/reports/export-csv?range=all&start_date=${start_date}&end_date=${end_date}&doctor_id=${doctor_id}&agent_id=${agent_id}&department_id=${department_id}&procedure_id=${procedure_id}&status_id=${status_id}&remarks_1_id=${remarks_1_id}&remarks_2_id=${remarks_2_id}&payment_method=${payment_method}&order_by=${order_by}&order_direction=${order_direction}`,
    responseType: "blob", 
  });
};
