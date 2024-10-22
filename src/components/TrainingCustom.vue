<template>
  <div style="
      padding: 0px 20px;
      max-width: 1200px;
      margin: 0 auto;
      text-align: left;
    ">
    <h1 color="$ep-color-primary">{{ msg }}</h1>

    <!-- 表单开始 -->
    <el-form ref="formRef" :model="formModel" :rules="rules" @submit.prevent="handleSubmit" label-width="120px"
      label-position="left">
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
            <el-select v-model="formModel.basicInfo.trainingPhase" placeholder="请选择训练阶段">
              <el-option label="SFT" value="sft"></el-option>
              <el-option label="Pretrain" value="pretrain"></el-option>
              <!-- 根据需要添加更多选项 -->
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item required label="版本" prop="version">
            <el-input v-model="formModel.basicInfo.version" placeholder="请输入版本，允许数字、字母、中划线"></el-input>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="8">
          <el-form-item label="训练机数" prop="replicas">
            <el-input-number v-model="formModel.basicInfo.replicas" :min="1" placeholder="请输入训练机数"
              style="width: 100%"></el-input-number>
          </el-form-item>
        </el-col>

        <el-col :span="8">
          <el-form-item label="TP" prop="tp">
            <el-input-number v-model="formModel.distributedParams['tensor-model-parallel-size']" :min="1"
              placeholder="请输入 TP 值，必须为正整数" style="width: 100%"></el-input-number>
          </el-form-item>
        </el-col>

        <el-col :span="8">
          <el-form-item label="PP" prop="pp">
            <el-input-number v-model="formModel.distributedParams.pipelineModelParallelSize" :min="1"
              placeholder="请输入 PP 值，必须为正整数" style="width: 100%"></el-input-number>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">

        <el-col :span="8">
          <el-form-item required label="权重路径" prop="mountPath">
            <el-input v-model="formModel.checkpointConfig.load" placeholder="请选择权重路径"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item required label="TOKENIZER" prop="mountPath">
            <el-input v-model="formModel.dataParams.hfTokenizerPath" placeholder="请选择TOKENIZER路径"></el-input>
          </el-form-item>
        </el-col>
      </el-row>

      <el-collapse style="margin-bottom: 20px;" v-model="activeNames" @change="handleChange">
        <!-- 1）数据参数 -->
        <el-collapse-item title="数据参数" name="1">
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item required label="data-path" prop="dataPath">
                <el-input v-model="formModel.dataParams.dataPath" placeholder="请输入预训练数据集文件路径"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="split" prop="split">
                <el-input v-model="formModel.dataParams.split"
                  placeholder="Train/Validate/Test使用数据占比，例如969,30,1"></el-input>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="train-data-path" prop="trainDataPath">
                <el-input v-model="formModel.dataParams.trainDataPath" placeholder="请输入训练集路径"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="valid-data-path" prop="validDataPath">
                <el-input v-model="formModel.dataParams.validDataPath" placeholder="请输入验证集路径"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="test-data-path" prop="testDataPath">
                <el-input v-model="formModel.dataParams.testDataPath" placeholder="请输入测试集路径"></el-input>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="data-cache-path" prop="dataCachePath">
                <el-input v-model="formModel.dataParams.dataCachePath" placeholder="请输入缓存存储路径"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="no-mmap-bin-files" prop="noMmapBinFiles">
                <el-switch v-model="formModel.dataParams.noMmapBinFiles" active-text="开启"
                  inactive-text="关闭"></el-switch>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="mock-data" prop="mockData">
                <el-switch v-model="formModel.dataParams.mockData" active-text="是" inactive-text="否"></el-switch>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="dataloader-type" prop="dataloaderType">
                <el-select v-model="formModel.dataParams.dataloaderType" placeholder="请选择数据加载类型">
                  <el-option label="single" value="single"></el-option>
                  <el-option label="cyclic" value="cyclic"></el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="num-workers" prop="numWorkers">
                <el-input-number v-model="formModel.dataParams.numWorkers" :min="0" placeholder="请输入 worker 数目"
                  style="width: 100%"></el-input-number>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item required label="tokenizer-type" prop="tokenizerType">
                <el-select v-model="formModel.dataParams.tokenizerType" placeholder="请选择 Tokenizer 类型">
                  <el-option label="NullTokenizer" value="NullTokenizer"></el-option>
                  <el-option label="Llama2Tokenizer" value="Llama2Tokenizer"></el-option>
                  <el-option label="HFTokenizer" value="HFTokenizer"></el-option>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="hf-tokenizer-path" prop="hfTokenizerPath">
                <el-input v-model="formModel.dataParams.hfTokenizerPath"
                  placeholder="请输入 Huggingface Tokenizer 路径"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="use-fast-tokenizer" prop="useFastTokenizer">
                <el-switch v-model="formModel.dataParams.useFastTokenizer" active-text="是"
                  inactive-text="否"></el-switch>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="tokenizer-model" prop="tokenizerModel">
                <el-input v-model="formModel.dataParams.tokenizerModel"
                  placeholder="请输入 Tokenizer model 文件地址"></el-input>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item required label="seq-length" prop="seqLength">
                <el-input-number v-model="formModel.dataParams.seqLength" :min="1" placeholder="请输入序列长度"
                  style="width: 100%"></el-input-number>
              </el-form-item>
            </el-col>
          </el-row>
        </el-collapse-item>

        <!-- 2）模型组网参数 -->
        <el-collapse-item title="模型组网参数" name="2">
          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item required label="num-layers" prop="numLayers">
                <el-input-number v-model="formModel.modelConfig.numLayers" :min="1" placeholder="请输入层数"
                  style="width: 100%"></el-input-number>
              </el-form-item>
            </el-col>

            <el-col :span="8">
              <el-form-item required label="hidden-size" prop="hiddenSize">
                <el-input-number v-model="formModel.modelConfig.hiddenSize" :min="1" placeholder="请输入隐层维数"
                  style="width: 100%"></el-input-number>
              </el-form-item>
            </el-col>

            <el-col :span="8">
              <el-form-item label="ffn-hidden-size" prop="ffnHiddenSize">
                <el-input-number v-model="formModel.modelConfig.ffnHiddenSize" :min="1" placeholder="请输入 FFN 隐层维数"
                  style="width: 100%"></el-input-number>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item required label="num-attention-heads" prop="numAttentionHeads">
                <el-input-number v-model="formModel.modelConfig.numAttentionHeads" :min="1"
                  placeholder="请输入自注意力的 head 数" style="width: 100%"></el-input-number>
              </el-form-item>
            </el-col>

            <el-col :span="8">
              <el-form-item label="group-query-attention" prop="groupQueryAttention">
                <el-switch v-model="formModel.modelConfig.groupQueryAttention" active-text="启用"
                  inactive-text="禁用"></el-switch>
              </el-form-item>
            </el-col>

            <el-col :span="8">
              <el-form-item label="num-query-groups" prop="numQueryGroups">
                <el-input-number v-model="formModel.modelConfig.numQueryGroups" :min="1"
                  placeholder="请输入 GQA 中 Query 头分组数" style="width: 100%"></el-input-number>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item required label="position-embedding-type" prop="positionEmbeddingType">
                <el-select v-model="formModel.modelConfig.positionEmbeddingType"
                  placeholder="请选择 Position Embedding 类型">
                  <el-option label="learned_absolute" value="learned_absolute"></el-option>
                  <el-option label="rope" value="rope"></el-option>
                  <el-option label="alibi" value="alibi"></el-option>
                </el-select>
              </el-form-item>
            </el-col>

            <el-col :span="8" v-if="formModel.modelConfig.positionEmbeddingType === 'learned_absolute'">
              <el-form-item label="max-position-embeddings" prop="maxPositionEmbeddings">
                <el-input-number v-model="formModel.modelConfig.maxPositionEmbeddings" :min="1" placeholder="请输入最大序列长度"
                  style="width: 100%"></el-input-number>
              </el-form-item>
            </el-col>

            <el-col :span="8">
              <el-form-item label="rotary-interleaved" prop="rotaryInterleaved">
                <el-switch v-model="formModel.modelConfig.rotaryInterleaved" active-text="是"
                  inactive-text="否"></el-switch>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="8" v-if="formModel.modelConfig.rotaryInterleaved">
              <el-form-item label="rotary-percent" prop="rotaryPercent">
                <el-input-number v-model="formModel.modelConfig.rotaryPercent" :min="0" :max="1" :step="0.1"
                  placeholder="请输入 Rotary dimension 百分比" style="width: 100%"></el-input-number>
              </el-form-item>
            </el-col>

            <el-col :span="8" v-if="formModel.modelConfig.rotaryInterleaved">
              <el-form-item label="rotary-base" prop="rotaryBase">
                <el-input-number v-model="formModel.modelConfig.rotaryBase" :min="1" placeholder="请输入 Rotary Base 数值"
                  style="width: 100%"></el-input-number>
              </el-form-item>
            </el-col>

            <el-col :span="8" v-if="formModel.modelConfig.rotaryInterleaved">
              <el-form-item label="rotary-seq-len-interpolation-factor" prop="rotarySeqLenInterpolationFactor">
                <el-input-number v-model="formModel.modelConfig.rotarySeqLenInterpolationFactor" :min="1"
                  placeholder="请输入序列长度线性插值因子" style="width: 100%"></el-input-number>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="attention-dropout" prop="attentionDropout">
                <el-input-number v-model="formModel.modelConfig.attentionDropout" :min="0" :max="1" :step="0.01"
                  placeholder="请输入 attention dropout 概率" style="width: 100%"></el-input-number>
              </el-form-item>
            </el-col>

            <el-col :span="8">
              <el-form-item label="hidden-dropout" prop="hiddenDropout">
                <el-input-number v-model="formModel.modelConfig.hiddenDropout" :min="0" :max="1" :step="0.01"
                  placeholder="请输入 hidden dropout 概率" style="width: 100%"></el-input-number>
              </el-form-item>
            </el-col>

            <el-col :span="8">
              <el-form-item label="normalization" prop="normalization">
                <el-select v-model="formModel.modelConfig.normalization" placeholder="请选择 normalization 类型">
                  <el-option label="LayerNorm" value="LayerNorm"></el-option>
                  <el-option label="RMSNorm" value="RMSNorm"></el-option>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="norm-epsilon" prop="normEpsilon">
                <el-input-number v-model="formModel.modelConfig.normEpsilon" :min="1e-10" :step="1e-6"
                  placeholder="请输入 normalization Epsilon 数值" style="width: 100%"></el-input-number>
              </el-form-item>
            </el-col>

            <el-col :span="8">
              <el-form-item label="use-normhead" prop="useNormhead">
                <el-switch v-model="formModel.modelConfig.useNormhead" active-text="启用" inactive-text="禁用"></el-switch>
              </el-form-item>
            </el-col>

            <el-col :span="8">
              <el-form-item label="swiglu" prop="swiglu">
                <el-switch v-model="formModel.modelConfig.swiglu" active-text="启用" inactive-text="禁用"></el-switch>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="disable-bias-linear" prop="disableBiasLinear">
                <el-switch v-model="formModel.modelConfig.disableBiasLinear" active-text="启用"
                  inactive-text="禁用"></el-switch>
              </el-form-item>
            </el-col>

            <el-col :span="8">
              <el-form-item label="add-qkv-bias" prop="addQkvBias">
                <el-switch v-model="formModel.modelConfig.addQkvBias" active-text="启用" inactive-text="禁用"></el-switch>
              </el-form-item>
            </el-col>

            <el-col :span="8">
              <el-form-item label="make-vocab-size-divisible-by" prop="makeVocabSizeDivisibleBy">
                <el-input-number v-model="formModel.modelConfig.makeVocabSizeDivisibleBy" :min="1"
                  placeholder="请输入可被整除的数值" style="width: 100%"></el-input-number>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="untie-embeddings-and-output-weights" prop="untieEmbeddingsAndOutputWeights">
                <el-switch v-model="formModel.modelConfig.untieEmbeddingsAndOutputWeights" active-text="启用"
                  inactive-text="禁用"></el-switch>
              </el-form-item>
            </el-col>
          </el-row>
        </el-collapse-item>

        <!-- 3）初始化参数 -->
        <el-collapse-item title="初始化参数" name="3">
          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="seed" prop="seed">
                <el-input-number v-model="formModel.initialization.seed" :min="0" placeholder="请输入随机种子"
                  style="width: 100%"></el-input-number>
              </el-form-item>
            </el-col>

            <el-col :span="8">
              <el-form-item label="data-parallel-random-init" prop="dataParallelRandomInit">
                <el-switch v-model="formModel.initialization.dataParallelRandomInit" active-text="启用"
                  inactive-text="禁用"></el-switch>
              </el-form-item>
            </el-col>

            <el-col :span="8">
              <el-form-item label="init-method-std" prop="initMethodStd">
                <el-input-number v-model="formModel.initialization.initMethodStd" :min="0" :step="0.01"
                  placeholder="请输入初始化标准差" style="width: 100%"></el-input-number>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="init-method-xavier-uniform" prop="initMethodXavierUniform">
                <el-switch v-model="formModel.initialization.initMethodXavierUniform" active-text="启用"
                  inactive-text="禁用"></el-switch>
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
                <el-input-number v-model="formModel.optimizerConfig.minLr" :min="0" :step="0.0001"
                  placeholder="请输入最小学习率" style="width: 100%"></el-input-number>
              </el-form-item>
            </el-col>

            <el-col :span="8">
              <el-form-item required label="lr-decay-style" prop="lrDecayStyle">
                <el-select v-model="formModel.optimizerConfig.lrDecayStyle" placeholder="请选择学习率衰减方式">
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
                <el-input-number v-model="formModel.optimizerConfig.lrDecayIters" :min="1" placeholder="请输入学习率衰减迭代次数"
                  style="width: 100%"></el-input-number>
              </el-form-item>
            </el-col>

            <el-col :span="8">
              <el-form-item label="lr-warmup-fraction" prop="lrWarmupFraction">
                <el-input-number v-model="formModel.optimizerConfig.lrWarmupFraction" :min="0" :max="1" :step="0.01"
                  placeholder="请输入 warmup 比例" style="width: 100%"></el-input-number>
              </el-form-item>
            </el-col>

            <el-col :span="8">
              <el-form-item label="optimizer" prop="optimizer">
                <el-select v-model="formModel.optimizerConfig.optimizer" placeholder="请选择优化器类型">
                  <el-option label="adam" value="adam"></el-option>
                  <el-option label="sgd" value="sgd"></el-option>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item required label="weight-decay" prop="weightDecay">
                <el-input-number v-model="formModel.optimizerConfig.weightDecay" :min="0" :step="0.001"
                  placeholder="请输入权重衰减系数" style="width: 100%"></el-input-number>
              </el-form-item>
            </el-col>

            <el-col :span="8">
              <el-form-item label="clip-grad" prop="clipGrad">
                <el-input-number v-model="formModel.optimizerConfig.clipGrad" :min="0" :step="0.1"
                  placeholder="请输入梯度剪裁阈值" style="width: 100%"></el-input-number>
              </el-form-item>
            </el-col>

            <el-col :span="8">
              <el-form-item label="adam-beta1" prop="adamBeta1">
                <el-input-number v-model="formModel.optimizerConfig.adamBeta1" :min="0" :max="1" :step="0.01"
                  placeholder="请输入 Adam beta1 系数" style="width: 100%"></el-input-number>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="adam-beta2" prop="adamBeta2">
                <el-input-number v-model="formModel.optimizerConfig.adamBeta2" :min="0" :max="1" :step="0.001"
                  placeholder="请输入 Adam beta2 系数" style="width: 100%"></el-input-number>
              </el-form-item>
            </el-col>

            <el-col :span="8">
              <el-form-item label="adam-eps" prop="adamEps">
                <el-input-number v-model="formModel.optimizerConfig.adamEps" :min="1e-10" :step="1e-8"
                  placeholder="请输入 Adam eps" style="width: 100%"></el-input-number>
              </el-form-item>
            </el-col>

            <el-col :span="8" v-if="formModel.optimizerConfig.optimizer === 'sgd'">
              <el-form-item label="sgd-momentum" prop="sgdMomentum">
                <el-input-number v-model="formModel.optimizerConfig.sgdMomentum" :min="0" :max="1" :step="0.1"
                  placeholder="请输入 SGD 动量因子" style="width: 100%"></el-input-number>
              </el-form-item>
            </el-col>
          </el-row>
        </el-collapse-item>

        <!-- 5）Checkpoint 读取和保存参数 -->
        <el-collapse-item title="Checkpoint 读取和保存参数" name="5">
          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="load" prop="load">
                <el-input v-model="formModel.checkpointConfig.load" placeholder="请输入加载模型的文件夹路径"></el-input>
              </el-form-item>
            </el-col>

            <el-col :span="8">
              <el-form-item label="no-load-optim" prop="noLoadOptim">
                <el-switch v-model="formModel.checkpointConfig.noLoadOptim" active-text="是"
                  inactive-text="否"></el-switch>
              </el-form-item>
            </el-col>

            <el-col :span="8">
              <el-form-item label="no-load-rng" prop="noLoadRng">
                <el-switch v-model="formModel.checkpointConfig.noLoadRng" active-text="是" inactive-text="否"></el-switch>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="save" prop="save">
                <el-input v-model="formModel.checkpointConfig.save" placeholder="请输入保存模型的文件夹路径"></el-input>
              </el-form-item>
            </el-col>

            <el-col :span="8">
              <el-form-item label="save-interval" prop="saveInterval">
                <el-input-number v-model="formModel.checkpointConfig.saveInterval" :min="1" placeholder="请输入保存间隔步数"
                  style="width: 100%"></el-input-number>
              </el-form-item>
            </el-col>

            <el-col :span="8">
              <el-form-item label="no-save-optim" prop="noSaveOptim">
                <el-switch v-model="formModel.checkpointConfig.noSaveOptim" active-text="是"
                  inactive-text="否"></el-switch>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="no-save-rng" prop="noSaveRng">
                <el-switch v-model="formModel.checkpointConfig.noSaveRng" active-text="是" inactive-text="否"></el-switch>
              </el-form-item>
            </el-col>

            <el-col :span="8">
              <el-form-item label="ckpt-step" prop="ckptStep">
                <el-input-number v-model="formModel.checkpointConfig.ckptStep" :min="1"
                  placeholder="请输入具体 step 的 checkpoint" style="width: 100%"></el-input-number>
              </el-form-item>
            </el-col>
          </el-row>
        </el-collapse-item>

        <!-- 6）混合精度参数 -->
        <el-collapse-item title="混合精度参数" name="6">
          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="fp16" prop="fp16">
                <el-switch v-model="formModel.mixedPrecision.fp16" active-text="启用" inactive-text="禁用"></el-switch>
              </el-form-item>
            </el-col>

            <el-col :span="8">
              <el-form-item label="bf16" prop="bf16">
                <el-switch v-model="formModel.mixedPrecision.bf16" active-text="启用" inactive-text="禁用"></el-switch>
              </el-form-item>
            </el-col>

            <el-col :span="8">
              <el-form-item label="loss-scale" prop="lossScale">
                <el-input-number v-model="formModel.mixedPrecision.lossScale" :min="1" :step="1"
                  placeholder="请输入 loss scale" style="width: 100%"></el-input-number>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20" v-if="formModel.mixedPrecision.fp16 || formModel.mixedPrecision.bf16">
            <el-col :span="8">
              <el-form-item label="initial-loss-scale" prop="initialLossScale">
                <el-input-number v-model="formModel.mixedPrecision.initialLossScale" :min="1" :step="1"
                  placeholder="请输入初始 loss scale" style="width: 100%"></el-input-number>
              </el-form-item>
            </el-col>

            <el-col :span="8">
              <el-form-item label="min-loss-scale" prop="minLossScale">
                <el-input-number v-model="formModel.mixedPrecision.minLossScale" :min="1" :step="0.1"
                  placeholder="请输入最小 loss scale" style="width: 100%"></el-input-number>
              </el-form-item>
            </el-col>

            <el-col :span="8">
              <el-form-item label="loss-scale-window" prop="lossScaleWindow">
                <el-input-number v-model="formModel.mixedPrecision.lossScaleWindow" :min="1"
                  placeholder="请输入 loss scale 窗口大小" style="width: 100%"></el-input-number>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="accumulate-allreduce-grads-in-fp32" prop="accumulateAllreduceGradsInFp32">
                <el-switch v-model="formModel.mixedPrecision.accumulateAllreduceGradsInFp32" active-text="启用"
                  inactive-text="禁用"></el-switch>
              </el-form-item>
            </el-col>
          </el-row>
        </el-collapse-item>
        <!-- 7) 分布式参数 -->
        <el-collapse-item title="分布式参数" name="7">
          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="tensor-model-parallel-size" prop="tensorModelParallelSize">
                <el-input-number v-model="formModel.distributedParams.tensorModelParallelSize" :min="1"
                  placeholder="请输入张量并行维数" style="width: 100%"></el-input-number>
              </el-form-item>
            </el-col>

            <el-col :span="8">
              <el-form-item label="pipeline-model-parallel-size" prop="pipelineModelParallelSize">
                <el-input-number v-model="formModel.distributedParams.pipelineModelParallelSize" :min="1"
                  placeholder="请输入流水并行维数" style="width: 100%"></el-input-number>
              </el-form-item>
            </el-col>

            <el-col :span="8">
              <el-form-item label="num-layers-per-virtual-pipeline-stage" prop="numLayersPerVirtualPipelineStage">
                <el-input-number v-model="formModel.distributedParams.numLayersPerVirtualPipelineStage" :min="1"
                  placeholder="请输入每个 model chunk 的层数" style="width: 100%"></el-input-number>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="no-overlap-p2p-communication" prop="noOverlapP2pCommunication">
                <el-switch v-model="formModel.distributedParams.noOverlapP2pCommunication" active-text="禁用"
                  inactive-text="启用"></el-switch>
              </el-form-item>
            </el-col>

            <el-col :span="8">
              <el-form-item label="distributed-backend" prop="distributedBackend">
                <el-select v-model="formModel.distributedParams.distributedBackend" placeholder="请选择通信后端">
                  <el-option label="nccl" value="nccl"></el-option>
                  <el-option label="gloo" value="gloo"></el-option>
                </el-select>
              </el-form-item>
            </el-col>

            <el-col :span="8">
              <el-form-item label="distributed-timeout-minutes" prop="distributedTimeoutMinutes">
                <el-input-number v-model="formModel.distributedParams.distributedTimeoutMinutes" :min="1"
                  placeholder="请输入超时时间（分钟）" style="width: 100%"></el-input-number>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="use-distributed-optimizer" prop="useDistributedOptimizer">
                <el-switch v-model="formModel.distributedParams.useDistributedOptimizer" active-text="启用"
                  inactive-text="禁用"></el-switch>
              </el-form-item>
            </el-col>

            <el-col :span="8">
              <el-form-item label="overlap-grad-reduce" prop="overlapGradReduce">
                <el-switch v-model="formModel.distributedParams.overlapGradReduce" active-text="启用"
                  inactive-text="禁用"></el-switch>
              </el-form-item>
            </el-col>

            <el-col :span="8">
              <el-form-item label="overlap-param-gather" prop="overlapParamGather">
                <el-switch v-model="formModel.distributedParams.overlapParamGather" active-text="启用"
                  inactive-text="禁用"></el-switch>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="context-parallel-size" prop="contextParallelSize">
                <el-input-number v-model="formModel.distributedParams.contextParallelSize" :min="1"
                  placeholder="请输入 Context 序列并行维数" style="width: 100%"></el-input-number>
              </el-form-item>
            </el-col>

            <el-col :span="8">
              <el-form-item label="expert-model-parallel-size" prop="expertModelParallelSize">
                <el-input-number v-model="formModel.distributedParams.expertModelParallelSize" :min="1"
                  placeholder="请输入专家并行维数" style="width: 100%"></el-input-number>
              </el-form-item>
            </el-col>

            <el-col :span="8">
              <el-form-item label="tp-comm-overlap" prop="tpCommOverlap">
                <el-switch v-model="formModel.distributedParams.tpCommOverlap" active-text="启用"
                  inactive-text="禁用"></el-switch>
              </el-form-item>
            </el-col>
          </el-row>
        </el-collapse-item>

        <!-- 8) 显存策略参数 -->
        <el-collapse-item title="显存策略参数" name="8">
          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="sequence-parallel" prop="sequenceParallel">
                <el-switch v-model="formModel.memoryOptimization.sequenceParallel" active-text="启用"
                  inactive-text="禁用"></el-switch>
              </el-form-item>
            </el-col>

            <el-col :span="8">
              <el-form-item label="recompute-activations" prop="recomputeActivations">
                <el-switch v-model="formModel.memoryOptimization.recomputeActivations" active-text="启用"
                  inactive-text="禁用"></el-switch>
              </el-form-item>
            </el-col>

            <el-col :span="8">
              <el-form-item label="recompute-granularity" prop="recomputeGranularity">
                <el-select v-model="formModel.memoryOptimization.recomputeGranularity" placeholder="请选择重计算粒度">
                  <el-option label="full" value="full"></el-option>
                  <el-option label="selective" value="selective"></el-option>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="recompute-method" prop="recomputeMethod">
                <el-select v-model="formModel.memoryOptimization.recomputeMethod" placeholder="请选择重计算方式">
                  <el-option label="uniform" value="uniform"></el-option>
                  <el-option label="block" value="block"></el-option>
                </el-select>
              </el-form-item>
            </el-col>

            <el-col :span="8">
              <el-form-item label="recompute-num-layers" prop="recomputeNumLayers">
                <el-input-number v-model="formModel.memoryOptimization.recomputeNumLayers" :min="1"
                  placeholder="请输入重计算层数" style="width: 100%"></el-input-number>
              </el-form-item>
            </el-col>

            <el-col :span="8">
              <el-form-item label="distribute-saved-activations" prop="distributeSavedActivations">
                <el-switch v-model="formModel.memoryOptimization.distributeSavedActivations" active-text="启用"
                  inactive-text="禁用"></el-switch>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="offload-optimizer" prop="offloadOptimizer">
                <el-select v-model="formModel.memoryOptimization.offloadOptimizer"
                  placeholder="请选择 optimizer offload 功能">
                  <el-option label="disabled" value="disabled"></el-option>
                  <el-option label="auto" value="auto"></el-option>
                  <el-option label="manual" value="manual"></el-option>
                </el-select>
              </el-form-item>
            </el-col>

            <el-col :span="8" v-if="formModel.memoryOptimization.offloadOptimizer === 'manual'">
              <el-form-item label="offload-optimizer-percent" prop="offloadOptimizerPercent">
                <el-input-number v-model="formModel.memoryOptimization.offloadOptimizerPercent" :min="0" :max="1"
                  :step="0.1" placeholder="请输入 optimizer offload 比例" style="width: 100%"></el-input-number>
              </el-form-item>
            </el-col>

            <el-col :span="8">
              <el-form-item label="no-overlap-offload-optimizer" prop="noOverlapOffloadOptimizer">
                <el-switch v-model="formModel.memoryOptimization.noOverlapOffloadOptimizer" active-text="是"
                  inactive-text="否"></el-switch>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="cpu-adam-threads" prop="cpuAdamThreads">
                <el-input-number v-model="formModel.memoryOptimization.cpuAdamThreads" :min="1"
                  placeholder="请输入 CPU 上优化器计算的线程数" style="width: 100%"></el-input-number>
              </el-form-item>
            </el-col>
          </el-row>
        </el-collapse-item>

        <!-- 9) MoE 训练参数 -->
        <el-collapse-item title="MoE训练参数" name="9">
          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="moe-router-load-balancing-type" prop="moeRouterLoadBalancingType">
                <el-select v-model="formModel.moeParams.moeRouterLoadBalancingType" placeholder="请选择 router 负载均衡策略">
                  <el-option label="aux_loss" value="aux_loss"></el-option>
                  <el-option label="sinkhorn" value="sinkhorn"></el-option>
                  <el-option label="none" value="none"></el-option>
                </el-select>
              </el-form-item>
            </el-col>

            <el-col :span="8">
              <el-form-item label="moe-router-topk" prop="moeRouterTopk">
                <el-input-number v-model="formModel.moeParams.moeRouterTopk" :min="1"
                  placeholder="请输入每个 token 需要路由的专家数目" style="width: 100%"></el-input-number>
              </el-form-item>
            </el-col>

            <el-col :span="8">
              <el-form-item label="moe-grouped-gemm" prop="moeGroupedGemm">
                <el-switch v-model="formModel.moeParams.moeGroupedGemm" active-text="启用" inactive-text="禁用"></el-switch>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="moe-aux-loss-coeff" prop="moeAuxLossCoeff">
                <el-input-number v-model="formModel.moeParams.moeAuxLossCoeff" :min="0" :step="0.1"
                  placeholder="请输入 aux loss 缩放系数" style="width: 100%"></el-input-number>
              </el-form-item>
            </el-col>

            <el-col :span="8">
              <el-form-item label="moe-z-loss-coeff" prop="moeZLossCoeff">
                <el-input-number v-model="formModel.moeParams.moeZLossCoeff" :min="0" :step="0.1"
                  placeholder="请输入 z-loss 缩放系数" style="width: 100%"></el-input-number>
              </el-form-item>
            </el-col>

            <el-col :span="8">
              <el-form-item label="moe-input-jitter-eps" prop="moeInputJitterEps">
                <el-input-number v-model="formModel.moeParams.moeInputJitterEps" :min="0" :step="0.01"
                  placeholder="请输入输入 tensor 添加噪声的值" style="width: 100%"></el-input-number>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="moe-token-dropping" prop="moeTokenDropping">
                <el-switch v-model="formModel.moeParams.moeTokenDropping" active-text="是" inactive-text="否"></el-switch>
              </el-form-item>
            </el-col>

            <el-col :span="8">
              <el-form-item label="moe-token-dispatcher-type" prop="moeTokenDispatcherType">
                <el-select v-model="formModel.moeParams.moeTokenDispatcherType" placeholder="请选择 token 分发通信模式">
                  <el-option label="allgather" value="allgather"></el-option>
                  <el-option label="alltoall" value="alltoall"></el-option>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="moe-input-jitter-eps" prop="moeInputJitterEps">
                <el-input-number v-model="formModel.moeParams.moeInputJitterEps" :min="0" :step="0.01"
                  placeholder="请输入输入 tensor 添加噪声的值" style="width: 100%"></el-input-number>
              </el-form-item>
            </el-col>
          </el-row>
        </el-collapse-item>

        <!-- 10) SFT 训练参数 -->
        <el-collapse-item title="SFT训练参数" name="10">
          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="chat-template" prop="chatTemplate">
                <el-select v-model="formModel.sftParams.chatTemplate" placeholder="请选择对话模板">
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
                <el-input v-model="formModel.sftParams.sftDatasetConfig" placeholder="请输入数据集配置文件路径"></el-input>
              </el-form-item>
            </el-col>

            <el-col :span="8">
              <el-form-item label="sft-dataset" prop="sftDataset">
                <el-input v-model="formModel.sftParams.sftDataset"
                  placeholder="请输入数据集名称，对应 --data-path 中的数据集文件"></el-input>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="sft-train-dataset" prop="sftTrainDataset">
                <el-input v-model="formModel.sftParams.sftTrainDataset"
                  placeholder="请输入仅训练的数据集名称，对应 --train-data-path 中的数据集文件"></el-input>
              </el-form-item>
            </el-col>

            <el-col :span="8">
              <el-form-item label="sft-valid-dataset" prop="sftValidDataset">
                <el-input v-model="formModel.sftParams.sftValidDataset"
                  placeholder="请输入仅验证的数据集名称，对应 --valid-data-path 中的数据集文件"></el-input>
              </el-form-item>
            </el-col>

            <el-col :span="8">
              <el-form-item label="sft-test-dataset" prop="sftTestDataset">
                <el-input v-model="formModel.sftParams.sftTestDataset"
                  placeholder="请输入仅测试的数据集名称，对应 --test-data-path 中的数据集文件"></el-input>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="sft-data-streaming" prop="sftDataStreaming">
                <el-switch v-model="formModel.sftParams.sftDataStreaming" active-text="启用"
                  inactive-text="禁用"></el-switch>
              </el-form-item>
            </el-col>

            <el-col :span="8">
              <el-form-item label="streaming-buffer-size" prop="streamingBufferSize">
                <el-input-number v-model="formModel.sftParams.streamingBufferSize" :min="1"
                  placeholder="请输入 streaming 模式下的 buffer size" style="width: 100%"></el-input-number>
              </el-form-item>
            </el-col>

            <el-col :span="8">
              <el-form-item label="sft-num-preprocess-workers" prop="sftNumPreprocessWorkers">
                <el-input-number v-model="formModel.sftParams.sftNumPreprocessWorkers" :min="1"
                  placeholder="请输入数据预处理 worker 数目" style="width: 100%"></el-input-number>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="train-on-prompt" prop="trainOnPrompt">
                <el-switch v-model="formModel.sftParams.trainOnPrompt" active-text="启用" inactive-text="禁用"></el-switch>
              </el-form-item>
            </el-col>

            <el-col :span="8">
              <el-form-item label="variable-seq-lengths" prop="variableSeqLengths">
                <el-switch v-model="formModel.sftParams.variableSeqLengths" active-text="启用"
                  inactive-text="禁用"></el-switch>
              </el-form-item>
            </el-col>

            <el-col :span="8">
              <el-form-item label="sft-data-mix-strategy" prop="sftDataMixStrategy">
                <el-select v-model="formModel.sftParams.sftDataMixStrategy" placeholder="请选择数据混合策略">
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
                <el-switch v-model="formModel.sftParams.isTokenizedData" active-text="是" inactive-text="否"></el-switch>
              </el-form-item>
            </el-col>

            <el-col :span="8">
              <el-form-item label="packing-sft-data" prop="packingSftData">
                <el-switch v-model="formModel.sftParams.packingSftData" active-text="启用" inactive-text="禁用"></el-switch>
              </el-form-item>
            </el-col>
          </el-row>
        </el-collapse-item>

        <!-- 11) 其他训练参数 -->
        <el-collapse-item title="其他训练参数" name="11">
          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="micro-batch-size" prop="microBatchSize">
                <el-input-number v-model="formModel.otherTrainingParams.microBatchSize" :min="1"
                  placeholder="请输入单次迭代每个rank的batch size" style="width: 100%"></el-input-number>
              </el-form-item>
            </el-col>

            <el-col :span="8">
              <el-form-item label="global-batch-size" prop="globalBatchSize">
                <el-input-number v-model="formModel.otherTrainingParams.globalBatchSize" :min="1"
                  placeholder="请输入分布式训练全局batch size" style="width: 100%"></el-input-number>
              </el-form-item>
            </el-col>

            <el-col :span="8">
              <el-form-item label="train-iters" prop="trainIters">
                <el-input-number v-model="formModel.otherTrainingParams.trainIters" :min="1" placeholder="请输入训练的迭代轮数"
                  style="width: 100%"></el-input-number>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="eval-iters" prop="evalIters">
                <el-input-number v-model="formModel.otherTrainingParams.evalIters" :min="1" placeholder="请输入评估的迭代步数"
                  style="width: 100%"></el-input-number>
              </el-form-item>
            </el-col>

            <el-col :span="8">
              <el-form-item label="eval-interval" prop="evalInterval">
                <el-input-number v-model="formModel.otherTrainingParams.evalInterval" :min="1"
                  placeholder="请输入在验证集上进行评估的间隔步数" style="width: 100%"></el-input-number>
              </el-form-item>
            </el-col>

            <el-col :span="8">
              <el-form-item label="log-interval" prop="logInterval">
                <el-input-number v-model="formModel.otherTrainingParams.logInterval" :min="1" placeholder="请输入日志打印的间隔步数"
                  style="width: 100%"></el-input-number>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="tensorboard-dir" prop="tensorboardDir">
                <el-input v-model="formModel.otherTrainingParams.tensorboardDir"
                  placeholder="请输入 tensorboard 文件写入路径"></el-input>
              </el-form-item>
            </el-col>

            <el-col :span="8">
              <el-form-item label="timing-log-level" prop="timingLogLevel">
                <el-select v-model="formModel.otherTrainingParams.timingLogLevel" placeholder="请选择 timing log 级别">
                  <el-option label="0" value="0"></el-option>
                  <el-option label="1" value="1"></el-option>
                  <el-option label="2" value="2"></el-option>
                </el-select>
              </el-form-item>
            </el-col>

            <el-col :span="8">
              <el-form-item label="timing-log-option" prop="timingLogOption">
                <el-select v-model="formModel.otherTrainingParams.timingLogOption" placeholder="请选择 timing log 选项">
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
                <el-input-number v-model="formModel.otherTrainingParams.tensorboardLogInterval" :min="1"
                  placeholder="请输入 tensorboard log 写入间隔" style="width: 100%"></el-input-number>
              </el-form-item>
            </el-col>

            <el-col :span="8">
              <el-form-item label="log-timers-to-tensorboard" prop="logTimersToTensorboard">
                <el-switch v-model="formModel.otherTrainingParams.logTimersToTensorboard" active-text="启用"
                  inactive-text="禁用"></el-switch>
              </el-form-item>
            </el-col>

            <el-col :span="8">
              <el-form-item label="log-validation-ppl-to-tensorboard" prop="logValidationPplToTensorboard">
                <el-switch v-model="formModel.otherTrainingParams.logValidationPplToTensorboard" active-text="启用"
                  inactive-text="禁用"></el-switch>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="wandb-project" prop="wandbProject">
                <el-input v-model="formModel.otherTrainingParams.wandbProject" placeholder="请输入 wandb 项目名称"></el-input>
              </el-form-item>
            </el-col>

            <el-col :span="8">
              <el-form-item label="wandb-exp-name" prop="wandbExpName">
                <el-input v-model="formModel.otherTrainingParams.wandbExpName" placeholder="请输入 wandb 实验名称"></el-input>
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
            <el-button type="primary" @click="handleSubmit">生成执行命令</el-button>
            <el-button @click="handleReset">重置</el-button>
            <div>
              <el-select v-if="generatedParams" v-model="resourcePoolId" placeholder="请选择资源池" style="width: 240px"
                @change="getResourcePoolInfo">
                <el-option v-for="item in resourcepoolList" :key="item.metadata.id" :label="item.metadata.name"
                  :value="item.metadata.id">
                  <span style="float: left">{{ item.metadata.name }}</span>
                  <span style="
                      float: right;
                      color: var(--el-text-color-secondary);
                      font-size: 13px;
                    ">
                    {{ item.metadata.id }}
                  </span>
                </el-option>
              </el-select>

              <el-button v-if="generatedParams" type="primary" @click="createJob">提交任务</el-button>
            </div>
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
import { ElMessage, FormRules, CollapseModelValue } from "element-plus";
import {
  generateTraining,
  timeStr,
  getReplicas,
  AiakTrainingJob,
} from "./aiak-parms";
import { useStore } from "../store"; // 确保从 vuex 导入 useStore
import { ResourcePool, Job } from "../store/types";
import axios from "axios";
import { getAccessToken } from "../utils/auth";
import { ActionTypes } from "../store/mutation-types";

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

// 定义响应式的表单模型
const formModel = reactive({
  // 基本信息
  basicInfo: {
    "model-name": "llama2-7b",
    replicas: 1,
    version: timeStr() + '.sh',
    trainingPhase: "sft",
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
    "chat-template": undefined, // --chat-template
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
});

const msg = ref("AIAK训练执行命令生成");

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
];

// 定义数据集选项
const pretrainDatasets = ["pile_llama_test", "WuDaoCorpus2.0_base_sample"];
const sftDatasets = ["alpaca_zh-llama3-train", "alpaca_zh-llama3-valid"];

// 计算当前数据集选项
const datasetOptions = computed(() => {
  if (formModel.basicInfo.trainingPhase === "pretrain") {
    return pretrainDatasets;
  } else if (formModel.basicInfo.trainingPhase === "sft") {
    return sftDatasets;
  } else {
    return [];
  }
});

// 监听 trainingPhase 变化，重置 datasetName
watch(
  () => formModel.basicInfo.trainingPhase,
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
  version: [
    { required: true, message: "请输入版本", trigger: "blur" },
    {
      pattern: /^[A-Za-z0-9\-]+$/,
      message: "版本只能包含数字、字母和中划线",
      trigger: "blur",
    },
  ],
  trainingPhase: [
    { required: true, message: "请选择训练阶段", trigger: "blur" },
  ],
  image: [{ required: true, message: "请输入镜像地址", trigger: "blur" }],
  mountPath: [{ required: true, message: "请输入挂载路径", trigger: "blur" }],
  // 根据需要为其他字段添加更多规则
};

// 引用表单实例
const formRef = ref();

let job_info: AiakTrainingJob = {} as AiakTrainingJob;

// 提交表单
const handleSubmit = () => {
  console.log("submit!");
  console.log(JSON.stringify(formModel));
  formRef.value.validate((valid: boolean) => {
    if (valid) {
      const aiakJobConfig = {
        MODEL_NAME: formModel.basicInfo["model-name"],
        REPLICAS: formModel.basicInfo.replicas,
        VERSION: formModel.basicInfo.version,
        TRAINING_PHASE: formModel.basicInfo.trainingPhase,
      };

      try {
        job_info = generateTraining(aiakJobConfig);
        console.log(job_info);
        generatedParams.value = job_info.command; // 格式化显示
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
  if (formRef.value) {
    formRef.value.resetFields();
    generatedParams.value = ""; // 可选：清除生成的参数展示
    formModel.basicInfo.version = timeStr() + '.sh'; // 重置版本号
    ElMessage.success("表单已重置");
  }
};

const createJob = async () => {
  const token = getAccessToken();
  if (!token) {
    ElMessage.error("在系统设置中配置API Key");
    return;
  }
  const body = {
    queue: "default",
    priority: "normal",
    jobFramework: "PyTorchJob",
    name: job_info.name,
    jobSpec: {
      command: job_info.command,
      image: job_info.image,
      replicas: Number(job_info.replicas),
      resources: [
        {
          name: "baidu.com/a800_80g_cgpu",
          quantity: 8,
        },
      ],
      enableRDMA: true,
      envs: [
        {
          name: "CUDA_DEVICE_MAX_CONNECTIONS",
          value: "1",
        },
      ],
    },
    datasources: [
      {
        type: "pfs",
        name: resourcePoolInfo.value.spec.associatedPfsId,
        sourcePath: "/",
        mountPath: job_info.mountPath,
      },
    ],
  };
  try {
    const res = await axios.post(
      `https://6d6q5xfg0drsm.cfc-execute.bj.baidubce.com/api/v1/aijobs`,
      body,
      {
        params: {
          resourcePoolId: resourcePoolInfo.value.metadata.id,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    console.log(res.data);
    if (res.data.result && res.data.result.jobId) {
      ElMessage.success("创建任务成功");
    } else {
      ElMessage.error("创建任务失败");
    }
  } catch (error) {
    console.error("Error copying job:", error);
    ElMessage.error("创建任务失败");
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
