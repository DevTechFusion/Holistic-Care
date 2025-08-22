import { invokeApi } from "../utils/invokeApi";

export const getCategories = () => {
    return invokeApi({ path: "api/categories" });
};