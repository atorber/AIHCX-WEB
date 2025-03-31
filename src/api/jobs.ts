import { get, post } from '../utils/request'

// 获取任务列表服务接口
export const ServeGetJobs = (data: { resourcePoolId: string, pageSize?: number, pageNumber?: number }) => {
    return get('/?action=DescribeJobs', data)
}

// 获取任务详情服务接口
export const ServeGetJob = (data: { jobId: string, resourcePoolId: string }) => {
    return get('/?action=DescribeJob', data)
}

// 创建任务服务接口
export const ServeCreateJob = (data: any, options: { params: { resourcePoolId: string } }) => {
    return post('/?action=CreateJob', data, options)
}

// 获取任务Web终端服务接口
export const ServeGetJobWebTerminal = (data: { jobId: string, podName: string, resourcePoolId: string }) => {
    return get('/?action=DescribeJobWebTerminal', data)
}
