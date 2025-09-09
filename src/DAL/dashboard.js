import { invokeApi } from "../utils/invokeApi";
export const getAdminDashboard = ( range = 'weekly') => {
    return invokeApi({ path: `api/dashboard?range=${range}` });
};

export const getAgentDashboard = ( range = 'weekly') => {
    return invokeApi({ path: `api/agent/dashboard?range=${range}` });
};

export const getManagerDashboard = ( range = 'weekly') => {
    return invokeApi({ path: `api/manager/dashboard?range=${range}` });
};