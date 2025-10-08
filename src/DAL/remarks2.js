import { invokeApi } from "../utils/invokeApi";

export const getAllRemarks2 = () => {
    return invokeApi({path: "api/remarks2"});
}

export const getSelectRemarks2 = () => {
    return invokeApi({path: "api/remarks2/select"});
}