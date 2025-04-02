import { Request, Response, Router } from 'express';
import { RequestHeaders, getSignature, extractCredentials } from '../utils/common';
import { v4 as uuidv4 } from 'uuid';
const rp = require("request-promise");

const router = Router();

const RESOURCE_POOL_API = "/api/v1/resourcepools";

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
  } catch (err: any) {
    res.status(err.statusCode || 500).json(err.error);
  }
}

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
  } catch (err: any) {
    res.status(err.statusCode || 500).json(err.error);
  }
}

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

    const result = response.result;

    const responseData = {
      requestId: uuidv4(),
      resourceQueues: result.queues || [],
      totalCount: result.total || 0,
      pageSize: pageSize,
      pageNumber: pageNo,
      orderBy: result.orderBy,
      order: result.order
    }

    res.header('server', 'AIHC');
    res.header('x-bce-request-id', responseData.requestId);

    console.log("返回数据:", responseData);
    res.json(responseData);
  } catch (err: any) {
    res.status(err.statusCode || 500).json(err.error);
  }
}

const DescribeResourceQueue = async (req: Request, res: Response) => {
  const { method, params, query, body, headers, url, baseUrl, originalUrl } = req;
  const { resourcePoolId, queueName } = query;

  const path = `${RESOURCE_POOL_API}/${resourcePoolId}/queue/${queueName}`;

  const { ak, sk, region } = extractCredentials(req.headers as RequestHeaders);
  const host = `aihc.${region}.baidubce.com`;

  const aihcHeaders: any = { Host: host };

  const signature = getSignature(ak, sk, 'GET', path, {}, aihcHeaders);
  aihcHeaders.Authorization = signature;

  try {
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
  } catch (err: any) {
    res.status(err.statusCode || 500).json(err.error);
  }
}

export default router; 

export {
  DescribeResourcePools,
  DescribeResourcePool,
  DescribeResourceQueues,
  DescribeResourceQueue
}