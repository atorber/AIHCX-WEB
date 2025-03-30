import { get } from '../utils/request'

// 获取资源池列表服务接口
export const ServeGetResourcePools = () => {
    return get('/?action=DescribeResourcePools')
}

// 获取资源池详情服务接口
export const ServeGetResourcePool = (data: { resourcePoolId: string }) => {
    return get('/?action=DescribeResourcePool', data)
}

// 获取资源池队列列表服务接口
export const ServeGetResourceQueues = (data: { resourcePoolId: string }) => {
    return get('/?action=DescribeResourceQueues', data)
}

// 获取资源池队列详情服务接口
export const ServeGetResourceQueue = (data: { resourcePoolId: string, queueName: string }) => {
    return get('/?action=DescribeResourceQueue', data)
}
