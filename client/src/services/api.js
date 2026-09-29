import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api"
});

const withAuth = async (getToken) => {
  const token = getToken ? await getToken() : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const dashboardApi = {
  async getOverview(getToken) {
    const headers = await withAuth(getToken);
    const response = await api.get("/dashboard/overview", { headers });
    return response.data;
  },
  async getSensors(getToken) {
    const headers = await withAuth(getToken);
    const response = await api.get("/dashboard/sensors", { headers });
    return response.data;
  },
  async getRecommendations(getToken) {
    const headers = await withAuth(getToken);
    const response = await api.get("/dashboard/recommendations", { headers });
    return response.data;
  },
  async analyzeDisease(file, getToken) {
    const formData = new FormData();
    formData.append("image", file);
    const headers = await withAuth(getToken);
    const response = await api.post("/dashboard/disease-analysis", formData, { headers });
    return response.data;
  },
  async analyzeDiseaseRiskMap(file, getToken) {
    const formData = new FormData();
    formData.append("image", file);
    const headers = await withAuth(getToken);
    const response = await api.post("/dashboard/disease-risk-map", formData, { headers });
    return response.data;
  },
  async sendChat(messages, getToken) {
    const headers = await withAuth(getToken);
    const response = await api.post("/dashboard/chat", { messages }, { headers });
    return response.data;
  }
};

export const communityApi = {
  async list() {
    const response = await api.get("/community/posts");
    return response.data;
  },
  async create(payload, getToken) {
    const headers = await withAuth(getToken);
    const response = await api.post("/community/posts", payload, { headers });
    return response.data;
  },
  async toggleLike(postId, getToken) {
    const headers = await withAuth(getToken);
    const response = await api.post(`/community/posts/${postId}/like`, {}, { headers });
    return response.data;
  },
  async createComment(postId, payload, getToken) {
    const headers = await withAuth(getToken);
    const response = await api.post(`/community/posts/${postId}/comments`, payload, { headers });
    return response.data;
  }
};

export const expenseApi = {
  async list(getToken) {
    const headers = await withAuth(getToken);
    const response = await api.get("/expenses", { headers });
    return response.data;
  },
  async create(payload, getToken) {
    const headers = await withAuth(getToken);
    const response = await api.post("/expenses", payload, { headers });
    return response.data;
  }
};

export const alertsApi = {
  async list(getToken) {
    const headers = await withAuth(getToken);
    const response = await api.get("/alerts", { headers });
    return response.data;
  },
  async acknowledge(id, getToken) {
    const headers = await withAuth(getToken);
    const response = await api.post(`/alerts/${id}/acknowledge`, {}, { headers });
    return response.data;
  }
};

export const settingsApi = {
  async get(getToken) {
    const headers = await withAuth(getToken);
    const response = await api.get("/settings", { headers });
    return response.data;
  },
  async update(payload, getToken) {
    const headers = await withAuth(getToken);
    const response = await api.put("/settings", payload, { headers });
    return response.data;
  }
};

export const farmCalendarApi = {
  async listTasks(getToken) {
    const headers = await withAuth(getToken);
    const response = await api.get("/farm-calendar/tasks", { headers });
    return response.data;
  },
  async createTask(payload, getToken) {
    const headers = await withAuth(getToken);
    const response = await api.post("/farm-calendar/tasks", payload, { headers });
    return response.data;
  },
  async deleteTask(id, getToken) {
    const headers = await withAuth(getToken);
    const response = await api.delete(`/farm-calendar/tasks/${id}`, { headers });
    return response.data;
  }
};

export const governmentSchemesApi = {
  async list(getToken) {
    const headers = await withAuth(getToken);
    const response = await api.get("/government-schemes", { headers });
    return response.data;
  }
};
