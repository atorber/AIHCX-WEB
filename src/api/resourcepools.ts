import { get } from '../utils/request'

// 获取订单列表服务接口
export const ServeGetAijobs = () => {
    return get('/api/v1/resourcepools')
}
