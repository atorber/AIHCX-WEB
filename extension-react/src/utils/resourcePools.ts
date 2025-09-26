import { getSignature } from './common';

const RESOURCE_POOL_API = "/api/v1/resourcepools";

const DescribeResourcePools = async (ak: string, sk: string, region: string) => {
  console.log("[AIHC助手] DescribeResourcePools", ak, sk, region);

  const host = `aihc.${region}.baidubce.com`;

  const pageSize = 100;
  const pageNo = 1;
  const orderBy = 'createdAt';
  const order = 'desc';
  const aihcQuery = {
    pageSize: pageSize.toString(),
    pageNo: pageNo.toString(),
    orderBy,
    order
  }
    
  // 不再设置Host头，由浏览器自动设置
  const aihcHeaders: any = {};
    
  // 获取SDK签名
  const signature = getSignature(ak, sk, 'GET', RESOURCE_POOL_API, aihcQuery, aihcHeaders);
  aihcHeaders.Authorization = signature;

  console.log("[AIHC助手] 请求参数:", aihcQuery);
  console.log("[AIHC助手] 请求头:", JSON.stringify(aihcHeaders));

  try {
    const response = await fetch(`https://${host}${RESOURCE_POOL_API}?${new URLSearchParams(aihcQuery)}`, {
      method: 'GET',
      headers: aihcHeaders
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("[AIHC助手] API响应:", data);

    // 确保data.result存在
    if (!data || !data.result) {
      throw new Error('API返回数据格式错误');
    }
    return data.result.resourcePools || [];
  } catch (error) {
    console.log("[AIHC助手] API响应错误:", error);
    let errorMessage = '未知错误';
    if (error instanceof Error) {
      errorMessage = error.message;
    } else {
      errorMessage = String(error);
    }
    console.error('[AIHC助手] 远程获取资源池失败:', errorMessage);
    return [];
  }
}

export {
  DescribeResourcePools,
}