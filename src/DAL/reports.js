import { invokeApi } from "..utils/invokeApi";

export const getAllReports = () => {
    return invokeApi({ path: "api/reports" });
};