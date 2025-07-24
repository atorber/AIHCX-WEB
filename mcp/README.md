# 百舸MCP服务

## 快速开始

- 创建任务

```
使用/Users/luyuchao/Documents/GitHub/AIHCX-WEB/mcp/jobinfo.yaml创建一个百舸训练任务
```

- 查询任务列表

```
查询百舸任务列表
```

- 查询任务状态

TBD

## 配置文件

- Mac/Linux

```
{
    "mcpServers": {
        "aihc-job": {
            "command": "/Users/luyuchao/miniconda3/envs/aihc_env/bin/python",
            "args": [
                "/Users/luyuchao/Documents/GitHub/AIHCX-WEB/mcp/job.py"
            ]
        }
    }
}
```

- Windows

```
{
    "mcpServers": {
        "weather": {
            "command": "C:\\ABSOLUTE\\PATH\\TO\\PARENT\\FOLDER\\python",
            "args": [
                "C:\\ABSOLUTE\\PATH\\TO\\PARENT\\FOLDER\\job.py"
            ]
        }
    }
}
```
