# api.py
# flake8: noqa
import os
import uuid
import json
import asyncio
import subprocess
from pathlib import Path
from typing import Optional, Dict, Any

import uvicorn
from fastapi import FastAPI, HTTPException, APIRouter, BackgroundTasks, UploadFile, File
from fastapi.staticfiles import StaticFiles
from fastapi.responses import RedirectResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import logging
from logging.handlers import RotatingFileHandler

# 配置日志
logger = logging.getLogger("api")
logger.setLevel(logging.INFO)

# 创建格式化器
formatter = logging.Formatter(
    '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

# 创建控制台处理器
console_handler = logging.StreamHandler()
console_handler.setLevel(logging.INFO)
console_handler.setFormatter(formatter)
logger.addHandler(console_handler)

# 创建轮转文件处理器
file_handler = RotatingFileHandler(
    "api.log", maxBytes=10 * 1024 * 1024, backupCount=5, encoding='utf-8'
)
file_handler.setLevel(logging.INFO)
file_handler.setFormatter(formatter)
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
        allow_population_by_field_name = True  # Pydantic V2 配置项，用于允许通过字段名称或别名填充字段

# 任务存储和锁
tasks: Dict[str, Dict[str, Any]] = {}
tasks_lock = asyncio.Lock()

# 创建 API 路由器
api_router = APIRouter(prefix="/api", tags=["API"])

def convert_params_to_args(params: RunParameters) -> Dict[str, Any]:
    return {
        "model_name": params.modelName or "llama2-70b",
        "num_gpus": params.numGpus or 256,
        "nproc_per_node": params.nprocPerNode or 8,
        "gpu_infos": params.gpuInfos or "a800",
        "global_batch_size": params.globalBatchSize or 1024,
        "sequence_length": params.sequenceLength or 4096,
        "top": params.top or 5,
        "cpu_gflops": params.cpuGflops or 3072,
        "mem_bandwidth": params.memBandwidth or 300,
        "idcs": params.idcs or "",
        "inter_idc_bandwidth": params.interIdcBandwidth or "",
        "mode": params.mode or "fast",
        "strategy_file": params.strategyFile or "",
        "num_experts": params.numExperts or 0,
        "moe_router_topk": params.moeRouterTopk or 2,
    }

async def generate_strategies_task(task_id: str, params: RunParameters):
    logger.info(f"任务 {task_id} 开始执行")
    async with tasks_lock:
        tasks[task_id]['status'] = 'running'
    try:
        args = convert_params_to_args(params)
        command = [
            "python", "main.py",
            "--model-name", args["model_name"],
            "--num-gpus", str(args["num_gpus"]),
            "--nproc-per-node", str(args["nproc_per_node"]),
            "--gpu-infos", args["gpu_infos"],
            "--global-batch-size", str(args["global_batch_size"]),
            "--sequence-length", str(args["sequence_length"]),
            "--top", str(args["top"]),
            "--cpu-gflops", str(args["cpu_gflops"]),
            "--mem-bandwidth", str(args["mem_bandwidth"]),
            "--idcs", args["idcs"],
            "--inter-idc-bandwidth", args["inter_idc_bandwidth"],
            "--mode", args["mode"],
            "--strategy-file", args["strategy_file"],
            "--num-experts", str(args["num_experts"]),
            "--moe-router-topk", str(args["moe_router_topk"]),
        ]

        logger.info(f"执行命令: {' '.join(command)}")
        process = await asyncio.create_subprocess_exec(
            *command,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE
        )

        stdout, stderr = await process.communicate()

        if process.returncode == 0:
            result = {"message": "策略生成成功", "stdout": stdout.decode()}
            async with tasks_lock:
                tasks[task_id]['status'] = 'completed'
                tasks[task_id]['result'] = result
            logger.info(f"任务 {task_id} 完成")
        else:
            error_msg = stderr.decode() or "策略生成失败"
            async with tasks_lock:
                tasks[task_id]['status'] = 'failed'
                tasks[task_id]['error'] = error_msg
            logger.error(f"任务 {task_id} 失败: {error_msg}")

    except Exception as e:
        logger.error(f"任务 {task_id} 发生未知错误: {e}")
        async with tasks_lock:
            tasks[task_id]['status'] = 'failed'
            tasks[task_id]['error'] = str(e)

@api_router.post("/run", summary="生成策略并估计吞吐量")
async def run_main(params: RunParameters, background_tasks: BackgroundTasks):
    logger.info(f"接收到请求: {params}")
    task_id = str(uuid.uuid4())
    async with tasks_lock:
        tasks[task_id] = {
            "status": "pending",
            "result": None,
            "error": None
        }
    background_tasks.add_task(generate_strategies_task, task_id, params)
    return {"task_id": task_id}

@api_router.get("/status", summary="查询任务列表")
async def get_status_list():
    async with tasks_lock:
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
async def get_status(task_id: str):
    async with tasks_lock:
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

@api_router.post("/scripts/run", summary="运行任务脚本")
async def run_script(script_file_path: str, background_tasks: BackgroundTasks):
    script_path = Path(script_file_path)
    if not script_path.is_file():
        raise HTTPException(status_code=404, detail="脚本文件不存在")

    if not os.access(script_file_path, os.X_OK):
        raise HTTPException(status_code=403, detail="脚本文件不可执行")

    task_id = str(uuid.uuid4())
    async with tasks_lock:
        tasks[task_id] = {
            "status": "pending",
            "result": None,
            "error": None
        }

    async def run_shell_script(task_id: str, script_path: Path):
        logger.info(f"任务 {task_id} 开始执行脚本: {script_path}")
        async with tasks_lock:
            tasks[task_id]['status'] = 'running'
        try:
            process = await asyncio.create_subprocess_exec(
                "bash", str(script_path),
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )
            stdout, stderr = await process.communicate()

            if process.returncode == 0:
                result = {"message": "脚本执行成功", "stdout": stdout.decode()}
                async with tasks_lock:
                    tasks[task_id]['status'] = 'completed'
                    tasks[task_id]['result'] = result
                logger.info(f"任务 {task_id} 脚本执行完成")
            else:
                error_msg = stderr.decode() or "脚本执行失败"
                async with tasks_lock:
                    tasks[task_id]['status'] = 'failed'
                    tasks[task_id]['error'] = error_msg
                logger.error(f"任务 {task_id} 脚本执行失败: {error_msg}")

        except Exception as e:
            logger.error(f"任务 {task_id} 执行脚本时发生错误: {e}")
            async with tasks_lock:
                tasks[task_id]['status'] = 'failed'
                tasks[task_id]['error'] = str(e)

    background_tasks.add_task(run_shell_script, task_id, script_path)
    return {"task_id": task_id}

@api_router.get("/scripts/run/{task_id}", summary="查询任务脚本状态")
async def get_script_status(task_id: str):
    async with tasks_lock:
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

# 查询全部任务脚本状态
@api_router.get("/scripts/run/list", summary="查询任务脚本列表")
async def get_script_list():
    async with tasks_lock:
        script_tasks = [
            {
                "task_id": task_id,
                "status": task['status'],
                "result": task['result'],
                "error": task['error']
            }
            for task_id, task in tasks.items()
        ]

    return {"list": script_tasks, "message": "ok"}

@api_router.get("/scripts", summary="获取任务脚本列表")
async def get_scripts():
    scripts_dir = Path("scripts")
    if not scripts_dir.exists():
        return {"list": [], "message": "ok"}

    scripts = [
        {
            "name": script.stem,
            "description": "用户自定义脚本"
        }
        for script in scripts_dir.glob("*.sh")
    ]

    return {"list": scripts, "message": "ok"}

@api_router.get("/scripts/{script_name}", summary="获取任务脚本")
async def get_script(script_name: str):
    script_path = Path("scripts") / f"{script_name}.sh"
    if not script_path.is_file():
        raise HTTPException(status_code=404, detail="脚本不存在")

    content = script_path.read_text()
    return {
        "name": script_name,
        "description": "用户自定义脚本",
        "content": content,
        "message": "ok"
    }

@api_router.post("/scripts", summary="保存任务脚本为文件")
async def save_script(script_name: str, content: str):
    script_path = Path("scripts") / f"{script_name}.sh"
    script_path.parent.mkdir(parents=True, exist_ok=True)
    script_path.write_text(content)
    os.chmod(script_path, 0o755)  # 确保脚本可执行
    return {"message": "ok", "file": str(script_path)}

@api_router.get("/files", summary="获取指定路径下的目录和文件")
async def get_files(path: str):
    normalized_path = os.path.abspath(path)
    base_dir = os.path.abspath("files")  # 限制访问在 'files' 目录下

    if not normalized_path.startswith(base_dir):
        raise HTTPException(status_code=403, detail="禁止访问该路径")

    target_path = Path(normalized_path)
    if not target_path.exists():
        raise HTTPException(status_code=404, detail="路径不存在")

    if target_path.is_dir():
        items = list(target_path.iterdir())
        return {
            "data": {
                "list": [
                    {"name": item.name, "type": "dir" if item.is_dir() else "file"}
                    for item in items
                ],
                "message": "ok"
            }
        }
    else:
        return {"name": target_path.name, "type": "file"}

@api_router.post("/files/download", summary="下载文件到指定路径")
async def download_file(path: str, content: str):
    normalized_path = os.path.abspath(path)
    base_dir = os.path.abspath("files")

    if not normalized_path.startswith(base_dir):
        raise HTTPException(status_code=403, detail="禁止访问该路径")

    target_path = Path(normalized_path)
    target_path.parent.mkdir(parents=True, exist_ok=True)
    target_path.write_text(content)
    return {"message": "ok", "file": str(target_path)}

@api_router.post("/files/upload", summary="上传文件到指定路径")
async def upload_file(path: str, file: UploadFile = File(...)):
    normalized_path = os.path.abspath(path)
    base_dir = os.path.abspath("files")

    if not normalized_path.startswith(base_dir):
        raise HTTPException(status_code=403, detail="禁止访问该路径")

    target_path = Path(normalized_path)
    target_path.parent.mkdir(parents=True, exist_ok=True)
    with target_path.open("wb") as f:
        content = await file.read()
        f.write(content)
    return {"message": "ok", "file": str(target_path)}

@api_router.post("/models/convert", summary="权重转换与切分")
async def convert_weights(background_tasks: BackgroundTasks):
    task_id = str(uuid.uuid4())
    async with tasks_lock:
        tasks[task_id] = {
            "status": "pending",
            "result": None,
            "error": None
        }

    async def convert_task(task_id: str):
        logger.info(f"任务 {task_id} 开始权重转换与切分")
        async with tasks_lock:
            tasks[task_id]['status'] = 'running'
        try:
            command = ["python", "main.py", "--convert-weights"]
            process = await asyncio.create_subprocess_exec(
                *command,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )
            stdout, stderr = await process.communicate()

            if process.returncode == 0:
                result = {"message": "权重转换与切分成功", "stdout": stdout.decode()}
                async with tasks_lock:
                    tasks[task_id]['status'] = 'completed'
                    tasks[task_id]['result'] = result
                logger.info(f"任务 {task_id} 权重转换与切分完成")
            else:
                error_msg = stderr.decode() or "权重转换与切分失败"
                async with tasks_lock:
                    tasks[task_id]['status'] = 'failed'
                    tasks[task_id]['error'] = error_msg
                logger.error(f"任务 {task_id} 权重转换与切分失败: {error_msg}")

        except Exception as e:
            logger.error(f"任务 {task_id} 权重转换与切分时发生错误: {e}")
            async with tasks_lock:
                tasks[task_id]['status'] = 'failed'
                tasks[task_id]['error'] = str(e)

    background_tasks.add_task(convert_task, task_id)
    return {"task_id": task_id}

@api_router.post("/datas/preprocess", summary="数据预处理")
async def preprocess_data(background_tasks: BackgroundTasks):
    task_id = str(uuid.uuid4())
    async with tasks_lock:
        tasks[task_id] = {
            "status": "pending",
            "result": None,
            "error": None
        }

    async def preprocess_task(task_id: str):
        logger.info(f"任务 {task_id} 开始数据预处理")
        async with tasks_lock:
            tasks[task_id]['status'] = 'running'
        try:
            command = ["python", "main.py", "--preprocess-data"]
            process = await asyncio.create_subprocess_exec(
                *command,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )
            stdout, stderr = await process.communicate()

            if process.returncode == 0:
                result = {"message": "数据预处理成功", "stdout": stdout.decode()}
                async with tasks_lock:
                    tasks[task_id]['status'] = 'completed'
                    tasks[task_id]['result'] = result
                logger.info(f"任务 {task_id} 数据预处理完成")
            else:
                error_msg = stderr.decode() or "数据预处理失败"
                async with tasks_lock:
                    tasks[task_id]['status'] = 'failed'
                    tasks[task_id]['error'] = error_msg
                logger.error(f"任务 {task_id} 数据预处理失败: {error_msg}")

        except Exception as e:
            logger.error(f"任务 {task_id} 数据预处理时发生错误: {e}")
            async with tasks_lock:
                tasks[task_id]['status'] = 'failed'
                tasks[task_id]['error'] = str(e)

    background_tasks.add_task(preprocess_task, task_id)
    return {"task_id": task_id}

@api_router.post("/files/export", summary="数据导出")
async def export_data(background_tasks: BackgroundTasks):
    task_id = str(uuid.uuid4())
    async with tasks_lock:
        tasks[task_id] = {
            "status": "pending",
            "result": None,
            "error": None
        }

    async def export_task(task_id: str):
        logger.info(f"任务 {task_id} 开始数据导出")
        async with tasks_lock:
            tasks[task_id]['status'] = 'running'
        try:
            command = ["python", "main.py", "--export-data"]
            process = await asyncio.create_subprocess_exec(
                *command,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )
            stdout, stderr = await process.communicate()

            if process.returncode == 0:
                result = {"message": "数据导出成功", "stdout": stdout.decode()}
                async with tasks_lock:
                    tasks[task_id]['status'] = 'completed'
                    tasks[task_id]['result'] = result
                logger.info(f"任务 {task_id} 数据导出完成")
            else:
                error_msg = stderr.decode() or "数据导出失败"
                async with tasks_lock:
                    tasks[task_id]['status'] = 'failed'
                    tasks[task_id]['error'] = error_msg
                logger.error(f"任务 {task_id} 数据导出失败: {error_msg}")

        except Exception as e:
            logger.error(f"任务 {task_id} 数据导出时发生错误: {e}")
            async with tasks_lock:
                tasks[task_id]['status'] = 'failed'
                tasks[task_id]['error'] = str(e)

    background_tasks.add_task(export_task, task_id)
    return {"task_id": task_id}

@api_router.post("/files/save", summary="保存训练参数")
async def save_training_params(params: Dict[str, Any]):
    training_params_path = Path("training_params.json")
    training_params_path.parent.mkdir(parents=True, exist_ok=True)
    training_params_path.write_text(json.dumps(params, indent=4))
    return {"message": "ok"}

@app.get("/", summary="API 主页")
async def read_root():
    return RedirectResponse(url="/index.html")

# 将 API 路由器包含到主应用中
app.include_router(api_router, prefix="/api")

# 挂载静态文件目录
app.mount("/", StaticFiles(directory="dist", html=True), name="static")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)