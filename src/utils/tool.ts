import * as fs from 'fs';

/**
 * 将 PascalCase 或 camelCase 转换为 kebab-case
 * @param str - 要转换的字符串
 * @returns 转换后的 kebab-case 字符串
 */
export function camelToKebab(str: string): string {
    return str
        // 在小写字母或数字后跟大写字母的位置插入一个连字符
        .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
        // 处理连续大写字母的情况，如 "XMLHttpRequest" -> "xml-http-request"
        .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
        .toLowerCase();
}

/**
 * 将 kebab-case 转换为 PascalCase
 * @param str - 要转换的字符串
 * @returns 转换后的 PascalCase 字符串
 */
export function kebabToCamel(str: string): string {
    return str
        // 按连字符分割字符串
        .split('-')
        // 将每个单词的首字母大写，其余字母小写
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        // 拼接成一个整体
        .join('');
}

// 示例使用
// const pascalCase = "TrainDataPath";
// const kebabCase = camelToKebab(pascalCase);
// console.log(kebabCase); // 输出: train-data-path

// const convertedPascal = kebabToCamel(kebabCase);
// console.log(convertedPascal); // 输出: TrainDataPath

// scriptConverter.ts

interface TrainingParameters {
    MODEL_ARGS?: { [key: string]: string };
    DATA_ARGS?: { [key: string]: string };
    TRAINING_ARGS?: { [key: string]: string };
    DISTRIBUTED_ARGS?: { [key: string]: string };
    MODEL_PARALLEL_ARGS?: { [key: string]: string };
    LOGGING_ARGS?: { [key: string]: string };
}

/**
 * Parses a shell script and extracts training parameters into JSON.
 * @param shellScriptPath Path to the shell script file.
 * @returns Parsed JSON object.
 */
export function parseShellScriptToJSON(shellScriptPath: string): TrainingParameters {
    const script = fs.readFileSync(shellScriptPath, 'utf-8');
    const params: TrainingParameters = {};

    const arrayRegex = /(\w+)=$([^)]+)$/g;
    let match: RegExpExecArray | null;

    while ((match = arrayRegex.exec(script)) !== null) {
        const varName = match[1];
        const varValues = match[2].split('\n').join(' ').trim().split(/\s+/);

        const args: { [key: string]: string } = {};
        for (let i = 0; i < varValues.length; i++) {
            const item = varValues[i];
            if (item.startsWith('--')) {
                const key = item.replace(/^--/, '');
                const nextItem = varValues[i + 1];
                if (nextItem && !nextItem.startsWith('--')) {
                    args[key] = nextItem;
                    i++;
                } else {
                    args[key] = "true"; // Flags without values
                }
            }
        }

        params[varName as keyof TrainingParameters] = args;
    }

    return params;
}

/**
 * Generates a shell script from a JSON object containing training parameters.
 * @param jsonParams JSON object with training parameters.
 * @param outputScriptPath Path to output the generated shell script.
 */
export function generateShellScriptFromJSON(jsonParams: TrainingParameters, outputScriptPath: string) {
    let script = `#! /bin/bash
  
  MEGATRON_PATH=\${MEGATRON_PATH:-"/workspace/AIAK-Megatron"}
  AIAK_TRAINING_PATH=\${AIAK_TRAINING_PATH:-"/workspace/AIAK-Training-LLM"}
  
  DATA_PATH=\${DATA_PATH:-"/mnt/cluster/qwen/qwen2_data/pile-qwen_text_document"}
  
  TOKENIZER_PATH=\${TOKENIZER_PATH:-"/mnt/cluster/qwen/Qwen2-72B-HF"}
  
  CHECKPOINT_PATH=\${CHECKPOINT_PATH:-"/mnt/cluster/qwen/Qwen2_72B_mcore_tp8pp4"}
  
  TENSORBOARD_PATH=\${TENSORBOARD_PATH:-"/mnt/cluster/qwen/tensorboard-log/qwen2-72b"}
  
  GPUS_PER_NODE=8
  
  # Change for multinode config
  MASTER_ADDR=\${MASTER_ADDR:-"localhost"}
  MASTER_PORT=\${MASTER_PORT:-"6000"}
  NNODES=\${WORLD_SIZE:-"1"}
  NODE_RANK=\${RANK:-"0"}
  
  `;

    for (const [key, args] of Object.entries(jsonParams)) {
        script += `\n${key}=(`;
        for (const [argKey, argValue] of Object.entries(args)) {
            script += `\n    --${argKey}`;
            if (argValue !== "true") {
                script += ` ${argValue}`;
            }
        }
        script += `\n)\n`;
    }

    script += `\nPYTHONPATH=$MEGATRON_PATH:$AIAK_TRAINING_PATH:$PYTHONPATH \\\n    torchrun \${DISTRIBUTED_ARGS[@]} \\\n    \$AIAK_TRAINING_PATH/aiak_training_llm/train.py \\\n`;

    const paramOrder = [
        "MODEL_ARGS",
        "DATA_ARGS",
        "TRAINING_ARGS",
        "MODEL_PARALLEL_ARGS",
        "LOGGING_ARGS",
    ];

    paramOrder.forEach((param) => {
        if (jsonParams[param as keyof TrainingParameters]) {
            script += `    \${${param}[@]} \\\n`;
        }
    });

    // Remove the trailing backslash and newline
    script = script.trimEnd().replace(/\\$/, '');

    fs.writeFileSync(outputScriptPath, script, 'utf-8');
    console.log(`Shell script generated at ${outputScriptPath}`);
}

// Example Usage:
 
// Parsing shell script to JSON
// const shellScriptPath = 'train.sh'; // Path to your shell script
// const trainingParams = parseShellScriptToJSON(shellScriptPath);
// console.log("Parsed JSON:");
// console.log(JSON.stringify(trainingParams, null, 2));

// // Generating shell script from JSON
// const outputScriptPath = 'generated_train.sh';
// generateShellScriptFromJSON(trainingParams, outputScriptPath);