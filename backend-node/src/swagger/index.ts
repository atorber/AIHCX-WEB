/**
 * Swagger 文档入口文件
 */

import { 
    JobSchema, 
    JobSpecSchema, 
    EnvSchema, 
    ImageConfigSchema, 
    FaultToleranceConfigSchema, 
    TensorboardConfigSchema, 
    DatasourceSchema,
    LabelSchema
} from './schemas/job.schema';
import { ResourceSchema } from './schemas/resource.schema';
import { JobsPaths } from './paths/jobs.path';
import { ResourcePoolsPaths } from './paths/resourcePools.path';
import { AppsPaths } from './paths/apps.path';

export const swaggerDocument = {
  openapi: '3.0.0',
//   info: {
//     title: 'AIHCX API',
//     version: '1.0.0',
//     description: 'AIHCX平台接口文档'
//   },
  servers: [
    {
      url: 'http://127.0.0.1:8000',
      description: '开发环境'
    }
  ],
  components: {
    schemas: {
      Job: JobSchema,
      JobSpec: JobSpecSchema,
      Resource: ResourceSchema,
      Datasource: DatasourceSchema,
      Env: EnvSchema,
      ImageConfig: ImageConfigSchema,
      FaultToleranceConfig: FaultToleranceConfigSchema,
      TensorboardConfig: TensorboardConfigSchema,
      Label: LabelSchema
    }
  },
  paths: {
    ...JobsPaths,
    ...ResourcePoolsPaths,
    ...AppsPaths
  }
}; 