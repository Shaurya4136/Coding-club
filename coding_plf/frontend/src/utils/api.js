import axios from "axios";

export const api = axios.create({
  baseURL: "https://coding-club-1.onrender.com/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
export const getProfileEndpoint = (role) => {
  switch (role) {
    case "student":
      return "/profile";
    case "club":
      return "/club/profile";
    case "college":
      return "/college/profile";
    default:
      return "/profile";
  }
};
