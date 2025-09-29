import { invokeApi } from "../utils/invokeApi";

export const getAllStatuses = ( page = 1, perPage = 15) => {
    return invokeApi({path: `api/statuses?page=${page}&per_page=${perPage}`});
}

export const createStatus = (data) => {
    const reqObj = {
        method: "POST",
        postData: data,
        path: "api/statuses",
    };
    return invokeApi(reqObj);
}

export const updateStatus = (id, data) => {
    const reqObj = {
        method: "PUT",
        postData: data,
        path: `api/statuses/${id}`,
    };
    return invokeApi(reqObj);
}

export const deleteStatus = (id) => {
    return invokeApi({ method: "DELETE", path: `api/statuses/${id}` });
}

export const getSelectStatuses = () => {
    return invokeApi({path: "api/statuses/select"});
}
