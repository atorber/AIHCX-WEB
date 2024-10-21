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
            <el-select v-model="formModel.basicInfo.modelName" placeholder="请选择模型名称">
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
          <el-form-item label="数据集名称" prop="datasetName">
            <el-select v-model="formModel.basicInfo.datasetName" placeholder="请选择数据集名称">
              <el-option v-for="dataset in datasetOptions" :key="dataset" :label="dataset" :value="dataset"></el-option>
            </el-select>
          </el-form-item>
        </el-col>

        <el-col :span="8">
          <el-form-item required label="镜像" prop="image">
            <el-input v-model="formModel.basicInfo.image" placeholder="请输入镜像地址"></el-input>
          </el-form-item>
        </el-col>

        <el-col :span="8">
          <el-form-item required label="挂载路径" prop="mountPath">
            <el-input v-model="formModel.basicInfo.mountPath" placeholder="请输入挂载路径"></el-input>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="8">
          <el-form-item label="副本数" prop="replicas">
            <el-input-number v-model="formModel.basicInfo.replicas" :min="1" placeholder="请输入训练机数"
              style="width: 100%"></el-input-number>
          </el-form-item>
        </el-col>

        <el-col :span="8">
          <el-form-item label="TP" prop="tp">
            <el-input-number v-model="formModel.basicInfo.tp" :min="1" placeholder="请输入 TP 值，必须为正整数"
              style="width: 100%"></el-input-number>
          </el-form-item>
        </el-col>

        <el-col :span="8">
          <el-form-item label="PP" prop="pp">
            <el-input-number v-model="formModel.basicInfo.pp" :min="1" placeholder="请输入 PP 值，必须为正整数"
              style="width: 100%"></el-input-number>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="8">
          <el-form-item label="模型 URL" prop="modelUrl">
            <el-input v-model="formModel.basicInfo.modelUrl" placeholder="请输入模型 URL，以bos:/开头"></el-input>
          </el-form-item>
        </el-col>

        <el-col :span="8">
          <el-form-item label="数据集 URL" prop="datasetUrl">
            <el-input v-model="formModel.basicInfo.datasetUrl" placeholder="请输入数据集 URL，以bos:/开头"></el-input>
          </el-form-item>
        </el-col>

        <el-col v-if="formModel.basicInfo.trainingPhase === 'pretrain'" :span="8">
          <el-form-item required label="JSON Keys" prop="jsonKeys">
            <el-input v-model="formModel.basicInfo.jsonKeys" placeholder="请输入 JSON Keys"></el-input>
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
                <el-input-number v-model="formModel.optimizerConfig.minLr" :min="0" :step="0.0001" placeholder="请输入最小学习率"
                  style="width: 100%"></el-input-number>
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
    modelName: "llama2-7b",
    replicas: 1,
    version: timeStr(),
    trainingPhase: "sft",
    tp: undefined as number | undefined,
    pp: undefined as number | undefined,
    image:
      "registry.baidubce.com/aihc-aiak/aiak-training-llm:ubuntu22.04-cu12.3-torch2.2.0-py310-bccl1.2.7.2_v2.1.1.5_release",
    mountPath: "/workspace/pfs",
    modelUrl: "",
    datasetUrl: "",
    datasetName: "alpaca_zh-llama3-train",
    jsonKeys: "text",
    split: '969,30,1'
  },

  // 1）数据参数
  dataParams: {
    dataPath: "", // --data-path
    split: "969,30,1", // --split
    trainDataPath: "", // --train-data-path
    validDataPath: "", // --valid-data-path
    testDataPath: "", // --test-data-path
    dataCachePath: "", // --data-cache-path
    noMmapBinFiles: false, // --no-mmap-bin-files
    mockData: false, // --mock-data
    dataloaderType: "single", // --dataloader-type
    numWorkers: 2, // --num-workers
    tokenizerType: 'HFTokenizer', // --tokenizer-type
    hfTokenizerPath: "", // --hf-tokenizer-path
    useFastTokenizer: false, // --use-fast-tokenizer
    tokenizerModel: "", // --tokenizer-model
    seqLength: undefined, // --seq-length
  },

  // 2）模型组网参数
  modelConfig: {
    // 自动组网参数
    modelName: "llama2-7b", // --model-name

    // 详细组网参数
    numLayers: undefined, // --num-layers
    hiddenSize: undefined, // --hidden-size
    ffnHiddenSize: undefined, // --ffn-hidden-size
    numAttentionHeads: undefined, // --num-attention-heads
    groupQueryAttention: false, // --group-query-attention
    numQueryGroups: 1, // --num-query-groups
    positionEmbeddingType: "learned_absolute", // --position-embedding-type
    maxPositionEmbeddings: undefined, // --max-position-embeddings
    rotaryInterleaved: false, // --rotary-interleaved
    rotaryPercent: 1.0, // --rotary-percent
    rotaryBase: 10000, // --rotary-base
    rotarySeqLenInterpolationFactor: undefined, // --rotary-seq-len-interpolation-factor
    attentionDropout: 0.1, // --attention-dropout
    hiddenDropout: 0.1, // --hidden-dropout
    normalization: "LayerNorm", // --normalization
    normEpsilon: 1e-5, // --norm-epsilon
    useNormhead: false, // --use-normhead
    swiglu: false, // --swiglu
    disableBiasLinear: false, // --disable-bias-linear
    addQkvBias: false, // --add-qkv-bias
    makeVocabSizeDivisibleBy: 128, // --make-vocab-size-divisible-by
    untieEmbeddingsAndOutputWeights: false, // --untie-embeddings-and-output-weights
  },

  // 3）初始化参数
  initialization: {
    seed: 1234, // --seed
    dataParallelRandomInit: false, // --data-parallel-random-init
    initMethodStd: 0.02, // --init-method-std
    initMethodXavierUniform: false, // --init-method-xavier-uniform
  },

  // 4）优化器和学习率参数
  optimizerConfig: {
    lr: undefined, // --lr
    minLr: 0.0, // --min-lr
    lrDecayStyle: "linear", // --lr-decay-style
    lrDecayIters: undefined, // --lr-decay-iters
    lrWarmupFraction: undefined, // --lr-warmup-fraction
    optimizer: "adam", // --optimizer
    weightDecay: 0.01, // --weight-decay
    clipGrad: 1.0, // --clip-grad
    adamBeta1: 0.9, // --adam-beta1
    adamBeta2: 0.999, // --adam-beta2
    adamEps: 1e-8, // --adam-eps
    sgdMomentum: 0.9, // --sgd-momentum
  },

  // 5）Checkpoint 读取和保存参数
  checkpointConfig: {
    load: "", // --load
    noLoadOptim: false, // --no-load-optim
    noLoadRng: false, // --no-load-rng
    save: "", // --save
    saveInterval: undefined, // --save-interval
    noSaveOptim: false, // --no-save-optim
    noSaveRng: false, // --no-save-rng
    ckptStep: undefined, // --ckpt-step
  },

  // 6）混合精度参数
  mixedPrecision: {
    fp16: false, // --fp16
    bf16: false, // --bf16
    lossScale: undefined, // --loss-scale
    initialLossScale: Math.pow(2, 32), // --initial-loss-scale
    minLossScale: 1.0, // --min-loss-scale
    lossScaleWindow: 1000, // --loss-scale-window
    accumulateAllreduceGradsInFp32: false, // --accumulate-allreduce-grads-in-fp32
  },

  // 7）分布式参数
  distributedParams: {
    tensorModelParallelSize: 1, // --tensor-model-parallel-size
    pipelineModelParallelSize: 1, // --pipeline-model-parallel-size
    numLayersPerVirtualPipelineStage: undefined, // --num-layers-per-virtual-pipeline-stage
    noOverlapP2pCommunication: false, // --no-overlap-p2p-communication
    distributedBackend: "NCCL", // --distributed-backend
    distributedTimeoutMinutes: 10, // --distributed-timeout-minutes
    useDistributedOptimizer: false, // --use-distributed-optimizer
    overlapGradReduce: false, // --overlap-grad-reduce
    overlapParamGather: false, // --overlap-param-gather
    contextParallelSize: 1, // --context-parallel-size
    expertModelParallelSize: 1, // --expert-model-parallel-size
    tpCommOverlap: false, // --tp-comm-overlap
  },

  // 8）显存策略参数
  memoryOptimization: {
    sequenceParallel: false, // --sequence-parallel
    recomputeActivations: false, // --recompute-activations
    recomputeGranularity: undefined, // --recompute-granularity
    recomputeMethod: undefined, // --recompute-method
    recomputeNumLayers: 1, // --recompute-num-layers
    distributeSavedActivations: false, // --distribute-saved-activations
    offloadOptimizer: "disabled", // --offload-optimizer
    offloadOptimizerPercent: 1.0, // --offload-optimizer-percent
    noOverlapOffloadOptimizer: false, // --no-overlap-offload-optimizer
    cpuAdamThreads: 1, // --cpu-adam-threads
  },

  // 9）MoE 训练参数
  //   --moe-router-load-balancing-type	string	否	aux_loss	aux_loss、sinkhorn、none	router 负载均衡策略
  // --moe-router-topk	int	否	2	NA	每个 token 需要路由的专家数目
  // --moe-grouped-gemm	bool	否	False	NA	每个rank 存在多个专家时，使用 grouped gemm加速专家计算
  // --moe-aux-loss-coeff	float	否	0.0	NA	aux loss 缩放系数
  // --moe-z-loss-coeff	float	否	None	NA	z-loss 缩放系数
  // --moe-input-jitter-eps	float	否	None	NA	输入 tensor 添加噪声
  // --moe-token-dropping	bool	否	False	NA	暂不支持；用于指定当达到专家容量时是否丢弃 token；
  // --moe-token-dispatcher-type	str	否	allgather	allgather、alltoall	token 分发时采用的通信模式
  moeParams: {
    moeRouterLoadBalancingType: "aux_loss", // --moe-router-load-balancing-type
    moeRouterTopk: 2, // --moe-router-topk
    moeGroupedGemm: false, // --moe-grouped-gemm
    moeAuxLossCoeff: 0.0, // --moe-aux-loss-coeff
    moeZLossCoeff: undefined, // --moe-z-loss-coeff
    moeInputJitterEps: undefined, // --moe-input-jitter-eps
    moeTokenDropping: false, // --moe-token-dropping
    moeTokenDispatcherType: "allgather", // --moe-token-dispatcher-type
  },

  // 10）SFT训练参数
  sftParams: {
    chatTemplate: undefined, // --chat-template
    sftDatasetConfig: "", // --sft-dataset-config
    sftDataset: undefined, // --sft-dataset
    sftTrainDataset: undefined, // --sft-train-dataset
    sftValidDataset: undefined, // --sft-valid-dataset
    sftTestDataset: undefined, // --sft-test-dataset
    sftDataStreaming: false, // --sft-data-streaming
    streamingBufferSize: 16384, // --streaming-buffer-size
    sftNumPreprocessWorkers: undefined, // --sft-num-preprocess-workers
    trainOnPrompt: false, // --train-on-prompt
    variableSeqLengths: false, // --variable-seq-lengths
    sftDataMixStrategy: "concat", // --sft-data-mix-strategy
    isTokenizedData: false, // --is-tokenized-data
    packingSftData: false, // --packing-sft-data
  },

  // 11）其他训练参数
  otherTrainingParams: {
    microBatchSize: undefined, // --micro-batch-size
    globalBatchSize: undefined, // --global-batch-size
    trainIters: undefined, // --train-iters
    evalIters: 100, // --eval-iters
    evalInterval: 1000, // --eval-interval
    logInterval: 100, // --log-interval
    tensorboardDir: "", // --tensorboard-dir
    timingLogLevel: 0, // --timing-log-level
    timingLogOption: "minmax", // --timing-log-option
    tensorboardLogInterval: 1, // --tensorboard-log-interval
    logTimersToTensorboard: false, // --log-timers-to-tensorboard
    logValidationPplToTensorboard: false, // --log-validation-ppl-to-tensorboard
    wandbProject: "", // --wandb-project
    wandbExpName: "", // --wandb-exp-name
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
    if (newPhase === "pretrain") {
      formModel.basicInfo.datasetName = pretrainDatasets[0];
    } else if (newPhase === "sft") {
      formModel.basicInfo.datasetName = sftDatasets[0];
    } else {
      formModel.basicInfo.datasetName = "";
    }
  }
);

watch(
  () => formModel.basicInfo.modelName,
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
  console.log(formModel);
  formRef.value.validate((valid: boolean) => {
    if (valid) {
      const aiakJobConfig = {
        MODEL_NAME: formModel.basicInfo.modelName,
        REPLICAS: formModel.basicInfo.replicas,
        VERSION: formModel.basicInfo.version,
        TRAINING_PHASE: formModel.basicInfo.trainingPhase,
        TP: formModel.basicInfo.tp,
        PP: formModel.basicInfo.pp,
        DATASET_NAME: formModel.basicInfo.datasetName,
        IMAGE: formModel.basicInfo.image,
        MOUNT_PATH: formModel.basicInfo.mountPath,
        MODEL_URL: formModel.basicInfo.modelUrl,
        DATASET_URL: formModel.basicInfo.datasetUrl,
        JSON_KEYS: formModel.basicInfo.jsonKeys,
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
    formModel.basicInfo.version = timeStr(); // 重置版本号
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
