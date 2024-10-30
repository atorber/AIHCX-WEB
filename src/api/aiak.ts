// 授权相关接口
import { post, get } from '../utils/request'

export const getFiles = (data: { path: string }) => {
    return get('http://127.0.0.1:8000/api/files', data)
}
// 登录服务接口
export const ServeLogin = (data: any) => {
    return post('/api/v1/auth/login', data)
}

// 注册服务接口
export const ServeRegister = (data: any) => {
    return post('/api/v1/auth/register', data)
}

// 退出登录服务接口
export const ServeLogout = (data: any) => {
    return post('/api/v1/auth/logout', data)
}

// 刷新登录Token服务接口
export const ServeRefreshToken = () => {
    return post('/api/v1/auth/refresh-token')
}

// 找回密码服务
export const ServeForgetPassword = (data: any) => {
    return post('/api/v1/auth/forget', data)
}