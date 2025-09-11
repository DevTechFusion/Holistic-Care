// src/DAl/pharmacy.js
import { invokeApi } from "../utils/invokeApi";

// GET /api/pharmacy
export const getAllPharmacy = () => {
    return invokeApi({ path: "api/pharmacy" });
};  

// POST /api/pharmacy
export const createPharmacy = (data) => {
  const reqObj = {
    method: "POST",
    postData: data,
    path: "api/pharmacy",
  };
  return invokeApi(reqObj);
};

// DELETE /api/pharmacy/:id
export const deletePharmacy = (id) => {
  return invokeApi({ method: "DELETE", path: `api/pharmacy/${id}` });
};

// PUT /api/pharmacy
export const updatePharmacy = (id, data) => {
  const reqObj = {
    method: "PUT",
    postData: data,
    path: `api/pharmacy/${id}`,
  };
  return invokeApi(reqObj);
};

// # Filter by agent and status
// GET /api/pharmacy?per_page=20&page=1&agent_id=1&status=completed

export const getPharmacy = (page = 1, perPage = 15, agentId, status) => {
  return invokeApi({
    path: `api/pharmacy?page=${page}&per_page=${perPage}&agent_id=${agentId}&status=${status}`,
  });
};

// # Multiple filters with date range
// GET /api/pharmacy?agent_id=1&start_date=2025-09-01&end_date=2025-09-30&search=cash

export const getFilteredPharmacy = (agentId, startDate, endDate, search) => {
  return invokeApi({
    path: `api/pharmacy?agent_id=${agentId}&start_date=${startDate}&end_date=${endDate}&search=${search}`,
  });
};