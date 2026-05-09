import axios from "axios";

export const API = axios.create({
  baseURL: "https://foodcompanion-backend.onrender.com/api",
});