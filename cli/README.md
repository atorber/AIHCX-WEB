# AIHCX CLI SDK

这是一个用于与百度智能云AIHC服务交互的CLI SDK。

## 安装

```bash
npm install
```

## 配置环境变量

在使用SDK之前，需要设置以下环境变量：

```bash
export BCE_REGION=your-region  # 例如：bj, gz, su等
export BCE_AK=your-access-key
export BCE_SK=your-secret-key
```

## 使用方法

```typescript
import { handleRequest } from './sdk';

const request = {
    method: 'POST',
    body: { /* 请求体 */ }
};

const response = {
    status: (code: number) => ({
        json: (data: any) => console.log(data)
    })
};

const query = {
    action: 'DescribeJobs'
    // 其他查询参数
};

await handleRequest(request, response, query, request.body);
```

## 支持的操作

### 资源池操作
- DescribeResourcePools
- DescribeResourcePool
- DescribeResourcePoolConfiguration
- DescribeResourcePoolOverview

### 队列操作
- DescribeQueues
- DeleteQueue

### 作业操作
- DescribeJobs
- CreateJob
- DeleteJob
- DescribeJob
- ModifyJob
- DescribeJobEvents
- DescribeJobLogs
- DescribePodEvents
- StopJob
- DescribeJobMetrics
- DescribeJobNodes
- DescribeJobWebterminal

## 构建

```bash
npm run build
```

## 开发

```bash
npm run dev
```