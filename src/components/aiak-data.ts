import * as fs from 'fs';

// 定义 Shell 命令
export const job1_convert_checkpoint = `
echo "LOAD: \${LOAD}"
echo "SAVE: \${SAVE}"
echo "MODEL_BOS_PATH: \${MODEL_BOS_PATH}"
echo "MODEL_NAME: \${MODEL_NAME}"
echo "TP: \${TP}"
echo "PP: \${PP}"

# 如果SAVE文件夹已存在，则终止启动，打印提示信息
if [ -d "\${SAVE}" ]; then
    echo "The SAVE folder \${SAVE} already exists, you can use it directly. Or you can delete it and run this script again."
    exit 1
else
    echo "The SAVE folder \${SAVE} does not exist, start to convert checkpoint."
fi

# 检查LOAD路径是否存在，不存在则下载
if [ ! -d "\${LOAD}" ]; then
    # 下载bcecmd程序
    wget https://doc.bce.baidu.com/bce-documentation/BOS/linux-bcecmd-0.4.5.zip
    # 解压
    unzip linux-bcecmd-0.4.5.zip
    cd linux-bcecmd-0.4.5
    echo "Start to download checkpoint..."
    ./bcecmd  bos sync \${MODEL_BOS_PATH} \${LOAD}
    echo "Download checkpoint done."
else
    echo "The LOAD folder \${LOAD} already exists,no need to download."
fi

echo "Start to convert checkpoint..."

AIAK_TRAINING_PATH=/workspace/AIAK-Training-LLM
CONVERT_CHECKPOINT_PATH="\${AIAK_TRAINING_PATH}/tools/convert_checkpoint"
MEGATRON_PATH=\${MEGATRON_PATH:-"/workspace/AIAK-Megatron"}

# 当前不支持 optim 部分转换，通过 --no_save_optim 和 --no_load_optim 关闭；
python \${CONVERT_CHECKPOINT_PATH}/model.py \
    --load_platform=huggingface \
    --save_platform=mcore \
    --common_config_path=\${CONVERT_CHECKPOINT_PATH}/config/\${MODEL_NAME}.json \
    --tensor_model_parallel_size=\${TP} \
    --pipeline_model_parallel_size=\${PP} \
    --load_ckpt_path=\${LOAD} \
    --save_ckpt_path=\${SAVE} \
    --megatron_path=\${MEGATRON_PATH} \
    --no_save_optim \
    --no_load_optim \
    --safetensors

echo "Convert checkpoint done."
echo "The converted checkpoint is saved in: \n \${SAVE}."
`;

export const job2_pretrain_data_preprocess = `
#!/bin/bash
echo "INPUT_DATA: \${INPUT_DATA}"
echo "OUTPUT_PREFIX: \${OUTPUT_PREFIX}"
echo "DATASET_BOS_PATH: \${DATASET_BOS_PATH}"
echo "TOKENIZER_PATH: \${TOKENIZER_PATH}"
echo "JSON_KEYS: \${JSON_KEYS}"

# 如果INPUT_DATA文件已存在，则终止启动，打印提示信息
if [ -f "\${INPUT_DATA}" ]; then
    echo "The INPUT_DATA file \${INPUT_DATA} already exists, you can use it directly. Or you can delete it and run this script again."
    exit 1
fi

# 下载测试数据集
# 检查INPUT_DATA是否存在，不存在则下载
if [ ! -f "\${INPUT_DATA}" ]; then
    # 下载bcecmd程序
    wget https://doc.bce.baidu.com/bce-documentation/BOS/linux-bcecmd-0.4.5.zip
    # 解压
    unzip linux-bcecmd-0.4.5.zip
    cd linux-bcecmd-0.4.5

    echo "Start to download data..."
    ./bcecmd bos cp \${DATASET_BOS_PATH} \${INPUT_DATA} --restart --quiet --yes
fi

echo "Download data done."

MEGATRON_PATH=/workspace/AIAK-Megatron
AIAK_TRAINING_PATH=\${AIAK_TRAINING_PATH:-"/workspace/AIAK-Training-LLM"}

PYTHONPATH=\${MEGATRON_PATH}:\${AIAK_TRAINING_PATH}:\${PYTHONPATH} \
    python \${AIAK_TRAINING_PATH}/tools/data_preprocess/preprocess_pretrain_data.py \
        --input \${INPUT_DATA} \
        --output-prefix \${OUTPUT_PREFIX} \
        --tokenizer-type HFTokenizer \
        --hf-tokenizer-path \${TOKENIZER_PATH} \
        --json-keys \${JSON_KEYS} \
        --workers 50 \
        --append-eod
echo "Data preprocess done."
`;

export const job2_sft_data_preprocess = `
#!/bin/bash
# 检查INPUT_DATA是否存在，不存在则下载
if [ ! -d "\${INPUT_DATA}" ]; then
    # 下载bcecmd程序
    wget https://doc.bce.baidu.com/bce-documentation/BOS/linux-bcecmd-0.4.5.zip
    # 解压
    unzip linux-bcecmd-0.4.5.zip
    cd linux-bcecmd-0.4.5

    echo "Start to download data..."
    # 下载测试数据集
    ./bcecmd bos cp \${DATASET_BOS_PATH} \${INPUT_DATA} --restart --quiet --yes
fi

echo "Download data done."

MEGATRON_PATH=/workspace/AIAK-Megatron
AIAK_TRAINING_PATH=\${AIAK_TRAINING_PATH:-"/workspace/AIAK-Training-LLM"}

PYTHONPATH=\${MEGATRON_PATH}:\${AIAK_TRAINING_PATH}:\${PYTHONPATH} \
    python \${AIAK_TRAINING_PATH}/tools/data_preprocess/preprocess_sft_data.py \
        --input \${INPUT_DATA} \
        --output \${OUTPUT_PATH} \
        --seq-length 2048 \
        --chat-template \${CHAT_TEMPLATE} \
        --tokenizer-type HFTokenizer \
        --hf-tokenizer-path \${TOKENIZER_PATH} \
        --workers 50 \
        --split 100,0,0
        # --packing-sft-data \
        # --train-on-prompt \
        # --eod-mask-loss \
        # --sft-dataset-config /workspace/AIAK-Training-LLM/configs/sft_dataset_config.json \
        # --sft-dataset custom_dataset \
echo "Data preprocess done."
`;

export const datasets: { [key: string]: string } = {
    "pile_llama_test": "bos:/cce-ai-datasets/cce-ai-datasets.bj.bcebos.com/megatron_llama/pile_llama_test/pile_test_jsonl/test.jsonl",
    "WuDaoCorpus2.0_base_sample": "bos:/cce-ai-datasets/datasets/aiak/WuDaoCorpus2.0_base_sample.jsonl",
    "alpaca_zh-llama3-train": "bos:/cce-ai-datasets/datasets/aiak/alpaca_zh-llama3-train.json",
    "alpaca_zh-llama3-valid": "bos:/cce-ai-datasets/datasets/aiak/alpaca_zh-llama3-valid.json"
};

export const models: { [key: string]: [string, string, string, number] } = {
    "baichuan-7b": [
        "bos:/cce-ai-datasets/huggingface.co/baichuan-inc/baichuan-7B",
        "#N/A",
        "#N/A",
        1
    ],
    "baichuan-13b": [
        "bos:/cce-ai-datasets/huggingface.co/baichuan-inc/Baichuan-13B-Base",
        "#N/A",
        "#N/A",
        2
    ],
    "baichuan2-7b": [
        "bos:/cce-ai-models/huggingface.co/baichuan-inc/Baichuan2-7B-Base",
        "1",
        "1",
        1
    ],
    "baichuan2-13b": [
        "bos:/cce-ai-models/huggingface.co/baichuan-inc/Baichuan2-13B-Base",
        "1",
        "2",
        2
    ],
    "llama-7b": [
        "bos:/cce-ai-datasets/huggingface.co/decapoda-research/llama-7b-hf",
        "#N/A",
        "#N/A",
        1
    ],
    "llama-13b": [
        "bos:/cce-ai-datasets/huggingface.co/decapoda-research/llama-13b-hf",
        "#N/A",
        "#N/A",
        2
    ],
    "llama-65b": [
        "bos:/cce-ai-datasets/huggingface.co/decapoda-research/llama-65b-hf",
        "#N/A",
        "#N/A",
        4
    ],
    "llama2-7b": [
        "bos:/cce-ai-datasets/huggingface.co/meta-llama/Llama-2-7b-hf",
        "1",
        "1",
        1
    ],
    "llama2-13b": [
        "bos:/cce-ai-datasets/huggingface.co/meta-llama/Llama-2-13b-hf",
        "1",
        "2",
        2
    ],
    "llama2-70b": [
        "bos:/cce-ai-datasets/huggingface.co/meta-llama/Llama-2-70b-hf",
        "4",
        "4",
        4
    ],
    "llama3-8b": [
        "bos:/cce-ai-models/huggingface.co/meta-llama/Meta-Llama-3-8B-Instruct",
        "1",
        "1",
        1
    ],
    "llama3-70b": [
        "bos:/cce-ai-models/meta-llama/Meta-Llama-3-70B-Instruct",
        "4",
        "4",
        4
    ],
    "llama3.1-8b": [
        "bos:/cce-ai-models/huggingface/meta-llama/Meta-Llama-3.1-8B-Instruct",
        "#N/A",
        "#N/A",
        1
    ],
    "llama3.1-70b": [
        "bos:/cce-ai-models/huggingface.co/meta-llama/Meta-Llama-3.1-70B-Instruct",
        "#N/A",
        "#N/A",
        4
    ],
    "llama3.1-405b": [
        "bos:/cce-ai-models/huggingface.co/meta-llama/Meta-Llama-3.1-405B-Instruct",
        "#N/A",
        "#N/A",
        16
    ],
    "mixtral-8x7b": [
        "bos:/cce-ai-models/huggingface.co/mistralai/Mixtral-8x7B-v0.1",
        "1",
        "2",
        4
    ],
    "mixtral-8x22b": [
        "bos:/cce-ai-datasets/huggingface.co/mistralai/Mixtral-8x22B-Instruct-v0.1",
        "2",
        "2",
        8
    ],
    "qwen-1.8b": [
        "bos:/cce-ai-models/huggingface.co/Qwen/Qwen-1_8B",
        "1",
        "1",
        1
    ],
    "qwen-7b": [
        "bos:/cce-ai-models/huggingface.co/Qwen/Qwen-7B",
        "1",
        "1",
        1
    ],
    "qwen-14b": [
        "bos:/cce-ai-models/huggingface.co/Qwen/Qwen-14B",
        "1",
        "2",
        2
    ],
    "qwen-72b": [
        "bos:/cce-ai-models/huggingface.co/Qwen/Qwen-72B",
        "2",
        "8",
        4
    ],
    "qwen1.5-0.5b": [
        "bos:/cce-ai-models/huggingface.co/Qwen/Qwen1.5-0.5B",
        "1",
        "1",
        1
    ],
    "qwen1.5-1.8b": [
        "bos:/cce-ai-models/huggingface.co/Qwen/Qwen1.5-1.8B-Chat",
        "1",
        "1",
        1
    ],
    "qwen1.5-4b": [
        "bos:/cce-ai-models/huggingface.co/Qwen/Qwen1.5-4B",
        "1",
        "1",
        1
    ],
    "qwen1.5-7b": [
        "bos:/cce-ai-models/huggingface.co/Qwen/Qwen1.5-7B-Chat",
        "1",
        "1",
        1
    ],
    "qwen1.5-14b": [
        "bos:/cce-ai-models/huggingface.co/Qwen/Qwen1.5-14B-Chat",
        "1",
        "2",
        2
    ],
    "qwen1.5-32b": [
        "bos:/cce-ai-models/huggingface.co/Qwen/Qwen1.5-32B-Chat",
        "2",
        "4",
        4
    ],
    "qwen1.5-72b": [
        "bos:/cce-ai-models/huggingface.co/Qwen/Qwen1.5-72B-Chat",
        "2",
        "8",
        4
    ],
    "qwen2-0.5b": [
        "bos:/cce-ai-models/huggingface.co/Qwen/Qwen2-0.5B-Instruct",
        "1",
        "1",
        1
    ],
    "qwen2-1.5b": [
        "bos:/cce-ai-models/huggingface.co/Qwen/Qwen2-1.5B-Instruct",
        "1",
        "1",
        1
    ],
    "qwen2-7b": [
        "bos:/cce-ai-models/huggingface.co/Qwen/Qwen2-7B-Instruct",
        "1",
        "1",
        1
    ],
    "qwen2-72b": [
        "bos:/cce-ai-models/huggingface.co/Qwen/Qwen2-72B-Instruct",
        "8",
        "4",
        4
    ],
    "STDiT-XL/2": [
        "bos:/cce-ai-models/huggingface.co/hpcai-tech/OpenSora-STDiT-v2-stage3",
        "#N/A",
        "#N/A",
        2
    ]
};

// 从 Shell 脚本文件中读取命令
function getCommandFromSh(filePath: string): string {
    if (!fs.existsSync(filePath)) {
        throw new Error(`File ${filePath} not found.`);
    }
    return fs.readFileSync(filePath, 'utf-8');
}

// 写入链信息（环境变量）
function writeChainInfo(chainInfo: any, ak: string, sk: string, host: string): void {
    chainInfo.jobs[0].jobSpec.envs = [
        {
            "name": "AK",
            "value": ak
        },
        {
            "name": "SK",
            "value": sk
        },
        {
            "name": "HOST",
            "value": host
        }
    ];
    chainInfo.jobs[1].jobSpec.envs = [
        {
            "name": "AK",
            "value": ak
        },
        {
            "name": "SK",
            "value": sk
        },
        {
            "name": "HOST",
            "value": host
        }
    ];
}

// 构建命令
function buildCommand(jobChainInfo: any, configDir: string, index: number): string {
    const jobs = jobChainInfo['jobs'];
    const jobInfo = jobs[index];
    const jobsCount = jobs.length;

    let command = jobInfo['jobSpec']['command'];
    if (jobInfo['jobSpec'].hasOwnProperty('scriptFile')) {
        const scriptFile = jobInfo['jobSpec']['scriptFile'];
        command = '';
        delete jobInfo['jobSpec']['scriptFile'];
    }

    if (index !== jobsCount - 1) {
        const jobsStr = JSON.stringify(jobChainInfo, null, 4);

        // 保存配置文件
        const commandSaveChainInfo = `cat << 'EOF' > /workspace/chain_info.json\n${jobsStr}\nEOF`;

        const commandPipInstall = `
echo "job_chain:The previous task has been completed."
pip install future
pip install pycryptodome
pip install bce-python-sdk-next --index-url https://pypi.org/simple
pip install python-dotenv
echo "job_chain:Next job is to be continued..."
`.trim();

        const pyStr: string = `
        # -*- coding: utf-8 -*-
import sys
import os
import time
from baidubce.services.aihc.aihc_client import AIHCClient
import baidubce.protocol
from baidubce.bce_client_configuration import BceClientConfiguration
from baidubce.auth.bce_credentials import BceCredentials
from dotenv import load_dotenv

load_dotenv()

ak = os.getenv("AK") if os.getenv("AK") else ''
sk = os.getenv("SK") if os.getenv("SK") else ''
host = os.getenv("HOST") if os.getenv("HOST") else ''


def create_job_chain(config_file=None, index=None):
    args = sys.argv[1:]
    if config_file is None:
        if len(args) < 1:
            print("Usage: python job_chain.py <config_file> [index]")
            return
        else:
            config_file = args[0]
    if index is None:
        try:
            index = int(args[1]) if len(args) > 1 else 0
        except ValueError:
            print("Invalid index value.")
    else:
        index = int(index)
    if not os.path.exists(config_file):
        raise FileNotFoundError(f"File {config_file} not found.")

    client_token = 'test-aihc-' + str(int(time.time()))
    print('client_token: ', client_token)
    config = BceClientConfiguration(
        credentials=BceCredentials(ak, sk),
        endpoint=host,
        protocol=baidubce.protocol.HTTPS
    )

    aihc_client = AIHCClient(config)
    chain_job_info = aihc_client.create_job_chain(config_file, index)
    print('chain_job_info: ', chain_job_info)
    return chain_job_info


if __name__ == "__main__":
    create_job_chain()
        `;
        const commandSavePy = `cat << 'EOF' > /workspace/job_chain.py\n${pyStr}\nEOF`;
        const commandCallPy = `python /workspace/job_chain.py /workspace/chain_info.json ${index + 1}`;

        command = `${command}\n${commandSaveChainInfo}\n${commandPipInstall}\n${commandSavePy}\n${commandCallPy}`;
    }

    return command;
}