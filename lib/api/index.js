import axios from 'axios'
// import router from 'umi/router'

import { API_HOST } from '../../config'
import { getToken } from '../../helpers/storage'
import { notRejectReason } from '../../helpers/data/index'

/**
 * axios config
 */
const API = axios.create({
  baseURL: API_HOST
})

API.interceptors.request.use(config => {
  const token = getToken()
  if (token) {
    config.headers.Authorization = token
  }

  return config
})

API.interceptors.response.use(
  res => res.data,
  error => {
    // axios取消发送请求时不改变Promise状态为reject
    if (error.message === notRejectReason) {
      return
    }
    return Promise.reject(error)
  }
)

/**
 * HTTP Methods
 */
export const GET = 'GET'
export const POST = 'POST'
export const PATCH = 'PATCH'
export const PUT = 'PUT'
export const DELETE = 'DELETE'
export const OPTIONS = 'OPTIONS'
export const HEAD = 'HEAD'
export const TRACE = 'TRACE'
export const CONNECT = 'CONNECT'

export default API
