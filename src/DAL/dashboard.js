import { invokeApi } from "../utils/invokeApi";
export const getAdminDashboard = ( range = 'weekly') => {
    return invokeApi({ path: `api/dashboard?range=${range}` });
};