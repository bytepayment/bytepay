const axios = require('axios')
const API_BASE_URL = 'https://api.github.com'

module.exports = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
})
