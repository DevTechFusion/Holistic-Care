import { invokeApi } from "../utils/invokeApi";

export const createDoctor = (data) => {
  const reqObj = {
    method: "POST",
    postData: data,
    path: "api/doctors",
  };
  return invokeApi(reqObj);
};

export const getDoctors = (page = 1, perPage = 15) => {
  return invokeApi({
    path: `api/doctors?page=${page}&per_page=${perPage}`
  });
};

export const getDoctorById = (id) => {
  return invokeApi({ path: `api/doctors/${id}` });
};

export const updateDoctor = (id, data) => {
  const reqObj = {
    method: "PUT",
    postData: data,
    path: `api/doctors/${id}`,
  };
  return invokeApi(reqObj);
};

export const deleteDoctor = (id) => {
  return invokeApi({ method: "DELETE", path: `api/doctors/${id}` });
};

// getDoctorsByDepartment
export const getDoctorsByDepartment = (id) => {
  return invokeApi({ path: `api/doctors/department/${id}` });
};

// getDoctorsByProcedure
export const getDoctorsByProcedure = (id) => {
  return invokeApi({ path: `api/doctors/procedure/${id}` });
};

// getDoctorsByAvailability
export const getDoctorsByAvailability = (id) => {
  return invokeApi({ path: `api/doctor-availability/?doctor_id=${id}?` });
};