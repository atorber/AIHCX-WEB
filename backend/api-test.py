import requests
import json
import time
import logging
from logging.handlers import RotatingFileHandler

# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("api-test")

# 创建格式化器
formatter = logging.Formatter(
    '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

# 创建控制台处理器并设置级别和格式
console_handler = logging.StreamHandler()
console_handler.setLevel(logging.INFO)
console_handler.setFormatter(formatter)

# 创建文件处理器（轮转日志）并设置级别和格式
file_handler = RotatingFileHandler(
    "api-test.log", maxBytes=10*1024*1024, backupCount=5, encoding='utf-8'
)
file_handler.setLevel(logging.INFO)
file_handler.setFormatter(formatter)

# 将处理器添加到日志记录器
logger.addHandler(console_handler)
logger.addHandler(file_handler)


def submit_task():
    """
    向 /run 端点提交策略生成任务，并返回任务ID。
    """
    # API 端点 URL
    url = "http://localhost:8000/run"

    # 请求头，指定内容类型为 JSON
    headers = {
        "Content-Type": "application/json"
    }

    # 构建请求的 JSON 数据
    payload = {
        "model_name": "llama2-70b",
        "num_gpus": 256,
        "nproc_per_node": 8,
        "gpu_infos": "a800:256,h800:256",
        "global_batch_size": 1024,
        "sequence_length": 4096,
        "top": 5,
        "cpu_gflops": 3072,
        "mem_bandwidth": 300,
        "idcs": "idc1,idc2",
        "inter_idc_bandwidth": "100,100",
        "mode": "fast",
        "strategy_file": "",
        "num_experts": 0,
        "moe_router_topk": 2
    }

    try:
        # 发送 POST 请求到 /run 端点
        response = requests.post(
            url,
            headers=headers,
            data=json.dumps(payload),
            timeout=300
        )

        # 检查响应状态码
        response.raise_for_status()

        # 解析 JSON 响应
        data = response.json()

        # 获取任务ID
        task_id = data.get("task_id")
        if task_id:
            logger.info(f"任务已提交，任务ID: {task_id}")
            return task_id
        else:
            logger.error("未能获取任务ID。")
            return None

    except requests.exceptions.HTTPError as http_err:
        logger.error(f"HTTP 错误: {http_err}")
        logger.error(f"响应内容: {response.text}")
    except requests.exceptions.Timeout:
        logger.error("请求超时。请确保 API 服务正在运行并响应及时。")
    except requests.exceptions.RequestException as req_err:
        logger.error(f"请求错误: {req_err}")
    except json.JSONDecodeError:
        logger.error("无法解析响应为 JSON 格式。")
    except Exception as e:
        logger.error(f"发生未知错误: {e}")


def check_status(task_id):
    """
    查询指定任务ID的状态和结果。
    """
    # API 端点 URL
    url = f"http://localhost:8000/status/{task_id}"

    try:
        # 发送 GET 请求到 /status/{task_id} 端点
        response = requests.get(url, timeout=60)

        # 检查响应状态码
        response.raise_for_status()

        # 解析 JSON 响应
        data = response.json()

        status = data.get("status")
        result = data.get("result")
        error = data.get("error")

        logger.info(f"任务状态: {status}")
        if status == "completed":
            logger.info("生成策略结果:")
            logger.info(json.dumps(result, indent=2))
            logger.info("生成的策略列表:")
            for idx, strategy in enumerate(result, start=1):
                logger.info(f"策略 {idx}:")
                for key, value in strategy.items():
                    logger.info(f"  {key}: {value}")
        elif status == "failed":
            logger.error(f"任务失败，错误信息: {error}")

    except requests.exceptions.HTTPError as http_err:
        logger.error(f"HTTP 错误: {http_err}")
        logger.error(f"响应内容: {response.text}")
    except requests.exceptions.Timeout:
        logger.error("请求超时。请确保 API 服务正在运行并响应及时。")
    except requests.exceptions.RequestException as req_err:
        logger.error(f"请求错误: {req_err}")
    except json.JSONDecodeError:
        logger.error("无法解析响应为 JSON 格式。")
    except Exception as e:
        logger.error(f"发生未知错误: {e}")


def main():
    # 提交任务
    task_id = submit_task()
    if task_id:
        # 定期检查任务状态，直到任务完成或失败
        while True:
            check_status(task_id)
            # 查询任务状态
            status_response = requests.get(
                f"http://localhost:8000/status/{task_id}")
            if status_response.status_code == 200:
                status_data = status_response.json()
                status = status_data.get("status")
                if status in ["completed", "failed"]:
                    break
            else:
                logger.error(f"无法获取任务状态，状态码: {status_response.status_code}")
                break
            # 等待一段时间后再次检查
            time.sleep(10)


if __name__ == "__main__":
    main()
