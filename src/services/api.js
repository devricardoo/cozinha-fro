// src/services/api.js
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000/api", // base da sua API Laravel
});

// Esse interceptor será chamado antes de cada requisição
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token"); // pega o token salvo no login
  if (token) {
    config.headers.Authorization = `Bearer ${token}`; // adiciona o token no header
  }
  return config;
});

export default api;
