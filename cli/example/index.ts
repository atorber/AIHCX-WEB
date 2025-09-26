import AihcClient from '../sdk';
import { config as dotenvConfig } from 'dotenv';
import type { BceConfig } from '../sdk/types/common';

// 加载环境变量
dotenvConfig();

// 创建 AIHC 客户端配置
const config: BceConfig = {
  endpoint: 'https://aihc.bj.baidubce.com', // 传入所在区域域名
  credentials: {
    ak: process.env['AK'] || '', // 您的AccessKey
    sk: process.env['SK'] || ''  // 您的SecretAccessKey
  }
};

console.log(config);

// 创建 AIHC 客户端实例
const client = new AihcClient(config);

// 列出资源池
client
  .listResourcepools()
  .then((response) => {
    console.log(JSON.stringify(response.body));
  })
  .catch((err: Error) => {
    console.log('listResourcepools failed:', err);
  });

// 获取特定资源池详情（已注释）
// client
//   .getResourcepool('cce-e0isdmib')
//   .then((response) => {
//     console.log(JSON.stringify(response.body));
//   })
//   .catch((err: Error) => {
//     console.log('getResourcepool failed:', err);
//   });

// 列出 AI 作业（已注释）
// client
//   .listAIJobs('cce-e0isdmib')
//   .then((response) => {
//     console.log(JSON.stringify(response.body));
//   })
//   .catch((err: Error) => {
//     console.log('listAIJobs failed:', err);
//   });

// 获取特定 AI 作业详情（已注释）
// client
//   .listAIJob('cce-e0isdmib', 'yintao03-48hours-megatron')
//   .then((response) => {
//     console.log(JSON.stringify(response.body));
//   })
//   .catch((err: Error) => {
//     console.log('listAIJob failed:', err);
//   });

// 获取 AI 作业 Web 终端（已注释）
// client
//   .getAIJobWebterminal('cce-e0isdmib', 'aihc-helper-job-cpu-rs4c4', 'example-container')
//   .then((res: any) => {
//     console.log(res);
//   })
//   .catch((err: Error) => {
//     console.error(err);
//   });