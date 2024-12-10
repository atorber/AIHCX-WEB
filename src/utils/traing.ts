export const getScript = () => {
    const data = `
    #! /bin/bash
# The script needs to be run on at least 4 nodes.

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

MODEL_ARGS=(
    --model-name qwen2-72b
    --rotary-base 100000000
    --rotary-seq-len-interpolation-factor 1
)

DATA_ARGS=(
    --tokenizer-type HFTokenizer
    --hf-tokenizer-path /mnt/cluster/qwen/Qwen2-72B-HF
    --eod-mask-loss
    --data-path /mnt/cluster/qwen/qwen2_data/pile-qwen_text_document
    --split 99,1,0
)

TRAINING_ARGS=(
    --training-phase pretrain
    --seq-length 4096
    --max-position-embeddings 32768
    --init-method-std 0.006
    --micro-batch-size 1
    --global-batch-size 2048
    --lr 1.0e-5
    --min-lr 1.0e-6
    --clip-grad 1.0
    --weight-decay 0.1
    --optimizer adam
    --adam-beta1 0.9
    --adam-beta2 0.95
    --adam-eps 1e-08
    --norm-epsilon 1e-6
    --train-iters 50000
    --lr-decay-iters 500000
    --lr-decay-style linear
    --lr-warmup-iters 500
    --initial-loss-scale 65536
    --bf16
    --accumulate-allreduce-grads-in-fp32
    --load /mnt/cluster/qwen/Qwen2_72B_mcore_tp8pp4
    --save /mnt/cluster/qwen/Qwen2_72B_mcore_tp8pp4
    --save-interval 5000
    --eval-interval 1000
    --eval-iters 10
)

MODEL_PARALLEL_ARGS=(
    --tensor-model-parallel-size 8
    --pipeline-model-parallel-size 4
    --use-distributed-optimizer
    --overlap-grad-reduce
    --overlap-param-gather
    --distributed-backend nccl
    --sequence-parallel
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

torchrun /workspace/AIAK-Training-LLM/aiak_training_llm/train.py \
    \${MODEL_ARGS[@]} \
    \${DATA_ARGS[@]} \
    \${TRAINING_ARGS[@]} \
    \${MODEL_PARALLEL_ARGS[@]} \
    \${LOGGING_ARGS[@]}
    `
    return data.toString()
}