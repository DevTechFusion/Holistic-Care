import { invokeApi } from "../utils/invokeApi";

export const getSources = () => {
    return invokeApi({ path: "api/sources" });  
}