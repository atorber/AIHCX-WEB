import axios from 'axios'
import { delAccessToken, getAccessToken } from './auth.js'
import { ElMessageBox } from 'element-plus'

// 创建 axios 实例
const request = axios.create({
    // API 请求的默认前缀
    baseURL: import.meta.env.VITE_BASE_API,

    // 请求超时时间
    timeout: 120000
})

let once = false

/**
 * 异常拦截处理器
 *
 * @param {*} error
 */
const errorHandler = (error: any) => {
    // 判断是否是响应错误信息
    if (error.response) {
        if (error.response.status == 401) {
            delAccessToken()

            if (!once) {
                once = true
                ElMessageBox.alert('当前登录已失效，请重新登录？', '友情提示', {
                    // if you want to disable its autofocus
                    // autofocus: false,
                    confirmButtonText: '立即登录',
                    callback: () => {
                        location.reload()
                    },
                })
            }
        }
    }

    return Promise.reject(error)
}

// 请求拦截器
request.interceptors.request.use((config) => {
    const token = getAccessToken()

    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`
    }

    return config
}, errorHandler)

// 响应拦截器
request.interceptors.response.use((response) => response.data, errorHandler)

/**
 * GET 请求
 *
 * @param {String} url
 * @param {Object} data
 * @param {Object} options
 * @returns {Promise<any>}
 */
export const get = (url: string, data = {}, options = {}) => {
    return request({
        url,
        params: data,
        method: 'get',
        ...options
    })
}

/**
 * POST 请求
 *
 * @param {String} url
 * @param {Object} data
 * @param {Object} options
 * @returns {Promise<any>}
 */
export const post = (url: string, data = {}, options = {}) => {
    return request({
        url,
        method: 'post',
        data: data,
        ...options
    })
}

/**
 * 上传文件 POST 请求
 *
 * @param {String} url
 * @param {Object} data
 * @param {Object} options
 * @returns {Promise<any>}
 */
export const upload = (url: string, data = {}, options = {}) => {
    return request({
        url,
        method: 'post',
        data: data,
        ...options
    })
}