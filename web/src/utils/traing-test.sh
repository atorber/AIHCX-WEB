#! /bin/bash
# The script needs to be run on at least 4 nodes.

GPUS_PER_NODE=8

# Change for multinode config
MASTER_ADDR=${MASTER_ADDR:-"localhost"}
MASTER_PORT=${MASTER_PORT:-"6000"}
NNODES=${WORLD_SIZE:-"1"}
NODE_RANK=${RANK:-"0"}

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

if [ -n "${WANDB_API_KEY}" ]; then
    LOGGING_ARGS+=(
        --wandb-project ${WANDB_PROJECT}
        --wandb-exp-name ${WANDB_NAME} 
    )
fi
  
dataParams=(
    --data-path /mnt/cluster/qwen/qwen2_data/pile-qwen_text_document
    --split 99,1,0
    --dataloader-type single
    --num-workers 2
    --tokenizer-type HFTokenizer
    --hf-tokenizer-path /mnt/cluster/qwen/Qwen2-72B-HF
    --seq-length 4096
)

modelConfig=(
    --model-name qwen2-72b
    --num-query-groups 1
    --position-embedding-type learned_absolute
    --max-position-embeddings 32768
    --rotary-percent 1
    --rotary-base 100000000
    --rotary-seq-len-interpolation-factor 1
    --attention-dropout 0.1
    --hidden-dropout 0.1
    --normalization LayerNorm
    --norm-epsilon 1e-6
    --make-vocab-size-divisible-by 128
)

initialization=(
    --training-phase pretrain
    --seed 1234
    --init-method-std 0.006
)

optimizerConfig=(
    --lr 0.00001
    --min-lr 0.000001
    --lr-decay-style linear
    --lr-decay-iters 500000
    --optimizer adam
    --weight-decay 0.1
    --clip-grad 1
    --adam-beta1 0.9
    --adam-beta2 0.95
    --adam-eps 1e-8
    --sgd-momentum 0.9
)

checkpointConfig=(
    --load /mnt/cluster/qwen/Qwen2_72B_mcore_tp8pp4
    --save /mnt/cluster/qwen/Qwen2_72B_mcore_tp8pp4
    --save-interval 5000
)

mixedPrecision=(
    --bf16
    --initial-loss-scale 65536
    --min-loss-scale 1
    --loss-scale-window 1000
    --accumulate-allreduce-grads-in-fp32
)

distributedParams=(
    --tensor-model-parallel-size 8
    --pipeline-model-parallel-size 4
    --distributed-backend nccl
    --distributed-timeout-minutes 10
    --use-distributed-optimizer
    --overlap-grad-reduce
    --overlap-param-gather
    --context-parallel-size 1
    --expert-model-parallel-size 1
)

memoryOptimization=(
    --sequence-parallel
    --recompute-num-layers 1
    --offload-optimizer-percent 1
    --cpu-adam-threads 1
)

moeParams=(
    --moe-router-load-balancing-type aux_loss
    --moe-router-topk 2
    --moe-token-dispatcher-type allgather
)

sftParams=(
    --chat-template alpaca
    --streaming-buffer-size 16384
    --sft-data-mix-strategy concat
)

otherTrainingParams=(
    --micro-batch-size 1
    --global-batch-size 2048
    --train-iters 50000
    --eval-iters 10
    --eval-interval 1000
    --log-interval 1
    --tensorboard-dir /mnt/cluster/qwen/tensorboard-log/qwen2-72b
    --timing-log-option minmax
    --tensorboard-log-interval 1
    --log-timers-to-tensorboard
)

torchrun ${DISTRIBUTED_ARGS[@]} /workspace/AIAK-Training-LLM/aiak_training_llm/train.py \
    ${LOGGING_ARGS[@]} \
    ${dataParams[@]} \
    ${modelConfig[@]} \
    ${initialization[@]} \
    ${optimizerConfig[@]} \
    ${checkpointConfig[@]} \
    ${mixedPrecision[@]} \
    ${distributedParams[@]} \
    ${memoryOptimization[@]} \
    ${moeParams[@]} \
    ${sftParams[@]} \
    ${otherTrainingParams[@]} 