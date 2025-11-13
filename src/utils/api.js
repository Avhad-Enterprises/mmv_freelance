import axios from "axios";

const BASE_URL = "http://localhost:8000/api/v1/";
// const BASE_URL = "https://api.makemyvid.io/api/v1/";

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("jwtToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export async function makePostRequest(endpoint, bodyData) {
  return await apiClient.post(endpoint, bodyData);
}

export async function makeGetRequest(endpoint) {
  return await apiClient.get(endpoint);
}

export async function makePutRequest(endpoint, bodyData) {
  return await apiClient.put(endpoint, bodyData);
}

export async function makePatchRequest(endpoint, bodyData) {
  return await apiClient.patch(endpoint, bodyData);
}

export async function makeDeleteRequest(endpoint, data = {}) {
  return await apiClient.delete(endpoint, { data });
}

export default apiClient;
