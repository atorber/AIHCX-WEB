import { getSignature } from './common';
import axios from 'axios';

const RESOURCE_POOL_API = "/api/v1/resourcepools";

const DescribeResourcePools = async (ak: string, sk: string, region: string) => {
  console.log("DescribeResourcePools", ak, sk, region);

  const host = `aihc.${region}.baidubce.com`;

  const pageSize = 100;
  const pageNo = 1;
  const orderBy = 'createdAt';
  const order = 'desc';
  const aihcQuery = {
    pageSize,
    pageNo,
    orderBy,
    order
  }
    
  // 不再设置Host头，由浏览器自动设置
  const aihcHeaders: any = {};
    
  // 获取SDK签名
  const signature = getSignature(ak, sk, 'GET', RESOURCE_POOL_API, aihcQuery, aihcHeaders);
  aihcHeaders.Authorization = signature;

  console.log("请求参数:", aihcQuery);
  console.log("请求头:", JSON.stringify(aihcHeaders));

  try {
    const response = await axios({
      method: 'GET',
      url: `https://${host}${RESOURCE_POOL_API}`,
      params: aihcQuery,
      headers: aihcHeaders
    });

    console.log("API响应:", response.data);

    // 确保response.data.result存在
    if (!response.data || !response.data.result) {
      throw new Error('API返回数据格式错误');
    }
    return response.data.result.resourcePools || [];
  } catch (error) {
    console.log("API响应:", error);
    let errorMessage = '未知错误';
    if (axios.isAxiosError(error)) {
      errorMessage = error.response?.data || error.message;
    } else if (error instanceof Error) {
      errorMessage = error.message;
    } else {
      errorMessage = String(error);
    }
    console.error('远程获取资源池失败:', errorMessage);
    return [];
  }
}

export {
  DescribeResourcePools,
}