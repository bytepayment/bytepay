const axios = require('axios')
const { API_BASE_URL } = require('./config')

module.exports = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000
})
