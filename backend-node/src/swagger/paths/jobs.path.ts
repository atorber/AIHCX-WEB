/**
 * Jobs 相关的路径定义
 */

export const JobsPaths = {
  '/?action=DescribeJobs': {
    get: {
      tags: ['任务'],
      summary: '获取任务列表',
      description: '获取指定资源池中的任务列表',
      parameters: [
        {
          in: 'header',
          name: 'token',
          schema: {
            type: 'string'
          },
          required: false,
          description: '授权信息,authorization/token/x-api-key三选一, 格式: Bearer ak|sk|region,区域,可选值: bj, gz, su, bd, fwh, yq'
        },
        {
          in: 'header',
          name: 'authorization',
          schema: {
            type: 'string'
          },
          required: false,
          description: '授权信息,authorization/token/x-api-key三选一, 格式: Bearer ak|sk|region,区域,可选值: bj, gz, su, bd, fwh, yq'
        },
        {
          in: 'header',
          name: 'x-api-key',
          schema: {
            type: 'string'
          },
          required: false,
          description: '自定义授权信息，authorization/token/x-api-key三选一, 格式: ak|sk|region,区域,可选值: bj, gz, su, bd, fwh, yq'
        },
        {
          in: 'query',
          name: 'resourcePoolId',
          schema: {
            type: 'string'
          },
          required: true,
          description: '资源池ID'
        },
        {
          in: 'query',
          name: 'pageSize',
          schema: {
            type: 'number'
          },
          required: false,
          default: 100,
          description: '每页数量'
        },
        {
          in: 'query',
          name: 'pageNumber',
          schema: {
            type: 'number'
          },
          required: false,
          default: 1,
          description: '页码'
        },
        {
          in: 'query',
          name: 'orderBy',
          schema: {
            type: 'string'
          },
          required: false,
          default: 'createdAt',
          description: '排序字段, 可选值: createdAt, name, status'
        },
        {
          in: 'query',
          name: 'order',
          schema: {
            type: 'string'
          },
          required: false,
          default: 'desc',
          description: '排序方向, 可选值: asc, desc'
        }
      ],
      responses: {
        200: {
          description: '成功获取任务列表'
        },
        500: {
          description: '服务器错误'
        }
      }
    }
  },
  '/?action=DescribeJob': {
    get: {
      tags: ['任务'],
      summary: '获取任务详情',
      description: '获取指定任务的详情',
      parameters: [
        {
          in: 'header',
          name: 'token',
          schema: {
            type: 'string'
          },
          required: false,
          description: '授权信息,authorization/token/x-api-key三选一, 格式: Bearer ak|sk|region,区域,可选值: bj, gz, su, bd, fwh, yq'
        },
        {
          in: 'header',
          name: 'authorization',
          schema: {
            type: 'string'
          },
          required: false,
          description: '授权信息,authorization/token/x-api-key三选一, 格式: Bearer ak|sk|region,区域,可选值: bj, gz, su, bd, fwh, yq'
        },
        {
          in: 'header',
          name: 'x-api-key',
          schema: {
            type: 'string'
          },
          required: false,
          description: '自定义授权信息，authorization/token/x-api-key三选一, 格式: ak|sk|region,区域,可选值: bj, gz, su, bd, fwh, yq'
        },
        {
          in: 'query',
          name: 'resourcePoolId',
          schema: {
            type: 'string'
          },
          required: true,
          description: '资源池ID'
        },
        {
          in: 'query',
          name: 'jobId',
          schema: {
            type: 'string'
          },
          required: true,
          description: '任务ID'
        }
      ],
      responses: {
        200: {
          description: '成功获取任务详情'
        },
        500: {
          description: '服务器错误'
        }
      }
    }
  },
  '/?action=DescribeJobWebTerminal': {
    get: {
      tags: ['任务'],
      summary: '获取任务Web终端',
      description: '获取指定任务的Web终端链接',
      parameters: [
        {
          in: 'header',
          name: 'token',
          schema: {
            type: 'string'
          },
          required: false,
          description: '授权信息,authorization/token/x-api-key三选一, 格式: Bearer ak|sk|region,区域,可选值: bj, gz, su, bd, fwh, yq'
        },
        {
          in: 'header',
          name: 'authorization',
          schema: {
            type: 'string'
          },
          required: false,
          description: '授权信息,authorization/token/x-api-key三选一, 格式: Bearer ak|sk|region,区域,可选值: bj, gz, su, bd, fwh, yq'
        },
        {
          in: 'header',
          name: 'x-api-key',
          schema: {
            type: 'string'
          },
          required: false,
          description: '自定义授权信息，authorization/token/x-api-key三选一, 格式: ak|sk|region,区域,可选值: bj, gz, su, bd, fwh, yq'
        },
        {
          in: 'query',
          name: 'resourcePoolId',
          schema: {
            type: 'string'
          },
          required: true,
          description: '资源池ID'
        },
        {
          in: 'query',
          name: 'jobId',
          schema: {
            type: 'string'
          },
          required: true,
          description: '任务ID'
        },
        {
          in: 'query',
          name: 'podName',
          schema: {
            type: 'string'
          },
          required: true,
          description: 'Pod名称'
        }
      ],
      responses: {
        200: {
          description: '成功获取任务Web终端'
        },
        500: {
          description: '服务器错误'
        }
      }
    }
  },
  '/?action=CreateJob': {
    post: {
      tags: ['任务'],
      summary: '创建任务',
      description: '创建一个新任务，参数参考：https://cloud.baidu.com/doc/AIHC/s/jm56inxn7',
      parameters: [
        {
          in: 'header',
          name: 'token',
          schema: {
            type: 'string'
          },
          required: false,
          description: '授权信息,authorization/token/x-api-key三选一, 格式: Bearer ak|sk|region,区域,可选值: bj, gz, su, bd, fwh, yq'
        },
        {
          in: 'header',
          name: 'authorization',
          schema: {
            type: 'string'
          },
          required: false,
          description: '授权信息,authorization/token/x-api-key三选一, 格式: Bearer ak|sk|region,区域,可选值: bj, gz, su, bd, fwh, yq'
        },
        {
          in: 'header',
          name: 'x-api-key',
          schema: {
            type: 'string'
          },
          required: false,
          description: '自定义授权信息，authorization/token/x-api-key三选一, 格式: ak|sk|region,区域,可选值: bj, gz, su, bd, fwh, yq'
        },
        {
          in: 'query',
          name: 'resourcePoolId',
          schema: {
            type: 'string'
          },
          required: true,
          description: '资源池ID'
        }
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
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
                  type: 'object',
                  required: ['image', 'replicas', 'command'],
                  properties: {
                    image: {
                      type: 'string',
                      description: '镜像地址，需要包含tag'
                    },
                    imageConfig: {
                      type: 'object',
                      description: '镜像仓库访问配置，仅私有镜像时需要配置'
                    },
                    replicas: {
                      type: 'integer',
                      description: 'worker副本数'
                    },
                    resources: {
                      type: 'array',
                      description: '任务资源配置',
                      items: {
                        type: 'object',
                        required: ['name', 'quantity'],
                        properties: {
                          name: {
                            type: 'string',
                            description: '资源名称示例，支持设置GPU/CPU/内存以及共享内存资源，枚举值：baidu.com/a800_80g_cgpu（gpu型号，需要根据型号按照百度的资源描述符填入，上述示例为A800的型号）、cpu（cpu配额，单位核）、memory（内存配额，单位GB）、sharedMemory（共享内存配额，单位GB）',
                            enum: ['baidu.com/a800_80g_cgpu', 'cpu', 'memory', 'sharedMemory']
                          },
                          quantity: {
                            type: 'string',
                            description: '资源量'
                          }
                        }
                      }
                    },
                    envs: {
                      type: 'array',
                      description: 'worker环境变量，默认注入:\n1. AIHC_JOB_NAME ，值为name字段的值\n2. NCCL_IB_DISABLE，开启rdma后默认注入，值为0\n3. NCCL_DEBUG，nccl日志的级别，值为INFO',
                      items: {
                        type: 'object',
                        properties: {
                          name: {
                            type: 'string',
                            description: '环境变量名称'
                          },
                          value: {
                            type: 'string',
                            description: '环境变量值'
                          }
                        }
                      }
                    },
                    command: {
                      type: 'string',
                      description: '启动命令'
                    },
                    enableRDMA: {
                      type: 'boolean',
                      description: '是否开启RDMA，默认false，开启后将自动添加NCCL_IB_DISABLE=0的环境变量，添加rdma/hca资源，并配置10GB共享内存到训练节点的容器中'
                    },
                    hostNetwork: {
                      type: 'boolean',
                      description: '是否使用宿主机网络，开启后作业worker将使用宿主机网络，开启RDMA时默认为true'
                    }
                  }
                },
                faultTolerance: {
                  type: 'boolean',
                  description: '是否开启容错，默认值为关闭'
                },
                labels: {
                  type: 'array',
                  description: '训练任务标签，默认包含：\n1. aijob.cce.baidubce.com/create-from-aihcp-api: "true"\n2. aijob.cce.baidubce.com/ai-user-id: {accoutId}\n3. aijob.cce.baidubce.com/ai-user-name: {userName}',
                  items: {
                    type: 'object',
                    properties: {
                      key: {
                        type: 'string'
                      },
                      value: {
                        type: 'string'
                      }
                    }
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
                        description: '源路径：\n- type类型为pfs时，表示pfs存储中的路径，默认为/\n- type类型为hostpath时，表示宿主机路径'
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
                  }
                },
                enableBccl: {
                  type: 'boolean',
                  description: '是否开启BCCL自动注入，默认值为关闭。当前开启条件：\n1. 实例数大于等于 2\n2. 每个实例占整机 8 卡\n3. 任务开启 RDMA\n4. 卡型号为A800/HPAS'
                },
                faultToleranceConfig: {
                  type: 'object',
                  description: '容错高级配置（自定义hang检测）'
                },
                tensorboardConfig: {
                  type: 'object',
                  description: 'tensorboard相关配置'
                }
              }
            }
          }
        }
      },
      responses: {
        200: {
          description: '成功创建任务'
        },
        400: {
          description: '参数错误'
        },
        500: {
          description: '服务器错误'
        }
      }
    }
  }
}; 