// src/store/index.ts
import { createStore, useStore as baseUseStore, Store, Commit, ActionContext } from 'vuex';
import { InjectionKey } from 'vue';
import axios from 'axios';
import { State, Job, ResourcePool, k8sRecord, SystemPod } from './types.js';
import { MutationTypes, ActionTypes } from './mutation-types.js';
import { getAccessToken, getAkSk } from '../utils/auth.js'
import { ElMessage } from "element-plus";

// const baseUrl = 'https://6d6q5xfg0drsm.cfc-execute.bj.baidubce.com'
const baseUrl = 'http://localhost:8000'

// 定义 Mutations 接口
export interface Mutations {
    [MutationTypes.UPDATE_CHECKED_CITIES](state: State, checkedCities: string[]): void;
    [MutationTypes.UPDATE_K8S_RECORD](state: State, k8sRecord: k8sRecord): void;
    [MutationTypes.UPDATE_SYSTEM_POD](state: State, systemPod: SystemPod): void;
    [MutationTypes.UPDATE_JOB_LIST](state: State, jobList: Job[]): void;
    [MutationTypes.UPDATE_RESOURCEPOOLS](state: State, resourcepools: ResourcePool[]): void;
    [key: string]: (state: State, payload: any) => void;
}

// 定义 Actions 接口
export interface Actions {
    [ActionTypes.FETCH_JOBS](
        context: ActionContext<State, State>,
        resourcePoolId: string
    ): Promise<void>;
    [ActionTypes.FETCH_RESOURCEPOOLS](context: ActionContext<State, State>): Promise<void>;
    [key: string]: (context: ActionContext<State, State>, payload: any) => void;
}

// 初始化状态
const state: State = {
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
    [MutationTypes.UPDATE_JOB_LIST](state, jobList) {
        state.jobList = jobList;
    },
    [MutationTypes.UPDATE_RESOURCEPOOLS](state, resourcepools) {
        state.resourcepoolList = resourcepools;
    },
};

// 定义 actions
const actions: Actions = {
    async [ActionTypes.FETCH_JOBS]({ commit }, resourcePoolId: string) {
        try {
            const token = getAccessToken()
            let jobs: Job[] = [];
            if (!token) {
                console.error("token is not set");
                ElMessage.warning("在系统设置中配置API Key");
            } else {
                try {
                    const response = await axios.get(
                        `${baseUrl}/?action=DescribeJobs`,
                        {
                        params: {
                            resourcePoolId,
                        },
                        headers: {
                            Authorization: `Bearer ${getAccessToken()}`,
                        }
                    }
                );
                jobs = response.data.jobs
                } catch (error) {
                    console.error("Error fetching jobs:", error);
                    ElMessage.error("获取任务列表失败");
                }
            }
            commit(MutationTypes.UPDATE_JOB_LIST, jobs);
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
                const response = await axios.get(
                    `${baseUrl}/?action=DescribeResourcePools`,
                    {
                        params: {
                        },
                        headers: {
                            Authorization: `Bearer ${getAccessToken()}`,
                        }
                    }
                );
                resourcePools = response.data.resourcePools
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
    cities: (state: State) => state.cities,
    checkedCities: (state: State) => state.checkedCities,
    k8sRecord: (state: State) => state.k8sRecord,
    systemPod: (state: State) => state.systemPod,
    jobList: (state: State) => state.jobList,
    resourcepoolList: (state: State) => state.resourcepoolList,
};

// 定义 Injection Key
export const key: InjectionKey<Store<State>> = Symbol();

// 创建 store
export const store = createStore<State>({
    state,
    mutations,
    actions,
    getters,
});

// 定义自定义的 useStore 函数
export function useStore() {
    return baseUseStore(key);
}