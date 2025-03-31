// src/store/types.ts

// 定义 Job 接口，根据你的 API 响应结构调整
export interface Job {
    name: string;
    status: string;
    priority: number | string;
    resourcePoolId: string;
    queue: string;
    createdAt: string;
    finishedAt: string;
    image?: string;
    command?: string;
    envs?: Array<{name: string, value: string}>;
    labels?: Array<{key: string, value: string}>;
    jobId?: string;
    runningAt?: string;
    scheduledAt?: string;
    datasources?: Array<{
        type: string;
        mountPath: string;
        name: string;
        sourcePath?: string;
        options: Record<string, any>;
    }>;
    enableFaultTolerance?: boolean;
    customFaultTolerancePattern?: any[];
    resources?: Array<{
        name: string;
        quantity: number;
    }>;
    enableRDMA?: boolean;
    hostNetwork?: boolean;
    replicas?: number;
    jobFramework?: string;
    enableBccl?: boolean;
    enableBcclStatus?: string;
    enableBcclErrorReason?: string;
    k8sUID?: string;
    k8sNamespace?: string;
    faultToleranceConfig?: {
        enabledHangDetection: boolean;
        customFaultTolerancePattern: any[];
        unconditionalFaultToleranceLimit: number;
    };
    faultToleranceArgs?: string;
    enableReplaceResult?: {
        status: string;
        message: string;
    };
    tensorboardAddr?: string;
    podList?: {
        listMeta: {
            totalItems: number;
        };
        pods: any[];
        faultTolerancePods: Record<string, any>;
    };
}
  
// 定义 ResourcePool 接口
export interface ResourcePoolMetadata {
    id: string;
    name: string;
    createdAt?: string;
    updatedAt?: string;
    creationTimestamp?: string;
}

export interface ResourcePoolSpec {
    associatedPfsId: string;
    k8sVersion?: string;
    region?: string;
    description?: string;
    associatedCpromIds?: string[];
    createdBy?: string;
    forbidDelete?: boolean;
}

export interface ResourcePoolStatus {
    phase?: string;
    nodeCount?: {
        total: number;
        used: number;
    };
    gpuCount?: {
        total: number;
        used: number;
    };
    gpuDetail?: Array<{
        gpuDescriptor: string;
        total: number;
        used: number;
    }>;
}

export interface ResourcePool {
    metadata: ResourcePoolMetadata;
    spec: ResourcePoolSpec;
    status?: ResourcePoolStatus;
    requestId?: string;
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
    totalCount: number;
    pageSize: number;
    pageNumber: number;
}