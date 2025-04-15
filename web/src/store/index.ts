// src/store/index.ts
import { createStore, useStore as baseUseStore, Store, Commit, ActionContext } from 'vuex';
import { InjectionKey } from 'vue';
import axios from 'axios';
import { State as StateType, Job, ResourcePool, k8sRecord, SystemPod } from './types.js';
import { MutationTypes, ActionTypes } from './mutation-types.js';
import { getAccessToken, getAkSk } from '../utils/auth.js'
import { ElMessage } from "element-plus";
import { ServeGetJobs } from '../api/jobs.js';
import { ServeGetResourcePools } from '../api/resourcePools.js';

// const baseUrl = 'https://6d6q5xfg0drsm.cfc-execute.bj.baidubce.com'
// const baseUrl = 'http://localhost:8000'

// 定义 Mutations 接口
export interface Mutations {
    [MutationTypes.UPDATE_CHECKED_CITIES](state: StateType, checkedCities: string[]): void;
    [MutationTypes.UPDATE_K8S_RECORD](state: StateType, k8sRecord: k8sRecord): void;
    [MutationTypes.UPDATE_SYSTEM_POD](state: StateType, systemPod: SystemPod): void;
    [MutationTypes.UPDATE_JOB_LIST](state: StateType, payload: { jobs: Job[], totalCount: number, pageSize: number, pageNumber: number }): void;
    [MutationTypes.UPDATE_RESOURCEPOOLS](state: StateType, resourcepools: ResourcePool[]): void;
    [key: string]: (state: StateType, payload: any) => void;
}

// 定义 Actions 接口
export interface Actions {
    [ActionTypes.FETCH_JOBS](
        context: ActionContext<StateType, StateType>,
        payload: { 
            resourcePoolId: string, 
            pageSize: number, 
            pageNumber: number,
            searchQuery?: string 
        }
    ): Promise<void>;
    [ActionTypes.FETCH_RESOURCEPOOLS](context: ActionContext<StateType, StateType>): Promise<void>;
    [key: string]: (context: ActionContext<StateType, StateType>, payload: any) => void;
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

// 初始化状态
const state: StateType = {
    cities: ['Shanghai', 'Beijing', 'Guangzhou', 'Shenzhen'],
    checkedCities: ['Shanghai', 'Beijing'],
    k8sRecord: {
        config: '',
    },
    systemPod: {
        cpuPod: '',
    },
    jobList: [],
    resourcepoolList: [],
    totalCount: 0,
    pageSize: 10,
    pageNumber: 1
};

// 定义 mutations
const mutations: Mutations = {
    [MutationTypes.UPDATE_CHECKED_CITIES](state, checkedCities) {
        state.checkedCities = checkedCities;
    },
    [MutationTypes.UPDATE_K8S_RECORD](state, k8sRecord) {
        state.k8sRecord = k8sRecord;
    },
    [MutationTypes.UPDATE_SYSTEM_POD](state, systemPod) {
        state.systemPod = systemPod;
    },
    [MutationTypes.UPDATE_JOB_LIST](state, { jobs, totalCount, pageSize, pageNumber }) {
        state.jobList = jobs;
        state.totalCount = totalCount;
        state.pageSize = pageSize;
        state.pageNumber = pageNumber;
    },
    [MutationTypes.UPDATE_RESOURCEPOOLS](state, resourcepools) {
        state.resourcepoolList = resourcepools;
    },
};

// 定义 actions
const actions: Actions = {
    async [ActionTypes.FETCH_JOBS]({ commit }, { resourcePoolId, pageSize, pageNumber }) {
        try {
            const token = getAccessToken()
            let jobs: Job[] = [];
            let totalCount = 0;
            if (!token) {
                console.error("token is not set");
                ElMessage.warning("在系统设置中配置API Key");
            } else {
                try {
                    const response: {
                        jobs: Job[],
                        totalCount: number,
                        pageSize: number,
                        pageNumber: number
                    } = await ServeGetJobs(
                        {
                            resourcePoolId,
                            pageSize: pageSize || 100,
                            pageNumber: pageNumber || 1,
                        }
                    ) as any
                console.log('Response from DescribeJobs:', response);
                jobs = response.jobs || [];
                totalCount = response.totalCount
                console.log('Total count:', totalCount, 'Jobs length:', jobs.length);
                } catch (error) {
                    console.error("Error fetching jobs:", error);
                    ElMessage.error("获取任务列表失败");
                }
            }
            commit(MutationTypes.UPDATE_JOB_LIST, {
                jobs,
                totalCount,
                pageSize: pageSize || 100,
                pageNumber: pageNumber || 1
            });
        } catch (error) {
            console.error("Error fetching jobs:", error);
            ElMessage.error("获取任务列表失败");
        }
    },

    async [ActionTypes.FETCH_RESOURCEPOOLS]({ commit }) {
        try {
            const token = getAccessToken()
            let resourcePools: ResourcePool[] = [];

            if (!token) {
                console.info("token is not set");
                ElMessage.warning("在系统设置中配置API Key");

            } else {
                const response: {
                    resourcePools: ResourcePool[],
                    totalCount: number,
                    pageSize: number,
                    pageNumber: number
                } = await ServeGetResourcePools() as any
                resourcePools = response.resourcePools
            }
            commit(MutationTypes.UPDATE_RESOURCEPOOLS, resourcePools);
        } catch (error) {
            console.error("Error fetching resource pools:", error);
            ElMessage.error("获取资源池失败");
        }
    },
};

// 定义 getters
const getters = {
    cities: (state: StateType) => state.cities,
    checkedCities: (state: StateType) => state.checkedCities,
    k8sRecord: (state: StateType) => state.k8sRecord,
    systemPod: (state: StateType) => state.systemPod,
    jobList: (state: StateType) => state.jobList,
    resourcepoolList: (state: StateType) => state.resourcepoolList,
};

// 定义 Injection Key
export const key: InjectionKey<Store<StateType>> = Symbol();

// 创建 store
export const store = createStore<StateType>({
    state,
    mutations,
    actions,
    getters,
});

// 定义自定义的 useStore 函数
export function useStore() {
    return baseUseStore(key);
}