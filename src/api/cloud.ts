import { Cloud } from 'laf-client-sdk';
import { getToken } from '../utils/auth';


// const API_BASE_URL = 'https://6119a1ac-1e79-4449-8665-f4f7d3066a5a.lafyun.com'
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL


export const cloud = new Cloud({
  baseUrl: API_BASE_URL,
  dbProxyUrl: '/proxy/console',
  getAccessToken: getToken as any
})
