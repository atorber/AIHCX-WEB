/**
 * Resource 相关的数据模型定义
 */

export const ResourceSchema = {
  type: 'object',
  required: ['name', 'quantity'],
  properties: {
    name: {
      type: 'string',
      description: `资源名称示例，支持设置GPU/CPU/内存以及共享内存资源，枚举值：
- baidu.com/a800_80g_cgpu：gpu型号，需要根据型号按照百度的资源描述符填入，上述示例为A800的型号
- cpu：cpu配额，单位核
- memory：内存配额，单位GB
- sharedMemory：共享内存配额，单位GB`,
      enum: ['baidu.com/a800_80g_cgpu', 'cpu', 'memory', 'sharedMemory']
    },
    quantity: {
      type: 'string',
      description: '资源量'
    }
  }
}; 