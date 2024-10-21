import { get, post } from '../utils/request'

// 获取订单列表服务接口
export const ServeGetAijobs = (data: { resourcePoolId: string }) => {
    return get('/api/v1/aijobs', data)
}

// 创建订单服务接口
export const ServeCreateAijob = (data: any, options: { params: { resourcePoolId: string } }) => {
    return post('/api/v1/aijobs', data, options)
}
