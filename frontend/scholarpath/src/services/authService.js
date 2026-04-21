import api from "./api";
import { tokenStorage } from "../utils/tokenStorage";

export const authService = {
  async register(data) {
    const res = await api.post("/register/", data);
    return res.data;
  },

  async login(email, password) {
    const res = await api.post("/token/", { email, password });
    tokenStorage.set(res.data.access, res.data.refresh);
    return res.data;
  },

  async logout() {
    const refresh = tokenStorage.getRefresh();
    if (refresh) {
      try {
        await api.post("/token/blacklist/", { refresh });
      } catch {
        // ignore — still clear tokens
      }
    }
    tokenStorage.clear();
  },

  async getCurrentUser() {
    const res = await api.get("/profile/");
    return res.data;
  },
};
