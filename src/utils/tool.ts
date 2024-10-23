import * as fs from 'fs';
import { getScript } from './traing'

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

export interface TrainingParameters {
    basicInfo: {
        "model-name": string;
        replicas: number;
        "data-model": string;
        "auto-model": boolean;
    };
    dataParams: {
        "data-path": string;
        "split"?: string; // 可选
        "train-data-path"?: string; // 可选
        "valid-data-path"?: string; // 可选
        "test-data-path"?: string; // 可选
        "data-cache-path"?: string; // 可选
        "no-mmap-bin-files"?: boolean; // 可选
        "mock-data"?: boolean; // 可选
        "dataloader-type"?: string; // 可选
        "num-workers"?: number; // 可选
        "tokenizer-type": string;
        "hf-tokenizer-path"?: string; // 可选
        "use-fast-tokenizer"?: boolean; // 可选
        "tokenizer-model"?: string; // 可选
        "seq-length": number;
    };
    modelConfig: {
        "model-name": string;
        "num-layers"?: number; // 可选
        "hidden-size"?: number; // 可选
        "ffn-hidden-size"?: number; // 可选
        "num-attention-heads"?: number; // 可选
        "group-query-attention"?: boolean; // 可选
        "num-query-groups"?: number; // 可选
        "position-embedding-type": string;
        "max-position-embeddings"?: number; // 可选
        "rotary-interleaved"?: boolean; // 可选
        "rotary-percent"?: number; // 可选
        "rotary-base"?: number; // 可选
        "rotary-seq-len-interpolation-factor"?: number; // 可选
        "attention-dropout"?: number; // 可选
        "hidden-dropout"?: number; // 可选
        "normalization"?: string; // 可选
        "norm-epsilon"?: number; // 可选
        "use-normhead"?: boolean; // 可选
        "swiglu"?: boolean; // 可选
        "disable-bias-linear"?: boolean; // 可选
        "add-qkv-bias"?: boolean; // 可选
        "make-vocab-size-divisible-by"?: number; // 可选
        "untie-embeddings-and-output-weights"?: boolean; // 可选
    };
    initialization: {
        "training-phase": "pretrain" | "sft";
        "seed"?: number; // 可选
        "data-parallel-random-init"?: boolean; // 可选
        "init-method-std"?: number; // 可选
        "init-method-xavier-uniform"?: boolean; // 可选
    };
    optimizerConfig: {
        "lr": number | undefined; // 必选
        "min-lr"?: number; // 可选
        "lr-decay-style": string; // 必选
        "lr-decay-iters"?: number; // 可选
        "lr-warmup-fraction"?: number; // 可选
        "optimizer"?: string; // 可选
        "weight-decay": number; // 必选
        "clip-grad"?: number; // 可选
        "adam-beta1"?: number; // 可选
        "adam-beta2"?: number; // 可选
        "adam-eps"?: number; // 可选
        "sgd-momentum"?: number; // 可选
    };
    checkpointConfig: {
        "load"?: string; // 可选
        "no-load-optim"?: boolean; // 可选
        "no-load-rng"?: boolean; // 可选
        "save"?: string; // 可选
        "save-interval"?: number; // 可选
        "no-save-optim"?: boolean; // 可选
        "no-save-rng"?: boolean; // 可选
        "ckpt-step"?: number; // 可选
    };
    mixedPrecision: {
        "fp16"?: boolean; // 可选
        "bf16"?: boolean; // 可选
        "loss-scale"?: number; // 可选
        "initial-loss-scale"?: number; // 可选
        "min-loss-scale"?: number; // 可选
        "loss-scale-window"?: number; // 可选
        "accumulate-allreduce-grads-in-fp32"?: boolean; // 可选
    };
    distributedParams: {
        "tensor-model-parallel-size"?: number; // 可选
        "pipeline-model-parallel-size"?: number; // 可选
        "num-layers-per-virtual-pipeline-stage"?: number; // 可选
        "no-overlap-p2p-communication"?: boolean; // 可选
        "distributed-backend"?: string; // 可选
        "distributed-timeout-minutes"?: number; // 可选
        "use-distributed-optimizer"?: boolean; // 可选
        "overlap-grad-reduce"?: boolean; // 可选
        "overlap-param-gather"?: boolean; // 可选
        "context-parallel-size"?: number; // 可选
        "expert-model-parallel-size"?: number; // 可选
        "tp-comm-overlap"?: boolean; // 可选
    };
    memoryOptimization: {
        "sequence-parallel"?: boolean; // 可选
        "recompute-activations"?: boolean; // 可选
        "recompute-granularity"?: string; // 可选
        "recompute-method"?: string; // 可选
        "recompute-num-layers"?: number; // 可选
        "distribute-saved-activations"?: boolean; // 可选
        "offload-optimizer"?: string; // 可选
        "offload-optimizer-percent"?: number; // 可选
        "no-overlap-offload-optimizer"?: boolean; // 可选
        "cpu-adam-threads"?: number; // 可选
    };
    moeParams: {
        "moe-router-load-balancing-type"?: string; // 可选
        "moe-router-topk"?: number; // 可选
        "moe-grouped-gemm"?: boolean; // 可选
        "moe-aux-loss-coeff"?: number; // 可选
        "moe-z-loss-coeff"?: number; // 可选
        "moe-input-jitter-eps"?: number; // 可选
        "moe-token-dropping"?: boolean; // 可选
        "moe-token-dispatcher-type"?: string; // 可选
    };
    sftParams: {
        "chat-template": string; // 必选
        "sft-dataset-config"?: string; // 可选
        "sft-dataset"?: string; // 可选
        "sft-train-dataset"?: string; // 可选
        "sft-valid-dataset"?: string; // 可选
        "sft-test-dataset"?: string; // 可选
        "sft-data-streaming"?: boolean; // 可选
        "streaming-buffer-size"?: number; // 可选
        "sft-num-preprocess-workers"?: number; // 可选
        "train-on-prompt"?: boolean; // 可选
        "variable-seq-lengths"?: boolean; // 可选
        "sft-data-mix-strategy"?: string; // 可选
        "is-tokenized-data"?: boolean; // 可选
        "packing-sft-data"?: boolean; // 可选
    };
    otherTrainingParams: {
        "micro-batch-size"?: number; // 可选
        "global-batch-size": number | undefined; // 必选
        "train-iters": number | undefined; // 必选
        "eval-iters"?: number; // 可选
        "eval-interval"?: number; // 可选
        "log-interval"?: number; // 可选
        "tensorboard-dir"?: string; // 可选
        "timing-log-level"?: number; // 可选
        "timing-log-option"?: string; // 可选
        "tensorboard-log-interval"?: number; // 可选
        "log-timers-to-tensorboard"?: boolean; // 可选
        "log-validation-ppl-to-tensorboard"?: boolean; // 可选
        "wandb-project"?: string; // 可选
        "wandb-exp-name"?: string; // 可选
    };
};

export const getTemplate = () => {

    const data: TrainingParameters = {
        // 基本信息
        basicInfo: {
            "model-name": "llama2-7b",
            replicas: 1,
            "data-model": "proportional-split",
            "auto-model": true,
        },

        // 1）数据参数
        /*
          参数名	取值类型	是否必选	默认值	枚举值	描述
        --data-path	str	是	None	NA	预训练数据集文件路径
        --split	str	否	969, 30, 1	NA	Train/Validate/Test使用数据占比
        --train-data-path	str	否	None	NA	训练集路径，不和--data-path 和--split 共同使用
        --valid-data-path	str	否	None	NA	验证集路径，不和--data-path 和--split 共同使用
        --test-data-path	str	否	None	NA	测试集路径，不和--data-path 和--split 共同使用
        --data-cache-path	str	否	None	NA	存储路径，用于缓存可重用的数据集索引
        --no-mmap-bin-files	bool	否	False	NA	关闭.bin 文件内存映射
        --mock-data	bool	否	False	NA	跳过真实数据读取过程，使用自动生成的模拟数据
        --dataloader-type	str	否	single	single、cyclic	单轮或多轮数据读取
        --num-workers	int	否	2	NA	Dataloader worker进程数目
        --tokenizer-type	str	是	None	NullTokenizer、Llama2Tokenizer、HFTokenizer（推荐）	Tokenizer类型
        --hf-tokenizer-path	str	否	None	NA	huggingface tokenizer路径
        --use-fast-tokenizer	bool	否	False	NA	使用HFTokenizer类型时，指定使用 fast 版本
        --tokenizer-model	str	否	None	NA	使用非HFTokenizer类型时，指定 tokenizer model文件地址
        --seq-length	int	是	None	NA	序列长度
        */
        dataParams: {
            "data-path": "", // --data-path
            "split": "969, 30, 1", // --split
            "train-data-path": "", // --train-data-path
            "valid-data-path": "", // --valid-data-path
            "test-data-path": "", // --test-data-path
            "data-cache-path": "", // --data-cache-path
            "no-mmap-bin-files": false, // --no-mmap-bin-files
            "mock-data": false, // --mock-data
            "dataloader-type": "single", // --dataloader-type
            "num-workers": 2, // --num-workers
            "tokenizer-type": "HFTokenizer", // --tokenizer-type
            "hf-tokenizer-path": "", // --hf-tokenizer-path
            "use-fast-tokenizer": false, // --use-fast-tokenizer
            "tokenizer-model": "", // --tokenizer-model
            "seq-length": 2048, // --seq-length
        },

        // 2）模型组网参数
        /*
      参数名	取值类型	是否必选	默认值	枚举值	model-name为具体架构时是否自动配置	描述
      --num-layers	int	是	None	NA	是	层数
      --hidden-size	int	是	None	NA	是	隐层维数
      --ffn-hidden-size	int	否	None	NA	是	FFN隐层维数；
      --num-attention-heads	int	是	None	NA	是	自注意力的head数
      --group-query-attention	bool	否	False	NA	是	使用 GQA
      --num-query-groups	int	否	1	NA	是	GQA 中，Query 头分组数目，每组共享KV头
      --position-embedding-type	string	是	learned_absolute	learned_ab、olute、rope、alibi	是	Position Embedding类型
      --max-position-embeddings	int	是	None	NA	否	使用 learned_absolute 类型时，指定位置 Embedding 最大序列长度
      --rotary-interleaved	bool	否	False	NA	是	使用 Interleaved Rotary Embedding
      --rotary-percent	float	否	1.0	NA	否	Rotary dimension百分比
      --rotary-base	int	否	10000	NA	否	Rotary Base 数值
      --rotary-seq-len-interpolation-factor	int	否	None	NA	否	序列长度线性插值因子，用于 rotary embedding；
      --attention-dropout	float	否	0.1	NA	是	Post attention dropout概率
      --hidden-dropout	float	否	0.1	NA	是	Hidden state transformer dropout概率
      --normalization	string	否	LayerNorm	LayerNorm、RMSNorm	是	normalization类型
      --norm-epsilon	float	否	1e-5	NA	否	指定 Layernorm 或 Rmsnorm 中的 Epsilon 数值
      --use-normhead	bool	否	False	NA	是	baichuan 模型中，部分尺寸会使用normhead
      --swiglu	bool	否	False	NA	是	使用 swiglu 激活函数
      --disable-bias-linear	bool	否	False	NA	是	Linear 层中不添加 bias
      --add-qkv-bias	bool	否	False	NA	是	仅在QKV Linear中添加 bias
      --make-vocab-size-divisible-by	int	否	128	NA	否	Pad Vocab 大小可以被指定数值整除
      --untie-embeddings-and-output-weights	bool	否	False	NA	是	取消 Embedding 和 Ouput 层的权重共享
        */
        modelConfig: {
            // 自动组网参数
            "model-name": "llama2-7b", // --model-name

            // 详细组网参数
            "num-layers": undefined, // --num-layers
            "hidden-size": undefined, // --hidden-size
            "ffn-hidden-size": undefined, // --ffn-hidden-size
            "num-attention-heads": undefined, // --num-attention-heads
            "group-query-attention": false, // --group-query-attention
            "num-query-groups": 1, // --num-query-groups
            "position-embedding-type": "learned_absolute", // --position-embedding-type
            "max-position-embeddings": undefined, // --max-position-embeddings
            "rotary-interleaved": false, // --rotary-interleaved
            "rotary-percent": 1.0, // --rotary-percent
            "rotary-base": 10000, // --rotary-base
            "rotary-seq-len-interpolation-factor": undefined, // --rotary-seq-len-interpolation-factor
            "attention-dropout": 0.1, // --attention-dropout
            "hidden-dropout": 0.1, // --hidden-dropout
            "normalization": "LayerNorm", // --normalization
            "norm-epsilon": 1e-5, // --norm-epsilon
            "use-normhead": false, // --use-normhead
            "swiglu": false, // --swiglu
            "disable-bias-linear": false, // --disable-bias-linear
            "add-qkv-bias": false, // --add-qkv-bias
            "make-vocab-size-divisible-by": 128, // --make-vocab-size-divisible-by
            "untie-embeddings-and-output-weights": false, // --untie-embeddings-and-output-weights
        },

        // 3）初始化参数
        /*
      参数名	取值类型	是否必选	默认值	枚举值	描述
      --seed	int	否	1234	NA	随机种子，用于python、numpy、pytorch、cuda 等
      --data-parallel-random-init	bool	否	False	NA	确保数据并行中不同 Rank 的模型权重随机初始化
      --init-method-std	float	否	0.02	NA	权重初始化时，零均值正态分布的标准差
      --init-method-xavier-uniform	bool	否	False	NA	使用Xqvier 参数初始化方法
        */
        initialization: {
            "training-phase": "sft", // --training-phase
            "seed": 1234, // --seed
            "data-parallel-random-init": false, // --data-parallel-random-init
            "init-method-std": 0.02, // --init-method-std
            "init-method-xavier-uniform": false, // --init-method-xavier-uniform
        },

        // 4）优化器和学习率参数
        /*
      参数名	取值类型	是否必选	默认值	枚举值	描述
      --lr	float	是	None	NA	学习率
      --min-lr	fload	否	0.0	NA	学习率最小值
      --lr-decay-style	str	是	linear	constant、linear、cosine、inverse-square-root	学习率衰减方式
      --lr-decay-iters	int	否	None	NA	指定迭代次数用于学习率衰减
      --lr-warmup-fraction	float	否	None	NA	学习率warmup比例
      --optimizer	str	否	adam	adam、sgd	优化器类型
      --weight-decay	float	是	0.01	NA	L2 正则权重衰减系数
      --clip-grad	float	否	1.0	NA	梯度clipping
      --adam-beta1	float	否	0.9	NA	adam beta1系数
      --adam-beta2	float	否	0.999	NA	adam beta2系数
      --adam-eps	float	否	1e-8	NA	adam eps项
      --sgd-momentum	fload	否	0.9	NA	sgd 优化器动量因子
        */
        optimizerConfig: {
            "lr": undefined, // --lr
            "min-lr": 0.0, // --min-lr
            "lr-decay-style": "linear", // --lr-decay-style
            "lr-decay-iters": undefined, // --lr-decay-iters
            "lr-warmup-fraction": undefined, // --lr-warmup-fraction
            "optimizer": "adam", // --optimizer
            "weight-decay": 0.01, // --weight-decay
            "clip-grad": 1.0, // --clip-grad
            "adam-beta1": 0.9, // --adam-beta1
            "adam-beta2": 0.999, // --adam-beta2
            "adam-eps": 1e-8, // --adam-eps
            "sgd-momentum": 0.9, // --sgd-momentum
        },

        // 5）Checkpoint 读取和保存参数
        /*
      参数名	取值类型	是否必选	默认值	枚举值	描述
      --load	str	否	None	NA	加载模型的文件夹路径
      --no-load-optim	bool	否	False	NA	不从 checkpoint 中加载优化器状态
      --no-load-rng	bool	否	False	NA	不从 checkpoint 中加载 rng 状态
      --save	str	否	None	NA	保存模型的文件夹路径
      --save-interval	int	否	None	NA	保存模型ckpt的间隔
      --no-save-optim	bool	否	False	NA	不保存优化器状态
      --no-save-rng	bool	否	False	NA	不保存 RNG 状态
      --ckpt-step	int	否	None	NA	指定读取具体 step 的checkpoint
        */
        checkpointConfig: {
            "load": "", // --load
            "no-load-optim": false, // --no-load-optim
            "no-load-rng": false, // --no-load-rng
            "save": "", // --save
            "save-interval": undefined, // --save-interval
            "no-save-optim": false, // --no-save-optim
            "no-save-rng": false, // --no-save-rng
            "ckpt-step": undefined, // --ckpt-step
        },

        // 6）混合精度参数
        /*
      参数名	取值类型	是否必选	默认值	枚举值	描述
      --fp16	bool	否	False	NA	FP16开关
      --bf16	bool	否	False	NA	BF16开关
      --loss-scale	float	否	None	NA	用于 FP16训练，若指定数值，将采用静态 loss 缩放方法，否则将采用动态 loss 缩放
      --initial-loss-scale	float	否	2**32	NA	用于 FP16训练，指定动态 loss 缩放时的初始缩放因子
      --min-loss-scale	float	否	1.0	NA	用于 FP16训练，指定动态 loss 缩放时的最小缩放因子
      --loss-scale-window	float	否	1000	NA	用于 FP16训练，指定动态调整缩放因子的窗口大小
      --accumulate-allreduce-grads-in-fp32	bool	否	False	NA	使用 FP32 进行梯度累积和平均；采用 BF16训练时，默认开启该选项
        */
        mixedPrecision: {
            "fp16": false, // --fp16
            "bf16": false, // --bf16
            "loss-scale": undefined, // --loss-scale
            "initial-loss-scale": 2 ** 32, // --initial-loss-scale
            "min-loss-scale": 1.0, // --min-loss-scale
            "loss-scale-window": 1000, // --loss-scale-window
            "accumulate-allreduce-grads-in-fp32": false, // --accumulate-allreduce-grads-in-fp32
        },

        // 7）分布式参数
        /*
      参数名	取值类型	是否必选	默认值	枚举值	描述
      --tensor-model-parallel-size	int	否	1	NA	张量并行维数
      --pipeline-model-parallel-size	int	否	1	NA	流水并行维数
      --num-layers-per-virtual-pipeline-stage	int	否	None	NA	使用 Interleaved 1F1B 时，指定每个model chunk的层数
      --no-overlap-p2p-communication	bool	否	False	NA	Interleaved pipeline p2p通信隐藏开关
      --distributed-backend	str	否	NCCL	nccl、gloo	指定分布式训练时的通信后端
      --distributed-timeout-minutes	int	否	10	NA	torch.distributed 接口的通信操作超时时间
      --use-distributed-optimizer	bool	否	Fasle	NA	Distributed optimizer开关（ZeRO1）
      --overlap-grad-reduce	bool	否	False	NA	开启梯度reduce-scatter和计算 overlap
      --overlap-param-gather	bool	否	False	NA	开启参数allgather 和 计算 overlap
      --context-parallel-size	int	否	1	NA	Context 序列并行维数
      --expert-model-parallel-size	int	否	1	NA	专家并行维数
      --tp-comm-overlap	bool	否	false	NA	开启 tp 通信和计算 overlap
        */
        distributedParams: {
            "tensor-model-parallel-size": 1, // --tensor-model-parallel-size
            "pipeline-model-parallel-size": 1, // --pipeline-model-parallel-size
            "num-layers-per-virtual-pipeline-stage": undefined, // --num-layers-per-virtual-pipeline-stage
            "no-overlap-p2p-communication": false, // --no-overlap-p2p-communication
            "distributed-backend": "nccl", // --distributed-backend
            "distributed-timeout-minutes": 10, // --distributed-timeout-minutes
            "use-distributed-optimizer": false, // --use-distributed-optimizer
            "overlap-grad-reduce": false, // --overlap-grad-reduce
            "overlap-param-gather": false, // --overlap-param-gather
            "context-parallel-size": 1, // --context-parallel-size
            "expert-model-parallel-size": 1, // --expert-model-parallel-size
            "tp-comm-overlap": false, // --tp-comm-overlap
        },

        // 8）显存策略参数
        /*
      参数名	取值类型	是否必选	默认值	枚举值	描述
      --sequence-parallel	bool	否	False	NA	使用 Tensor 并行时，开启Sequence parallel用于显存优化
      --recompute-activations	bool	否	False	NA	selective 重计算开关
      --recompute-granularity	str	否	None	full、selective	重计算粒度
      --recompute-method	str	否	None	uniform、block	重计算方式
      --recompute-num-layers	int	否	1	NA	重计算层数
      --distribute-saved-activations	bool	否	False	NA	中间值结果按tensor model parallel维度切分开关
      --offload-optimizer	str	否	disabled	disabled、auto、manual	开启optimizer offload功能，指定为auto 时框架自动计算需要 offload 的显存大小
      --offload-optimizer-percent	float	否	1.0	NA	--offload-optimizer=manual时，指定优化器 offload 比例
      --no-overlap-offload-optimizer	bool	否	False	NA	开启optimizer offload功能时，关闭数据传输和计算 overlap
      --cpu-adam-threads	int	否	1	NA	在 CPU 上进行优化器计算时的线程数
        */
        memoryOptimization: {
            "sequence-parallel": false, // --sequence-parallel
            "recompute-activations": false, // --recompute-activations
            "recompute-granularity": undefined, // --recompute-granularity
            "recompute-method": undefined, // --recompute-method
            "recompute-num-layers": 1, // --recompute-num-layers
            "distribute-saved-activations": false, // --distribute-saved-activations
            "offload-optimizer": undefined, // --offload-optimizer
            "offload-optimizer-percent": 1.0, // --offload-optimizer-percent
            "no-overlap-offload-optimizer": false, // --no-overlap-offload-optimizer
            "cpu-adam-threads": 1, // --cpu-adam-threads
        },

        // 9）MoE 训练参数
        /*
      参数名	取值类型	是否必选	默认值	枚举值	描述
      --moe-router-load-balancing-type	string	否	aux_loss	aux_loss、sinkhorn、none	router 负载均衡策略
      --moe-router-topk	int	否	2	NA	每个 token 需要路由的专家数目
      --moe-grouped-gemm	bool	否	False	NA	每个rank 存在多个专家时，使用 grouped gemm加速专家计算
      --moe-aux-loss-coeff	float	否	0.0	NA	aux loss 缩放系数
      --moe-z-loss-coeff	float	否	None	NA	z-loss 缩放系数
      --moe-input-jitter-eps	float	否	None	NA	输入 tensor 添加噪声
      --moe-token-dropping	bool	否	False	NA	暂不支持；用于指定当达到专家容量时是否丢弃 token；
      --moe-token-dispatcher-type	str	否	allgather	allgather、alltoall	token 分发时采用的通信模式
        */
        moeParams: {
            "moe-router-load-balancing-type": "aux_loss", // --moe-router-load-balancing-type
            "moe-router-topk": 2, // --moe-router-topk
            "moe-grouped-gemm": false, // --moe-grouped-gemm
            "moe-aux-loss-coeff": 0.0, // --moe-aux-loss-coeff
            "moe-z-loss-coeff": undefined, // --moe-z-loss-coeff
            "moe-input-jitter-eps": undefined, // --moe-input-jitter-eps
            "moe-token-dropping": false, // --moe-token-dropping
            "moe-token-dispatcher-type": "allgather", // --moe-token-dispatcher-type
        },

        // 10）SFT训练参数
        /*
      参数名	取值类型	是否必选	默认值	枚举值	描述
      --chat-template	str	否	None	alpaca、baichuan、baichuan2、llama2、llama2_zh、llama3、mistral、qwen	对于 SFT 训练，必须传递对话模板
      --sft-dataset-config	str	否	None	NA	数据集配置文件路径
      --sft-dataset	str	否	None	NA	数据集名称，可以传递多个，对应--data-path 中的数据集文件；
      --sft-train-dataset	str	否	None	NA	仅训练的数据集名称，可以传递多个，对应--train-data-path 中的数据集文件。和 --sft-dataset 不能同时使用。
      --sft-valid-dataset	str	否	None	NA	仅验证的数据集名称，可以传递多个，对应--valid-data-path 中的数据集文件。和 --sft-dataset 不能同时使用。
      --sft-test-dataset	str	否	None	NA	仅测试的数据集名称，可以传递多个，对应--test-data-path 中的数据集文件。和 --sft-dataset 不能同时使用。
      --sft-data-streaming	bool	否	False	NA	开启流式数据读取和解析
      --streaming-buffer-size	int	否	16384	NA	streaming 模式下，用于 shuffle 的 buffer size
      --sft-num-preprocess-workers	int	否	None	NA	数据预处理 worker 数目
      --train-on-prompt	bool	否	False	NA	promot 参与训练
      --variable-seq-lengths	bool	否	False	NA	开启变长数据训练；SFT 训练默认会开启变长，无需用户控制；
      --sft-data-mix-strategy	str	否	concat	concat、interleave_under、interleave_over	数据混合策略， 当前采用 huggingface dataset提供的混合策略机制
      --is-tokenized-data	bool	否	False	NA	输入的数据是否已经进行 tokenizer 转换
      --packing-sft-data	bool	否	False	NA	开启数据 packing 训练(本次版本新增参数)
        */
        sftParams: {
            "chat-template": "alpaca", // --chat-template
            "sft-dataset-config": undefined, // --sft-dataset-config
            "sft-dataset": undefined, // --sft-dataset
            "sft-train-dataset": undefined, // --sft-train-dataset
            "sft-valid-dataset": undefined, // --sft-valid-dataset
            "sft-test-dataset": undefined, // --sft-test-dataset
            "sft-data-streaming": false, // --sft-data-streaming
            "streaming-buffer-size": 16384, // --streaming-buffer-size
            "sft-num-preprocess-workers": undefined, // --sft-num-preprocess-workers
            "train-on-prompt": false, // --train-on-prompt
            "variable-seq-lengths": false, // --variable-seq-lengths
            "sft-data-mix-strategy": "concat", // --sft-data-mix-strategy
            "is-tokenized-data": false, // --is-tokenized-data
            "packing-sft-data": false, // --packing-sft-data
        },

        // 11）其他训练参数
        /*
      参数名	取值类型	是否必选	默认值	枚举值	描述
      --micro-batch-size	int	否	None	NA	单次迭代每个rank的batch size
      --global-batch-size	int	是	None	NA	分布式训练全局batch size
      --train-iters	int	是	None	NA	训练的迭代轮数
      --eval-iters	int	否	100	NA	评估的迭代步数
      --eval-interval	int	否	1000	NA	在验证集上进行评估的间隔步数
      --log-interval	int	否	100	NA	日志打印的间隔步数
      --tensorboard-dir	str	否	None	NA	tensorboard 文件写入路径
      --timing-log-level	int	否	0	0/1/2	细粒度指标打印级别
      --timing-log-option	str	否	minmax	max、minmax、all	打印 timing log时，可以选择打印最大值、或最小及最大值、或所有值；
      --tensorboard-log-interval	int	否	1	NA	tensorboard log写入间隔
      --log-timers-to-tensorboard	bool	否	False	NA	开启 timing 指标写入 tensorboard
      --log-validation-ppl-to-tensorboard	bool	否	False	NA	将 validation perplexity 数据写入 tensorboard
      --wandb-project	str	否	''	NA	wandb 项目名称
      --wandb-exp-name	str	否	''	NA	wandb 实验名称
        */
        otherTrainingParams: {
            "micro-batch-size": undefined, // --micro-batch-size
            "global-batch-size": undefined, // --global-batch-size
            "train-iters": undefined, // --train-iters
            "eval-iters": 100, // --eval-iters
            "eval-interval": 1000, // --eval-interval
            "log-interval": 100, // --log-interval
            "tensorboard-dir": undefined, // --tensorboard-dir
            "timing-log-level": 0, // --timing-log-level
            "timing-log-option": "minmax", // --timing-log-option
            "tensorboard-log-interval": 1, // --tensorboard-log-interval
            "log-timers-to-tensorboard": false, // --log-timers-to-tensorboard
            "log-validation-ppl-to-tensorboard": false, // --log-validation-ppl-to-tensorboard
            "wandb-project": "", // --wandb-project
            "wandb-exp-name": "", // --wandb-exp-name
        },

        // 其他可能的字段
        // 根据需要添加更多字段
    }

    return data
}

/**
 * Parses a shell script and extracts training parameters into JSON.
 * @param shellScriptPath Path to the shell script file.
 * @returns Parsed JSON object.
 */
export function parseShellScriptToJSON(shellScript?: string): TrainingParameters {
    const script = shellScript || getScript();
    console.info('解析的脚本：\n', script);
    const params: TrainingParameters = getTemplate();
    const paramsRaw: any = {};
    // 逐行打印script
    const lines = script.split('\n');
    console.log(lines);
    for (let i = 0; i < lines.length; i++) {
        // console.log(i);
        const line = lines[i].trim();
        if (line.startsWith('--')) {
            // console.log(line);
            const [key, value] = line.split(' ');
            paramsRaw[key.replace('--', '')] = value || true;
        }
    }
    console.log(paramsRaw);
    // 从脚本中提取副本数量，示例：# The script needs to be run on at least 1 nodes.
    const replicas = script.match(/least (\d+) nodes/);
    if (replicas) {
        params.basicInfo.replicas = parseInt(replicas[1]);
    }

    // 将 paramsRaw 中对应的值如果在 params 中存在key则赋给 params
    for (const key in params) {
        const value = params[key as keyof TrainingParameters] as any;
        for (const k in value) {
            if (paramsRaw[k]) {
                console.log(key, k, paramsRaw[k]);
                value[k] = paramsRaw[k];
            }
        }
    }
    return params;
}

/**
 * Generates a shell script from a JSON object containing training parameters.
 * @param jsonParams JSON object with training parameters.
 * @param outputScriptPath Path to output the generated shell script.
 */
export function generateShellScriptFromJSON(jsonParams: TrainingParameters) {
    // 排除的参数
    const excludeParams = ['wandb-project', 'wandb-exp-name']
    let script = `#! /bin/bash
# The script needs to be run on at least ${jsonParams.basicInfo.replicas} nodes.

GPUS_PER_NODE=8

# Change for multinode config
MASTER_ADDR=\${MASTER_ADDR:-"localhost"}
MASTER_PORT=\${MASTER_PORT:-"6000"}
NNODES=\${WORLD_SIZE:-"1"}
NODE_RANK=\${RANK:-"0"}

DISTRIBUTED_ARGS=(
    --nproc_per_node $GPUS_PER_NODE
    --nnodes $NNODES
    --node_rank $NODE_RANK
    --master_addr $MASTER_ADDR
    --master_port $MASTER_PORT
)

LOGGING_ARGS=(
    --log-interval 1
    --tensorboard-dir /mnt/cluster/qwen/tensorboard-log/qwen2-72b
    --log-timers-to-tensorboard
)

if [ -n "\${WANDB_API_KEY}" ]; then
    LOGGING_ARGS+=(
        --wandb-project \${WANDB_PROJECT}
        --wandb-exp-name \${WANDB_NAME} 
    )
fi
  `;

    let foot = `torchrun \${DISTRIBUTED_ARGS[@]} /workspace/AIAK-Training-LLM/aiak_training_llm/train.py \\\n    \${LOGGING_ARGS[@]} \\\n`
    // \${MODEL_ARGS[@]} \
    // \${DATA_ARGS[@]} \
    // \${TRAINING_ARGS[@]} \
    // \${MODEL_PARALLEL_ARGS[@]} \
    // \${LOGGING_ARGS[@]}

    for (const [key, args] of Object.entries(jsonParams)) {

        if (key !== 'basicInfo') {
            script += `\n${key}=(`;
            for (const [argKey, argValue] of Object.entries(args)) {
                if (argValue && !excludeParams.includes(argKey)) {
                    script += `\n    --${argKey}`;
                    if (argValue !== true) {
                        script += ` ${argValue}`;
                    }
                }
            }
            script += `\n)\n`;

            foot += `    \${${key}[@]} \\\n`;
        }

    }

    script += '\n' + foot;

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
    console.info('生成的脚本：\n', script);
    return script;
}
