import { invokeApi } from "../utils/invokeApi";

export const getSources = ( page = 1, perPage = 15) => {
    return invokeApi({ path: `api/sources?page=${page}&per_page=${perPage}` });  
}

export const createSource = (data) => {
    const reqObj = {
        method: "POST",
        postData: data,
        path: "api/sources",
    };
    return invokeApi(reqObj);
}

export const updateSource = (id, data) => {
    const reqObj = {
        method: "PUT",
        postData: data,
        path: `api/sources/${id}`,
    };
    return invokeApi(reqObj);
}

export const deleteSource = (id) => {
    return invokeApi({ method: "DELETE", path: `api/sources/${id}` });
}

export const getSelectSources = () => {
    return invokeApi({ path: "api/sources/select" });  
}
