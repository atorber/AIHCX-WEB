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
*     responses:
 *       200:
 *         description: 成功获取任务列表
 *       500:
 *         description: 服务器错误
 */
const DescribeJobs = async (req: Request, res: Response) => {
  const { ak, sk, region } = extractCredentials(req.headers as RequestHeaders);
  const { resourcePoolId } = req.query;
  const host = `aihc.${region}.baidubce.com`;

  const aihcQuery = { resourcePoolId };
  const aihcHeaders: any = { Host: host };
  const signature = getSignature(ak, sk, 'GET', JOBS_API, aihcQuery, aihcHeaders);
  aihcHeaders.Authorization = signature;

  const response = await rp({
    method: 'GET',
    uri: `https://${host}${JOBS_API}`,
    qs: aihcQuery,
    headers: aihcHeaders,
    json: true
  });

  const responseData = {
    requestId: response.requestId,
    jobs: response.result.jobs,
    totalCount: response.totalCount,
    pageSize: response.pageSize,
    pageNumber: response.pageNumber,
    orderBy: response.orderBy
  }

  res.json(responseData);
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
 *         required: true
 *         description: "授权信息,authorization/token/x-api-key三选一, 格式: Bearer ak|sk|region,区域,可选值: bj, gz, su, bd, fwh, yq"
 *       - in: header
 *         name: authorization
 *         schema:
 *           type: string
 *         required: true
 *         description: "授权信息,authorization/token/x-api-key三选一, 格式: Bearer ak|sk|region,区域,可选值: bj, gz, su, bd, fwh, yq"
 *       - in: header
 *         name: x-api-key
 *         schema:
 *           type: string
 *         required: true
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
}

export default router; 

export { 
  DescribeJobs,
  DescribeJob
};