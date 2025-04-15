
# 需求描述

从页面html中提取相应信息生成CLI命令

# 命令行工具参数说明

```
# 直接传参方式创建任务
aihc job create [flags]

flags:
      --code-url string               代码URL,使用代码上传命令返回的URL
      --code-dir string               代码在容器中的挂载路径，默认为 /workspace
      --command string                指定训练任务的入口命令 (与--script-file二选一)
      --ds-mountpath string           数据源挂载路径
      --ds-name string                数据源名称
      --ds-type string                数据源类型
      --enable-bccl                   是否启用BCCL,默认false
      --enable-fault-tolerance        是否启用容错功能,默认false
      --enable-rdma                   是否启用RDMA,默认false
      --env strings                   环境变量 (key=value)
      --fault-tolerance-args string   容错功能的详细参数
      --framework string              任务框架类型 (default "pytorch")
      --gpu strings                   GPU资源 (type=count)
  -h, --help                          help for create
      --host-network                  是否启用主机网络,默认false
      --image string                  容器镜像
  -f, --job-file strings              任务配置文件路径json/yaml
      --label strings                 标签 (key=value)
      --local-code string             本地代码路径，创建任务时会先上传代码
      --name string                   任务名称
  -p, --pool string                   资源池ID (如未指定则使用配置文件中的默认值)
      --priority string               任务优先级 (low/normal/high) (default "normal")
      --privileged                    是否启用特权模式,默认false
      --replicas int32                任务副本数 (default 1)
      --script-file string            命令脚本的路径，以脚本的方式指定训练任务的入口命令 (与--command二选一)

```

# 命令示例

```
aihc job create --local-code Aihc   --name cli-codeupload-test   --image registry.baidubce.com/inf-qa/nginx:latest   --framework PyTorchJob   --command "sleep 1d"   --replicas 4   --privileged=true   --fault-tolerance-args="--enable-replace=true --enable-hang-detection=true --hang-detection-log-timeout-minutes=7 --hang-detection-startup-toleration-minutes=15 --hang-detection-stack-timeout-minutes=3 --max-num-of-unconditional-retry=2 --unconditional-retry-observe-seconds=3600 --custom-log-patterns=timeout1 --custom-log-patterns=timeout2 --enable-use-nodes-of-last-job=true --enable-checkpoint-migration=true --internal-fault-tolerance-alarm-phone=10086,10010"   --priority high   --enable-bccl=false  
  --enable-fault-tolerance=true  
  --local-code /codeDir/file --code-dir /workspace
  -p cce-cm1jjxrq
```

# 格式化请求参数

```
{
    "name": "test-api-llama2-7b-4",
    "queue": "default",
    "jobFramework": "PyTorchJob",
    "jobSpec": {
        "image": "registry.baidubce.com/aihc-aiak/aiak-megatron:ubuntu20.04-cu11.8-torch1.14.0-py38_v1.2.7.12_release",
        "imageConfig": {
            "username": "",
            "password": ""
        },
        "replicas": 1,
        "resources": [
            {
                "name": "baidu.com/a800_80g_cgpu",
                "quantity": 8
            }
        ],
        "command": "#! /bin/bash",
        "envs": [
            {
                "name": "CUDA_DEVICE_MAX_CONNECTIONS",
                "value": "1"
            }
        ],
        "enableRDMA": true,
        "hostNetwork": false
    },
    "faultTolerance": false,
    "labels": [
        {
            "key": "123",
            "value": "222"
        }
    ],
    "priority": "normal",
    "datasources": [
        {
            "type": "pfs",
            "name": "pfs-7xWeAt",
            "sourcePath": "/",
            "mountPath": "/mnt/cluster"
        }
    ],
    "enableBccl": false,
    "faultToleranceConfig": {
        "enabledHangDetection": false,
        "hangDetectionTimeoutMinutes": 5
    },
    "tensorboardConfig": {
        "enableTensorboard": false,
        "logPath": "/"
    }
}
```

# 任务提交表单taskInfo示例

```
{
    "name": "ui-test-no-alert-success-rerun2",
    "namespace": "",
    "queue": "default",
    "priority": "normal",
    "oversell": false,
    "faultTolerance": true,
    "command": "sleep 5\nexit 0",
    "datasource": [
        {
            "type": "emptydir",
            "mountPath": "/dev/shm",
            "id": "",
            "name": "devshm",
            "options": {
                "sizeLimit": 10,
                "medium": "Memory",
                "readOnly": false,
                "cfsInstanceId": "",
                "cfsMountPoint": ""
            }
        },
        {
            "type": "pfsl1",
            "sourcePath": "/",
            "mountPath": "/mnt",
            "id": "",
            "name": "pfs-7xWeAt",
            "options": {
                "sizeLimit": 1000,
                "pfsL1ClusterIp": "192.168.12.142",
                "pfsL1ClusterPort": "8888",
                "pfsL1ParentDir": "/",
                "medium": "",
                "readOnly": false,
                "cfsInstanceId": "",
                "cfsMountPoint": ""
            }
        }
    ],
    "codeSource": {
        "filePath": "",
        "mountPath": "",
        "id": "",
        "bosObjectName": "",
        "bosTemporaryToken": "",
        "bosEndpoint": "",
        "bosBucket": ""
    },
    "jobFramework": "pytorch",
    "jobDistributed": false,
    "jobSpec": {
        "Master": {
            "replicas": 1,
            "restartPolicy": "Never",
            "image": "registry.baidubce.com/aihcp-public/pytorch",
            "tag": "22.08-py3",
            "resource": {

            },
            "env": {
                "AIHC_JOB_NAME": "ui-test-no-alert-success-rerun2",
                "AIHC_TENSORBOARD_LOG_PATH": "/mnt/ui-test-no-alert-success-rerun2/output/training_logs",
                "NCCL_IB_DISABLE": "1"
            },
            "command": "",
            "args": "",
            "postStart": "",
            "preStop": ""
        }
    },
    "imagePullSecrets": null,
    "imagePullSecretUsername": "",
    "imagePullSecretPassword": "",
    "tensorboard": {
        "enable": true,
        "logPath": "/mnt/ui-test-no-alert-success-rerun2/output/training_logs",
        "serviceType": ""
    },
    "labels": {
        "aijob.cce.baidubce.com/create-from-aihcp": "true"
    },
    "annotations": null,
    "nodeSelector": null,
    "autoCreatePVC": true,
    "hostNetwork": false,
    "isCopyJob": false,
    "sourceJobName": "ui-test-no-alert-success-rerun1",
    "workloadType": "PytorchJob",
    "pfsId": "pfs-7xWeAt",
    "retentionPeriod": "",
    "enabledHangDetection": false,
    "hangDetectionTimeoutMinutes": 0,
    "hangDetectionStartupTolerationMinutes": 0,
    "hangDetectionStackTimeoutMinutes": 0,
    "faultToleranceLimit": 0,
    "customFaultTolerancePattern": null,
    "unconditionalFaultToleranceLimit": 0,
    "unconditionalFaultToleranceObserveSeconds": 0,
    "enableReplace": false,
    "enableUseNodesOfLastJob": false,
    "enableCheckpointMigration": false,
    "internalFaultToleranceAlarmPhone": "",
    "alertConfig": null,
    "enableBccl": false,
    "submitTime": "",
    "privileged": false,
    "logCollectionFilePatterns": [

    ]
}
```

# 生成CLI命令示例

```
aihc job create --name "ui-test-no-alert-success-rerun2" --framework pytorchjob --image "registry.baidubce.com/aihcp-public/pytorch:22.08-py3" --enable-rdma=false --enable-bccl=false --enable-fault-tolerance=true --fault-tolerance-args="--enable-replace=false --enable-hang-detection=false --hang-detection-log-timeout-minutes=0 --hang-detection-startup-toleration-minutes=0 --hang-detection-stack-timeout-minutes=0 --max-num-of-unconditional-retry=0 --unconditional-retry-observe-seconds=0 --enable-use-nodes-of-last-job=false --enable-checkpoint-migration=false" --priority normal --replicas 1 --env "AIHC_JOB_NAME=ui-test-no-alert-success-rerun2" --env "AIHC_TENSORBOARD_LOG_PATH=/mnt/ui-test-no-alert-success-rerun2/output/training_logs" --env "NCCL_IB_DISABLE=1" --ds-type empty --ds-mountpath "/dev/shm" --ds-name "devshm" --ds-type pfs --ds-mountpath "/mnt" --ds-name "pfs-7xWeAt" --command "sleep 5
exit 0" --label "aijob.cce.baidubce.com/create-from-aihcp=true"
```