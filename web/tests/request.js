const axios = require('axios')
const API_BASE_URL =
  'https://b614c047-f7fc-4f6d-a56f-3004c27dbe9a.bytepay.online:8000/func'

module.exports = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000
})
