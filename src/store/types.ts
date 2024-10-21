// src/store/types.ts

// 定义 Job 接口，根据你的 API 响应结构调整
export interface Job {
    name: string;
    status: string;
    priority: number;
    resourcePoolId: string;
    queue: string;
    createdAt: string;
    finishedAt: string;
    // 添加其他必要的字段
  }
  
  // 定义 ResourcePool 接口
  export interface ResourcePoolMetadata {
    id: string;
    name: string;
  }
  
  export interface ResourcePool {
    metadata: ResourcePoolMetadata;
    spec: {
      associatedPfsId:string;
    }
    // 添加其他必要的字段
  }
  
  // 定义 k8sRecord 接口
  export interface k8sRecord {
    config: string;
  }
  
  // 定义 SystemPod 接口
  export interface SystemPod {
    cpuPod: string;
  }
  
  // 定义 State 接口
  export interface State {
    cities: string[];
    checkedCities: string[];
    k8sRecord?: k8sRecord;
    systemPod: SystemPod;
    jobList: Job[];
    resourcepoolList: ResourcePool[];
  }