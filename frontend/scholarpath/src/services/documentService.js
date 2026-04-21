import api from "./api";

export const documentService = {
  getDocuments: () => api.get("/documents/").then((r) => r.data),
  uploadDocument: (formData) =>
    api.post("/documents/", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }).then((r) => r.data),
  deleteDocument: (id) => api.delete(`/documents/${id}/`),
};
