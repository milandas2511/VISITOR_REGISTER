import axios from "axios";

const api = axios.create({
  baseURL: "https://visitor-register-be.onrender.com/api"
});

export default api;
