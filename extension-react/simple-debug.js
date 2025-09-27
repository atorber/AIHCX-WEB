// 简化调试脚本 - 直接复制到控制台执行
console.log('=== AIHC助手表单填充测试 ===');

// 测试数据
const testData = {
  dataset: {
    type: 'DATASET',
    datasetName: 'openai/gdpval',
    openSourceDataset: 'openai/gdpval',
    storagePath: 'huggingface.co/datasets/openai/gdpval'
  },
  model: {
    type: 'MODEL',
    modelName: 'Alibaba-NLP/Tongyi-DeepResearch-30B-A3B',
    openSourceModel: 'Alibaba-NLP/Tongyi-DeepResearch-30B-A3B',
    storagePath: 'huggingface.co/Alibaba-NLP/Tongyi-DeepResearch-30B-A3B'
  }
};

// 检查页面状态
function checkPage() {
  console.log('\n📋 检查页面状态:');
  
  const typeRadios = document.querySelectorAll('input[type="radio"][value="DATASET"], input[type="radio"][value="MODEL"]');
  console.log('🔘 单选按钮数量:', typeRadios.length);
  
  typeRadios.forEach((radio, i) => {
    console.log(`   ${i+1}. value="${radio.value}", checked=${radio.checked}`);
  });
  
  const nameField = document.querySelector('[data-name="datasetName"] input');
  const sourceField = document.querySelector('[data-name="datasetSourceUri"] input');
  const subPathField = document.querySelector('input[placeholder="请输入子路径名称"]');
  
  console.log('📝 字段状态:');
  console.log('   名称字段:', nameField ? '✅存在' : '❌不存在');
  console.log('   开源地址字段:', sourceField ? '✅存在' : '❌不存在');
  console.log('   子路径字段:', subPathField ? '✅存在' : '❌不存在');
  
  if (nameField) console.log('   名称字段值:', nameField.value || '(空)');
  if (subPathField) console.log('   子路径字段值:', subPathField.value || '(空)');
  if (sourceField) console.log('   开源地址值:', sourceField.value || '(空)');
}

// 测试表单填充
function testFill(data) {
  console.log(`\n🚀 测试填充 ${data.type === 'DATASET' ? '数据集' : '模型'}`);
  
  let successCount = 0;
  
  // 1. 切换单选按钮
  const targetRadio = document.querySelector(`input[type="radio"][value="${data.type}"]`);
  if (targetRadio) {
    // 取消所有选中
    document.querySelectorAll('input[type="radio"][value="DATASET"], input[type="radio"][value="MODEL"]').forEach(r => {
      r.checked = false;
      const wrapper = r.closest('.ant-radio-button-wrapper');
      if (wrapper) wrapper.classList.remove('ant-radio-button-wrapper-checked');
      const button = r.closest('.ant-radio-button');
      if (button) button.classList.remove('ant-radio-button-checked');
    });
    
    // 设置目标选中
    targetRadio.checked = true;
    const wrapper = targetRadio.closest('.ant-radio-button-wrapper');
    if (wrapper) wrapper.classList.add('ant-radio-button-wrapper-checked');
    const button = targetRadio.closest('.ant-radio-button');
    if (button) button.classList.add('ant-radio-button-checked');
    
    // 触发事件
    targetRadio.dispatchEvent(new Event('change', { bubbles: true }));
    targetRadio.dispatchEvent(new Event('click', { bubbles: true }));
    const label = targetRadio.closest('label');
    if (label) label.click();
    
    console.log(`✅ 单选按钮已切换到 ${data.type}`);
    successCount++;
  } else {
    console.log(`❌ 未找到 ${data.type} 单选按钮`);
  }
  
  // 等待页面更新后填充字段
  setTimeout(() => {
    // React输入框填充函数
    const fillReactInput = (field, value) => {
      if (!field || !value) return false;
      
      // 方法1: 直接设置value并触发React事件
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
      nativeInputValueSetter.call(field, value);
      
      // 创建React合成事件
      const inputEvent = new Event('input', { bubbles: true });
      inputEvent.simulated = true;
      
      const changeEvent = new Event('change', { bubbles: true });
      changeEvent.simulated = true;
      
      // 触发事件
      field.focus();
      field.dispatchEvent(inputEvent);
      field.dispatchEvent(changeEvent);
      field.blur();
      
      // 验证填充结果
      setTimeout(() => {
        console.log(`   字段值验证: "${field.value}" (期望: "${value}")`);
      }, 100);
      
      return true;
    };
    
    // 2. 填充名称字段
    const nameField = document.querySelector('[data-name="datasetName"] input');
    const nameValue = data.type === 'DATASET' ? data.datasetName : data.modelName;
    if (nameField && nameValue) {
      if (fillReactInput(nameField, nameValue)) {
        console.log(`✅ 名称字段已填充: ${nameValue}`);
        successCount++;
      }
    } else {
      console.log('❌ 名称字段填充失败');
    }
    
    // 3. 填充子路径字段
    const subPathField = document.querySelector('input[placeholder="请输入子路径名称"]');
    if (subPathField && data.storagePath) {
      if (fillReactInput(subPathField, data.storagePath)) {
        console.log(`✅ 子路径字段已填充: ${data.storagePath}`);
        successCount++;
      }
    } else {
      console.log('❌ 子路径字段填充失败');
    }
    
    // 4. 填充开源地址字段
    const sourceField = document.querySelector('[data-name="datasetSourceUri"] input');
    const sourceValue = data.type === 'DATASET' ? data.openSourceDataset : data.openSourceModel;
    if (sourceField && sourceValue) {
      if (fillReactInput(sourceField, sourceValue)) {
        console.log(`✅ 开源地址字段已填充: ${sourceValue}`);
        successCount++;
      }
    } else {
      console.log('❌ 开源地址字段填充失败');
    }
    
    console.log(`🎉 填充完成！成功 ${successCount} 个字段`);
    
    // 最终验证
    setTimeout(() => {
      console.log('\n🔍 最终验证:');
      if (nameField) console.log(`   名称字段最终值: "${nameField.value}"`);
      if (subPathField) console.log(`   子路径字段最终值: "${subPathField.value}"`);
      if (sourceField) console.log(`   开源地址字段最终值: "${sourceField.value}"`);
    }, 500);
  }, 2000);
}

// 暴露测试函数到全局
window.testDataset = () => testFill(testData.dataset);
window.testModel = () => testFill(testData.model);
window.checkPage = checkPage;
window.testFill = testFill;
window.testData = testData;

// 快捷测试函数
window.quickTestDataset = function() {
  console.log('\n🚀 快捷测试数据集填充');
  testFill(testData.dataset);
};

window.quickTestModel = function() {
  console.log('\n🚀 快捷测试模型填充');
  testFill(testData.model);
};

console.log('\n📖 可用命令:');
console.log('checkPage() - 检查页面状态');
console.log('testDataset() - 测试数据集填充');
console.log('testModel() - 测试模型填充');

// 自动检查页面
checkPage();