// job_chain.ts
import {
    job1_convert_checkpoint,
    job2_pretrain_data_preprocess,
    job2_sft_data_preprocess,
    datasets,
    models
} from './aiak-data';

// 获取当前时间字符串，用于默认版本号，东八区时间
export const timeStr = () => new Date().toLocaleString("zh-CN").replace(/[^0-9]/g, "");

// 定义命令、数据集和模型
const commands: { [key: string]: string } = {
    "job1_convert_checkpoint": job1_convert_checkpoint,
    "job2_pretrain_data_preprocess": job2_pretrain_data_preprocess,
    "job2_sft_data_preprocess": job2_sft_data_preprocess
};

// 获取命令
function getCommand(filePath: string): string {
    const command = commands[filePath];
    if (!command) {
        throw new Error(`Command for ${filePath} not found.`);
    }
    return command;
}

// 读取链信息
function readChainInfo(): any {
    return JSON.parse(JSON.stringify(chain_info_temp)); // 深拷贝
}

export function getReplicas(MODEL_NAME: string): number {
    return models[MODEL_NAME][3];
}

export function generateParameter(aiakJobConfig: any): {
    VERSION: string,
    DATASET_NAME: string,
    MODEL_NAME: string,
    TP: string,
    PP: string,
    JSON_KEYS: string,
    IMAGE: string,
    TRAINING_PHASE: string,
    REPLICAS: string,
    MOUNT_PATH: string,
    MODEL_URL: string,
    DATASET_URL: string,
    MODEL_BOS_PATH: string,
    LOAD: string,
    TOKENIZER_PATH: string,
    CHECKPOINT_PATH: string,
    DATASET_BOS_PATH: string,
    INPUT_DATA: string,
    DATA_CACHE_PATH: string,
    OUTPUT_PREFIX: string,
    DATA_PATH: string,
    CK_JOB_NAME: string,
    DP_JOB_NAME: string,
    TRAIN_JOB_NAME: string,
    CHAT_TEMPLATE: string
} {
    const aiakJobInfo: any = aiakJobConfig;
    const VERSION = aiakJobInfo['VERSION'];
    const DATASET_NAME = aiakJobInfo['DATASET_NAME'];
    const MODEL_NAME = aiakJobInfo['MODEL_NAME'];
    let TP = aiakJobInfo['TP'];
    let PP = aiakJobInfo['PP'];
    const JSON_KEYS = aiakJobInfo['JSON_KEYS'] || 'text';
    const IMAGE = aiakJobInfo['IMAGE'];
    const TRAINING_PHASE = aiakJobInfo['TRAINING_PHASE'];
    const REPLICAS = aiakJobInfo['REPLICAS'] || models[MODEL_NAME][3];
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

    const CK_JOB_NAME = `${TRAINING_PHASE}-${MODEL_NAME}-ck2mc-tp${TP}-pp${PP}-${VERSION}`;
    const DP_JOB_NAME = `${TRAINING_PHASE}-${MODEL_NAME}-dp-${VERSION}`;
    const TRAIN_JOB_NAME = `${TRAINING_PHASE}-${MODEL_NAME}-train-tp${TP}-pp${PP}-${VERSION}`;
    const CHAT_TEMPLATE = MODEL_NAME.startsWith('qwen') ? 'qwen' : MODEL_NAME.split('-')[0];

    return {
        VERSION,
        DATASET_NAME,
        MODEL_NAME,
        TP,
        PP,
        JSON_KEYS,
        IMAGE,
        TRAINING_PHASE,
        REPLICAS,
        MOUNT_PATH,
        MODEL_URL,
        DATASET_URL,
        MODEL_BOS_PATH,
        LOAD,
        TOKENIZER_PATH,
        CHECKPOINT_PATH,
        DATASET_BOS_PATH,
        INPUT_DATA,
        DATA_CACHE_PATH,
        OUTPUT_PREFIX,
        DATA_PATH,
        CK_JOB_NAME,
        DP_JOB_NAME,
        TRAIN_JOB_NAME,
        CHAT_TEMPLATE
    }
}

export function generateAiakParameter(aiakJobConfig: any): string {
    const envs = generateParameter(aiakJobConfig)
    // 更新 ck_job
    const ckJob_command = getCommand('job1_convert_checkpoint');

    // 更新 dp_job
    const shPath = `job2_${envs.TRAINING_PHASE}_data_preprocess`;
    const CHAT_TEMPLATE = envs.MODEL_NAME.startsWith('qwen') ? 'qwen' : envs.MODEL_NAME.split('-')[0];
    const dpJob_command = getCommand(shPath);

    // 更新 train_job
    let SH_PATH = `/workspace/AIAK-Training-LLM/examples/${envs.MODEL_NAME.split('-')[0]}/pretrain/pretrain_${envs.MODEL_NAME.replace(/-/g, '_')}.sh`;
    if (envs.TRAINING_PHASE === 'sft') {
        SH_PATH = `/workspace/AIAK-Training-LLM/examples/${envs.MODEL_NAME.split('-')[0]}/finetuning/sft_${envs.MODEL_NAME.replace(/-/g, '_')}.sh`;
    }
    const trainJob_command = `bash ${SH_PATH}`;

    // 生成单个任务的 Shell 脚本
    const oneJobCommand = `
#!/bin/bash

# ===========使用以下信息在百舸控制台创建任务==========
# 任务名称: ${envs.TRAINING_PHASE}-${envs.MODEL_NAME}-ck2mc-dp-train-tp${envs.TP}-pp${envs.PP}-${envs.VERSION}
# 镜像: ${envs.IMAGE}
# 环境变量: CUDA_DEVICE_MAX_CONNECTIONS=1
# 挂载路径: ${envs.MOUNT_PATH}
# 实例数量: ${envs.REPLICAS}
# ================================================

export MODEL_BOS_PATH=${envs.MODEL_BOS_PATH}
export MODEL_NAME=${envs.MODEL_NAME}
export TP=${envs.TP}
export PP=${envs.PP}
export LOAD=${envs.LOAD}
export SAVE=${envs.CHECKPOINT_PATH}
export TOKENIZER_PATH=${envs.TOKENIZER_PATH}
export DATASET_BOS_PATH=${envs.DATASET_BOS_PATH}
export INPUT_DATA=${envs.INPUT_DATA}
export OUTPUT_PREFIX=${envs.OUTPUT_PREFIX}
export OUTPUT_PATH=${envs.OUTPUT_PREFIX}
export DATA_PATH=${envs.DATA_PATH}
export DATA_CACHE_PATH=${envs.DATA_CACHE_PATH}
export JSON_KEYS=${envs.JSON_KEYS}
export CHAT_TEMPLATE=${CHAT_TEMPLATE}
export CHECKPOINT_PATH=${envs.CHECKPOINT_PATH}
export CUDA_DEVICE_MAX_CONNECTIONS=1

${ckJob_command.replace('#!/bin/bash', '')}
${dpJob_command.replace('#!/bin/bash', '')}
${trainJob_command}
`.trim();

    // console.log('=============================\n');
    // console.log('任务执行命令：', oneJobCommand);
    // console.log('\n=============================');

    return oneJobCommand
}

export function generateConvertCheckpoint(aiakJobConfig: any): string {
    const envs = generateParameter(aiakJobConfig)
    const command = getCommand('job1_convert_checkpoint');

    const ck_envs = `
export MODEL_BOS_PATH=${envs.MODEL_BOS_PATH}
export MODEL_NAME=${envs.MODEL_NAME}
export TP=${envs.TP}
export PP=${envs.PP}
export LOAD=${envs.LOAD}
export SAVE=${envs.CHECKPOINT_PATH}
    `

    // 生成单个任务的 Shell 脚本
    const oneJobCommand = `
#!/bin/bash

# ===========使用以下信息在百舸控制台创建任务==========
# 任务名称: ${envs.CK_JOB_NAME}
# 镜像: ${envs.IMAGE}
# 挂载路径: ${envs.MOUNT_PATH}
# 实例数量: 1
# ================================================

${ck_envs}

${command.replace('#!/bin/bash', '')}
`.trim();

    // console.log('=============================\n');
    // console.log('任务执行命令：', oneJobCommand);
    // console.log('\n=============================');

    return oneJobCommand
}

export function generatePreprocessData(aiakJobConfig: any): string {

    const envs = generateParameter(aiakJobConfig)

    const shPath = `job2_${envs.TRAINING_PHASE}_data_preprocess`;
    const command = getCommand(shPath);

    let dp_envs = '';
    if (envs.TRAINING_PHASE === 'sft') {
        dp_envs = `
export DATASET_BOS_PATH=${envs.DATASET_BOS_PATH}
export TOKENIZER_PATH=${envs.TOKENIZER_PATH}
export INPUT_DATA=${envs.INPUT_DATA}
export OUTPUT_PATH=${envs.OUTPUT_PREFIX}
export CHAT_TEMPLATE=${envs.CHAT_TEMPLATE}
        `

    } else {
        dp_envs = `
export DATASET_BOS_PATH=${envs.DATASET_BOS_PATH}
export TOKENIZER_PATH=${envs.TOKENIZER_PATH}
export INPUT_DATA=${envs.INPUT_DATA}
export OUTPUT_PREFIX=${envs.OUTPUT_PREFIX}
export JSON_KEYS=${envs.JSON_KEYS}
        `
    }

    // 生成单个任务的 Shell 脚本
    const oneJobCommand = `
#!/bin/bash

# ===========使用以下信息在百舸控制台创建任务==========
# 任务名称: ${envs.DP_JOB_NAME}
# 镜像: ${envs.IMAGE}
# 挂载路径: ${envs.MOUNT_PATH}
# 实例数量: 1
# ================================================

${dp_envs}
${command.replace('#!/bin/bash', '')}
`.trim();

    // console.log('=============================\n');
    // console.log('任务执行命令：', oneJobCommand);
    // console.log('\n=============================');

    return oneJobCommand
}

export interface AiakTrainingJob {
    name: string,
    command: string,
    image: string,
    replicas: string,
    mountPath: string
}

export function generateTraining(aiakJobConfig: any): AiakTrainingJob {
    const envs = generateParameter(aiakJobConfig)

    let SH_PATH = `/workspace/AIAK-Training-LLM/examples/${envs.MODEL_NAME.split('-')[0]}/pretrain/pretrain_${envs.MODEL_NAME.replace(/-/g, '_')}.sh`;
    if (envs.TRAINING_PHASE === 'sft') {
        SH_PATH = `/workspace/AIAK-Training-LLM/examples/${envs.MODEL_NAME.split('-')[0]}/finetuning/sft_${envs.MODEL_NAME.replace(/-/g, '_')}.sh`;
    }

    let train_envs = ''

    if (envs.TRAINING_PHASE === 'sft') {
        train_envs = `
export DATA_PATH=${envs.INPUT_DATA}
export DATA_CACHE_PATH=${envs.DATA_CACHE_PATH}
export TOKENIZER_PATH=${envs.TOKENIZER_PATH}
export CHECKPOINT_PATH=${envs.CHECKPOINT_PATH}
export CUDA_DEVICE_MAX_CONNECTIONS=1
       `;
    } else {
        train_envs = `
export DATA_PATH=${envs.DATA_PATH}
export TOKENIZER_PATH=${envs.TOKENIZER_PATH}
export CHECKPOINT_PATH=${envs.CHECKPOINT_PATH}
export CUDA_DEVICE_MAX_CONNECTIONS=1
        `;
    }

    // 生成单个任务的 Shell 脚本
    const command = `
#!/bin/bash

# ===========使用以下信息在百舸控制台创建任务==========
# 任务名称: ${envs.TRAIN_JOB_NAME}
# 镜像: ${envs.IMAGE}
# 环境变量: CUDA_DEVICE_MAX_CONNECTIONS=1
# 挂载路径: ${envs.MOUNT_PATH}
# 实例数量: ${envs.REPLICAS}
# ================================================

${train_envs}

bash ${SH_PATH}
`.trim();

    // console.log('=============================\n');
    // console.log('任务执行命令：', command);
    // console.log('\n=============================');

    return {
        name: envs.TRAIN_JOB_NAME,
        command,
        image: envs.IMAGE,
        replicas: envs.REPLICAS,
        mountPath: envs.MOUNT_PATH
    }
}

// 生成 AIAK 参数，备份
export function generateAiakAllInOneParameter(aiakJobConfig: any): string {

    const aiakJobInfo: any = aiakJobConfig;

    const VERSION = aiakJobInfo['VERSION'];
    const DATASET_NAME = aiakJobInfo['DATASET_NAME'];
    const MODEL_NAME = aiakJobInfo['MODEL_NAME'];
    let TP = aiakJobInfo['TP'];
    let PP = aiakJobInfo['PP'];
    const JSON_KEYS = aiakJobInfo['JSON_KEYS'] || '';
    const IMAGE = aiakJobInfo['IMAGE'];
    const TRAINING_PHASE = aiakJobInfo['TRAINING_PHASE'];
    const REPLICAS = aiakJobInfo['REPLICAS'] || models[MODEL_NAME][3];
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

    const CK_JOB_NAME = `${TRAINING_PHASE}-${MODEL_NAME}-ck2mc-tp${TP}-pp${PP}-${VERSION}`;
    const DP_JOB_NAME = `${TRAINING_PHASE}-${MODEL_NAME}-dp-${VERSION}`;
    const TRAIN_JOB_NAME = `${TRAINING_PHASE}-${MODEL_NAME}-train-tp${TP}-pp${PP}-${VERSION}`;

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

# 任务名称: ${MODEL_NAME}-ck2mc-dp-train-${VERSION}
# 镜像: ${IMAGE}
# 环境变量: CUDA_DEVICE_MAX_CONNECTIONS=1
# 挂载路径: ${MOUNT_PATH}
# 实例数量: ${REPLICAS}

MODEL_BOS_PATH=${MODEL_BOS_PATH}
MODEL_NAME=${MODEL_NAME}
TP=${TP}
PP=${PP}
LOAD=${LOAD}
SAVE=${CHECKPOINT_PATH}
TOKENIZER_PATH=${TOKENIZER_PATH}
DATASET_BOS_PATH=${DATASET_BOS_PATH}
INPUT_DATA=${INPUT_DATA}
OUTPUT_PREFIX=${OUTPUT_PREFIX}
OUTPUT_PATH=${OUTPUT_PREFIX}
DATA_PATH=${DATA_PATH}
DATA_CACHE_PATH=${DATA_CACHE_PATH}
JSON_KEYS=${JSON_KEYS}
CHAT_TEMPLATE=${CHAT_TEMPLATE}
CHECKPOINT_PATH=${CHECKPOINT_PATH}

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
