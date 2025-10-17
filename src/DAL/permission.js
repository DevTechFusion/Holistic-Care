import { invokeApi } from "../utils/invokeApi";

export const getPermissions = () => {
    return invokeApi({ path: `api/roles-permissions/all-permissions` });
};

export const assignPermission = (data, role_id = "") => {
    const reqObj = {
        method: "POST",
        path: `api/roles/${role_id}/assign-permissions`, 
        postData: data
    };
    return invokeApi(reqObj);
};

export const removePermission = (data, role_id = "") => {
    const reqObj = {
        method: "POST",
        path: `api/roles/${role_id}/remove-permissions`, 
        postData: data
    };
    return invokeApi(reqObj);
};
