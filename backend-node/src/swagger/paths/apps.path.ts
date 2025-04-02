/**
 * Apps 相关的路径定义
 */

export const AppsPaths = {
  '/?action=DescribeApps': {
    get: {
      tags: ['应用'],
      summary: '获取应用列表',
      description: '获取应用列表',
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
  '/?action=DescribeApp': {
    get: {
      tags: ['应用'],
      summary: '获取应用详情',
      description: '获取指定应用的详情',
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
          name: 'appId',
          schema: {
            type: 'string'
          },
          required: true,
          description: '应用ID'
        }
      ],
      responses: {
        200: {
          description: '成功获取应用详情'
        },
        500: {
          description: '服务器错误'
        }
      }
    }
  },
  '/?action=DescribeAppTags': {
    get: {
      tags: ['应用'],
      summary: '获取应用标签',
      description: '获取应用标签',
      responses: {
        200: {
          description: '成功获取应用标签'
        },
        500: {
          description: '服务器错误'
        }
      }
    }
  }
}; 