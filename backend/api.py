# api.py
# flake8: noqa

import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import RedirectResponse
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any

import logging
from logging.handlers import RotatingFileHandler
import uuid
from concurrent.futures import ThreadPoolExecutor
from threading import Lock
import json

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

# 挂载静态文件目录
app.mount("/dist", StaticFiles(directory="dist"), name="dist")

# 定义RunParameters模型


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
        

    except Exception as e:
        logger.error(f"发生未知错误: {e}")
        with tasks_lock:
            tasks[task_id]['status'] = 'failed'
            tasks[task_id]['error'] = str(e)


@app.post("/run", summary="生成策略并估计吞吐量")
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


@app.get("/status/{task_id}", summary="查询任务状态")
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
        "error": task['error']
    }

    logger.info(f"任务 {task_id} 状态: {task['status']}")
    logger.info(f"请求返回结果: {json.dumps(res)}")

    return res


@app.get("/", summary="API 主页")
def read_root():
    return RedirectResponse(url="/dist/index.html")


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
