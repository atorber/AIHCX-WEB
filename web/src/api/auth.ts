// 授权相关接口
import { post, get } from '../utils/request'

// 登录服务接口
export const ServeLogin = (data: { ak: string, sk: string, region: string }) => {
    return post('/?action=Login', data)
}

// 获取用户信息服务接口
export const ServeGetUserInfo = () => {
    return get('/?action=DescribeUser')
}

// 注册服务接口
export const ServeRegister = (data: any) => {
    return post('/?action=Register', data)
}

// 退出登录服务接口
export const ServeLogout = (data: any) => {
    return post('/?action=Logout', data)
}

// 刷新登录Token服务接口
export const ServeRefreshToken = () => {
    return post('/?action=RefreshToken')
}

// 找回密码服务
export const ServeForgetPassword = (data: any) => {
    return post('/?action=ForgetPassword', data)
}