/**
 * Job 相关的数据模型定义
 */

export const JobSpecSchema = {
  type: 'object',
  required: ['image', 'replicas', 'command'],
  properties: {
    image: {
      type: 'string',
      description: '镜像地址，需要包含tag'
    },
    imageConfig: {
      $ref: '#/components/schemas/ImageConfig'
    },
    replicas: {
      type: 'integer',
      description: 'worker副本数'
    },
    resources: {
      type: 'array',
      description: '任务资源配置',
      items: {
        $ref: '#/components/schemas/Resource'
      }
    },
    envs: {
      type: 'array',
      description: `worker环境变量，默认注入:
1. AIHC_JOB_NAME ，值为name字段的值
2. NCCL_IB_DISABLE，开启rdma后默认注入，值为0
3. NCCL_DEBUG，nccl日志的级别，值为INFO`,
      items: {
        $ref: '#/components/schemas/Env'
      }
    },
    command: {
      type: 'string',
      description: '启动命令'
    },
    enableRDMA: {
      type: 'boolean',
      description: `是否开启RDMA，默认false，开启后将自动添加NCCL_IB_DISABLE=0的环境变量，
添加rdma/hca资源，并配置10GB共享内存到训练节点的容器中`
    },
    hostNetwork: {
      type: 'boolean',
      description: '是否使用宿主机网络，开启后作业worker将使用宿主机网络，开启RDMA时默认为true'
    }
  }
};

export const JobSchema = {
  type: 'object',
  required: ['name', 'jobSpec'],
  properties: {
    name: {
      type: 'string',
      description: '任务名称'
    },
    queue: {
      type: 'string',
      description: '训练任务所属队列，默认为default队列'
    },
    jobFramework: {
      type: 'string',
      description: '分布式框架，只支持 PyTorchJob，默认值：PyTorchJob'
    },
    jobSpec: {
      $ref: '#/components/schemas/JobSpec'
    },
    faultTolerance: {
      type: 'boolean',
      description: '是否开启容错，默认值为关闭'
    },
    labels: {
      type: 'array',
      description: `训练任务标签，默认包含：
1. aijob.cce.baidubce.com/create-from-aihcp-api: "true"
2. aijob.cce.baidubce.com/ai-user-id: {accoutId}
3. aijob.cce.baidubce.com/ai-user-name: {userName}`,
      items: {
        $ref: '#/components/schemas/Label'
      }
    },
    priority: {
      type: 'string',
      description: '调度优先级，支持高（high）、中（normal）、低（low），默认值：normal',
      enum: ['high', 'normal', 'low']
    },
    datasources: {
      type: 'array',
      description: '训练任务数据源配置',
      items: {
        $ref: '#/components/schemas/Datasource'
      }
    },
    enableBccl: {
      type: 'boolean',
      description: `是否开启BCCL自动注入，默认值为关闭。当前开启条件：
1. 实例数大于等于 2
2. 每个实例占整机 8 卡
3. 任务开启 RDMA
4. 卡型号为A800/HPAS`
    },
    faultToleranceConfig: {
      $ref: '#/components/schemas/FaultToleranceConfig'
    },
    tensorboardConfig: {
      $ref: '#/components/schemas/TensorboardConfig'
    }
  }
}; 

export const EnvSchema = {
  type: 'object',
  properties: {
    name: {
      type: 'string',
      description: '标签名'
    },
    value: {
      type: 'string', 
      description: '标签值'
    }
  }
};

export const ImageConfigSchema = {
  type: 'object',
  required: ['username', 'password'],
  properties: {
    username: {
      type: 'string',
      description: '私有镜像仓库用户名'
    },
    password: {
      type: 'string',
      description: '私有镜像仓库密码'
    }
  }
};

export const FaultToleranceConfigSchema = {
  type: 'object',
  properties: {
    enabledHangDetection: {
      type: 'boolean',
      description: '是否开启hang检测，默认值：false'
    },
    hangDetectionTimeoutMinutes: {
      type: 'integer',
      description: '判断任务hang的时间阈值（分钟），当所有的 worker 超过指定时间没有输出日志，就认定当前任务出现 hang'
    }
  }
}

export const TensorboardConfigSchema = {
  type: 'object',
  properties: {
    enableTensorboard: {
      type: 'boolean',
      description: '开启Tensorboard'
    },
    logPath: {
      type: 'string',
      description: '训练任务Tensorboard日志'
    }
  }
}

export const DatasourceSchema = {
  type: 'object',
  required: ['type', 'name', 'sourcePath', 'mountPath'],
  properties: {
    type: {
      type: 'string',
      description: '数据源类型，枚举值：pfs/pfsl1/pfsl2/hostPath；（pfsl1/pfsl2将废弃，统一使用pfs）',
      enum: ['pfs', 'pfsl1', 'pfsl2', 'hostPath']
    },
    name: {
      type: 'string',
      description: '数据源名称，如果type类型为pfs时，此处必须填写pfs实例id'
    },
    sourcePath: {
      type: 'string',
      description: `源路径：
- type类型为pfs时，表示pfs存储中的路径，默认为/
- type类型为hostpath时，表示宿主机路径`
    },
    mountPath: {
      type: 'string',
      description: '容器内挂载路径'
    },
    options: {
      type: 'object',
      description: '数据源参数'
    }
  }
}; 

export const LabelSchema = {
  type: 'object',
  required: ['key', 'value'],
  properties: {
    key: {
      type: 'string',
      description: '标签名'
    },
    value: {
      type: 'string', 
      description: '标签值'
    }
  }
}