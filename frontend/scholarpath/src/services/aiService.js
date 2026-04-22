import api from "./api";

export const aiService = {
  analyzeProfile: () => api.post("/ai/analyze-profile/").then((r) => r.data),
  recommend:      () => api.post("/ai/recommend/").then((r) => r.data),
  testConnection: () => api.get("/ai/test/").then((r) => r.data),
};
