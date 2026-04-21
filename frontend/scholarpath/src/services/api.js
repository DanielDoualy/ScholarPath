import axios from "axios";
import { tokenStorage } from "../utils/tokenStorage";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL
    ? `${import.meta.env.VITE_API_URL}/api`
    : "/api",
  headers: { "Content-Type": "application/json" },
});

// Inject access token on every request
api.interceptors.request.use((config) => {
  const token = tokenStorage.getAccess();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Refresh access token on 401
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      const refresh = tokenStorage.getRefresh();
      if (refresh) {
        try {
          const { data } = await axios.post(
            `${api.defaults.baseURL}/token/refresh/`,
            { refresh }
          );
          tokenStorage.set(data.access, data.refresh ?? refresh);
          original.headers.Authorization = `Bearer ${data.access}`;
          return api(original);
        } catch {
          tokenStorage.clear();
          window.location.href = "/login";
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
