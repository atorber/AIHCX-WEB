from mcp.server.fastmcp import FastMCP
from baidubce.services.aihc.aihc_client import AIHCClient
import json
import yaml
from baidubce.bce_client_configuration import BceClientConfiguration
from baidubce.auth.bce_credentials import BceCredentials
import os

HOST = 'https://aihc.bj.baidubce.com'
AK = os.environ.get('AK')
SK = os.environ.get('SK')
resourcePoolId = os.environ.get('resourcePoolId')

aihc_config = BceClientConfiguration(credentials=BceCredentials(AK, SK), endpoint=HOST)

# 初始化 FastMCP 服务器
mcp = FastMCP("baige-ai-train-job")

# 从文件读取训练任务参数
def read_job_params(job_params_file_path: str):
    """读取训练任务参数"""
    # 判断是yaml文件还是json文件
    if job_params_file_path.endswith('.yaml'):
        with open(job_params_file_path, 'r') as f:
            return yaml.load(f, Loader=yaml.SafeLoader)
    elif job_params_file_path.endswith('.json'):
        with open(job_params_file_path, 'r') as f:
            return json.load(f)
    else:
        raise ValueError("文件类型错误，必须是yaml或json文件")

async def create_job_request(job_params_file_path: str):
    """创建百舸训练任务。
    
    参数:
        job_params_file_path: 训练任务参数文件的绝对路径
    """
    aihc_client = AIHCClient(aihc_config)
    client_token = "client_token"

    payload = read_job_params(job_params_file_path)

    try:
        create_response = aihc_client.create_aijob(
            client_token=client_token,
            resourcePoolId=resourcePoolId,
            payload=payload
        )
        # print(create_response)
        return create_response
    except Exception as e:
        # print(e)
        return e
    
async def get_job_list_request(pageNo: int = 1, pageSize: int = 100):
    """获取百舸训练任务列表"""
    aihc_client = AIHCClient(aihc_config)
    try:
        ai_jobs = aihc_client.get_all_aijobs(resourcePoolId=resourcePoolId, pageNo=pageNo, pageSize=pageSize)
        # print(ai_jobs)
        return ai_jobs
    except Exception as e:
        # print(e)
        return e
    
async def get_job_detail_request(jobId: str):
    """根据jobId获取百舸训练任务详情"""
    aihc_client = AIHCClient(aihc_config)
    try:
        job_detail = aihc_client.get_aijob(resourcePoolId=resourcePoolId, aijobId=jobId)
        return job_detail
    except Exception as e:
        # print(e)
        return e
    
def format_job_list(result: object) -> str:
    """格式化百舸训练任务列表"""
    format_text = f"""
pageNo:{result.pageNo}
pageSize:{result.pageSize}
orderBy:{result.orderBy}
order:{result.order}
total:{result.total}
list:{len(result.jobs)}
"""
    
    for job in result.jobs:
        format_text += f"""
name：{job.name}
jobId：{job.jobId}
status：{job.status}
createdAt：{job.createdAt}
"""
    return format_text

@mcp.tool()
async def get_job_list(pageNo: int = 1, pageSize: int = 100) -> str:
    """获取百舸训练任务列表。
    
    参数:
        pageNo: 页码
        pageSize: 每页数量
    """
    response = await get_job_list_request(pageNo, pageSize)

    if not response or not response.result:
        return "无法获取百舸训练任务列表。"
    else:
        if len(response.result.jobs) == 0:
            return "当前资源池没有百舸训练任务。"
        else:
            alerts = format_job_list(response.result)
            return alerts
        
@mcp.tool()
async def get_job_detail(jobId: str) -> str:
    """根据jobId获取百舸训练任务详情。
    
    参数:
        jobId: 百舸训练任务ID
    """
    response = await get_job_detail_request(jobId)

    if not response:
        return "无法获取百舸训练任务详情。"
    else:
        if response.result:
            result = response.result
            result_text = yaml.dump(result)
            return result_text
        else:
            return "无法获取百舸训练任务详情。"

@mcp.tool()
async def create_job(job_params_file_path: str) -> str:
    """创建百舸训练任务。

    参数:
        job_params_file_path: 训练任务参数文件的绝对路径
    """
    response = await create_job_request(job_params_file_path)

    if isinstance(response, Exception):
        return f"创建百舸训练任务失败。错误信息：{str(response)}"
    
    if not response:
        return "创建百舸训练任务失败。"
    
    if hasattr(response, 'result') and response.result and hasattr(response.result, 'jobId'):
        return f"""
        创建百舸训练任务成功。
        requestId: {response.requestId}
        jobId: {response.result.jobId}
        jobName: {response.result.jobName}
        """
    else:
        return f"创建百舸训练任务失败。响应内容：{response}"

if __name__ == "__main__":
    # 初始化并运行服务器
    # print('start mcp server')
    mcp.run(transport='stdio')