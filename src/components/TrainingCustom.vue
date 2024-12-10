<template>
  <div style="
      padding: 0px 20px;
      max-width: 1200px;
      margin: 0 auto;
      text-align: left;
    ">
    <h1 color="$ep-color-primary">{{ msg }}</h1>

    <!-- 表单开始 -->
    <el-form ref="formRef" :model="formModel" :rules="rules" @submit.prevent="handleSubmit" label-width="auto"
      label-position="top">
      <el-row :gutter="20">
        <!-- 第一列 -->
        <el-col :span="8">
          <el-form-item label="模型名称" prop="modelName">
            <el-select v-model="formModel.basicInfo['model-name']" placeholder="请选择模型名称">
              <el-option v-for="model in modelOptions" :key="model" :label="model" :value="model"></el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="训练阶段" prop="trainingPhase">
            <el-select v-model="formModel.initialization['training-phase']" placeholder="请选择训练阶段">
              <el-option label="SFT" value="sft"></el-option>
              <el-option label="Pretrain" value="pretrain"></el-option>
              <!-- 根据需要添加更多选项 -->
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="训练机数" prop="replicas">
            <el-input-number v-model="formModel.basicInfo.replicas" :min="1" placeholder="请输入训练机数"
              style="width: 100%"></el-input-number>
          </el-form-item>
        </el-col>
      </el-row>
      <!-- <el-row :gutter="20">
        <el-col :span="8">
          <el-form-item required label="版本" prop="version">
            <el-input v-model="formModel.basicInfo.version" placeholder="请输入版本，允许数字、字母、中划线"></el-input>
          </el-form-item>
        </el-col>
      </el-row> -->
      <el-row :gutter="20">
        <el-col :span="8">
          <el-form-item label="数据集划分方式" prop="dataloaderModel">
            <el-select v-model="formModel.basicInfo['data-model']" placeholder="请选择数据加载类型">
              <el-option label="proportional-split" value="proportional-split"></el-option>
              <el-option label="pre-split" value="pre-split"></el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="模型自动组网" prop="noLoadOptim">
            <el-switch v-model="formModel.basicInfo['auto-model']" active-text="是" inactive-text="否"></el-switch>
          </el-form-item>
        </el-col>
      </el-row>
      <el-collapse style="margin-bottom: 20px;" v-model="activeNames" @change="handleChange">
        <!-- 5）Checkpoint 读取和保存参数 -->
        <el-collapse-item title="检查点读取和保存参数" name="5">
          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="load" prop="load">
                <el-input v-model="formModel.checkpointConfig.load" placeholder="请输入加载模型的文件夹路径">
                  <template #append>
                    <PathSelector title="选择" @selection-confirmed="setCheckpointConfigLoad" />
                  </template>
                </el-input>

              </el-form-item>
            </el-col>

            <el-col :span="8">
              <el-form-item label="no-load-optim" prop="noLoadOptim">
                <el-switch v-model="formModel.checkpointConfig['no-load-optim']" active-text="是"
                  inactive-text="否"></el-switch>
              </el-form-item>
            </el-col>

            <el-col :span="8">
              <el-form-item label="no-load-rng" prop="noLoadRng">
                <el-switch v-model="formModel.checkpointConfig['no-load-rng']" active-text="是"
                  inactive-text="否"></el-switch>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="save" prop="save">
                <el-input v-model="formModel.checkpointConfig.save" placeholder="请输入保存模型的文件夹路径">
                  <template #append>
                    <PathSelector title="选择" @selection-confirmed="setCheckpointConfigSave" />
                  </template>
                </el-input>
              </el-form-item>
            </el-col>

            <el-col :span="8">
              <el-form-item label="save-interval" prop="saveInterval">
                <el-input-number v-model="formModel.checkpointConfig['save-interval']" :min="1" placeholder="请输入保存间隔步数"
                  style="width: 100%"></el-input-number>
              </el-form-item>
            </el-col>

            <el-col :span="8">
              <el-form-item label="no-save-optim" prop="noSaveOptim">
                <el-switch v-model="formModel.checkpointConfig['no-save-optim']" active-text="是"
                  inactive-text="否"></el-switch>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="no-save-rng" prop="noSaveRng">
                <el-switch v-model="formModel.checkpointConfig['no-save-rng']" active-text="是"
                  inactive-text="否"></el-switch>
              </el-form-item>
            </el-col>

            <el-col :span="8">
              <el-form-item label="ckpt-step" prop="ckptStep">
                <el-input-number v-model="formModel.checkpointConfig['ckpt-step']" :min="1"
                  placeholder="请输入具体 step 的 checkpoint" style="width: 100%"></el-input-number>
              </el-form-item>
            </el-col>
          </el-row>
        </el-collapse-item>
        <!-- 1）数据参数 -->
        <el-collapse-item title="数据参数" name="1">
          <el-row :gutter="20" v-if="formModel.basicInfo['data-model'] == 'proportional-split'">
            <el-col :span="8">
              <el-form-item label="data-path" prop="dataPath">
                <el-input v-model="formModel.dataParams['data-path']" placeholder="请输入预训练数据集文件路径">
                  <template #append>
                    <PathSelector title="选择" @selection-confirmed="setDataParamsDataPath" />
                  </template>
                </el-input>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="split" prop="split">
                <el-input v-model="formModel.dataParams.split"
                  placeholder="Train/Validate/Test使用数据占比，例如969,30,1"></el-input>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20" v-if="formModel.basicInfo['data-model'] == 'pre-split'">
            <el-col :span="8">
              <el-form-item label="train-data-path" prop="trainDataPath">
                <el-input v-model="formModel.dataParams['train-data-path']" placeholder="请输入训练集路径">
                  <template #append>
                    <PathSelector title="选择" @selection-confirmed="setDataParamsTrainDataPath" />
                  </template>
                </el-input>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="valid-data-path" prop="validDataPath">
                <el-input v-model="formModel.dataParams['valid-data-path']" placeholder="请输入验证集路径">
                  <template #append>
                    <PathSelector title="选择" @selection-confirmed="setDataParamsValidDataPath" />
                  </template>
                </el-input>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="test-data-path" prop="testDataPath">
                <el-input v-model="formModel.dataParams['test-data-path']" placeholder="请输入测试集路径">
                  <template #append>
                    <PathSelector title="选择" @selection-confirmed="setDataParamsTestDataPath" />
                  </template>
                </el-input>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="data-cache-path" prop="dataCachePath">
                <el-input v-model="formModel.dataParams['data-cache-path']" placeholder="请输入缓存存储路径">
                  <template #append>
                    <PathSelector title="选择" @selection-confirmed="setDataParamsDataCachePath" />
                  </template>
                </el-input>
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item label="no-mmap-bin-files" prop="noMmapBinFiles">
                <el-switch v-model="formModel.dataParams['no-mmap-bin-files']" active-text="是"
                  inactive-text="否"></el-switch>
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item label="mock-data" prop="mockData">
                <el-switch v-model="formModel.dataParams['mock-data']" active-text="是" inactive-text="否"></el-switch>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="dataloader-type" prop="dataloaderType">
                <el-select v-model="formModel.dataParams['dataloader-type']" placeholder="请选择数据加载类型">
                  <el-option label="single" value="single"></el-option>
                  <el-option label="cyclic" value="cyclic"></el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="num-workers" prop="numWorkers">
                <el-input-number v-model="formModel.dataParams['num-workers']" :min="0" placeholder="请输入 worker 数目"
                  style="width: 100%"></el-input-number>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item required label="tokenizer-type" prop="tokenizerType">
                <el-select v-model="formModel.dataParams['tokenizer-type']" placeholder="请选择 Tokenizer 类型">
                  <el-option label="NullTokenizer" value="NullTokenizer"></el-option>
                  <el-option label="Llama2Tokenizer" value="Llama2Tokenizer"></el-option>
                  <el-option label="HFTokenizer" value="HFTokenizer"></el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col v-if="formModel.dataParams['tokenizer-type'] == 'HFTokenizer'" :span="8">
              <el-form-item label="hf-tokenizer-path" prop="hfTokenizerPath">
                <el-input v-model="formModel.dataParams['hf-tokenizer-path']"
                  placeholder="请输入 Huggingface Tokenizer 路径"></el-input>
              </el-form-item>
            </el-col>
            <el-col v-if="formModel.dataParams['tokenizer-type'] == 'HFTokenizer'" :span="8">
              <el-form-item label="use-fast-tokenizer" prop="useFastTokenizer">
                <el-switch v-model="formModel.dataParams['use-fast-tokenizer']" active-text="是"
                  inactive-text="否"></el-switch>
              </el-form-item>
            </el-col>
            <el-col v-if="formModel.dataParams['tokenizer-type'] != 'HFTokenizer'" :span="8">
              <el-form-item label="tokenizer-model" prop="tokenizerModel">
                <el-input v-model="formModel.dataParams['tokenizer-model']"
                  placeholder="请输入 Tokenizer model 文件地址"></el-input>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item required label="seq-length" prop="seqLength">
                <el-input-number v-model="formModel.dataParams['seq-length']" :min="1" placeholder="请输入序列长度"
                  style="width: 100%"></el-input-number>
              </el-form-item>
            </el-col>
          </el-row>
        </el-collapse-item>

        <!-- 2）模型组网参数 -->
        <el-collapse-item v-if="!formModel.basicInfo['auto-model']" title="模型组网参数" name="2">
          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item required label="num-layers" prop="numLayers">
                <el-input-number v-model="formModel.modelConfig['num-layers']" :min="1" placeholder="请输入层数"
                  style="width: 100%"></el-input-number>
              </el-form-item>
            </el-col>

            <el-col :span="8">
              <el-form-item required label="hidden-size" prop="hiddenSize">
                <el-input-number v-model="formModel.modelConfig['hidden-size']" :min="1" placeholder="请输入隐层维数"
                  style="width: 100%"></el-input-number>
              </el-form-item>
            </el-col>

            <el-col :span="8">
              <el-form-item label="ffn-hidden-size" prop="ffnHiddenSize">
                <el-input-number v-model="formModel.modelConfig['ffn-hidden-size']" :min="1" placeholder="请输入 FFN 隐层维数"
                  style="width: 100%"></el-input-number>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item required label="num-attention-heads" prop="numAttentionHeads">
                <el-input-number v-model="formModel.modelConfig['num-attention-heads']" :min="1"
                  placeholder="请输入自注意力的 head 数" style="width: 100%"></el-input-number>
              </el-form-item>
            </el-col>

            <el-col :span="8">
              <el-form-item label="group-query-attention" prop="groupQueryAttention">
                <el-switch v-model="formModel.modelConfig['group-query-attention']" active-text="是"
                  inactive-text="否"></el-switch>
              </el-form-item>
            </el-col>

            <el-col :span="8">
              <el-form-item label="num-query-groups" prop="numQueryGroups">
                <el-input-number v-model="formModel.modelConfig['num-query-groups']" :min="1"
                  placeholder="请输入 GQA 中 Query 头分组数" style="width: 100%"></el-input-number>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item required label="position-embedding-type" prop="positionEmbeddingType">
                <el-select v-model="formModel.modelConfig['position-embedding-type']"
                  placeholder="请选择 Position Embedding 类型">
                  <el-option label="learned_absolute" value="learned_absolute"></el-option>
                  <el-option label="rope" value="rope"></el-option>
                  <el-option label="alibi" value="alibi"></el-option>
                </el-select>
              </el-form-item>
            </el-col>

            <el-col :span="8" v-if="formModel.modelConfig['position-embedding-type'] === 'learned_absolute'">
              <el-form-item label="max-position-embeddings" prop="maxPositionEmbeddings">
                <el-input-number v-model="formModel.modelConfig['max-position-embeddings']" :min="1"
                  placeholder="请输入最大序列长度" style="width: 100%"></el-input-number>
              </el-form-item>
            </el-col>

            <el-col :span="8">
              <el-form-item label="rotary-interleaved" prop="rotaryInterleaved">
                <el-switch v-model="formModel.modelConfig['rotary-interleaved']" active-text="是"
                  inactive-text="否"></el-switch>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="8" v-if="formModel.modelConfig['rotary-interleaved']">
              <el-form-item label="rotary-percent" prop="rotaryPercent">
                <el-input-number v-model="formModel.modelConfig['rotary-percent']" :min="0" :max="1" :step="0.1"
                  placeholder="请输入 Rotary dimension 百分比" style="width: 100%"></el-input-number>
              </el-form-item>
            </el-col>

            <el-col :span="8" v-if="formModel.modelConfig['rotary-interleaved']">
              <el-form-item label="rotary-base" prop="rotaryBase">
                <el-input-number v-model="formModel.modelConfig['rotary-base']" :min="1"
                  placeholder="请输入 Rotary Base 数值" style="width: 100%"></el-input-number>
              </el-form-item>
            </el-col>

            <el-col :span="8" v-if="formModel.modelConfig['rotary-interleaved']">
              <el-form-item label="rotary-seq-len-interpolation-factor" prop="rotarySeqLenInterpolationFactor">
                <el-input-number v-model="formModel.modelConfig['rotary-seq-len-interpolation-factor']" :min="1"
                  placeholder="请输入序列长度线性插值因子" style="width: 100%"></el-input-number>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="attention-dropout" prop="attentionDropout">
                <el-input-number v-model="formModel.modelConfig['attention-dropout']" :min="0" :max="1" :step="0.01"
                  placeholder="请输入 attention dropout 概率" style="width: 100%"></el-input-number>
              </el-form-item>
            </el-col>

            <el-col :span="8">
              <el-form-item label="hidden-dropout" prop="hiddenDropout">
                <el-input-number v-model="formModel.modelConfig['hidden-dropout']" :min="0" :max="1" :step="0.01"
                  placeholder="请输入 hidden dropout 概率" style="width: 100%"></el-input-number>
              </el-form-item>
            </el-col>

            <el-col :span="8">
              <el-form-item label="normalization" prop="normalization">
                <el-select v-model="formModel.modelConfig['normalization']" placeholder="请选择 normalization 类型">
                  <el-option label="LayerNorm" value="LayerNorm"></el-option>
                  <el-option label="RMSNorm" value="RMSNorm"></el-option>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="norm-epsilon" prop="normEpsilon">
                <el-input-number v-model="formModel.modelConfig['norm-epsilon']" :min="1e-10" :step="1e-6"
                  placeholder="请输入 normalization Epsilon 数值" style="width: 100%"></el-input-number>
              </el-form-item>
            </el-col>

            <el-col :span="8">
              <el-form-item label="use-normhead" prop="useNormhead">
                <el-switch v-model="formModel.modelConfig['use-normhead']" active-text="是"
                  inactive-text="否"></el-switch>
              </el-form-item>
            </el-col>

            <el-col :span="8">
              <el-form-item label="swiglu" prop="swiglu">
                <el-switch v-model="formModel.modelConfig.swiglu" active-text="是" inactive-text="否"></el-switch>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="disable-bias-linear" prop="disableBiasLinear">
                <el-switch v-model="formModel.modelConfig['disable-bias-linear']" active-text="是"
                  inactive-text="否"></el-switch>
              </el-form-item>
            </el-col>

            <el-col :span="8">
              <el-form-item label="add-qkv-bias" prop="addQkvBias">
                <el-switch v-model="formModel.modelConfig['add-qkv-bias']" active-text="是"
                  inactive-text="否"></el-switch>
              </el-form-item>
            </el-col>

            <el-col :span="8">
              <el-form-item label="make-vocab-size-divisible-by" prop="makeVocabSizeDivisibleBy">
                <el-input-number v-model="formModel.modelConfig['make-vocab-size-divisible-by']" :min="1"
                  placeholder="请输入可被整除的数值" style="width: 100%"></el-input-number>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="untie-embeddings-and-output-weights" prop="untieEmbeddingsAndOutputWeights">
                <el-switch v-model="formModel.modelConfig['untie-embeddings-and-output-weights']" active-text="是"
                  inactive-text="否"></el-switch>
              </el-form-item>
            </el-col>
          </el-row>
        </el-collapse-item>

        <!-- 3）初始化参数 -->
        <el-collapse-item title="初始化参数" name="3">
          <el-row :gutter="20">
            <el-col :span="6">
              <el-form-item label="seed" prop="seed">
                <el-input-number v-model="formModel.initialization.seed" :min="0" placeholder="请输入随机种子"
                  style="width: 100%"></el-input-number>
              </el-form-item>
            </el-col>

            <el-col :span="6">
              <el-form-item label="init-method-std" prop="initMethodStd">
                <el-input-number v-model="formModel.initialization['init-method-std']" :min="0" :step="0.01"
                  placeholder="请输入初始化标准差" style="width: 100%"></el-input-number>
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item label="data-parallel-random-init" prop="dataParallelRandomInit">
                <el-switch v-model="formModel.initialization['data-parallel-random-init']" active-text="是"
                  inactive-text="否"></el-switch>
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item label="init-method-xavier-uniform" prop="initMethodXavierUniform">
                <el-switch v-model="formModel.initialization['init-method-xavier-uniform']" active-text="是"
                  inactive-text="否"></el-switch>
              </el-form-item>
            </el-col>
          </el-row>
        </el-collapse-item>

        <!-- 4）优化器和学习率参数 -->
        <el-collapse-item title="优化器和学习率参数" name="4">
          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item required label="lr" prop="lr">
                <el-input-number v-model="formModel.optimizerConfig.lr" :min="0" :step="0.0001" placeholder="请输入学习率"
                  style="width: 100%"></el-input-number>
              </el-form-item>
            </el-col>

            <el-col :span="8">
              <el-form-item label="min-lr" prop="minLr">
                <el-input-number v-model="formModel.optimizerConfig['min-lr']" :min="0" :step="0.0001"
                  placeholder="请输入最小学习率" style="width: 100%"></el-input-number>
              </el-form-item>
            </el-col>

            <el-col :span="8">
              <el-form-item required label="lr-decay-style" prop="lrDecayStyle">
                <el-select v-model="formModel.optimizerConfig['lr-decay-style']" placeholder="请选择学习率衰减方式">
                  <el-option label="constant" value="constant"></el-option>
                  <el-option label="linear" value="linear"></el-option>
                  <el-option label="cosine" value="cosine"></el-option>
                  <el-option label="inverse-square-root" value="inverse-square-root"></el-option>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="lr-decay-iters" prop="lrDecayIters">
                <el-input-number v-model="formModel.optimizerConfig['lr-decay-iters']" :min="1"
                  placeholder="请输入学习率衰减迭代次数" style="width: 100%"></el-input-number>
              </el-form-item>
            </el-col>

            <el-col :span="8">
              <el-form-item label="lr-warmup-fraction" prop="lrWarmupFraction">
                <el-input-number v-model="formModel.optimizerConfig['lr-warmup-fraction']" :min="0" :max="1"
                  :step="0.01" placeholder="请输入 warmup 比例" style="width: 100%"></el-input-number>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="optimizer" prop="optimizer">
                <el-select v-model="formModel.optimizerConfig.optimizer" placeholder="请选择优化器类型">
                  <el-option label="adam" value="adam"></el-option>
                  <el-option label="sgd" value="sgd"></el-option>
                </el-select>
              </el-form-item>
            </el-col>

            <el-col :span="8">
              <el-form-item required label="weight-decay" prop="weightDecay">
                <el-input-number v-model="formModel.optimizerConfig['weight-decay']" :min="0" :step="0.001"
                  placeholder="请输入权重衰减系数" style="width: 100%"></el-input-number>
              </el-form-item>
            </el-col>

            <el-col :span="8">
              <el-form-item label="clip-grad" prop="clipGrad">
                <el-input-number v-model="formModel.optimizerConfig['clip-grad']" :min="0" :step="0.1"
                  placeholder="请输入梯度剪裁阈值" style="width: 100%"></el-input-number>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="adam-beta1" prop="adamBeta1">
                <el-input-number v-model="formModel.optimizerConfig['adam-beta1']" :min="0" :max="1" :step="0.01"
                  placeholder="请输入 Adam beta1 系数" style="width: 100%"></el-input-number>
              </el-form-item>
            </el-col>

            <el-col :span="8">
              <el-form-item label="adam-beta2" prop="adamBeta2">
                <el-input-number v-model="formModel.optimizerConfig['adam-beta2']" :min="0" :max="1" :step="0.001"
                  placeholder="请输入 Adam beta2 系数" style="width: 100%"></el-input-number>
              </el-form-item>
            </el-col>

            <el-col :span="8">
              <el-form-item label="adam-eps" prop="adamEps">
                <el-input-number v-model="formModel.optimizerConfig['adam-eps']" :min="1e-10" :step="1e-8"
                  placeholder="请输入 Adam eps" style="width: 100%"></el-input-number>
              </el-form-item>
            </el-col>

            <el-col :span="8" v-if="formModel.optimizerConfig.optimizer === 'sgd'">
              <el-form-item label="sgd-momentum" prop="sgdMomentum">
                <el-input-number v-model="formModel.optimizerConfig['sgd-momentum']" :min="0" :max="1" :step="0.1"
                  placeholder="请输入 SGD 动量因子" style="width: 100%"></el-input-number>
              </el-form-item>
            </el-col>
          </el-row>
        </el-collapse-item>

        <!-- 6）混合精度参数 -->
        <el-collapse-item title="混合精度参数" name="6">
          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="bf16" prop="bf16">
                <el-switch :disabled="formModel.mixedPrecision.fp16" v-model="formModel.mixedPrecision.bf16"
                  active-text="是" inactive-text="否"></el-switch>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="fp16" prop="fp16">
                <el-switch :disabled="formModel.mixedPrecision.bf16" v-model="formModel.mixedPrecision.fp16"
                  active-text="是" inactive-text="否"></el-switch>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20" v-if="formModel.mixedPrecision.fp16">
            <el-col :span="6">
              <el-form-item label="loss-scale" prop="initialLossScale">
                <el-input-number v-model="formModel.mixedPrecision['loss-scale']" :min="1" :step="1"
                  placeholder="请输入loss scale" style="width: 100%"></el-input-number>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="initial-loss-scale" prop="initialLossScale">
                <el-input-number v-model="formModel.mixedPrecision['initial-loss-scale']" :min="1" :step="1"
                  placeholder="请输入初始 loss scale" style="width: 100%"></el-input-number>
              </el-form-item>
            </el-col>

            <el-col :span="6">
              <el-form-item label="min-loss-scale" prop="minLossScale">
                <el-input-number v-model="formModel.mixedPrecision['min-loss-scale']" :min="1" :step="0.1"
                  placeholder="请输入最小 loss scale" style="width: 100%"></el-input-number>
              </el-form-item>
            </el-col>

            <el-col :span="6">
              <el-form-item label="loss-scale-window" prop="lossScaleWindow">
                <el-input-number v-model="formModel.mixedPrecision['loss-scale-window']" :min="1"
                  placeholder="请输入 loss scale 窗口大小" style="width: 100%"></el-input-number>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="accumulate-allreduce-grads-in-fp32" prop="accumulateAllreduceGradsInFp32">
                <el-switch v-model="formModel.mixedPrecision['accumulate-allreduce-grads-in-fp32']" active-text="是"
                  inactive-text="否"></el-switch>
              </el-form-item>
            </el-col>
          </el-row>
        </el-collapse-item>
        <!-- 7) 分布式参数 -->
        <el-collapse-item title="分布式参数" name="7">
          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="tensor-model-parallel-size" prop="tensorModelParallelSize">
                <el-input-number v-model="formModel.distributedParams['tensor-model-parallel-size']" :min="1"
                  placeholder="请输入张量并行维数" style="width: 100%"></el-input-number>
              </el-form-item>
            </el-col>

            <el-col :span="8">
              <el-form-item label="pipeline-model-parallel-size" prop="pipelineModelParallelSize">
                <el-input-number v-model="formModel.distributedParams['pipeline-model-parallel-size']" :min="1"
                  placeholder="请输入流水并行维数" style="width: 100%"></el-input-number>
              </el-form-item>
            </el-col>

            <el-col :span="8">
              <el-form-item label="num-layers-per-virtual-pipeline-stage" prop="numLayersPerVirtualPipelineStage">
                <el-input-number v-model="formModel.distributedParams['num-layers-per-virtual-pipeline-stage']" :min="1"
                  placeholder="请输入每个 model chunk 的层数" style="width: 100%"></el-input-number>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="no-overlap-p2p-communication" prop="noOverlapP2pCommunication">
                <el-switch v-model="formModel.distributedParams['no-overlap-p2p-communication']" active-text="否"
                  inactive-text="是"></el-switch>
              </el-form-item>
            </el-col>

            <el-col :span="8">
              <el-form-item label="distributed-backend" prop="distributedBackend">
                <el-select v-model="formModel.distributedParams['distributed-backend']" placeholder="请选择通信后端">
                  <el-option label="nccl" value="nccl"></el-option>
                  <el-option label="gloo" value="gloo"></el-option>
                </el-select>
              </el-form-item>
            </el-col>

            <el-col :span="8">
              <el-form-item label="distributed-timeout-minutes" prop="distributedTimeoutMinutes">
                <el-input-number v-model="formModel.distributedParams['distributed-timeout-minutes']" :min="1"
                  placeholder="请输入超时时间（分钟）" style="width: 100%"></el-input-number>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="use-distributed-optimizer" prop="useDistributedOptimizer">
                <el-switch v-model="formModel.distributedParams['use-distributed-optimizer']" active-text="是"
                  inactive-text="否"></el-switch>
              </el-form-item>
            </el-col>

            <el-col :span="8">
              <el-form-item label="overlap-grad-reduce" prop="overlapGradReduce">
                <el-switch v-model="formModel.distributedParams['overlap-grad-reduce']" active-text="是"
                  inactive-text="否"></el-switch>
              </el-form-item>
            </el-col>

            <el-col :span="8">
              <el-form-item label="overlap-param-gather" prop="overlapParamGather">
                <el-switch v-model="formModel.distributedParams['overlap-param-gather']" active-text="是"
                  inactive-text="否"></el-switch>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="context-parallel-size" prop="contextParallelSize">
                <el-input-number v-model="formModel.distributedParams['context-parallel-size']" :min="1"
                  placeholder="请输入 Context 序列并行维数" style="width: 100%"></el-input-number>
              </el-form-item>
            </el-col>

            <el-col :span="8">
              <el-form-item label="expert-model-parallel-size" prop="expertModelParallelSize">
                <el-input-number v-model="formModel.distributedParams['expert-model-parallel-size']" :min="1"
                  placeholder="请输入专家并行维数" style="width: 100%"></el-input-number>
              </el-form-item>
            </el-col>

            <el-col :span="8">
              <el-form-item label="tp-comm-overlap" prop="tpCommOverlap">
                <el-switch v-model="formModel.distributedParams['tp-comm-overlap']" active-text="是"
                  inactive-text="否"></el-switch>
              </el-form-item>
            </el-col>
          </el-row>
        </el-collapse-item>

        <!-- 8) 显存策略参数 -->
        <el-collapse-item title="显存策略参数" name="8">
          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="sequence-parallel" prop="sequenceParallel">
                <el-switch v-model="formModel.memoryOptimization['sequence-parallel']" active-text="是"
                  inactive-text="否"></el-switch>
              </el-form-item>
            </el-col>

            <el-col :span="8">
              <el-form-item label="recompute-activations" prop="recomputeActivations">
                <el-switch v-model="formModel.memoryOptimization['recompute-activations']" active-text="是"
                  inactive-text="否"></el-switch>
              </el-form-item>
            </el-col>

            <el-col :span="8">
              <el-form-item label="recompute-granularity" prop="recomputeGranularity">
                <el-select v-model="formModel.memoryOptimization['recompute-granularity']" placeholder="请选择重计算粒度">
                  <el-option label="full" value="full"></el-option>
                  <el-option label="selective" value="selective"></el-option>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="recompute-method" prop="recomputeMethod">
                <el-select v-model="formModel.memoryOptimization['recompute-method']" placeholder="请选择重计算方式">
                  <el-option label="uniform" value="uniform"></el-option>
                  <el-option label="block" value="block"></el-option>
                </el-select>
              </el-form-item>
            </el-col>

            <el-col :span="8">
              <el-form-item label="recompute-num-layers" prop="recomputeNumLayers">
                <el-input-number v-model="formModel.memoryOptimization['recompute-num-layers']" :min="1"
                  placeholder="请输入重计算层数" style="width: 100%"></el-input-number>
              </el-form-item>
            </el-col>

            <el-col :span="8">
              <el-form-item label="distribute-saved-activations" prop="distributeSavedActivations">
                <el-switch v-model="formModel.memoryOptimization['distribute-saved-activations']" active-text="是"
                  inactive-text="否"></el-switch>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="offload-optimizer" prop="offloadOptimizer">
                <el-select v-model="formModel.memoryOptimization['offload-optimizer']"
                  placeholder="请选择 optimizer offload 功能">
                  <el-option label="disabled" value="disabled"></el-option>
                  <el-option label="auto" value="auto"></el-option>
                  <el-option label="manual" value="manual"></el-option>
                </el-select>
              </el-form-item>
            </el-col>

            <el-col :span="8" v-if="formModel.memoryOptimization['offload-optimizer'] === 'manual'">
              <el-form-item label="offload-optimizer-percent" prop="offloadOptimizerPercent">
                <el-input-number v-model="formModel.memoryOptimization['offload-optimizer-percent']" :min="0" :max="1"
                  :step="0.1" placeholder="请输入 optimizer offload 比例" style="width: 100%"></el-input-number>
              </el-form-item>
            </el-col>

            <el-col :span="8">
              <el-form-item label="no-overlap-offload-optimizer" prop="noOverlapOffloadOptimizer">
                <el-switch v-model="formModel.memoryOptimization['no-overlap-offload-optimizer']" active-text="是"
                  inactive-text="否"></el-switch>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="cpu-adam-threads" prop="cpuAdamThreads">
                <el-input-number v-model="formModel.memoryOptimization['cpu-adam-threads']" :min="1"
                  placeholder="请输入 CPU 上优化器计算的线程数" style="width: 100%"></el-input-number>
              </el-form-item>
            </el-col>
          </el-row>
        </el-collapse-item>

        <!-- 9) MoE 训练参数 -->
        <el-collapse-item v-if="['mixtral-8x7b', 'mixtral-8x22b'].includes(formModel.basicInfo['model-name'])"
          title="MoE训练参数" name="9">
          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="moe-router-load-balancing-type" prop="moeRouterLoadBalancingType">
                <el-select v-model="formModel.moeParams['moe-router-load-balancing-type']"
                  placeholder="请选择 router 负载均衡策略">
                  <el-option label="aux_loss" value="aux_loss"></el-option>
                  <el-option label="sinkhorn" value="sinkhorn"></el-option>
                  <el-option label="none" value="none"></el-option>
                </el-select>
              </el-form-item>
            </el-col>

            <el-col :span="8">
              <el-form-item label="moe-router-topk" prop="moeRouterTopk">
                <el-input-number v-model="formModel.moeParams['moe-router-topk']" :min="1"
                  placeholder="请输入每个 token 需要路由的专家数目" style="width: 100%"></el-input-number>
              </el-form-item>
            </el-col>

            <el-col :span="8">
              <el-form-item label="moe-grouped-gemm" prop="moeGroupedGemm">
                <el-switch v-model="formModel.moeParams['moe-grouped-gemm']" active-text="是"
                  inactive-text="否"></el-switch>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="moe-aux-loss-coeff" prop="moeAuxLossCoeff">
                <el-input-number v-model="formModel.moeParams['moe-aux-loss-coeff']" :min="0" :step="0.1"
                  placeholder="请输入 aux loss 缩放系数" style="width: 100%"></el-input-number>
              </el-form-item>
            </el-col>

            <el-col :span="8">
              <el-form-item label="moe-z-loss-coeff" prop="moeZLossCoeff">
                <el-input-number v-model="formModel.moeParams['moe-z-loss-coeff']" :min="0" :step="0.1"
                  placeholder="请输入 z-loss 缩放系数" style="width: 100%"></el-input-number>
              </el-form-item>
            </el-col>

            <el-col :span="8">
              <el-form-item label="moe-input-jitter-eps" prop="moeInputJitterEps">
                <el-input-number v-model="formModel.moeParams['moe-input-jitter-eps']" :min="0" :step="0.01"
                  placeholder="请输入输入 tensor 添加噪声的值" style="width: 100%"></el-input-number>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="moe-token-dropping" prop="moeTokenDropping">
                <el-switch v-model="formModel.moeParams['moe-token-dropping']" active-text="是"
                  inactive-text="否"></el-switch>
              </el-form-item>
            </el-col>

            <el-col :span="8">
              <el-form-item label="moe-token-dispatcher-type" prop="moeTokenDispatcherType">
                <el-select v-model="formModel.moeParams['moe-token-dispatcher-type']" placeholder="请选择 token 分发通信模式">
                  <el-option label="allgather" value="allgather"></el-option>
                  <el-option label="alltoall" value="alltoall"></el-option>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="moe-input-jitter-eps" prop="moeInputJitterEps">
                <el-input-number v-model="formModel.moeParams['moe-input-jitter-eps']" :min="0" :step="0.01"
                  placeholder="请输入输入 tensor 添加噪声的值" style="width: 100%"></el-input-number>
              </el-form-item>
            </el-col>
          </el-row>
        </el-collapse-item>

        <!-- 10) SFT 训练参数 -->
        <el-collapse-item title="SFT训练参数" name="10" v-if="formModel.initialization['training-phase'] == 'sft'">
          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="chat-template" prop="chatTemplate">
                <el-select v-model="formModel.sftParams['chat-template']" placeholder="请选择对话模板">
                  <el-option label="alpaca" value="alpaca"></el-option>
                  <el-option label="baichuan" value="baichuan"></el-option>
                  <el-option label="baichuan2" value="baichuan2"></el-option>
                  <el-option label="llama2" value="llama2"></el-option>
                  <el-option label="llama2_zh" value="llama2_zh"></el-option>
                  <el-option label="llama3" value="llama3"></el-option>
                  <el-option label="mistral" value="mistral"></el-option>
                  <el-option label="qwen" value="qwen"></el-option>
                </el-select>
              </el-form-item>
            </el-col>

            <el-col :span="8">
              <el-form-item label="sft-dataset-config" prop="sftDatasetConfig">
                <el-input v-model="formModel.sftParams['sft-dataset-config']" placeholder="请输入数据集配置文件路径"></el-input>
              </el-form-item>
            </el-col>

            <el-col :span="8">
              <el-form-item label="sft-dataset" prop="sftDataset">
                <el-input v-model="formModel.sftParams['sft-dataset']"
                  placeholder="请输入数据集名称，对应 --data-path 中的数据集文件"></el-input>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="sft-train-dataset" prop="sftTrainDataset">
                <el-input v-model="formModel.sftParams['sft-train-dataset']"
                  placeholder="请输入仅训练的数据集名称，对应 --train-data-path 中的数据集文件"></el-input>
              </el-form-item>
            </el-col>

            <el-col :span="8">
              <el-form-item label="sft-valid-dataset" prop="sftValidDataset">
                <el-input v-model="formModel.sftParams['sft-valid-dataset']"
                  placeholder="请输入仅验证的数据集名称，对应 --valid-data-path 中的数据集文件"></el-input>
              </el-form-item>
            </el-col>

            <el-col :span="8">
              <el-form-item label="sft-test-dataset" prop="sftTestDataset">
                <el-input v-model="formModel.sftParams['sft-test-dataset']"
                  placeholder="请输入仅测试的数据集名称，对应 --test-data-path 中的数据集文件"></el-input>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="sft-data-streaming" prop="sftDataStreaming">
                <el-switch v-model="formModel.sftParams['sft-data-streaming']" active-text="是"
                  inactive-text="否"></el-switch>
              </el-form-item>
            </el-col>

            <el-col :span="8">
              <el-form-item label="streaming-buffer-size" prop="streamingBufferSize">
                <el-input-number v-model="formModel.sftParams['streaming-buffer-size']" :min="1"
                  placeholder="请输入 streaming 模式下的 buffer size" style="width: 100%"></el-input-number>
              </el-form-item>
            </el-col>

            <el-col :span="8">
              <el-form-item label="sft-num-preprocess-workers" prop="sftNumPreprocessWorkers">
                <el-input-number v-model="formModel.sftParams['sft-num-preprocess-workers']" :min="1"
                  placeholder="请输入数据预处理 worker 数目" style="width: 100%"></el-input-number>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="train-on-prompt" prop="trainOnPrompt">
                <el-switch v-model="formModel.sftParams['train-on-prompt']" active-text="是"
                  inactive-text="否"></el-switch>
              </el-form-item>
            </el-col>

            <el-col :span="8">
              <el-form-item label="variable-seq-lengths" prop="variableSeqLengths">
                <el-switch v-model="formModel.sftParams['variable-seq-lengths']" active-text="是"
                  inactive-text="否"></el-switch>
              </el-form-item>
            </el-col>

            <el-col :span="8">
              <el-form-item label="sft-data-mix-strategy" prop="sftDataMixStrategy">
                <el-select v-model="formModel.sftParams['sft-data-mix-strategy']" placeholder="请选择数据混合策略">
                  <el-option label="concat" value="concat"></el-option>
                  <el-option label="interleave_under" value="interleave_under"></el-option>
                  <el-option label="interleave_over" value="interleave_over"></el-option>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="is-tokenized-data" prop="isTokenizedData">
                <el-switch v-model="formModel.sftParams['is-tokenized-data']" active-text="是"
                  inactive-text="否"></el-switch>
              </el-form-item>
            </el-col>

            <el-col :span="8">
              <el-form-item label="packing-sft-data" prop="packingSftData">
                <el-switch v-model="formModel.sftParams['packing-sft-data']" active-text="是"
                  inactive-text="否"></el-switch>
              </el-form-item>
            </el-col>
          </el-row>
        </el-collapse-item>

        <!-- 11) 其他训练参数 -->
        <el-collapse-item title="其他训练参数" name="11">
          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="micro-batch-size" prop="microBatchSize">
                <el-input-number v-model="formModel.otherTrainingParams['micro-batch-size']" :min="1"
                  placeholder="请输入单次迭代每个rank的batch size" style="width: 100%"></el-input-number>
              </el-form-item>
            </el-col>

            <el-col :span="8">
              <el-form-item label="global-batch-size" prop="globalBatchSize">
                <el-input-number v-model="formModel.otherTrainingParams['global-batch-size']" :min="1"
                  placeholder="请输入分布式训练全局batch size" style="width: 100%"></el-input-number>
              </el-form-item>
            </el-col>

            <el-col :span="8">
              <el-form-item label="train-iters" prop="trainIters">
                <el-input-number v-model="formModel.otherTrainingParams['train-iters']" :min="1"
                  placeholder="请输入训练的迭代轮数" style="width: 100%"></el-input-number>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="eval-iters" prop="evalIters">
                <el-input-number v-model="formModel.otherTrainingParams['eval-iters']" :min="1" placeholder="请输入评估的迭代步数"
                  style="width: 100%"></el-input-number>
              </el-form-item>
            </el-col>

            <el-col :span="8">
              <el-form-item label="eval-interval" prop="evalInterval">
                <el-input-number v-model="formModel.otherTrainingParams['eval-interval']" :min="1"
                  placeholder="请输入在验证集上进行评估的间隔步数" style="width: 100%"></el-input-number>
              </el-form-item>
            </el-col>

            <el-col :span="8">
              <el-form-item label="log-interval" prop="logInterval">
                <el-input-number v-model="formModel.otherTrainingParams['log-interval']" :min="1"
                  placeholder="请输入日志打印的间隔步数" style="width: 100%"></el-input-number>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="tensorboard-dir" prop="tensorboardDir">
                <el-input v-model="formModel.otherTrainingParams['tensorboard-dir']"
                  placeholder="请输入 tensorboard 文件写入路径">
                  <template #append>
                    <PathSelector title="选择" @selection-confirmed="setOtherTrainingParamsTensorboardDir" />
                  </template>
                </el-input>
              </el-form-item>
            </el-col>

            <el-col :span="8">
              <el-form-item label="timing-log-level" prop="timingLogLevel">
                <el-select v-model="formModel.otherTrainingParams['timing-log-level']" placeholder="请选择 timing log 级别">
                  <el-option label="0" value="0"></el-option>
                  <el-option label="1" value="1"></el-option>
                  <el-option label="2" value="2"></el-option>
                </el-select>
              </el-form-item>
            </el-col>

            <el-col :span="8">
              <el-form-item label="timing-log-option" prop="timingLogOption">
                <el-select v-model="formModel.otherTrainingParams['timing-log-option']" placeholder="请选择 timing log 选项">
                  <el-option label="minmax" value="minmax"></el-option>
                  <el-option label="max" value="max"></el-option>
                  <el-option label="all" value="all"></el-option>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="tensorboard-log-interval" prop="tensorboardLogInterval">
                <el-input-number v-model="formModel.otherTrainingParams['tensorboard-log-interval']" :min="1"
                  placeholder="请输入 tensorboard log 写入间隔" style="width: 100%"></el-input-number>
              </el-form-item>
            </el-col>

            <el-col :span="8">
              <el-form-item label="log-timers-to-tensorboard" prop="logTimersToTensorboard">
                <el-switch v-model="formModel.otherTrainingParams['log-timers-to-tensorboard']" active-text="是"
                  inactive-text="否"></el-switch>
              </el-form-item>
            </el-col>

            <el-col :span="8">
              <el-form-item label="log-validation-ppl-to-tensorboard" prop="logValidationPplToTensorboard">
                <el-switch v-model="formModel.otherTrainingParams['log-validation-ppl-to-tensorboard']" active-text="是"
                  inactive-text="否"></el-switch>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="wandb-project" prop="wandbProject">
                <el-input v-model="formModel.otherTrainingParams['wandb-project']"
                  placeholder="请输入 wandb 项目名称"></el-input>
              </el-form-item>
            </el-col>

            <el-col :span="8">
              <el-form-item label="wandb-exp-name" prop="wandbExpName">
                <el-input v-model="formModel.otherTrainingParams['wandb-exp-name']"
                  placeholder="请输入 wandb 实验名称"></el-input>
              </el-form-item>
            </el-col>
          </el-row>
        </el-collapse-item>
      </el-collapse>

      <!-- <div class="demo-collapse" style="margin-bottom: 20px;">
      </div> -->

      <!-- <div style="padding: 20px">
        <el-text style="color: grey">
          参数说明：<br />
          - 模型名称：必选<br />
          - 训练阶段：必选，支持选择pretrain和sft<br />
          - 版本：必填，本次训练的备注标识，通过版本可以区分训练任务<br />
          - 数据集名称：可选，使用预置的测试数据集<br />
          - 镜像：必填，AIAK镜像地址，支持2.1.1.5以上<br />
          - 挂载路径：必填，挂载的PFS路径<br />
          - 副本数：选填，根据模型参数选择，一般7b 1实例、13b 2实例、70b
          4实例，不填写时默认使用AIAK推荐机数<br />
          - TP：选填，张量并行切分策略，不填写时默认使用AIAK推荐切分策略<br />
          - PP：选填，流水线并行切分策略，不填写时默认使用AIAK推荐切分策略<br />
          -
          模型URL：选填，HF格式模型权重的BOS存储地址，填写时会使用填写的地址覆盖默认地址<br />
          -
          数据集URL：选填，数据集的BOS存储地址，填写时会使用填写的地址覆盖默认测试数据集地址<br />
        </el-text>
      </div> -->
      <!-- 提交按钮 -->
      <el-row :gutter="20">
        <el-col :span="24">
          <el-form-item>
            <el-button type="primary" @click="handleSubmit">预览执行命令</el-button>
            <el-button disabled @click="handleReset">重置</el-button>
            <el-button disabled type="primary" @click="handleReset">保存为脚本</el-button>
            <el-button disabled @click="handleReset">导入</el-button>
            <el-button disabled @click="handleReset">历史记录</el-button>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <!-- 表单结束 -->
    <!-- 生成的参数展示 -->
    <el-card v-if="generatedParams" class="box-card" style="margin-top: 20px">
      <div class="clearfix">
        <el-button style="float: right; padding: 3px 0" type="primary" size="small" @click="copyToClipboard">
          复制到剪切板
        </el-button>
      </div>
      <pre class="pre-wrap">{{ generatedParams }}</pre>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { reactive, computed, watch, ref } from "vue";
import { ElMessage, FormRules, CollapseModelValue, CascaderProps } from "element-plus";
import {
  generateTraining,
  getReplicas,
  AiakTrainingJob,
} from "./aiak-parms";
import { useStore } from "../store"; // 确保从 vuex 导入 useStore
import { ResourcePool, Job } from "../store/types";
import axios from "axios";
import { getAccessToken } from "../utils/auth";
import {
  generateShellScriptFromJSON,
  TrainingParameters,
  parseShellScriptToJSON,
} from '../utils/tool'

const activeNames = ref([''])
const handleChange = (val: CollapseModelValue) => {
  console.log(val)
  return val
}

const store = useStore();

const resourcepoolList = computed<ResourcePool[]>(
  () => store.getters.resourcepoolList
);
console.log(resourcepoolList.value);

const resourcePoolId = ref("");
const resourcePoolInfo = ref({} as ResourcePool);

// 解析 Shell 脚本
const parms = parseShellScriptToJSON();
console.info(parms);

// 定义响应式的表单模型
let formModel: TrainingParameters = reactive(parms)
const msg = ref("训练参数编辑器");

// 定义生成的参数
const generatedParams = ref("");

// 定义模型选项
const modelOptions = [
  "llama2-7b",
  "llama2-13b",
  "llama2-70b",
  "llama3-8b",
  "llama3-70b",
  "qwen2-0.5b",
  "qwen2-1.5b",
  "qwen2-7b",
  "qwen2-72b",
  "baichuan2-7b",
  "baichuan2-13b",
  "qwen-1.8b",
  "qwen-7b",
  "qwen-14b",
  "qwen-72b",
  "qwen1.5-0.5b",
  "qwen1.5-1.8b",
  "qwen1.5-4b",
  "qwen1.5-7b",
  "qwen1.5-14b",
  "qwen1.5-32b",
  "qwen1.5-72b",
  "mixtral-8x7b",
  "mixtral-8x22b",
];

const setCheckpointConfigLoad = (path: string) => {
  formModel.checkpointConfig.load = path;
}

const setCheckpointConfigSave = (path: string) => {
  formModel.checkpointConfig.save = path;
}

const setOtherTrainingParamsTensorboardDir = (path: string) => {
  formModel.otherTrainingParams['tensorboard-dir'] = path;
}

const setDataParamsDataCachePath = (path: string) => {
  formModel.dataParams['data-cache-path'] = path;
}

const setDataParamsDataPath = (path: string) => {
  formModel.dataParams['data-path'] = path;
}

const setDataParamsTrainDataPath = (path: string) => {
  formModel.dataParams['train-data-path'] = path;
}

const setDataParamsValidDataPath = (path: string) => {
  formModel.dataParams['valid-data-path'] = path;
}

const setDataParamsTestDataPath = (path: string) => {
  formModel.dataParams['test-data-path'] = path;
}

// 监听 trainingPhase 变化，重置 datasetName
watch(
  () => formModel.initialization['training-phase'],
  (newPhase) => {
    console.log("newPhase", newPhase);
  }
);

watch(
  () => formModel.basicInfo["model-name"],
  (newName) => {
    formModel.basicInfo.replicas = getReplicas(newName);
  }
);

// 定义表单验证规则
const rules: FormRules = {
  modelName: [{ required: true, message: "请选择模型名称", trigger: "blur" }],
  replicas: [
    { required: false, message: "请输入训练机数", trigger: "blur" },
    { type: "number", min: 1, message: "副本数必须为正整数", trigger: "blur" },
  ],
  trainingPhase: [
    { required: true, message: "请选择训练阶段", trigger: "blur" },
  ],
  // 根据需要为其他字段添加更多规则
};

// 引用表单实例
const formRef = ref();

let job_info: AiakTrainingJob = {} as AiakTrainingJob;

// 提交表单
const handleSubmit = () => {
  console.log("submit!");
  console.log(JSON.stringify(formModel));

  // 生成 Shell 脚本
  const script = generateShellScriptFromJSON(formModel);
  console.log(script);
  generatedParams.value = script; // 格式化显示

  formRef.value.validate((valid: boolean) => {
    console.log("valid", valid);
    if (valid) {
      const aiakJobConfig = {
        MODEL_NAME: formModel.basicInfo["model-name"],
        REPLICAS: formModel.basicInfo.replicas,
        // VERSION: formModel.basicInfo.version,
        TRAINING_PHASE: formModel.initialization['training-phase'],
      };

      try {
        job_info = generateTraining(aiakJobConfig);
        console.log(job_info);
        ElMessage.success("已生成成功");
      } catch (error) {
        ElMessage.error("生成参数时出错，请检查输入");
        console.error(error);
      }
    } else {
      ElMessage.error("有必填项未填写");
      return false;
    }
  });
};

// 复制到剪切板
const copyToClipboard = async () => {
  if (!generatedParams.value) {
    ElMessage.warning("没有生成的参数可以复制");
    return;
  }
  try {
    await navigator.clipboard.writeText(generatedParams.value);
    ElMessage.success("复制成功！");
  } catch (err) {
    ElMessage.error("复制失败，请手动复制");
    console.error(err);
  }
};

// 重置表单
const handleReset = () => {
  formModel = parseShellScriptToJSON();
  if (formRef.value) {
    formRef.value.resetFields();
    generatedParams.value = ""; // 可选：清除生成的参数展示
    // formModel.basicInfo.version = timeStr() + '.sh'; // 重置版本号
    ElMessage.success("表单已重置");
  }
};

const getResourcePoolInfo = () => {
  resourcePoolInfo.value =
    resourcepoolList.value.find(
      (item) => item.metadata.id === resourcePoolId.value
    ) || ({} as ResourcePool);
  console.log(JSON.stringify(resourcePoolInfo.value));
};

// 获取资源池列表的 Action
const fetchResourcePools = async () => {
  if (resourcepoolList.value.length > 0) {
    resourcePoolId.value = resourcepoolList.value[0].metadata.id;
  }
  if (resourcePoolId.value) {
    getResourcePoolInfo();
  }
};
fetchResourcePools();
</script>

<style>
.ep-button {
  margin: 4px;
}

.ep-button+.ep-button {
  margin-left: 0;
  margin: 4px;
}

/* 为表单添加一些间距 */
.el-form {
  width: 100%;
  padding: 20px;
}

/* 调整 el-row 间距 */
.el-row {
  margin: 0;
}

/* 调整生成参数展示框样式 */
.box-card {
  width: 100%;
  padding: 20px;
  word-break: break-word;
  /* 允许在单词内换行 */
  white-space: pre-wrap;
  /* 保留空格和换行符，并允许自动换行 */
  background-color: #f9f9f9;
  border: 1px solid #ebeef5;
}

/* 确保 pre 标签自动换行 */
.pre-wrap {
  white-space: pre-wrap;
  word-wrap: break-word;
  word-break: break-word;
  overflow-wrap: break-word;
}
</style>
