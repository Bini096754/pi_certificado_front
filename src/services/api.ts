import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3001/api",
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Limpa os dados do usuário do estado global (se houver)
      // e redireciona para a tela de login
      // if (window.location.pathname !== "/") {
      //   window.location.href = "/";
      // }
    }
    return Promise.reject(error);
  },
);
