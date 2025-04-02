import { Request, Response, Router } from 'express';
import { RequestHeaders, getSignature, extractCredentials } from '../utils/common';
const rp = require("request-promise");
import { v4 as uuidv4 } from 'uuid';

const router = Router();

const JOBS_API = "/api/v1/aijobs";

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

const CreateJob = async (req: Request, res: Response) => {
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

    const responseData = {
      requestId: response.requestId,
      ...response.result
    }

    res.json(responseData);
  } catch (err) {
    res.status(500).json(err);
  }
}

export default router; 

export { 
  DescribeJobs,
  DescribeJob,
  DescribeJobWebTerminal,
  CreateJob
};