// src/store/mutation-types.ts

export enum MutationTypes {
    UPDATE_CHECKED_CITIES = 'updateCheckedCities',
    UPDATE_K8S_RECORD = 'updateK8sRecord',
    UPDATE_SYSTEM_POD = 'updateSystemPod',
    UPDATE_JOB_LIST = 'updateJobList',
    UPDATE_RESOURCEPOOLS = 'updateResourcepools',
  }
  
  export enum ActionTypes {
    FETCH_JOBS = 'fetchJobs',
    FETCH_RESOURCEPOOLS = 'fetchResourcepools',
  }