import axios from "axios";

export const TOKEN_STORAGE_KEY = "applyai_token";

const backendBaseUrl = import.meta.env.VITE_BACKEND_API_BASE_URL;

if (!backendBaseUrl) {
  console.warn(
    "apiClient: BACKEND_API_BASE_URL is not configured. Requests will fallback to the current origin.",
  );
}

export const apiClient = axios.create({
  baseURL: backendBaseUrl,
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_STORAGE_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (import.meta.env.DEV) {
    console.debug("[apiClient] request", {
      method: config.method,
      url: config.url,
      baseURL: config.baseURL,
      params: config.params,
      data: config.data,
    });
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (import.meta.env.DEV) {
      console.error("[apiClient] response error", {
        url: error.config?.url,
        method: error.config?.method,
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
    }

    if (error.response?.status === 401) {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      if (window.location.pathname !== "/login") {
        window.location.assign("/login");
      }
    }
    return Promise.reject(error);
  },
);
