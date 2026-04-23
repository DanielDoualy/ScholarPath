import api from "./api";

export const profileService = {
  getStudentProfile:    ()       => api.get("/students/me/").then((r) => r.data),
  updateStudentProfile: (data)   => api.patch("/students/me/", data).then((r) => r.data),
  getDashboard:         ()       => api.get("/dashboard/").then((r) => r.data),

  // Centres d'intérêt
  getInterests:    ()     => api.get("/interests/").then((r) => r.data.results ?? r.data),
  addInterest:     (data) => api.post("/interests/", data).then((r) => r.data),
  deleteInterest:  (id)   => api.delete(`/interests/${id}/`),

  // Objectifs
  getGoals:    ()     => api.get("/goals/").then((r) => r.data.results ?? r.data),
  addGoal:     (data) => api.post("/goals/", data).then((r) => r.data),
  deleteGoal:  (id)   => api.delete(`/goals/${id}/`),

  // Activités extrascolaires
  getActivities:    ()     => api.get("/activities/").then((r) => r.data.results ?? r.data),
  addActivity:      (data) => api.post("/activities/", data).then((r) => r.data),
  deleteActivity:   (id)   => api.delete(`/activities/${id}/`),
};
