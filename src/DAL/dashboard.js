import { invokeApi } from "../utils/invokeApi";
export const getAdminDashboard = ( start_date = "", end_date = "") => {
    return invokeApi({ path: `api/dashboard?start_date=${start_date}&end_date=${end_date}` });
};

export const getAgentDashboard = ( start_date = "", end_date = "") => {
    return invokeApi({ path: `api/agent/dashboard?start_date=${start_date}&end_date=${end_date}` });
};

export const getManagerDashboard = ( start_date = "", end_date = "") => {
    return invokeApi({ path: `api/manager/dashboard?start_date=${start_date}&end_date=${end_date}` });
};