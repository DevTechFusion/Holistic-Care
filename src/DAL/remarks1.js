import { invokeApi } from "../utils/invokeApi";

export const getAllRemarks1 = () => {
    return invokeApi({path: "api/remarks1"});
}