import { invokeApi } from "../utils/invokeApi";

export const createDoctor = (data) => {
  const reqObj = {
    method: "POST",
    postData: data,
    path: "api/doctors",
  };
  return invokeApi(reqObj);
};

export const getDoctors = (page = 1, perPage = 15, department_id = "", procedure_id = "", name="") => {
  return invokeApi({
    path: `api/doctors?page=${page}&per_page=${perPage}&department_id=${department_id}&procedure_id=${procedure_id}&name=${name}`,
  });
};

export const getDoctorsList = () => {
  return invokeApi({ path: `api/doctors-all` });
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

export const deleteDoctor = async (id) => {
  const response = await invokeApi({ 
    method: "DELETE", 
    path: `api/doctors/${id}` 
  });
  
  // Check if backend returned an error in the response body
  if (response?.status === "error" || response?.data?.status === "error") {
    const errorData = response?.data || response;
    const error = new Error(errorData.message || "Failed to delete doctor");
    error.response = { data: errorData }; // Preserve error data structure
    throw error;
  }
  
  return response;
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
