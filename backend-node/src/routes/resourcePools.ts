import { Request, Response, Router } from 'express';
import { RequestHeaders, getSignature, extractCredentials } from '../utils/common';
import { v4 as uuidv4 } from 'uuid';
const rp = require("request-promise");

const router = Router();

const RESOURCE_POOL_API = "/api/v1/resourcepools";

/**
 * /api/v1/resourcepools:
 *   get:
 *     tags: ['资源池']
 *     summary: 获取资源池列表
 *     description: 获取所有可用资源池列表
 *     parameters:
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
 *         description: 成功获取资源池列表
 *       500:
 *         description: 服务器错误
 */
router.get(RESOURCE_POOL_API, async (req: Request, res: Response) => {
  try {
    const { ak, sk, region } = extractCredentials(req.headers as RequestHeaders);
    const host = `aihc.${region}.baidubce.com`;
    
    const headers: any = { Host: host };
    const signature = getSignature(ak, sk, 'GET', RESOURCE_POOL_API, {}, headers);
    headers.Authorization = signature;

    const response = await rp({
      method: 'GET',
      uri: `https://${host}${RESOURCE_POOL_API}`,
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
 * /?action=DescribeResourcePools:
 *   get:
 *     tags: ['资源池']
 *     summary: 获取资源池列表
 *     description: 获取所有可用资源池列表
 *     parameters:
 *       - in: header
 *         name: ak
 *         schema:
 *           type: string
 *         required: false
 *         description: 访问密钥
 *       - in: header
 *         name: sk
 *         schema:
 *           type: string
 *         required: false
 *         description: 访问密钥
 *       - in: header
 *         name: region
 *         schema:
 *           type: string
 *         required: false
 *         default: bj
 *         description: "区域,可选值: bj, gz, su, bd, fwh, yq"
 *       - in: header
 *         name: authorization
 *         schema:
 *           type: string
 *         required: false
 *         description: 授权信息
 *       - in: header
 *         name: x-api-key
 *         schema:
 *           type: string
 *         required: false
 *         description: 自定义授权信息
 *       - in: header
 *         name: token
 *         schema:
 *           type: string
 *         required: false
 *         description: 自定义授权信息
 *       - in: query
 *         name: pageNumber
 *         schema:
 *           type: number
 *         required: false
 *         default: 1
 *         description: 页码
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: number
 *         required: false
 *         default: 100
 *         description: 每页数量
 *       - in: query
 *         name: orderBy
 *         schema:
 *           type: string
 *         required: false
 *         default: createdAt
 *         description: "排序字段, 可选值: clusterName, clusterID, createdAt"
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *         required: false
 *         default: desc
 *         description: "排序方向, 可选值: asc, desc"
 *     responses:
 *       200:
 *         description: 成功获取资源池列表
 *       500:
 *         description: 服务器错误
 */
const DescribeResourcePools = async (req: Request, res: Response) => {
  const { method, params, query, body, headers, url, baseUrl, originalUrl } = req;
  console.log("请求头:", JSON.stringify(headers));
  try {
    const { ak, sk, region } = extractCredentials(req.headers as RequestHeaders);
    const host = `aihc.${region}.baidubce.com`;

    const pageSize = query.pageSize || 100;
    const pageNo = query.pageNumber || 1;
    const orderBy = query.orderBy || 'createdAt';
    const order = query.order || 'desc';
    const aihcQuery = {
      pageSize,
      pageNo,
      orderBy,
      order
    }
    
    const aihcHeaders: any = { Host: host };
    
    // 获取SDK签名
    const signature = getSignature(ak, sk, 'GET', RESOURCE_POOL_API, aihcQuery, aihcHeaders);
    aihcHeaders.Authorization = signature;
    
    // 在响应中设置授权信息，让客户端能够重用
    res.header('Authorization', `Bearer ${ak}|${sk}|${region}`);

    console.log("请求参数:", aihcQuery);
    console.log("请求头:", JSON.stringify(aihcHeaders));

    const response = await rp({
      method: 'GET',
      uri: `https://${host}${RESOURCE_POOL_API}`,
      qs: aihcQuery,
      headers: aihcHeaders,
      json: true
    });

    console.log("API响应:", response);

    // 确保response.result存在
    if (!response || !response.result) {
      throw new Error('API返回数据格式错误');
    }

    const responseData = {
      requestId: uuidv4(),
      resourcePools: response.result.resourcePools || [],
      totalCount: response.result.total || 0,
      pageSize: pageSize,
      pageNumber: pageNo,
      orderBy: response.result.orderBy || orderBy
    }

    res.header('server', 'AIHC');
    res.header('x-bce-request-id', responseData.requestId);

    console.log("返回数据:", responseData);

    res.json(responseData);
  } catch (err) {
    console.error('DescribeResourcePools错误:', err);
    throw err;
  }
}

/**
 * @swagger
 * /?action=DescribeResourcePool:
 *   get:
 *     tags: ['资源池']
 *     summary: 获取资源池详情
 *     description: 获取指定资源池的详情
 *     parameters:
 *       - in: header
 *         name: ak
 *         schema:
 *           type: string
 *         required: false
 *         description: 访问密钥
 *       - in: header
 *         name: sk
 *         schema:
 *           type: string
 *         required: false
 *         description: 访问密钥
 *       - in: header
 *         name: region
 *         schema:
 *           type: string
 *         required: false
 *         default: bj
 *         description: "区域,可选值: bj, gz, su, bd, fwh, yq"
 *       - in: header
 *         name: authorization
 *         schema:
 *           type: string
 *         required: false
 *         description: 授权信息
 *       - in: header
 *         name: x-api-key
 *         schema:
 *           type: string
 *         required: false
 *         description: 自定义授权信息
 *       - in: header
 *         name: token
 *         schema:
 *           type: string
 *         required: false
 *         description: 自定义授权信息
 *       - in: query
 *         name: resourcePoolId
 *         schema:
 *           type: string
 *         required: true
 *         description: 资源池ID
 *     responses:
 *       200:
 *         description: 成功获取资源池详情
 *       500:
 *         description: 服务器错误
 */
const DescribeResourcePool = async (req: Request, res: Response) => {
  const { method, params, query, body, headers, url, baseUrl, originalUrl } = req;

  try {
    const { ak, sk, region } = extractCredentials(req.headers as RequestHeaders);
    const host = `aihc.${region}.baidubce.com`;

    const aihcQuery = {
      resourcePoolId: query.resourcePoolId
    }
    
    const aihcHeaders: any = { Host: host };

    const path = `${RESOURCE_POOL_API}/${query.resourcePoolId}`;
    
    // 获取SDK签名
    const signature = getSignature(ak, sk, 'GET', path, aihcQuery, aihcHeaders);
    aihcHeaders.Authorization = signature;
    
    // 在响应中设置授权信息，让客户端能够重用
    res.header('Authorization', `Bearer ${ak}|${sk}|${region}`);

    console.log("请求参数:", aihcQuery);
    console.log("请求头:", JSON.stringify(aihcHeaders));

    const response = await rp({
      method: 'GET',
      uri: `https://${host}${path}`,
      qs: aihcQuery,
      headers: aihcHeaders,
      json: true
    });

    console.log("API响应:", response);

    // 确保response.result存在
    if (!response || !response.result) {
      throw new Error('API返回数据格式错误');
    }

    const responseData = {
      requestId: uuidv4(),
      ...response.result.resourcePool
    }

    res.header('server', 'AIHC');
    res.header('x-bce-request-id', responseData.requestId);

    console.log("返回数据:", responseData);

    res.json(responseData);
  } catch (err) {
    console.error('DescribeResourcePools错误:', err);
    throw err;
  }
}

/**
 * @swagger
 * /?action=DescribeResourceQueues:
 *   get:
 *     tags: ['资源池']
 *     summary: 获取资源队列列表
 *     description: 获取指定资源池中的资源队列列表
 *     parameters:
 *       - in: header
 *         name: ak
 *         schema:
 *           type: string
 *         required: false
 *         description: 访问密钥
 *       - in: header
 *         name: sk
 *         schema:
 *           type: string
 *         required: false
 *         description: 访问密钥
 *       - in: header
 *         name: region
 *         schema:
 *           type: string
 *         required: false
 *         default: bj
 *         description: "区域,可选值: bj, gz, su, bd, fwh, yq"
 *       - in: header
 *         name: authorization
 *         schema:
 *           type: string
 *         required: false
 *         description: 授权信息
 *       - in: header
 *         name: x-api-key
 *         schema:
 *           type: string
 *         required: false
 *         description: 自定义授权信息
 *       - in: header
 *         name: token
 *         schema:
 *           type: string
 *         required: false
 *         description: 自定义授权信息
 *       - in: query
 *         name: resourcePoolId
 *         schema:
 *           type: string
 *         required: true
 *         description: 资源池ID
 *     responses:
 *       200:
 *         description: 成功获取资源队列列表
 *       500:
 *         description: 服务器错误
 */
const DescribeResourceQueues = async (req: Request, res: Response) => {
  const { method, params, query, body, headers, url, baseUrl, originalUrl } = req;
  const path = `${RESOURCE_POOL_API}/${query.resourcePoolId}/queue`;

  try {
    const { ak, sk, region } = extractCredentials(req.headers as RequestHeaders);
    const host = `aihc.${region}.baidubce.com`;
    const pageSize = query.pageSize || 100;
    const pageNo = query.pageNumber || 1;
    const orderBy = query.orderBy || 'createdAt';
    const order = query.order || 'desc';
    const aihcQuery = {
      pageSize,
      pageNo,
      orderBy,
      order
    }

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

    console.log("API响应:", response);

    // 确保response.result存在
    if (!response || !response.result) {
      throw new Error('API返回数据格式错误');
    }

    const responseData = {
      requestId: uuidv4(),
      resourceQueues: response.result.queues || [],
      totalCount: response.result.total || 0,
      pageSize: pageSize,
      pageNumber: pageNo,
      orderBy: response.result.orderBy || orderBy
    }

    res.header('server', 'AIHC');
    res.header('x-bce-request-id', responseData.requestId);

    console.log("返回数据:", responseData);
    res.json(responseData);
  } catch (err) {
    console.error('DescribeResourceQueues错误:', err);
    throw err;
  }
}

/**
 * @swagger
 * /?action=DescribeResourceQueue:
 *   get:
 *     tags: ['资源池']
 *     summary: 获取资源队列详情
 *     description: 获取指定资源队列的详情
 *     parameters:
 *       - in: header
 *         name: ak
 *         schema:
 *           type: string
 *         required: false
 *         description: 访问密钥
 *       - in: header
 *         name: sk
 *         schema:
 *           type: string
 *         required: false
 *         description: 访问密钥
 *       - in: header
 *         name: region
 *         schema:
 *           type: string
 *         required: false
 *         default: bj
 *         description: "区域,可选值: bj, gz, su, bd, fwh, yq"
 *       - in: header
 *         name: authorization
 *         schema:
 *           type: string
 *         required: false
 *         description: 授权信息
 *       - in: header
 *         name: x-api-key
 *         schema:
 *           type: string
 *         required: false
 *         description: 自定义授权信息
 *       - in: header
 *         name: token
 *         schema:
 *           type: string
 *         required: false
 *         description: 自定义授权信息
 *       - in: query
 *         name: resourcePoolId
 *         schema:
 *           type: string
 *         required: true
 *         description: 资源池ID
 *       - in: query
 *         name: queueName
 *         schema:
 *           type: string
 *         required: true
 *         description: 资源队列名称
 *     responses:
 *       200:
 *         description: 成功获取资源队列详情
 *       500:
 *         description: 服务器错误
 */
const DescribeResourceQueue = async (req: Request, res: Response) => {
  const { method, params, query, body, headers, url, baseUrl, originalUrl } = req;
  const { resourcePoolId, queueName } = query;

  const path = `${RESOURCE_POOL_API}/${resourcePoolId}/queue/${queueName}`;

  const { ak, sk, region } = extractCredentials(req.headers as RequestHeaders);
  const host = `aihc.${region}.baidubce.com`;

  const aihcHeaders: any = { Host: host };

  const signature = getSignature(ak, sk, 'GET', path, {}, aihcHeaders);
  aihcHeaders.Authorization = signature;

  const response = await rp({
    method: 'GET',
    uri: `https://${host}${path}`,
    headers: aihcHeaders,
    json: true
  });

  const responseData = {
    requestId: uuidv4(),
    ...response.result.queue
  }

  res.header('server', 'AIHC');
  res.header('x-bce-request-id', responseData.requestId);

  res.json(responseData);
}

export default router; 

export {
  DescribeResourcePools,
  DescribeResourcePool,
  DescribeResourceQueues,
  DescribeResourceQueue
}