const axios = require("axios");
const API_BASE_URL =
  "https://f8e01ed1-af71-41f0-bb60-6a293ecc18e8.bytepay.online:8000/func";

module.exports = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
});
