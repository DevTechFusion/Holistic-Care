import { invokeApi } from "../utils/invokeApi";

export const createRole = (data) => {
    const reqObj = {
        method: "POST",
        postData: data,
        path: "api/roles",
    };
    return invokeApi(reqObj);
}
export const getRoles = () => {
    return invokeApi({ path: "api/users/by-roles?roles=agent" });
};

export const getRoleById = (id) => {
    return invokeApi({ path: `api/roles/${id}` });
};  