import api from "./api";

export const profileService = {
  getStudentProfile: () => api.get("/students/me/").then((r) => r.data),
  updateStudentProfile: (data) => api.patch("/students/me/", data).then((r) => r.data),
  getDashboard: () => api.get("/dashboard/").then((r) => r.data),
};
