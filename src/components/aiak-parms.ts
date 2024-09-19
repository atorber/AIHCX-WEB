// job_chain.ts

import * as fs from 'fs';

// 定义 Shell 命令
const job1_convert_checkpoint = `
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

# 检查/mnt/cluster/huggingface.co/meta-llama/Llama-2-70b-hf是否存在，不存在则下载
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
MEGATRON_PATH=\${MEGATRON_PATH || "/workspace/AIAK-Megatron"}

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

const job2_pretrain_data_preprocess = `
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

const job2_sft_data_preprocess = `
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

// 定义命令、数据集和模型
const commands: { [key: string]: string } = {
    "job1_convert_checkpoint": job1_convert_checkpoint,
    "job2_pretrain_data_preprocess": job2_pretrain_data_preprocess,
    "job2_sft_data_preprocess": job2_sft_data_preprocess
};

const datasets: { [key: string]: string } = {
    "pile_llama_test": "bos:/cce-ai-datasets/cce-ai-datasets.bj.bcebos.com/megatron_llama/pile_llama_test/pile_test_jsonl/test.jsonl",
    "WuDaoCorpus2.0_base_sample": "bos:/cce-ai-datasets/datasets/aiak/WuDaoCorpus2.0_base_sample.jsonl",
    "alpaca_zh-llama3-train": "bos:/cce-ai-datasets/datasets/aiak/alpaca_zh-llama3-train.json",
    "alpaca_zh-llama3-valid": "bos:/cce-ai-datasets/datasets/aiak/alpaca_zh-llama3-valid.json"
};

const models: { [key: string]: [string, string, string] } = {
    "baichuan-7b": [
        "bos:/cce-ai-datasets/huggingface.co/baichuan-inc/baichuan-7B",
        "#N/A",
        "#N/A"
    ],
    "baichuan-13b": [
        "bos:/cce-ai-datasets/huggingface.co/baichuan-inc/Baichuan-13B-Base",
        "#N/A",
        "#N/A"
    ],
    "baichuan2-7b": [
        "bos:/cce-ai-models/huggingface.co/baichuan-inc/Baichuan2-7B-Base",
        "1",
        "1"
    ],
    "baichuan2-13b": [
        "bos:/cce-ai-models/huggingface.co/baichuan-inc/Baichuan2-13B-Base",
        "1",
        "2"
    ],
    "llama-7b": [
        "bos:/cce-ai-datasets/huggingface.co/decapoda-research/llama-7b-hf",
        "#N/A",
        "#N/A"
    ],
    "llama-13b": [
        "bos:/cce-ai-datasets/huggingface.co/decapoda-research/llama-13b-hf",
        "#N/A",
        "#N/A"
    ],
    "llama-65b": [
        "bos:/cce-ai-datasets/huggingface.co/decapoda-research/llama-65b-hf",
        "#N/A",
        "#N/A"
    ],
    "llama2-7b": [
        "bos:/cce-ai-datasets/huggingface.co/meta-llama/Llama-2-7b-hf",
        "1",
        "1"
    ],
    "llama2-13b": [
        "bos:/cce-ai-datasets/huggingface.co/meta-llama/Llama-2-13b-hf",
        "1",
        "2"
    ],
    "llama2-70b": [
        "bos:/cce-ai-datasets/huggingface.co/meta-llama/Llama-2-70b-hf",
        "4",
        "4"
    ],
    "llama3-8b": [
        "bos:/cce-ai-models/huggingface.co/meta-llama/Meta-Llama-3-8B-Instruct",
        "1",
        "1"
    ],
    "llama3-70b": [
        "bos:/cce-ai-models/meta-llama/Meta-Llama-3-70B-Instruct",
        "4",
        "4"
    ],
    "llama3.1-8b": [
        "bos:/cce-ai-models/huggingface/meta-llama/Meta-Llama-3.1-8B-Instruct",
        "#N/A",
        "#N/A"
    ],
    "llama3.1-70b": [
        "bos:/cce-ai-models/huggingface.co/meta-llama/Meta-Llama-3.1-70B-Instruct",
        "#N/A",
        "#N/A"
    ],
    "llama3.1-405b": [
        "bos:/cce-ai-models/huggingface.co/meta-llama/Meta-Llama-3.1-405B-Instruct",
        "#N/A",
        "#N/A"
    ],
    "mixtral-8x7b": [
        "bos:/cce-ai-models/huggingface.co/mistralai/Mixtral-8x7B-v0.1",
        "1",
        "2"
    ],
    "mixtral-8x22b": [
        "bos:/cce-ai-datasets/huggingface.co/mistralai/Mixtral-8x22B-Instruct-v0.1",
        "2",
        "2"
    ],
    "qwen-1.8b": [
        "bos:/cce-ai-models/huggingface.co/Qwen/Qwen-1_8B",
        "1",
        "1"
    ],
    "qwen-7b": [
        "bos:/cce-ai-models/huggingface.co/Qwen/Qwen-7B",
        "1",
        "1"
    ],
    "qwen-14b": [
        "bos:/cce-ai-models/huggingface.co/Qwen/Qwen-14B",
        "1",
        "2"
    ],
    "qwen-72b": [
        "bos:/cce-ai-models/huggingface.co/Qwen/Qwen-72B",
        "2",
        "8"
    ],
    "qwen1.5-0.5b": [
        "bos:/cce-ai-models/huggingface.co/Qwen/Qwen1.5-0.5B",
        "1",
        "1"
    ],
    "qwen1.5-1.8b": [
        "bos:/cce-ai-models/huggingface.co/Qwen/Qwen1.5-1.8B-Chat",
        "1",
        "1"
    ],
    "qwen1.5-4b": [
        "bos:/cce-ai-models/huggingface.co/Qwen/Qwen1.5-4B",
        "1",
        "1"
    ],
    "qwen1.5-7b": [
        "bos:/cce-ai-models/huggingface.co/Qwen/Qwen1.5-7B-Chat",
        "1",
        "1"
    ],
    "qwen1.5-14b": [
        "bos:/cce-ai-models/huggingface.co/Qwen/Qwen1.5-14B-Chat",
        "1",
        "2"
    ],
    "qwen1.5-32b": [
        "bos:/cce-ai-models/huggingface.co/Qwen/Qwen1.5-32B-Chat",
        "2",
        "4"
    ],
    "qwen1.5-72b": [
        "bos:/cce-ai-models/huggingface.co/Qwen/Qwen1.5-72B-Chat",
        "2",
        "8"
    ],
    "qwen2-0.5b": [
        "bos:/cce-ai-models/huggingface.co/Qwen/Qwen2-0.5B-Instruct",
        "1",
        "1"
    ],
    "qwen2-1.5b": [
        "bos:/cce-ai-models/huggingface.co/Qwen/Qwen2-1.5B-Instruct",
        "1",
        "1"
    ],
    "qwen2-7b": [
        "bos:/cce-ai-models/huggingface.co/Qwen/Qwen2-7B-Instruct",
        "1",
        "1"
    ],
    "qwen2-72b": [
        "bos:/cce-ai-models/huggingface.co/Qwen/Qwen2-72B-Instruct",
        "8",
        "4"
    ],
    "STDiT-XL/2": [
        "bos:/cce-ai-models/huggingface.co/hpcai-tech/OpenSora-STDiT-v2-stage3",
        "#N/A",
        "#N/A"
    ]
};

// 定义链信息模板
const chain_info_temp = {
    "resourcePoolId": "cce-e0isdmib",
    "jobs": [
        {
            "name": "pretrain-qwen2-72b-ck-v1",
            "jobSpec": {
                "command": "",
                "image": "registry.baidubce.com/aihc-aiak/aiak-training-llm:ubuntu22.04-cu12.3-torch2.2.0-py310-bccl1.2.7.2_v2.1.1.5_release",
                "replicas": 1,
                "envs": []
            },
            "labels": [
                {
                    "key": "aijob.cce.baidubce.com/ai-user-id",
                    "value": "69bb4999b2044af8bbda25aec2f1e1f2"
                },
                {
                    "key": "aijob.cce.baidubce.com/ai-user-name",
                    "value": "zhangsan"
                }
            ],
            "datasources": [
                {
                    "type": "pfs",
                    "name": "pfs-oYQuh4",
                    "mountPath": "/root/pfs"
                }
            ],
            "queue": "default",
            "priority": "normal",
            "jobFramework": "PyTorchJob"
        },
        {
            "queue": "default",
            "priority": "normal",
            "jobFramework": "PyTorchJob",
            "name": "pretrain-qwen2-72b-dp-v1",
            "jobSpec": {
                "command": "",
                "image": "registry.baidubce.com/aihc-aiak/aiak-training-llm:ubuntu22.04-cu12.3-torch2.2.0-py310-bccl1.2.7.2_v2.1.1.5_release",
                "replicas": 1,
                "envs": []
            },
            "labels": [
                {
                    "key": "aijob.cce.baidubce.com/ai-user-id",
                    "value": "69bb4999b2044af8bbda25aec2f1e1f2"
                },
                {
                    "key": "aijob.cce.baidubce.com/ai-user-name",
                    "value": "zhangsan"
                }
            ],
            "datasources": [
                {
                    "type": "pfs",
                    "name": "pfs-oYQuh4",
                    "mountPath": "/root/pfs"
                }
            ]
        },
        {
            "queue": "default",
            "priority": "normal",
            "jobFramework": "PyTorchJob",
            "name": "pretrain-qwen2-72b-train-v1",
            "jobSpec": {
                "command": "bash /workspace/AIAK-Training-LLM/examples/qwen2/pretrain/pretrain_qwen2_72b.sh",
                "image": "registry.baidubce.com/aihc-aiak/aiak-training-llm:ubuntu22.04-cu12.3-torch2.2.0-py310-bccl1.2.7.2_v2.1.1.5_release",
                "replicas": 4,
                "resources": [
                    {
                        "name": "baidu.com/a800_80g_cgpu",
                        "quantity": 8
                    }
                ],
                "enableRDMA": true,
                "envs": []
            },
            "labels": [
                {
                    "key": "aijob.cce.baidubce.com/ai-user-id",
                    "value": "69bb4999b2044af8bbda25aec2f1e1f2"
                },
                {
                    "key": "aijob.cce.baidubce.com/ai-user-name",
                    "value": "zhangsan"
                }
            ],
            "datasources": [
                {
                    "type": "pfs",
                    "name": "pfs-oYQuh4",
                    "mountPath": "/root/pfs"
                }
            ]
        }
    ]
};

// 获取模型信息
function getModels(): { [key: string]: [string, string, string] } {
    return models;
}

// 获取数据集信息
function getDatasets(): { [key: string]: string } {
    return datasets;
}

// 获取命令
function getCommand(filePath: string): string {
    const command = commands[filePath];
    if (!command) {
        throw new Error(`Command for ${filePath} not found.`);
    }
    return command;
}

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

// 读取链信息
function readChainInfo(): any {
    return JSON.parse(JSON.stringify(chain_info_temp)); // 深拷贝
}

// 生成 AIAK 参数
export function generateAiakParameter(aiakJobConfig: any): string {

    const aiakJobInfo: any = aiakJobConfig;

    const VERSION = aiakJobInfo['VERSION'];
    const DATASET_NAME = aiakJobInfo['DATASET_NAME'];
    const MODEL_NAME = aiakJobInfo['MODEL_NAME'];
    let TP = aiakJobInfo['TP'];
    let PP = aiakJobInfo['PP'];
    const JSON_KEYS = aiakJobInfo['JSON_KEYS'] || '';
    const IMAGE = aiakJobInfo['IMAGE'];
    const TRAINING_PHASE = aiakJobInfo['TRAINING_PHASE'];
    const REPLICAS = aiakJobInfo['REPLICAS'];
    const MOUNT_PATH = aiakJobInfo['MOUNT_PATH'];
    const MODEL_URL = aiakJobInfo['MODEL_URL'] || '';
    const DATASET_URL = aiakJobInfo['DATASET_URL'] || '';

    const MODEL_BOS_PATH = MODEL_URL || models[MODEL_NAME][0];
    TP = aiakJobInfo['TP'] || models[MODEL_NAME][1];
    PP = aiakJobInfo['PP'] || models[MODEL_NAME][2];

    const savePath = MODEL_BOS_PATH.split('/').slice(2).join('/');
    const LOAD = `${MOUNT_PATH}/models/${MODEL_NAME}/hf/${savePath}`;
    const TOKENIZER_PATH = LOAD;
    const CHECKPOINT_PATH = `${MOUNT_PATH}/models/${MODEL_NAME}/mcore/${savePath}/tp${TP}_pp${PP}`;
    const DATASET_BOS_PATH = DATASET_URL || datasets[DATASET_NAME];
    const inputDataSavePath = DATASET_BOS_PATH.split('/').slice(2).join('/');
    const INPUT_DATA = `${MOUNT_PATH}/datasets/${inputDataSavePath}`;
    const savePathInput = INPUT_DATA.split('.').slice(0, -1).join('.');
    const DATA_CACHE_PATH = `${savePathInput}_cache`;
    const OUTPUT_PREFIX = savePathInput;
    const DATA_PATH = `${OUTPUT_PREFIX}_text_document`;

    const CK_JOB_NAME = `${TRAINING_PHASE}-${MODEL_NAME}-ck2mc-${VERSION}`;
    const DP_JOB_NAME = `${TRAINING_PHASE}-${MODEL_NAME}-dp-${VERSION}`;
    const TRAIN_JOB_NAME = `${TRAINING_PHASE}-${MODEL_NAME}-train-${VERSION}`;

    const chainInfo = readChainInfo();

    // 更新 ck_job
    const ckJob = chainInfo.jobs[0];
    ckJob.jobSpec.image = IMAGE;
    ckJob.name = CK_JOB_NAME;
    ckJob.jobSpec.command = getCommand('job1_convert_checkpoint');
    ckJob.jobSpec.envs.push(
        { 'name': 'MODEL_BOS_PATH', 'value': MODEL_BOS_PATH },
        { 'name': 'MODEL_NAME', 'value': MODEL_NAME },
        { 'name': 'TP', 'value': TP },
        { 'name': 'PP', 'value': PP },
        { 'name': 'LOAD', 'value': LOAD },
        { 'name': 'SAVE', 'value': CHECKPOINT_PATH }
    );

    // 更新 dp_job
    const dpJob = chainInfo.jobs[1];
    dpJob.jobSpec.image = IMAGE;
    dpJob.name = DP_JOB_NAME;

    const shPath = `job2_${TRAINING_PHASE}_data_preprocess`;
    const CHAT_TEMPLATE = MODEL_NAME.startsWith('qwen') ? 'qwen' : MODEL_NAME.split('-')[0];
    dpJob.jobSpec.command = getCommand(shPath);

    if (TRAINING_PHASE === 'sft') {
        dpJob.jobSpec.envs.push(
            { 'name': 'DATASET_BOS_PATH', 'value': DATASET_BOS_PATH },
            { 'name': 'TOKENIZER_PATH', 'value': TOKENIZER_PATH },
            { 'name': 'INPUT_DATA', 'value': INPUT_DATA },
            { 'name': 'OUTPUT_PATH', 'value': OUTPUT_PREFIX },
            { 'name': 'CHAT_TEMPLATE', 'value': CHAT_TEMPLATE }
        );
    } else {
        dpJob.jobSpec.envs.push(
            { 'name': 'DATASET_BOS_PATH', 'value': DATASET_BOS_PATH },
            { 'name': 'TOKENIZER_PATH', 'value': TOKENIZER_PATH },
            { 'name': 'INPUT_DATA', 'value': INPUT_DATA },
            { 'name': 'OUTPUT_PREFIX', 'value': OUTPUT_PREFIX },
            { 'name': 'JSON_KEYS', 'value': JSON_KEYS }
        );
    }

    // 更新 train_job
    const trainJob = chainInfo.jobs[2];
    trainJob.jobSpec.image = IMAGE;
    trainJob.name = TRAIN_JOB_NAME;

    if (TRAINING_PHASE === 'sft') {
        trainJob.jobSpec.envs.push(
            { 'name': 'CUDA_DEVICE_MAX_CONNECTIONS', 'value': '1' },
            { 'name': 'DATA_PATH', 'value': INPUT_DATA },
            { 'name': 'DATA_CACHE_PATH', 'value': DATA_CACHE_PATH },
            { 'name': 'TOKENIZER_PATH', 'value': TOKENIZER_PATH },
            { 'name': 'CHECKPOINT_PATH', 'value': CHECKPOINT_PATH }
        );
    } else {
        trainJob.jobSpec.envs.push(
            { "name": "CUDA_DEVICE_MAX_CONNECTIONS", "value": "1" },
            { 'name': 'DATA_PATH', 'value': DATA_PATH },
            { 'name': 'TOKENIZER_PATH', 'value': TOKENIZER_PATH },
            { 'name': 'CHECKPOINT_PATH', 'value': CHECKPOINT_PATH }
        );
    }

    let SH_PATH = `/workspace/AIAK-Training-LLM/examples/${MODEL_NAME.split('-')[0]}/pretrain/pretrain_${MODEL_NAME.replace(/-/g, '_')}.sh`;
    if (TRAINING_PHASE === 'sft') {
        SH_PATH = `/workspace/AIAK-Training-LLM/examples/${MODEL_NAME.split('-')[0]}/finetuning/sft_${MODEL_NAME.replace(/-/g, '_')}.sh`;
    }

    trainJob.jobSpec.command = `bash ${SH_PATH}`;
    trainJob.jobSpec.replicas = parseInt(REPLICAS, 10);

    // 更新 chain_info
    chainInfo.jobs[0] = ckJob;
    chainInfo.jobs[1] = dpJob;
    chainInfo.jobs[2] = trainJob;

    // 生成单个任务的 Shell 脚本
    const oneJobCommand = `
#!/bin/bash

# 任务名称: ${TRAIN_JOB_NAME}
# 镜像: ${IMAGE}
# 环境变量: CUDA_DEVICE_MAX_CONNECTIONS=1
# 挂载路径: ${MOUNT_PATH}
# 实例数量: ${REPLICAS}

export MODEL_BOS_PATH="${MODEL_BOS_PATH}"
export MODEL_NAME="${MODEL_NAME}"
export TP=${TP}
export PP=${PP}
export LOAD="${LOAD}"
export SAVE="${CHECKPOINT_PATH}"
export TOKENIZER_PATH="${TOKENIZER_PATH}"
export DATASET_BOS_PATH="${DATASET_BOS_PATH}"
export INPUT_DATA="${INPUT_DATA}"
export OUTPUT_PREFIX="${OUTPUT_PREFIX}"
export OUTPUT_PATH="${OUTPUT_PREFIX}"
export DATA_PATH="${DATA_PATH}"
export DATA_CACHE_PATH="${DATA_CACHE_PATH}"
export JSON_KEYS="${JSON_KEYS}"
export CHAT_TEMPLATE="${CHAT_TEMPLATE}"
export CHECKPOINT_PATH="${CHECKPOINT_PATH}"
export CUDA_DEVICE_MAX_CONNECTIONS=1

${ckJob.jobSpec.command.replace('#!/bin/bash', '')}
${dpJob.jobSpec.command.replace('#!/bin/bash', '')}
${trainJob.jobSpec.command}
`.trim();

console.log(chainInfo)
console.log(oneJobCommand)


    console.log('=============================\n');
    console.log('任务配置信息：', JSON.stringify(aiakJobInfo, null, 4));
    console.log('任务配置文件已生成：', 'chainJobConfigFile');
    console.log('任务执行命令：', 'oneJobCommandConfigFile');
    console.log('启动任务：', 'runCommand');
    console.log('\n=============================');

    return oneJobCommand
}

export function generateConvertCheckpoint(aiakJobConfig: any): string {

    const aiakJobInfo: any = aiakJobConfig;

    const VERSION = aiakJobInfo['VERSION'];
    const DATASET_NAME = aiakJobInfo['DATASET_NAME'];
    const MODEL_NAME = aiakJobInfo['MODEL_NAME'];
    let TP = aiakJobInfo['TP'];
    let PP = aiakJobInfo['PP'];
    const JSON_KEYS = aiakJobInfo['JSON_KEYS'] || '';
    const IMAGE = aiakJobInfo['IMAGE'];
    const TRAINING_PHASE = aiakJobInfo['TRAINING_PHASE'];
    const REPLICAS = aiakJobInfo['REPLICAS'];
    const MOUNT_PATH = aiakJobInfo['MOUNT_PATH'];
    const MODEL_URL = aiakJobInfo['MODEL_URL'] || '';
    const DATASET_URL = aiakJobInfo['DATASET_URL'] || '';

    const MODEL_BOS_PATH = MODEL_URL || models[MODEL_NAME][0];
    TP = aiakJobInfo['TP'] || models[MODEL_NAME][1];
    PP = aiakJobInfo['PP'] || models[MODEL_NAME][2];

    const savePath = MODEL_BOS_PATH.split('/').slice(2).join('/');
    const LOAD = `${MOUNT_PATH}/models/${MODEL_NAME}/hf/${savePath}`;
    const TOKENIZER_PATH = LOAD;
    const CHECKPOINT_PATH = `${MOUNT_PATH}/models/${MODEL_NAME}/mcore/${savePath}/tp${TP}_pp${PP}`;
    const DATASET_BOS_PATH = DATASET_URL || datasets[DATASET_NAME];
    const inputDataSavePath = DATASET_BOS_PATH.split('/').slice(2).join('/');
    const INPUT_DATA = `${MOUNT_PATH}/datasets/${inputDataSavePath}`;
    const savePathInput = INPUT_DATA.split('.').slice(0, -1).join('.');
    const DATA_CACHE_PATH = `${savePathInput}_cache`;
    const OUTPUT_PREFIX = savePathInput;
    const DATA_PATH = `${OUTPUT_PREFIX}_text_document`;

    const CK_JOB_NAME = `${TRAINING_PHASE}-${MODEL_NAME}-ck2mc-${VERSION}`;
    const DP_JOB_NAME = `${TRAINING_PHASE}-${MODEL_NAME}-dp-${VERSION}`;
    const TRAIN_JOB_NAME = `${TRAINING_PHASE}-${MODEL_NAME}-train-${VERSION}`;

    const chainInfo = readChainInfo();

    // 更新 ck_job
    const ckJob = chainInfo.jobs[0];
    ckJob.jobSpec.image = IMAGE;
    ckJob.name = CK_JOB_NAME;
    ckJob.jobSpec.command = getCommand('job1_convert_checkpoint');
    ckJob.jobSpec.envs.push(
        { 'name': 'MODEL_BOS_PATH', 'value': MODEL_BOS_PATH },
        { 'name': 'MODEL_NAME', 'value': MODEL_NAME },
        { 'name': 'TP', 'value': TP },
        { 'name': 'PP', 'value': PP },
        { 'name': 'LOAD', 'value': LOAD },
        { 'name': 'SAVE', 'value': CHECKPOINT_PATH }
    );

    // 更新 dp_job
    const dpJob = chainInfo.jobs[1];
    dpJob.jobSpec.image = IMAGE;
    dpJob.name = DP_JOB_NAME;

    const shPath = `job2_${TRAINING_PHASE}_data_preprocess`;
    const CHAT_TEMPLATE = MODEL_NAME.startsWith('qwen') ? 'qwen' : MODEL_NAME.split('-')[0];
    dpJob.jobSpec.command = getCommand(shPath);

    if (TRAINING_PHASE === 'sft') {
        dpJob.jobSpec.envs.push(
            { 'name': 'DATASET_BOS_PATH', 'value': DATASET_BOS_PATH },
            { 'name': 'TOKENIZER_PATH', 'value': TOKENIZER_PATH },
            { 'name': 'INPUT_DATA', 'value': INPUT_DATA },
            { 'name': 'OUTPUT_PATH', 'value': OUTPUT_PREFIX },
            { 'name': 'CHAT_TEMPLATE', 'value': CHAT_TEMPLATE }
        );
    } else {
        dpJob.jobSpec.envs.push(
            { 'name': 'DATASET_BOS_PATH', 'value': DATASET_BOS_PATH },
            { 'name': 'TOKENIZER_PATH', 'value': TOKENIZER_PATH },
            { 'name': 'INPUT_DATA', 'value': INPUT_DATA },
            { 'name': 'OUTPUT_PREFIX', 'value': OUTPUT_PREFIX },
            { 'name': 'JSON_KEYS', 'value': JSON_KEYS }
        );
    }

    // 更新 train_job
    const trainJob = chainInfo.jobs[2];
    trainJob.jobSpec.image = IMAGE;
    trainJob.name = TRAIN_JOB_NAME;

    if (TRAINING_PHASE === 'sft') {
        trainJob.jobSpec.envs.push(
            { 'name': 'CUDA_DEVICE_MAX_CONNECTIONS', 'value': '1' },
            { 'name': 'DATA_PATH', 'value': INPUT_DATA },
            { 'name': 'DATA_CACHE_PATH', 'value': DATA_CACHE_PATH },
            { 'name': 'TOKENIZER_PATH', 'value': TOKENIZER_PATH },
            { 'name': 'CHECKPOINT_PATH', 'value': CHECKPOINT_PATH }
        );
    } else {
        trainJob.jobSpec.envs.push(
            { "name": "CUDA_DEVICE_MAX_CONNECTIONS", "value": "1" },
            { 'name': 'DATA_PATH', 'value': DATA_PATH },
            { 'name': 'TOKENIZER_PATH', 'value': TOKENIZER_PATH },
            { 'name': 'CHECKPOINT_PATH', 'value': CHECKPOINT_PATH }
        );
    }

    let SH_PATH = `/workspace/AIAK-Training-LLM/examples/${MODEL_NAME.split('-')[0]}/pretrain/pretrain_${MODEL_NAME.replace(/-/g, '_')}.sh`;
    if (TRAINING_PHASE === 'sft') {
        SH_PATH = `/workspace/AIAK-Training-LLM/examples/${MODEL_NAME.split('-')[0]}/finetuning/sft_${MODEL_NAME.replace(/-/g, '_')}.sh`;
    }

    trainJob.jobSpec.command = `bash ${SH_PATH}`;
    trainJob.jobSpec.replicas = parseInt(REPLICAS, 10);

    // 更新 chain_info
    chainInfo.jobs[0] = ckJob;
    chainInfo.jobs[1] = dpJob;
    chainInfo.jobs[2] = trainJob;

    // 生成单个任务的 Shell 脚本
    const oneJobCommand = `
#!/bin/bash

# 任务名称: ${CK_JOB_NAME}
# 镜像: ${IMAGE}
# 挂载路径: ${MOUNT_PATH}
# 实例数量: 1

export MODEL_BOS_PATH="${MODEL_BOS_PATH}"
export MODEL_NAME="${MODEL_NAME}"
export TP=${TP}
export PP=${PP}
export LOAD="${LOAD}"
export SAVE="${CHECKPOINT_PATH}"
export TOKENIZER_PATH="${TOKENIZER_PATH}"
export DATASET_BOS_PATH="${DATASET_BOS_PATH}"
export INPUT_DATA="${INPUT_DATA}"
export OUTPUT_PREFIX="${OUTPUT_PREFIX}"
export OUTPUT_PATH="${OUTPUT_PREFIX}"
export DATA_PATH="${DATA_PATH}"
export DATA_CACHE_PATH="${DATA_CACHE_PATH}"
export JSON_KEYS="${JSON_KEYS}"
export CHAT_TEMPLATE="${CHAT_TEMPLATE}"
export CHECKPOINT_PATH="${CHECKPOINT_PATH}"

${ckJob.jobSpec.command.replace('#!/bin/bash', '')}
`.trim();

console.log(chainInfo)
console.log(oneJobCommand)


    console.log('=============================\n');
    console.log('任务配置信息：', JSON.stringify(aiakJobInfo, null, 4));
    console.log('任务配置文件已生成：', 'chainJobConfigFile');
    console.log('任务执行命令：', 'oneJobCommandConfigFile');
    console.log('启动任务：', 'runCommand');
    console.log('\n=============================');

    return oneJobCommand
}

export function generatePreprocessData(aiakJobConfig: any): string {

    const aiakJobInfo: any = aiakJobConfig;

    const VERSION = aiakJobInfo['VERSION'];
    const DATASET_NAME = aiakJobInfo['DATASET_NAME'];
    const MODEL_NAME = aiakJobInfo['MODEL_NAME'];
    let TP = aiakJobInfo['TP'];
    let PP = aiakJobInfo['PP'];
    const JSON_KEYS = aiakJobInfo['JSON_KEYS'] || '';
    const IMAGE = aiakJobInfo['IMAGE'];
    const TRAINING_PHASE = aiakJobInfo['TRAINING_PHASE'];
    const REPLICAS = aiakJobInfo['REPLICAS'];
    const MOUNT_PATH = aiakJobInfo['MOUNT_PATH'];
    const MODEL_URL = aiakJobInfo['MODEL_URL'] || '';
    const DATASET_URL = aiakJobInfo['DATASET_URL'] || '';

    const MODEL_BOS_PATH = MODEL_URL || models[MODEL_NAME][0];
    TP = aiakJobInfo['TP'] || models[MODEL_NAME][1];
    PP = aiakJobInfo['PP'] || models[MODEL_NAME][2];

    const savePath = MODEL_BOS_PATH.split('/').slice(2).join('/');
    const LOAD = `${MOUNT_PATH}/models/${MODEL_NAME}/hf/${savePath}`;
    const TOKENIZER_PATH = LOAD;
    const CHECKPOINT_PATH = `${MOUNT_PATH}/models/${MODEL_NAME}/mcore/${savePath}/tp${TP}_pp${PP}`;
    const DATASET_BOS_PATH = DATASET_URL || datasets[DATASET_NAME];
    const inputDataSavePath = DATASET_BOS_PATH.split('/').slice(2).join('/');
    const INPUT_DATA = `${MOUNT_PATH}/datasets/${inputDataSavePath}`;
    const savePathInput = INPUT_DATA.split('.').slice(0, -1).join('.');
    const DATA_CACHE_PATH = `${savePathInput}_cache`;
    const OUTPUT_PREFIX = savePathInput;
    const DATA_PATH = `${OUTPUT_PREFIX}_text_document`;

    const CK_JOB_NAME = `${TRAINING_PHASE}-${MODEL_NAME}-ck2mc-${VERSION}`;
    const DP_JOB_NAME = `${TRAINING_PHASE}-${MODEL_NAME}-dp-${VERSION}`;
    const TRAIN_JOB_NAME = `${TRAINING_PHASE}-${MODEL_NAME}-train-${VERSION}`;

    const chainInfo = readChainInfo();

    // 更新 ck_job
    const ckJob = chainInfo.jobs[0];
    ckJob.jobSpec.image = IMAGE;
    ckJob.name = CK_JOB_NAME;
    ckJob.jobSpec.command = getCommand('job1_convert_checkpoint');
    ckJob.jobSpec.envs.push(
        { 'name': 'MODEL_BOS_PATH', 'value': MODEL_BOS_PATH },
        { 'name': 'MODEL_NAME', 'value': MODEL_NAME },
        { 'name': 'TP', 'value': TP },
        { 'name': 'PP', 'value': PP },
        { 'name': 'LOAD', 'value': LOAD },
        { 'name': 'SAVE', 'value': CHECKPOINT_PATH }
    );

    // 更新 dp_job
    const dpJob = chainInfo.jobs[1];
    dpJob.jobSpec.image = IMAGE;
    dpJob.name = DP_JOB_NAME;

    const shPath = `job2_${TRAINING_PHASE}_data_preprocess`;
    const CHAT_TEMPLATE = MODEL_NAME.startsWith('qwen') ? 'qwen' : MODEL_NAME.split('-')[0];
    dpJob.jobSpec.command = getCommand(shPath);

    if (TRAINING_PHASE === 'sft') {
        dpJob.jobSpec.envs.push(
            { 'name': 'DATASET_BOS_PATH', 'value': DATASET_BOS_PATH },
            { 'name': 'TOKENIZER_PATH', 'value': TOKENIZER_PATH },
            { 'name': 'INPUT_DATA', 'value': INPUT_DATA },
            { 'name': 'OUTPUT_PATH', 'value': OUTPUT_PREFIX },
            { 'name': 'CHAT_TEMPLATE', 'value': CHAT_TEMPLATE }
        );
    } else {
        dpJob.jobSpec.envs.push(
            { 'name': 'DATASET_BOS_PATH', 'value': DATASET_BOS_PATH },
            { 'name': 'TOKENIZER_PATH', 'value': TOKENIZER_PATH },
            { 'name': 'INPUT_DATA', 'value': INPUT_DATA },
            { 'name': 'OUTPUT_PREFIX', 'value': OUTPUT_PREFIX },
            { 'name': 'JSON_KEYS', 'value': JSON_KEYS }
        );
    }

    // 更新 train_job
    const trainJob = chainInfo.jobs[2];
    trainJob.jobSpec.image = IMAGE;
    trainJob.name = TRAIN_JOB_NAME;

    if (TRAINING_PHASE === 'sft') {
        trainJob.jobSpec.envs.push(
            { 'name': 'CUDA_DEVICE_MAX_CONNECTIONS', 'value': '1' },
            { 'name': 'DATA_PATH', 'value': INPUT_DATA },
            { 'name': 'DATA_CACHE_PATH', 'value': DATA_CACHE_PATH },
            { 'name': 'TOKENIZER_PATH', 'value': TOKENIZER_PATH },
            { 'name': 'CHECKPOINT_PATH', 'value': CHECKPOINT_PATH }
        );
    } else {
        trainJob.jobSpec.envs.push(
            { "name": "CUDA_DEVICE_MAX_CONNECTIONS", "value": "1" },
            { 'name': 'DATA_PATH', 'value': DATA_PATH },
            { 'name': 'TOKENIZER_PATH', 'value': TOKENIZER_PATH },
            { 'name': 'CHECKPOINT_PATH', 'value': CHECKPOINT_PATH }
        );
    }

    let SH_PATH = `/workspace/AIAK-Training-LLM/examples/${MODEL_NAME.split('-')[0]}/pretrain/pretrain_${MODEL_NAME.replace(/-/g, '_')}.sh`;
    if (TRAINING_PHASE === 'sft') {
        SH_PATH = `/workspace/AIAK-Training-LLM/examples/${MODEL_NAME.split('-')[0]}/finetuning/sft_${MODEL_NAME.replace(/-/g, '_')}.sh`;
    }

    trainJob.jobSpec.command = `bash ${SH_PATH}`;
    trainJob.jobSpec.replicas = parseInt(REPLICAS, 10);

    // 更新 chain_info
    chainInfo.jobs[0] = ckJob;
    chainInfo.jobs[1] = dpJob;
    chainInfo.jobs[2] = trainJob;

    // 生成单个任务的 Shell 脚本
    const oneJobCommand = `
#!/bin/bash

# 任务名称: ${DP_JOB_NAME}
# 镜像: ${IMAGE}
# 挂载路径: ${MOUNT_PATH}
# 实例数量: 1

export MODEL_BOS_PATH="${MODEL_BOS_PATH}"
export MODEL_NAME="${MODEL_NAME}"
export TP=${TP}
export PP=${PP}
export LOAD="${LOAD}"
export SAVE="${CHECKPOINT_PATH}"
export TOKENIZER_PATH="${TOKENIZER_PATH}"
export DATASET_BOS_PATH="${DATASET_BOS_PATH}"
export INPUT_DATA="${INPUT_DATA}"
export OUTPUT_PREFIX="${OUTPUT_PREFIX}"
export OUTPUT_PATH="${OUTPUT_PREFIX}"
export DATA_PATH="${DATA_PATH}"
export DATA_CACHE_PATH="${DATA_CACHE_PATH}"
export JSON_KEYS="${JSON_KEYS}"
export CHAT_TEMPLATE="${CHAT_TEMPLATE}"
export CHECKPOINT_PATH="${CHECKPOINT_PATH}"
${dpJob.jobSpec.command.replace('#!/bin/bash', '')}
`.trim();

console.log(chainInfo)
console.log(oneJobCommand)


    console.log('=============================\n');
    console.log('任务配置信息：', JSON.stringify(aiakJobInfo, null, 4));
    console.log('任务配置文件已生成：', 'chainJobConfigFile');
    console.log('任务执行命令：', 'oneJobCommandConfigFile');
    console.log('启动任务：', 'runCommand');
    console.log('\n=============================');

    return oneJobCommand
}

export function generateTraining(aiakJobConfig: any): string {

    const aiakJobInfo: any = aiakJobConfig;

    const VERSION = aiakJobInfo['VERSION'];
    const DATASET_NAME = aiakJobInfo['DATASET_NAME'];
    const MODEL_NAME = aiakJobInfo['MODEL_NAME'];
    let TP = aiakJobInfo['TP'];
    let PP = aiakJobInfo['PP'];
    const JSON_KEYS = aiakJobInfo['JSON_KEYS'] || '';
    const IMAGE = aiakJobInfo['IMAGE'];
    const TRAINING_PHASE = aiakJobInfo['TRAINING_PHASE'];
    const REPLICAS = aiakJobInfo['REPLICAS'];
    const MOUNT_PATH = aiakJobInfo['MOUNT_PATH'];
    const MODEL_URL = aiakJobInfo['MODEL_URL'] || '';
    const DATASET_URL = aiakJobInfo['DATASET_URL'] || '';

    const MODEL_BOS_PATH = MODEL_URL || models[MODEL_NAME][0];
    TP = aiakJobInfo['TP'] || models[MODEL_NAME][1];
    PP = aiakJobInfo['PP'] || models[MODEL_NAME][2];

    const savePath = MODEL_BOS_PATH.split('/').slice(2).join('/');
    const LOAD = `${MOUNT_PATH}/models/${MODEL_NAME}/hf/${savePath}`;
    const TOKENIZER_PATH = LOAD;
    const CHECKPOINT_PATH = `${MOUNT_PATH}/models/${MODEL_NAME}/mcore/${savePath}/tp${TP}_pp${PP}`;
    const DATASET_BOS_PATH = DATASET_URL || datasets[DATASET_NAME];
    const inputDataSavePath = DATASET_BOS_PATH.split('/').slice(2).join('/');
    const INPUT_DATA = `${MOUNT_PATH}/datasets/${inputDataSavePath}`;
    const savePathInput = INPUT_DATA.split('.').slice(0, -1).join('.');
    const DATA_CACHE_PATH = `${savePathInput}_cache`;
    const OUTPUT_PREFIX = savePathInput;
    const DATA_PATH = `${OUTPUT_PREFIX}_text_document`;

    const CK_JOB_NAME = `${TRAINING_PHASE}-${MODEL_NAME}-ck2mc-${VERSION}`;
    const DP_JOB_NAME = `${TRAINING_PHASE}-${MODEL_NAME}-dp-${VERSION}`;
    const TRAIN_JOB_NAME = `${TRAINING_PHASE}-${MODEL_NAME}-train-${VERSION}`;

    const chainInfo = readChainInfo();

    // 更新 ck_job
    const ckJob = chainInfo.jobs[0];
    ckJob.jobSpec.image = IMAGE;
    ckJob.name = CK_JOB_NAME;
    ckJob.jobSpec.command = getCommand('job1_convert_checkpoint');
    ckJob.jobSpec.envs.push(
        { 'name': 'MODEL_BOS_PATH', 'value': MODEL_BOS_PATH },
        { 'name': 'MODEL_NAME', 'value': MODEL_NAME },
        { 'name': 'TP', 'value': TP },
        { 'name': 'PP', 'value': PP },
        { 'name': 'LOAD', 'value': LOAD },
        { 'name': 'SAVE', 'value': CHECKPOINT_PATH }
    );

    // 更新 dp_job
    const dpJob = chainInfo.jobs[1];
    dpJob.jobSpec.image = IMAGE;
    dpJob.name = DP_JOB_NAME;

    const shPath = `job2_${TRAINING_PHASE}_data_preprocess`;
    const CHAT_TEMPLATE = MODEL_NAME.startsWith('qwen') ? 'qwen' : MODEL_NAME.split('-')[0];
    dpJob.jobSpec.command = getCommand(shPath);

    if (TRAINING_PHASE === 'sft') {
        dpJob.jobSpec.envs.push(
            { 'name': 'DATASET_BOS_PATH', 'value': DATASET_BOS_PATH },
            { 'name': 'TOKENIZER_PATH', 'value': TOKENIZER_PATH },
            { 'name': 'INPUT_DATA', 'value': INPUT_DATA },
            { 'name': 'OUTPUT_PATH', 'value': OUTPUT_PREFIX },
            { 'name': 'CHAT_TEMPLATE', 'value': CHAT_TEMPLATE }
        );
    } else {
        dpJob.jobSpec.envs.push(
            { 'name': 'DATASET_BOS_PATH', 'value': DATASET_BOS_PATH },
            { 'name': 'TOKENIZER_PATH', 'value': TOKENIZER_PATH },
            { 'name': 'INPUT_DATA', 'value': INPUT_DATA },
            { 'name': 'OUTPUT_PREFIX', 'value': OUTPUT_PREFIX },
            { 'name': 'JSON_KEYS', 'value': JSON_KEYS }
        );
    }

    // 更新 train_job
    const trainJob = chainInfo.jobs[2];
    trainJob.jobSpec.image = IMAGE;
    trainJob.name = TRAIN_JOB_NAME;

    if (TRAINING_PHASE === 'sft') {
        trainJob.jobSpec.envs.push(
            { 'name': 'CUDA_DEVICE_MAX_CONNECTIONS', 'value': '1' },
            { 'name': 'DATA_PATH', 'value': INPUT_DATA },
            { 'name': 'DATA_CACHE_PATH', 'value': DATA_CACHE_PATH },
            { 'name': 'TOKENIZER_PATH', 'value': TOKENIZER_PATH },
            { 'name': 'CHECKPOINT_PATH', 'value': CHECKPOINT_PATH }
        );
    } else {
        trainJob.jobSpec.envs.push(
            { "name": "CUDA_DEVICE_MAX_CONNECTIONS", "value": "1" },
            { 'name': 'DATA_PATH', 'value': DATA_PATH },
            { 'name': 'TOKENIZER_PATH', 'value': TOKENIZER_PATH },
            { 'name': 'CHECKPOINT_PATH', 'value': CHECKPOINT_PATH }
        );
    }

    let SH_PATH = `/workspace/AIAK-Training-LLM/examples/${MODEL_NAME.split('-')[0]}/pretrain/pretrain_${MODEL_NAME.replace(/-/g, '_')}.sh`;
    if (TRAINING_PHASE === 'sft') {
        SH_PATH = `/workspace/AIAK-Training-LLM/examples/${MODEL_NAME.split('-')[0]}/finetuning/sft_${MODEL_NAME.replace(/-/g, '_')}.sh`;
    }

    trainJob.jobSpec.command = `bash ${SH_PATH}`;
    trainJob.jobSpec.replicas = parseInt(REPLICAS, 10);

    // 更新 chain_info
    chainInfo.jobs[0] = ckJob;
    chainInfo.jobs[1] = dpJob;
    chainInfo.jobs[2] = trainJob;

    // 生成单个任务的 Shell 脚本
    const oneJobCommand = `
#!/bin/bash

# 任务名称: ${TRAIN_JOB_NAME}
# 镜像: ${IMAGE}
# 环境变量: CUDA_DEVICE_MAX_CONNECTIONS=1
# 挂载路径: ${MOUNT_PATH}
# 实例数量: ${REPLICAS}

export MODEL_BOS_PATH="${MODEL_BOS_PATH}"
export MODEL_NAME="${MODEL_NAME}"
export TP=${TP}
export PP=${PP}
export LOAD="${LOAD}"
export SAVE="${CHECKPOINT_PATH}"
export TOKENIZER_PATH="${TOKENIZER_PATH}"
export DATASET_BOS_PATH="${DATASET_BOS_PATH}"
export INPUT_DATA="${INPUT_DATA}"
export OUTPUT_PREFIX="${OUTPUT_PREFIX}"
export OUTPUT_PATH="${OUTPUT_PREFIX}"
export DATA_PATH="${DATA_PATH}"
export DATA_CACHE_PATH="${DATA_CACHE_PATH}"
export JSON_KEYS="${JSON_KEYS}"
export CHAT_TEMPLATE="${CHAT_TEMPLATE}"
export CHECKPOINT_PATH="${CHECKPOINT_PATH}"
export CUDA_DEVICE_MAX_CONNECTIONS=1
${trainJob.jobSpec.command}
`.trim();

console.log(chainInfo)
console.log(oneJobCommand)


    console.log('=============================\n');
    console.log('任务配置信息：', JSON.stringify(aiakJobInfo, null, 4));
    console.log('任务配置文件已生成：', 'chainJobConfigFile');
    console.log('任务执行命令：', 'oneJobCommandConfigFile');
    console.log('启动任务：', 'runCommand');
    console.log('\n=============================');

    return oneJobCommand
}

// 验证索引
function validateIndex(index: number, jobsCount: number): void {
    if (index < 0 || index >= jobsCount) {
        throw new Error(`Index ${index} is out of range.`);
    }
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
