const Auth = require("@baiducloud/sdk").Auth;
const rp = require("request-promise");

const AIHC_APIS = {
  getResourcepools: "/api/v1/resourcepools",
  getJobs: "/api/v1/aijobs",
  createJob: "/api/v1/aijobs",
};

const getSignature = (ak, sk, method, path, query, headers) => {
  const auth = new Auth(ak, sk);
  // 设置有效时间
  let timestamp = parseInt(new Date().getTime() / 1000);
  let expirationPeriondInSeconds = 1800;
  let signature = auth.generateAuthorization(
    method,
    path,
    query,
    headers,
    timestamp,
    expirationPeriondInSeconds
  );
  return signature;
};

exports.handler = async (event, context, callback) => {
  // event格式如下：
  // {
  //   "resource": "请求的资源路径",
  //   "path": "HTTP触发器的路径",
  //   "httpMethod": "请求的HTTP方法",
  //   "headers": {请求头},
  //   "queryStringParameters": {query string 参数},
  //   "pathParameters":  {代理路径参数}，
  //   "requestContext": {请求上下文},
  //   "body": "请求体",
  //   "isBase64Encoded": "请求体是否为Base64编码，这里固定为false，暂不支持二进制格式"
  // }
  // console.debug("请求参数：", event);
  const queryStringParameters = event.queryStringParameters;
  const authorization = event.headers.Authorization;
  if (authorization) {
    const auth = authorization.replace("Bearer ", "").split("|");
    event.headers.Ak = auth[0];
    event.headers.Sk = auth[1];
    event.headers.Region = auth[2];
  }
  const ak = event.headers.Ak || queryStringParameters.ak;
  const sk = event.headers.Sk || queryStringParameters.sk;
  const host = `aihc.${event.headers.Region}.baidubce.com` || queryStringParameters.host;

  const path = event.path;
  const uri = `https://${host}${path}`;
  let method = event.httpMethod;
  const query = {};
  let body = {};
  let headers = {};

  // 处理预检请求（OPTIONS 请求）
  if (method === "OPTIONS") {
    console.debug("进入OPTIONS");
    const resp = JSON.stringify({
      isBase64Encoded: false,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers":
          "Content-Type, Authorization, ak, sk, region, Authorization",
      },
      statusCode: 200,
      body: "",
    });
    callback(null, resp);
    return;
  }

  try {
    if (path === AIHC_APIS.getJobs && method === "GET") {
      console.debug("进入getJobs");
      const { resourcePoolId } = queryStringParameters;
      query.resourcePoolId = resourcePoolId;
      headers.Host = host;
      const signature = getSignature(ak, sk, method, path, query, headers);
      headers.Authorization = signature;
    } else if (path === AIHC_APIS.getResourcepools && method === "GET") {
      console.debug("进入getResourcepools");
      headers.Host = host;
      const signature = getSignature(ak, sk, method, path, query, headers);
      headers.Authorization = signature;
    } else if (path === AIHC_APIS.createJob && method === "POST") {
      console.debug("进入createJob");
      const { resourcePoolId } = queryStringParameters;
      query.resourcePoolId = resourcePoolId;
      method = "POST";
      body = JSON.parse(event.body);
      headers.Host = host;
      headers["Content-Type"] = "application/json";
      const signature = getSignature(ak, sk, method, path, query, headers);
      headers.Authorization = signature;
    } else {
      console.debug("未找到匹配的路径");
      callback(
        null,
        JSON.stringify({
          isBase64Encoded: false,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          },
          statusCode: 200,
          body: "未找到匹配的路径",
        })
      );
    }

    const opt = {
      method,
      uri,
      qs: query,
      body,
      headers,
      json: true,
    };
    console.debug("请求参数：", opt);
    const res = await rp(opt);
    const resp = JSON.stringify({
      isBase64Encoded: false,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      },
      statusCode: 200,
      body: JSON.stringify(res),
    });
    console.debug("返回的结果：", resp);
    callback(null, resp);
  } catch (err) {
    console.error("报错信息：", err);
    const resp = JSON.stringify({
      isBase64Encoded: false,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      },
      statusCode: 200,
      body: JSON.stringify(err),
    });
    callback(null, resp);
  }
};
