import { invokeApi } from "../utils/invokeApi";

export const getAllStatuses = () => {
    return invokeApi({path: "api/statuses"});
}