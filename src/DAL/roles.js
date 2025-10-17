import { invokeApi } from "../utils/invokeApi";

export const createRole = (data) => {
    const reqObj = {
        method: "POST",
        path: "api/roles", 
        postData: data
    };
    return invokeApi(reqObj);
};

export const updateRole = (id, data) => {
    const reqObj = {
        method: "PUT",
        path: `api/roles/${id}`, 
        postData: data
    };
    return invokeApi(reqObj);
};

export const deleteRole = (id) => {
    const reqObj = {
        method: "DELETE",
        path: `api/roles/${id}`, 
    };
    return invokeApi(reqObj);
};

export const getRoleById = (id) => {
    return invokeApi({ path: `api/roles/${id}` });
};

export const getRoles = ( page = 1, perPage = 15) => {
    return invokeApi({ path: `api/roles?page=${page}&per_page=${perPage}` });
};

export const getSelectRoles = () => {
    return invokeApi({ path: `api/roles-all` });
};