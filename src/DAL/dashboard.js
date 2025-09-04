import { invokeApi } from "../utils/invokeApi";
export const getAdminDashboard = ( range = 'daily') => {
    return invokeApi({ path: `api/dashboard?range=${range}` });
};

export const getAgentDashboard = ( range = 'daily') => {
    return invokeApi({ path: `api/agent/dashboard?range=${range}` });
};