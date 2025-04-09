import { Request, Response, Router } from 'express';
import { RequestHeaders, getSignature, extractCredentials } from '../utils/common';
const rp = require("request-promise");
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

const Login = async (req: Request, res: Response) => {
  const { body } = req;
  const { ak, sk, region } = body;

  // 检查配置文件是否存在，不存在则创建
  if (!fs.existsSync('user.json')) {
    fs.writeFileSync('user.json', JSON.stringify([], null, 2));
  }
  // 读取配置文件
  const user = fs.readFileSync('user.json', 'utf8');
  const userData = JSON.parse(user);

  // 检查是否存在相同的ak，如果有则更新，否则添加
  const index = userData.findIndex((item: any) => item.ak === ak);
  if (index !== -1) {
    userData.splice(index, 1);
  }

  // 保存到本地JSON文件
  userData.push({
    ak,
    sk,
    region
  });
  fs.writeFileSync('user.json', JSON.stringify(userData, null, 2));

  const responseData = {
    requestId: uuidv4(),
    message: '登录成功',
    token: `${ak}|${sk}|${region}`
  }

  res.json(responseData);
}

const DescribeUser = async (req: Request, res: Response) => {
  const { ak } = extractCredentials(req.headers as RequestHeaders);

  const user = fs.readFileSync('user.json', 'utf8');
  const userData = JSON.parse(user);

  const userConfig = userData.find((item: any) => item.ak === ak);
  if (!userConfig) {
    return res.status(400).json({
      requestId: uuidv4(),
      message: '用户不存在'
    });
  }

  const responseData = {
    requestId: uuidv4(),
    ...userConfig
  }

  res.json(responseData);
}

export default router; 

export { 
  Login,
  DescribeUser,
};