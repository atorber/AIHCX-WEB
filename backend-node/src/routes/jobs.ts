import { Request, Response, Router } from 'express';
import { RequestHeaders, getSignature, extractCredentials } from '../utils/common';
const rp = require("request-promise");
import { v4 as uuidv4 } from 'uuid';

const router = Router();

const JOBS_API = "/api/v1/aijobs";

/**
 * /api/v1/aijobs:
 *   get:
 *     tags: ['任务']
 *     summary: 获取任务列表
 *     description: 获取指定资源池中的任务列表
 *     parameters:
 *       - in: query
 *         name: resourcePoolId
 *         schema:
 *           type: string
 *         required: true
 *         description: 资源池ID
 *       - in: header
 *         name: ak
 *         schema:
 *           type: string
 *         required: true
 *         description: API密钥
 *       - in: header
 *         name: sk
 *         schema:
 *           type: string
 *         required: true
 *         description: API密钥
 *       - in: header
 *         name: region
 *         schema:
 *           type: string
 *         required: true
 *         description: 地域
 *     responses:
 *       200:
 *         description: 成功获取任务列表
 *       500:
 *         description: 服务器错误
 */
router.get(JOBS_API, async (req: Request, res: Response) => {
  try {
    const { ak, sk, region } = extractCredentials(req.headers as RequestHeaders);
    const { resourcePoolId } = req.query;
    const host = `aihc.${region}.baidubce.com`;
    
    const query = { resourcePoolId };
    const headers: any = { Host: host };
    const signature = getSignature(ak, sk, 'GET', JOBS_API, query, headers);
    headers.Authorization = signature;

    const response = await rp({
      method: 'GET',
      uri: `https://${host}${JOBS_API}`,
      qs: query,
      headers,
      json: true
    });

    res.json(response);
  } catch (err) {
    res.status(500).json(err);
  }
});

/**
 * /api/v1/aijobs:
 *   post:
 *     tags: ['任务']
 *     summary: 创建任务
 *     description: 在指定资源池中创建新任务
 *     parameters:
 *       - in: query
 *         name: resourcePoolId
 *         schema:
 *           type: string
 *         required: true
 *         description: 资源池ID
 *       - in: header
 *         name: ak
 *         schema:
 *           type: string
 *         required: true
 *         description: API密钥
 *       - in: header
 *         name: sk
 *         schema:
 *           type: string
 *         required: true
 *         description: API密钥
 *       - in: header
 *         name: region
 *         schema:
 *           type: string
 *         required: true
 *         description: 地域
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: 任务名称
 *               description:
 *                 type: string
 *                 description: 任务描述
 *     responses:
 *       200:
 *         description: 成功创建任务
 *       500:
 *         description: 服务器错误
 */
router.post(JOBS_API, async (req: Request, res: Response) => {
  try {
    const { ak, sk, region } = extractCredentials(req.headers as RequestHeaders);
    const { resourcePoolId } = req.query;
    const host = `aihc.${region}.baidubce.com`;
    
    const query = { resourcePoolId };
    const headers: any = { 
      Host: host,
      'Content-Type': 'application/json'
    };
    const signature = getSignature(ak, sk, 'POST', JOBS_API, query, headers);
    headers.Authorization = signature;

    const response = await rp({
      method: 'POST',
      uri: `https://${host}${JOBS_API}`,
      qs: query,
      body: req.body,
      headers,
      json: true
    });

    res.json(response);
  } catch (err) {
    res.status(500).json(err);
  }
});

/**
 * @swagger
 * /?action=DescribeJobs:
 *   get:
 *     tags: ['任务']
 *     summary: 获取任务列表
 *     description: 获取指定资源池中的任务列表
 *     parameters:
 *       - in: header
 *         name: token
 *         schema:
 *           type: string
 *         required: false
 *         description: "授权信息,authorization/token/x-api-key三选一, 格式: Bearer ak|sk|region,区域,可选值: bj, gz, su, bd, fwh, yq"
 *       - in: header
 *         name: authorization
 *         schema:
 *           type: string
 *         required: false
 *         description: "授权信息,authorization/token/x-api-key三选一, 格式: Bearer ak|sk|region,区域,可选值: bj, gz, su, bd, fwh, yq"
 *       - in: header
 *         name: x-api-key
 *         schema:
 *           type: string
 *         required: false
 *         description: "自定义授权信息，authorization/token/x-api-key三选一, 格式: ak|sk|region,区域,可选值: bj, gz, su, bd, fwh, yq"
 *       - in: query
 *         name: resourcePoolId
 *         schema:
 *           type: string
 *         required: true
 *         description: 资源池ID
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: number
 *         required: false
 *         default: 100
 *         description: 每页数量
 *       - in: query
 *         name: pageNumber
 *         schema:
 *           type: number
 *         required: false
 *         default: 1
 *         description: 页码
 *       - in: query
 *         name: orderBy
 *         schema:
 *           type: string
 *         required: false
 *         default: createdAt
 *         description: "排序字段, 可选值: createdAt, name, status"
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *         required: false
 *         default: desc
 *         description: "排序方向, 可选值: asc, desc"
 *     responses:
 *       200:
 *         description: 成功获取任务列表
 *       500:
 *         description: 服务器错误
 */
const DescribeJobs = async (req: Request, res: Response) => {
  const { ak, sk, region } = extractCredentials(req.headers as RequestHeaders);
  const { resourcePoolId, pageSize, pageNumber, orderBy, order } = req.query;
  const host = `aihc.${region}.baidubce.com`;

  const aihcQuery = { 
    resourcePoolId,
    pageSize: pageSize || 100,
    pageNo: pageNumber || 1,
    orderBy: orderBy || 'createdAt',
    order: order || 'desc'
  };
  const aihcHeaders: any = { Host: host };
  const signature = getSignature(ak, sk, 'GET', JOBS_API, aihcQuery, aihcHeaders);
  aihcHeaders.Authorization = signature;

  try {
    const response = await rp({
      method: 'GET',
      uri: `https://${host}${JOBS_API}`,
      qs: aihcQuery,
      headers: aihcHeaders,
      json: true
    });
  
    console.log("response", response);

    const result = response.result;
    const responseData = {
      requestId: response.requestId,
      jobs: result.jobs,
      totalCount: result.total,
      pageSize: result.pageSize,
      pageNumber: result.pageNo,
      orderBy: result.orderBy,
      order: result.order
    }
  
    res.json(responseData);
  } catch (err: any) {
    res.status(err.statusCode).json(err.error);
  }
}

/**
 * @swagger
 * /?action=DescribeJob:
 *   get:
 *     tags: ['任务']
 *     summary: 获取任务详情
 *     description: 获取指定任务的详情
 *     parameters:
 *       - in: header
 *         name: token
 *         schema:
 *           type: string
 *         required: false
 *         description: "授权信息,authorization/token/x-api-key三选一, 格式: Bearer ak|sk|region,区域,可选值: bj, gz, su, bd, fwh, yq"
 *       - in: header
 *         name: authorization
 *         schema:
 *           type: string
 *         required: false
 *         description: "授权信息,authorization/token/x-api-key三选一, 格式: Bearer ak|sk|region,区域,可选值: bj, gz, su, bd, fwh, yq"
 *       - in: header
 *         name: x-api-key
 *         schema:
 *           type: string
 *         required: false
 *         description: "自定义授权信息，authorization/token/x-api-key三选一, 格式: ak|sk|region,区域,可选值: bj, gz, su, bd, fwh, yq"
 *       - in: query
 *         name: jobId
 *         schema:
 *           type: string
 *         required: true
 *         description: 任务ID
 *     responses:
 *       200:
 *         description: 成功获取任务详情
 *       500:
 *         description: 服务器错误
 */
const DescribeJob = async (req: Request, res: Response) => {
  const { method, params, query, body, headers, url, baseUrl, originalUrl } = req;
  const path = `${JOBS_API}/${query.jobId}`;

  const { ak, sk, region } = extractCredentials(req.headers as RequestHeaders);
  const host = `aihc.${region}.baidubce.com`;


  const aihcQuery = {
    resourcePoolId: query.resourcePoolId,
  };
  const aihcHeaders: any = { Host: host };
  const signature = getSignature(ak, sk, 'GET', path, aihcQuery, aihcHeaders);
  aihcHeaders.Authorization = signature;

  try {
    const response = await rp({
      method: 'GET',
      uri: `https://${host}${path}`,
      qs: aihcQuery,
      headers: aihcHeaders,
      json: true
    });

    console.log(response);

  const responseData = {
    requestId: response.requestId,
    ...response.result
  }

    res.json(responseData);
  } catch (err: any) {
    res.status(err.statusCode || 500).json(err.error);
  }
}

/**
 * @swagger
 * /?action=DescribeJobWebTerminal:
 *   get:
 *     tags: ['任务']
 *     summary: 获取任务Web终端
 *     description: 获取指定任务的Web终端链接
 *     parameters:
 *       - in: header
 *         name: token
 *         schema:
 *           type: string
 *         required: false
 *         description: "授权信息,authorization/token/x-api-key三选一, 格式: Bearer ak|sk|region,区域,可选值: bj, gz, su, bd, fwh, yq"
 *       - in: header
 *         name: authorization
 *         schema:
 *           type: string
 *         required: false
 *         description: "授权信息,authorization/token/x-api-key三选一, 格式: Bearer ak|sk|region,区域,可选值: bj, gz, su, bd, fwh, yq"
 *       - in: header
 *         name: x-api-key
 *         schema:
 *           type: string
 *         required: false
 *         description: "自定义授权信息，authorization/token/x-api-key三选一, 格式: ak|sk|region,区域,可选值: bj, gz, su, bd, fwh, yq"
 *       - in: query
 *         name: resourcePoolId
 *         schema:
 *           type: string
 *         required: true
 *         description: 资源池ID
 *       - in: query
 *         name: jobId
 *         schema:
 *           type: string
 *         required: true
 *         description: 任务ID
 *       - in: query
 *         name: podName
 *         schema:
 *           type: string
 *         required: true
 *         description: Pod名称
 *     responses:
 *       200:
 *         description: 成功获取任务Web终端
 *       500:
 *         description: 服务器错误
 */
const DescribeJobWebTerminal = async (req: Request, res: Response) => {
  const { jobId, podName, resourcePoolId } = req.query;
  const { ak, sk, region } = extractCredentials(req.headers as RequestHeaders);
  const host = `aihc.${region}.baidubce.com`;
  const path = `${JOBS_API}/${jobId}/pods/${podName}/webterminal`;

  const aihcQuery = {
    resourcePoolId,
    jobId,
    podName
  }

  const aihcHeaders: any = { Host: host };
  const signature = getSignature(ak, sk, 'GET', path, aihcQuery, aihcHeaders);
  aihcHeaders.Authorization = signature;

  try {
    const response = await rp({
      method: 'GET',
      uri: `https://${host}${path}`,
      qs: aihcQuery,
      headers: aihcHeaders,
      json: true
    });

    const responseData = {
      requestId: response.requestId,
      ...response.result
    }

    res.json(responseData);
  } catch (err: any) {
    res.status(err.statusCode || 500).json(err.error);
  }
}

/**
 * @swagger
 * /?action=CreateJob:
 *   post:
 *     tags: ['任务']
 *     summary: 创建任务
 *     description: 创建一个新任务，参数参考：https://cloud.baidu.com/doc/AIHC/s/jm56inxn7
 *     parameters:
 *       - in: header
 *         name: token
 *         schema:
 *           type: string
 *         required: false
 *         description: "授权信息,authorization/token/x-api-key三选一, 格式: Bearer ak|sk|region,区域,可选值: bj, gz, su, bd, fwh, yq"
 *       - in: header
 *         name: authorization
 *         schema:
 *           type: string
 *         required: false
 *         description: "授权信息,authorization/token/x-api-key三选一, 格式: Bearer ak|sk|region,区域,可选值: bj, gz, su, bd, fwh, yq"
 *       - in: header
 *         name: x-api-key
 *         schema:
 *           type: string
 *         required: false
 *         description: "自定义授权信息，authorization/token/x-api-key三选一, 格式: ak|sk|region,区域,可选值: bj, gz, su, bd, fwh, yq"
 *       - in: query
 *         name: resourcePoolId
 *         schema:
 *           type: string
 *         required: true
 *         description: 资源池ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - jobSpec
 *             properties:
 *               name:
 *                 type: string
 *                 description: 任务名称
 *               queue:
 *                 type: string
 *                 description: 训练任务所属队列，默认为default队列
 *               jobFramework:
 *                 type: string
 *                 description: 分布式框架，只支持 PyTorchJob，默认值：PyTorchJob
 *               jobSpec:
 *                 type: object
 *                 required:
 *                   - image
 *                   - replicas
 *                   - command
 *                 properties:
 *                   image:
 *                     type: string
 *                     description: 镜像地址，需要包含tag
 *                   imageConfig:
 *                     type: object
 *                     description: 镜像仓库访问配置，仅私有镜像时需要配置
 *                   replicas:
 *                     type: integer
 *                     description: worker副本数
 *                   resources:
 *                     type: array
 *                     description: 配置资源配额
 *                     items:
 *                       type: object
 *                       properties:
 *                         cpu:
 *                           type: string
 *                           description: CPU资源配额
 *                         memory:
 *                           type: string
 *                           description: 内存资源配额
 *                         gpu:
 *                           type: string
 *                           description: GPU资源配额
 *                   envs:
 *                     type: array
 *                     description: |
 *                       worker环境变量，默认注入:
 *                       1. AIHC_JOB_NAME ，值为name字段的值
 *                       2. NCCL_IB_DISABLE，开启rdma后默认注入，值为0
 *                       3. NCCL_DEBUG，nccl日志的级别，值为INFO
 *                     items:
 *                       type: object
 *                       properties:
 *                         name:
 *                           type: string
 *                           description: 环境变量名称
 *                         value:
 *                           type: string
 *                           description: 环境变量值
 *                   command:
 *                     type: string
 *                     description: 启动命令
 *                   enableRDMA:
 *                     type: boolean
 *                     description: |
 *                       是否开启RDMA，默认false，开启后将自动添加NCCL_IB_DISABLE=0的环境变量，
 *                       添加rdma/hca资源，并配置10GB共享内存到训练节点的容器中
 *                   hostNetwork:
 *                     type: boolean
 *                     description: 是否使用宿主机网络，开启后作业worker将使用宿主机网络，开启RDMA时默认为true
 *               faultTolerance:
 *                 type: boolean
 *                 description: 是否开启容错，默认值为关闭
 *               labels:
 *                 type: array
 *                 description: |
 *                   训练任务标签，默认包含：
 *                   1. aijob.cce.baidubce.com/create-from-aihcp-api: "true"
 *                   2. aijob.cce.baidubce.com/ai-user-id: {accoutId}
 *                   3. aijob.cce.baidubce.com/ai-user-name: {userName}
 *                 items:
 *                   type: object
 *                   properties:
 *                     key:
 *                       type: string
 *                     value:
 *                       type: string
 *               priority:
 *                 type: string
 *                 description: 调度优先级，支持高（high）、中（normal）、低（low），默认值：normal
 *                 enum: [high, normal, low]
 *               datasources:
 *                 type: array
 *                 description: 数据源配置，当前支持PFS
 *                 items:
 *                   type: object
 *                   properties:
 *                     type:
 *                       type: string
 *                       enum: [PFS]
 *                     path:
 *                       type: string
 *               enableBccl:
 *                 type: boolean
 *                 description: |
 *                   是否开启BCCL自动注入，默认值为关闭。当前开启条件：
 *                   1. 实例数大于等于 2
 *                   2. 每个实例占整机 8 卡
 *                   3. 任务开启 RDMA
 *                   4. 卡型号为A800/HPAS
 *               faultToleranceConfig:
 *                 type: object
 *                 description: 容错高级配置（自定义hang检测）
 *               tensorboardConfig:
 *                 type: object
 *                 description: tensorboard相关配置
 *     responses:
 *       200:
 *         description: 成功创建任务
 *       400:
 *         description: 参数错误
 *       500:
 *         description: 服务器错误
 */
const CreateJob = async (req: Request, res: Response) => {
  const { method, params, query, body, headers, url, baseUrl, originalUrl } = req;
  const responseData = {
    url,
    baseUrl,
    originalUrl,
    method,
    params,
    query,
    body,
    headers
  }

  res.json(responseData);
}

export default router; 

export { 
  DescribeJobs,
  DescribeJob,
  DescribeJobWebTerminal,
  CreateJob
};