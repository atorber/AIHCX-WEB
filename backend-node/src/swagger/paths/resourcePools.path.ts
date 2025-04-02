/**
 * resourcePools 相关的路径定义
 */

export const ResourcePoolsPaths = {
  '/?action=DescribeResourcePools': {
    get: {
      tags: ['资源池'],
      summary: '获取资源池列表',
      description: '获取所有资源池列表',
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
          name: 'orderBy',
          schema: {
            type: 'string'
          },
          required: false,
          default: 'createdAt',
          description: '排序字段, 可选值: clusterName, clusterID, createdAt'
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
          description: '成功获取资源池列表',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  requestId: {
                    type: 'string',
                    description: '请求ID'
                  },
                  resourcePools: {
                    type: 'array',
                    description: '资源池列表'
                  },
                  totalCount: {
                    type: 'number',
                    description: '总数'
                  },
                  pageSize: {
                    type: 'number',
                    description: '每页数量'
                  },
                  pageNumber: {
                    type: 'number',
                    description: '当前页码'
                  },
                  orderBy: {
                    type: 'string',
                    description: '排序字段'
                  }
                }
              }
            }
          }
        },
        500: {
          description: '服务器错误'
        }
      }
    }
  },
  '/?action=DescribeResourcePool': {
    get: {
      tags: ['资源池'],
      summary: '获取资源池详情',
      description: '获取指定资源池的详细信息',
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
      responses: {
        200: {
          description: '成功获取资源池详情',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  requestId: {
                    type: 'string',
                    description: '请求ID'
                  },
                  resourcePool: {
                    type: 'object',
                    description: '资源池详情'
                  }
                }
              }
            }
          }
        },
        404: {
          description: '资源池不存在'
        },
        500: {
          description: '服务器错误'
        }
      }
    }
  },
  '/?action=DescribeResourceQueues': {
    get: {
      tags: ['资源池'],
      summary: '获取资源队列列表',
      description: '获取指定资源池中的资源队列列表',
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
          name: 'orderBy',
          schema: {
            type: 'string'
          },
          required: false,
          default: 'createdAt',
          description: '排序字段'
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
          description: '成功获取资源队列列表',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  requestId: {
                    type: 'string',
                    description: '请求ID'
                  },
                  resourceQueues: {
                    type: 'array',
                    description: '资源队列列表'
                  },
                  totalCount: {
                    type: 'number',
                    description: '总数'
                  },
                  pageSize: {
                    type: 'number',
                    description: '每页数量'
                  },
                  pageNumber: {
                    type: 'number',
                    description: '当前页码'
                  },
                  orderBy: {
                    type: 'string',
                    description: '排序字段'
                  },
                  order: {
                    type: 'string',
                    description: '排序方向'
                  }
                }
              }
            }
          }
        },
        500: {
          description: '服务器错误'
        }
      }
    }
  },
  '/?action=DescribeResourceQueue': {
    get: {
      tags: ['资源池'],
      summary: '获取资源队列详情',
      description: '获取指定资源队列的详细信息',
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
          name: 'queueName',
          schema: {
            type: 'string'
          },
          required: true,
          description: '资源队列名称'
        }
      ],
      responses: {
        200: {
          description: '成功获取资源队列详情',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  requestId: {
                    type: 'string',
                    description: '请求ID'
                  },
                  resourceQueue: {
                    type: 'object',
                    description: '资源队列详情'
                  }
                }
              }
            }
          }
        },
        404: {
          description: '资源队列不存在'
        },
        500: {
          description: '服务器错误'
        }
      }
    }
  }
}; 