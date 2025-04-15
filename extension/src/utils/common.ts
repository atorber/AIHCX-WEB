import { Auth } from "@baiducloud/sdk";
import yaml from 'js-yaml';

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

// 格式化请求参数
export function formatRequestParams(params: any): any {
  if (!params || typeof params !== 'object') {
    return {};
  }

  const jobSpec = {
    "image": "registry.baidubce.com/aihc-aiak/aiak-megatron:ubuntu20.04-cu11.8-torch1.14.0-py38_v1.2.7.12_release",
    "imageConfig": {
      "username": "",
      "password": ""
    },
    "replicas": 1,
    "resources": [
      {
        "name": "baidu.com/a800_80g_cgpu",
        "quantity": 8
      }
    ],
    "command": "#! /bin/bash",
    "envs": [
      {
        "name": "CUDA_DEVICE_MAX_CONNECTIONS",
        "value": "1"
      }
    ],
    "enableRDMA": true,
    "hostNetwork": false
  }

  const labels = [
    {
      "key": "123",
      "value": "222"
    }
  ]

  const datasources = [
    {
      "type": "pfs",
      "name": "pfs-7xWeAt",
      "sourcePath": "/",
      "mountPath": "/mnt/cluster"
    }
  ]

  const faultToleranceConfig = {
    "enabledHangDetection": false,
    "hangDetectionTimeoutMinutes": 5
  }

  const tensorboardConfig = {
    "enableTensorboard": false,
    "logPath": "/"
  }

  const requestParams = {
    "name": "test-api-llama2-7b-4",
    "queue": "default",
    "jobFramework": "PyTorchJob",
    "jobSpec": jobSpec,
    "faultTolerance": false,
    "labels": labels,
    "priority": "normal",
    "datasources": datasources,
    "enableBccl": false,
    "faultToleranceConfig": faultToleranceConfig,
    "tensorboardConfig": tensorboardConfig
  }

  console.log('requestParams', requestParams)

  // 处理基本字段
  requestParams.name = params.name;
  requestParams.queue = params.queue || 'default';
  requestParams.jobFramework = params.jobFramework === 'pytorch' ? 'PyTorchJob' : 'Unknown';
  requestParams.priority = params.priority || 'normal';
  requestParams.faultTolerance = params.faultTolerance || false;
  requestParams.enableBccl = params.enableBccl || false;

  // 处理 jobSpec
  if (params.jobSpec) {
    const resources: { name: string; quantity: number }[] = JSON.parse(JSON.stringify(params.jobSpec.Master.resource))
    const rdmaKey = 'rdma/hca' as keyof typeof resources
    if (resources[rdmaKey]) {
      delete resources[rdmaKey]
    }
    const envs = params.jobSpec.Master?.env ? Object.entries(params.jobSpec.Master.env).filter(([name, value]) => !['AIHC_JOB_NAME', 'AIHC_TENSORBOARD_LOG_PATH', 'MASTER', 'NCCL_DEBUG', 'NCCL_IB_DISABLE'].includes(name)).map(([name, value]) => ({
      name,
      value: String(value)
    })) : []
    const jobSpec: any = {
      image: `${params.jobSpec.Master.image}:${params.jobSpec.Master.tag}`,
      replicas: params.jobSpec.Worker ? (params.jobSpec.Worker.replicas + params.jobSpec.Master.replicas) : params.jobSpec.Master.replicas,
      resources: Object.entries(resources).map(([key, value]) => ({
        name: key,
        quantity: value
      })),
      command: params.command || '',
      envs: envs,
      enableRDMA: params.jobSpec.Master.resource['rdma/hca'] ? true : false,
      hostNetwork: params.hostNetwork || false
    };
    if (params.imagePullSecretUsername) {
      jobSpec.imageConfig = {
        username: params.imagePullSecretUsername,
        password: params.imagePullSecretPassword
      }
    }
    requestParams.jobSpec = jobSpec
  }

  // 处理 labels
  if (params.labels) {
    const labels = Object.entries(params.labels).filter(([key, value]) => key !== 'aijob.cce.baidubce.com/create-from-aihcp').map(([key, value]) => ({
      key,
      value: String(value)
    }));
    requestParams.labels = labels
  }

  // 处理 datasources
  if (params.datasource) {
    const datasources = params.datasource.filter((ds: any) => ds.type !== 'emptydir').map((ds: any) => ({
      type: ds.type,
      name: ds.name,
      sourcePath: ds.sourcePath || '/',
      mountPath: ds.mountPath || '/mnt/cluster'
    }));
    requestParams.datasources = datasources
  }

  if (params.enabledHangDetection) {
    // 处理 faultToleranceConfig
    requestParams.faultToleranceConfig = {
      enabledHangDetection: params.enabledHangDetection || false,
      hangDetectionTimeoutMinutes: params.hangDetectionTimeoutMinutes || 5
    };
  }

  // 处理 tensorboardConfig
  requestParams.tensorboardConfig = {
    enableTensorboard: params.tensorboard?.enable || false,
    logPath: params.tensorboard?.logPath || '/'
  };

  return requestParams;
}

// 将json对象转换为yaml
export const generateYAML = (data: any) => {
  return yaml.dump(data, {
    indent: 2,
    lineWidth: -1,
    noRefs: true,
    noCompatMode: true,
  });
}

// 获取GPU类型的简称
const getGpuTypeShortName = (gpuType: string) => {
  const gpuMapping: Record<string, string> = {
    'nvidia-v100': 'v100',
    'nvidia-a100': 'a100',
    'nvidia-a800': 'a800',
    'nvidia-a10': 'a10',
    'nvidia-a30': 'a30',
    'nvidia-a40': 'a40',
    'nvidia-h800': 'h800',
    'nvidia-h100': 'h100',
    'nvidia-l4': 'l4',
    'kunlunxin-p800': 'klx-p800',
    'kunlunxin-p100': 'klx-p100',
    'kunlunxin-p920': 'klx-p920',
    'iluvatar-bi': 'bi',
    'iluvatar-pigeon': 'pigeon'
  };

  const lowerType = gpuType.toLowerCase();

  for (const [key, shortName] of Object.entries(gpuMapping)) {
    if (lowerType.includes(key)) {
      return shortName;
    }
  }

  return lowerType;
}

export const generateCLICommand = (taskInfo: any) => {
  // 生成CLI命令
  let cliCommand = `aihc job create --name ${taskInfo.name} \\
    --framework ${taskInfo.jobFramework} \\
    --image ${taskInfo.jobSpec.image} \\\n`;

  // 添加队列参数（如果有）
  if (taskInfo.queue && taskInfo.queue !== 'default') {
    cliCommand += `    --pool ${taskInfo.queue} \\\n`;
  }

  // 添加RDMA参数
  cliCommand += `    --enable-rdma=${taskInfo.jobSpec.enableRDMA || false} \\\n`;

  // 添加GPU资源（如果有）
  if (taskInfo.jobSpec.resources) {
    taskInfo.jobSpec.resources.forEach((item: { name: string, quantity: number }) => {
      cliCommand += `    --gpu ${item.name}=${item.quantity} \\\n`;
    });
  }

  // 添加BCCL参数
  cliCommand += `    --enable-bccl=${taskInfo.enableBccl || false} \\\n`;

  // 添加容错参数
  if (taskInfo.faultTolerance) {
    cliCommand += `    --enable-fault-tolerance=${taskInfo.faultTolerance} \\\n`;

    // 添加容错详细参数
    const ftArgs = [
      `--enable-hang-detection=${taskInfo.faultToleranceConfig.enabledHangDetection || false}`,

    ];

    if (taskInfo.faultToleranceConfig.enabledHangDetection) {
      ftArgs.push(`--hang-detection-log-timeout-minutes=${taskInfo.faultToleranceConfig.hangDetectionTimeoutMinutes || 5}`);
    }

    cliCommand += `    --fault-tolerance-args="${ftArgs.join(' ')}" \\\n`;
  } else {
    cliCommand += `    --enable-fault-tolerance=false \\\n`;
  }

  // 添加主机网络参数
  if (taskInfo.jobSpec.hostNetwork) {
    cliCommand += `    --host-network \\\n`;
  }

  // 添加优先级
  cliCommand += `    --priority ${taskInfo.priority || 'normal'} \\\n`;

  // 添加副本数
  cliCommand += `    --replicas ${taskInfo.jobSpec.replicas || 1} \\\n`;

  // 添加环境变量
  if (taskInfo.jobSpec.envs && Array.isArray(taskInfo.jobSpec.envs)) {
    taskInfo.jobSpec.envs.forEach((env: any) => {
      if (env.name && env.value !== undefined && env.value !== null) {
        cliCommand += `    --env "${env.name}=${env.value}" \\\n`;
      }
    });
  }

  // 添加数据源
  if (taskInfo.datasources && Array.isArray(taskInfo.datasources)) {
    taskInfo.datasources.forEach((ds: any) => {
      if (ds && ds.mountPath) {
        // 处理数据源类型
        let dsType = ds.type;
        if (dsType === 'pfsl1') {
          dsType = 'pfs';
        }

        cliCommand += `    --ds-type ${dsType} \\\n`;
        cliCommand += `    --ds-mountpath ${ds.mountPath} \\\n`;

        if (ds.name) {
          cliCommand += `    --ds-name ${ds.name} \\\n`;
        }
      }
    });
  }

  // 添加Tensorboard配置
  // if (taskInfo.tensorboardConfig && taskInfo.tensorboardConfig.enableTensorboard) {
  //   cliCommand += `    --tensorboard-dir ${taskInfo.tensorboardConfig.logPath} \\\n`;
  // }

  // 添加执行命令
  if (taskInfo.jobSpec.command) {
    if (taskInfo.jobSpec.command.length < 100) {
      cliCommand += `    --command "$(printf "${taskInfo.jobSpec.command}")"`;
    } else {
      cliCommand += `    --script-file command.txt(启动命令过长，请保存为文件，并使用--script-file指定文件路径)`;
    }
  }

  return cliCommand;
}

/*
  const jobSpec = {
    "image": "registry.baidubce.com/aihc-aiak/aiak-megatron:ubuntu20.04-cu11.8-torch1.14.0-py38_v1.2.7.12_release",
    "imageConfig": {
      "username": "",
      "password": ""
    },
    "replicas": 1,
    "resources": [
      {
        "name": "baidu.com/a800_80g_cgpu",
        "quantity": 8
      }
    ],
    "command": "#! /bin/bash",
    "envs": [
      {
        "name": "CUDA_DEVICE_MAX_CONNECTIONS",
        "value": "1"
      }
    ],
    "enableRDMA": true,
    "hostNetwork": false
  }

  const labels = [
    {
      "key": "123",
      "value": "222"
    }
  ]

  const datasources = [
    {
      "type": "pfs",
      "name": "pfs-7xWeAt",
      "sourcePath": "/",
      "mountPath": "/mnt/cluster"
    }
  ]

  const faultToleranceConfig = {
    "enabledHangDetection": false,
    "hangDetectionTimeoutMinutes": 5
  }

  const tensorboardConfig = {
    "enableTensorboard": false,
    "logPath": "/"
  }

  const requestParams = {
    "name": "test-api-llama2-7b-4",
    "queue": "default",
    "jobFramework": "PyTorchJob",
    "jobSpec": jobSpec,
    "faultTolerance": false,
    "labels": labels,
    "priority": "normal",
    "datasources": datasources,
    "enableBccl": false,
    "faultToleranceConfig": faultToleranceConfig,
    "tensorboardConfig": tensorboardConfig
  }

  console.log('requestParams', requestParams)
*/