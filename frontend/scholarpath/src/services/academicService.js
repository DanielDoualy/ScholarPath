import api from "./api";

export const academicService = {
  getRecords: (params) => api.get("/academic-records/", { params }).then((r) => r.data),
  createRecord: (data) => api.post("/academic-records/", data).then((r) => r.data),
  updateRecord: (id, data) => api.patch(`/academic-records/${id}/`, data).then((r) => r.data),
  deleteRecord: (id) => api.delete(`/academic-records/${id}/`),
  getSubjects: () => api.get("/subjects/").then((r) => r.data),
};
