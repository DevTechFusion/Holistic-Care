import { invokeApi } from "../utils/invokeApi";

export const getAllRemarks2 = () => {
    return invokeApi({path: "api/remarks2"});
}