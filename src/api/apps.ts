import { get, post } from '../utils/request'

// 获取应用列表服务接口
export const ServeGetApps = (data: { pageSize?: number, pageNumber?: number }) => {
    return get('/?action=DescribeApps', data)
}

// 获取任务详情服务接口
export const ServeGetApp = (data: { appId: string }) => {
    return get('/?action=DescribeApp', data)
}
