const Auth = require("@baiducloud/sdk").Auth;

export interface RequestHeaders {
  authorization?: string;
  'x-api-key'?: string;
  token?: string;
  ak?: string;
  sk?: string;
  region?: string;
  host?: string;
  'content-type'?: string;
  [key: string]: string | undefined;  // 添加索引签名允许使用字符串作为索引
}

export const getSignature = (ak: string, sk: string, method: string, path: string, query: any, headers: any) => {
  const auth = new Auth(ak, sk);
  const timestamp = Math.floor(Date.now() / 1000);
  const expirationPeriondInSeconds = 1800;
  return auth.generateAuthorization(
    method,
    path,
    query,
    headers,
    timestamp,
    expirationPeriondInSeconds
  );
};

// 提取请求头中的ak、sk、region
export function extractCredentials(headers: RequestHeaders) {
  // console.log('原始请求头:', JSON.stringify(headers));
  
  // 确保所有头部名称的大小写一致性
  const normalizedHeaders: Record<string, any> = {};
  for (const key in headers) {
    if (Object.prototype.hasOwnProperty.call(headers, key)) {
      normalizedHeaders[key.toLowerCase()] = headers[key];
    }
  }
  
  let ak = normalizedHeaders.ak;
  let sk = normalizedHeaders.sk;
  let region = normalizedHeaders.region || 'bj'; // 设置默认region

  // 处理Authorization头部
  if (normalizedHeaders.authorization) {
    try {
      // console.log('处理Authorization头部:', normalizedHeaders.authorization);
      const authValue = normalizedHeaders.authorization.replace("Bearer ", "");
      const parts = authValue.split("|");
      if (parts.length >= 2) {
        ak = ak || parts[0];
        sk = sk || parts[1];
        if (parts.length > 2) {
          region = region || parts[2];
        }
      } else {
        console.warn('Authorization格式不正确，无法解析ak/sk');
      }
    } catch (error) {
      console.error("解析Authorization失败:", error);
    }
  }

  // 处理token头部
  if (normalizedHeaders.token) {
    try {
      console.log('处理token头部:', normalizedHeaders.token);
      const tokenValue = normalizedHeaders.token.replace("Bearer ", "");
      const parts = tokenValue.split("|");
      if (parts.length >= 2) {
        ak = ak || parts[0];
        sk = sk || parts[1];
        if (parts.length > 2) {
          region = region || parts[2];
        }
      } else {
        console.warn('token格式不正确，无法解析ak/sk');
      }
    } catch (error) {
      console.error("解析Token失败:", error);
    }
  }

  // 处理x-api-key头部
  if (normalizedHeaders['x-api-key']) {
    try {
      console.log('处理x-api-key头部:', normalizedHeaders['x-api-key']);
      const apiKeyValue = normalizedHeaders['x-api-key'];
      const parts = apiKeyValue.split("|");
      if (parts.length >= 2) {
        ak = ak || parts[0];
        sk = sk || parts[1];
        if (parts.length > 2) {
          region = region || parts[2];
        }
      } else {
        console.warn('x-api-key格式不正确，无法解析ak/sk');
      }
    } catch (error) {
      console.error("解析x-api-key失败:", error);
    }
  }

  // 验证凭证
  if (!ak || !sk) {
    console.error('缺少凭证，可用头部:', Object.keys(normalizedHeaders));
    throw new Error('缺少必要凭证(ak, sk)，请确保提供了正确的认证信息');
  }

  const credentials = { ak, sk, region };
  console.log('提取的凭证:', { ak: ak?.substring(0, 4) + '****', sk: '****', region });
  return credentials;
}

// 字符串转换为小驼峰
export function toCamelCase(str: string) {
  return str.replace(/-([a-z])/g, (_, char) => char.toUpperCase());
}
