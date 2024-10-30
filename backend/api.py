# api.py
# flake8: noqa

import uvicorn
from fastapi import FastAPI, HTTPException, APIRouter
from fastapi.staticfiles import StaticFiles
from fastapi.responses import RedirectResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any

import logging
from logging.handlers import RotatingFileHandler
import uuid
from concurrent.futures import ThreadPoolExecutor
from threading import Lock
import json
import os

logging.basicConfig(level=logging.INFO)

# 配置日志
logger = logging.getLogger("api")
logger.setLevel(logging.INFO)

# 创建格式化器
formatter = logging.Formatter(
    '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

# 创建控制台处理器并设置级别和格式
console_handler = logging.StreamHandler()
console_handler.setLevel(logging.INFO)
console_handler.setFormatter(formatter)

# 创建文件处理器（轮转日志）并设置级别和格式
# file_handler = RotatingFileHandler(
#     "api.log", maxBytes=10*1024*1024, backupCount=5, encoding='utf-8'
# )
file_handler = logging.FileHandler("api.log")
file_handler.setLevel(logging.INFO)
file_handler.setFormatter(formatter)

# 将处理器添加到日志记录器
logger.addHandler(console_handler)
logger.addHandler(file_handler)

app = FastAPI(
    title="Strategy Generation API",
    description="通过RESTful API调用main.py生成策略并估计吞吐量",
    version="1.0.0"
)

# 添加CORSMiddleware
origins = [
    "*",
    "http://localhost",
    "http://127.0.0.1",
    "http://127.0.0.1:8000",
    "http://localhost:8000",
    "http://localhost:3000",
    "http://localhost:8080",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 定义 RunParameters 模型


class RunParameters(BaseModel):
    modelName: Optional[str] = Field(
        None,
        alias="model_name",
        description="模型名称，选择范围同main.py中的--model-name参数"
    )
    numGpus: Optional[int] = Field(
        None,
        alias="num_gpus",
        description="GPU数量，对应main.py中的--num-gpus参数"
    )
    nprocPerNode: Optional[int] = Field(
        None,
        alias="nproc_per_node",
        description="每个节点的进程数量，对应main.py中的--nproc-per-node参数"
    )
    gpuInfos: Optional[str] = Field(
        None,
        alias="gpu_infos",
        description="GPU信息，例如 'a800:256,h800:256'，对应main.py中的--gpu-infos参数"
    )
    globalBatchSize: Optional[int] = Field(
        None,
        alias="global_batch_size",
        description="全局批量大小，对应main.py中的--global-batch-size参数"
    )
    sequenceLength: Optional[int] = Field(
        None,
        alias="sequence_length",
        description="序列长度，对应main.py中的--sequence-length参数"
    )
    top: Optional[int] = Field(
        None,
        description="吞吐量前k的策略数量，对应main.py中的--top参数"
    )
    cpuGflops: Optional[int] = Field(
        None,
        alias="cpu_gflops",
        description="CPU FLOPS，单位GFLOPS，对应main.py中的--cpu-gflops参数"
    )
    memBandwidth: Optional[int] = Field(
        None,
        alias="mem_bandwidth",
        description="内存带宽，单位GB/S，对应main.py中的--mem-bandwidth参数"
    )
    idcs: Optional[str] = Field(
        None,
        description="支持多个IDC，例如 'idc1,idc2,idc3'，对应main.py中的--idcs参数"
    )
    interIdcBandwidth: Optional[str] = Field(
        None,
        alias="inter_idc_bandwidth",
        description="IDC间带宽，例如 '100,100,80'，对应main.py中的--inter-idc-bandwidth参数"
    )
    mode: Optional[str] = Field(
        None,
        description="模式，'fast' 或 'analytic'，对应main.py中的--mode参数"
    )
    strategyFile: Optional[str] = Field(
        None,
        alias="strategy_file",
        description="策略文件路径，对应main.py中的--strategy-file参数"
    )
    numExperts: Optional[int] = Field(
        None,
        alias="num_experts",
        description="MoE专家数量，对应main.py中的--num-experts参数"
    )
    moeRouterTopk: Optional[int] = Field(
        None,
        alias="moe_router_topk",
        description="每个token路由的专家数量，对应main.py中的--moe-router-topk参数"
    )

    class Config:
        populate_by_name = True  # Pydantic V2 配置项，用于允许通过字段名称或别名填充字段


# 任务存储和锁
tasks: Dict[str, Dict[str, Any]] = {}
tasks_lock = Lock()

# 线程池执行器
executor = ThreadPoolExecutor(max_workers=4)

# 创建 API 路由器
api_router = APIRouter(prefix="/api", tags=["API"])


def generate_strategies_task(task_id: str, params: RunParameters):
    logger.info(f"任务 {task_id} 开始执行")
    """
    后台任务函数，用于生成策略并更新任务状态。
    """
    try:
        # 将 RunParameters 转换为 Args 对象
        class Args:
            pass

        args = Args()
        args.model_name = params.modelName if params.modelName is not None else "llama2-70b"
        args.num_gpus = params.numGpus if params.numGpus is not None else 256
        args.nproc_per_node = params.nprocPerNode if params.nprocPerNode is not None else 8
        args.gpu_infos = params.gpuInfos if params.gpuInfos is not None else "a800"
        args.global_batch_size = params.globalBatchSize if params.globalBatchSize is not None else 1024
        args.sequence_length = params.sequenceLength if params.sequenceLength is not None else 4096
        args.top = params.top if params.top is not None else 5
        args.cpu_gflops = params.cpuGflops if params.cpuGflops is not None else 3072
        args.mem_bandwidth = params.memBandwidth if params.memBandwidth is not None else 300
        args.idcs = params.idcs if params.idcs is not None else ""
        args.inter_idc_bandwidth = params.interIdcBandwidth if params.interIdcBandwidth is not None else ""
        args.mode = params.mode if params.mode is not None else "fast"
        args.strategy_file = params.strategyFile if params.strategyFile is not None else ""
        args.num_experts = params.numExperts if params.numExperts is not None else 0
        args.moe_router_topk = params.moeRouterTopk if params.moeRouterTopk is not None else 2

        # 调用 main.py 生成策略
        # 这里需要实现实际的调用逻辑，例如使用 subprocess 运行脚本
        # 示例：
        # import subprocess
        # command = f"python main.py --model-name {args.model_name} --num-gpus {args.num_gpus} ..."
        # subprocess.run(command, shell=True, check=True)

        # 模拟任务执行
        import time
        time.sleep(5)  # 模拟长时间运行的任务

        # 假设任务成功，更新任务状态
        with tasks_lock:
            tasks[task_id]['status'] = 'completed'
            tasks[task_id]['result'] = {"message": "策略生成成功"}

    except Exception as e:
        logger.error(f"发生未知错误: {e}")
        with tasks_lock:
            tasks[task_id]['status'] = 'failed'
            tasks[task_id]['error'] = str(e)


@api_router.post("/run", summary="生成策略并估计吞吐量")
def run_main(params: RunParameters):
    print(params)
    logger.info(f"接收到请求: {params}")
    """
    接收策略生成参数，启动后台任务生成策略，并返回任务ID。
    """
    # 生成唯一任务ID
    task_id = str(uuid.uuid4())

    # 初始化任务状态
    with tasks_lock:
        tasks[task_id] = {
            "status": "pending",
            "result": None,
            "error": None
        }

    # 启动后台任务
    with tasks_lock:
        tasks[task_id]['status'] = 'running'

    executor.submit(generate_strategies_task, task_id, params)

    return {"task_id": task_id}


@api_router.get("/status", summary="查询任务列表")
def get_status_list():
    """
    查询所有任务的状态和结果。
    """
    with tasks_lock:
        res = {
            task_id: {
                "status": task['status'],
                "result": task['result'],
                "error": task['error']
            }
            for task_id, task in tasks.items()
        }

    logger.info(f"请求返回结果: {json.dumps(res)}")

    return res


@api_router.get("/status/{task_id}", summary="查询任务状态")
def get_status(task_id: str):
    """
    查询指定任务ID的状态和结果。
    """
    with tasks_lock:
        task = tasks.get(task_id)

    if not task:
        raise HTTPException(status_code=404, detail="任务ID不存在")

    res = {
        "task_id": task_id,
        "status": task['status'],
        "result": task['result'],
        "error": task['error'],
        "message": "ok"
    }

    logger.info(f"任务 {task_id} 状态: {task['status']}")
    logger.info(f"请求返回结果: {json.dumps(res)}")

    return res


@api_router.get("/scripts", summary="获取任务脚本列表")
def get_scripts():
    """
    获取任务脚本列表。
    """
    return {
        "list": [
            {
                "name": "llama2-70b",
                "description": "Llama2-70b模型"
            }
        ],
        "message": "ok"
    }


@api_router.get("/scripts/{script_name}", summary="获取任务脚本")
def get_script(script_name: str):
    return {
        "name": script_name,
        "description": "Llama2-70b模型",
        "content": "python main.py --model-name llama2-70b --num-gpus 256 --nproc-per-node 8 --gpu-infos a800 --global-batch-size 1024 --sequence-length 4096 --top 5 --cpu-gflops 3072 --mem-bandwidth 300 --idcs '' --inter-idc-bandwidth '' --mode fast --strategy-file '' --num-experts 0 --moe-router-topk 2",
        "message": "ok"
    }


@api_router.post("/scripts", summary="保存任务脚本为文件")
def save_script(script_name: str, content: str):
    os.makedirs("scripts", exist_ok=True)
    with open(f"scripts/{script_name}.sh", "w") as f:
        f.write(content)
    return {"message": "ok", "file": f"scripts/{script_name}.sh"}


@api_router.get("/files", summary="获取指定路径下的目录和文件")
def get_files(path: str):
    print(path)
    """
    获取指定路径下的目录和文件。
    """
    if not os.path.exists(path):
        raise HTTPException(status_code=404, detail="路径不存在")

    if os.path.isdir(path):
        items = os.listdir(path)
        return {
            "data": {
                "list": [{"name": item, "type": "dir" if os.path.isdir(f"{path}/{item}") else "file"} for item in items],
                "message": "ok"
            }
        }
    else:
        return {"name": path, "type": "file"}


@app.get("/", summary="API 主页")
def read_root():
    return RedirectResponse(url="/index.html")


# 将 API 路由器包含到主应用中
app.include_router(api_router)
# 挂载静态文件目录
app.mount("/", StaticFiles(directory="dist", html=True), name="static")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
