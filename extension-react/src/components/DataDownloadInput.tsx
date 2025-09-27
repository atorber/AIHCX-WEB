import React, { useState } from 'react';

interface DataDownloadInputProps {
  onParseUrl?: (parsedData: {
    datasetName: string;
    storagePath: string;
    organization: string;
    dataset: string;
  }) => void;
}

const DataDownloadInput: React.FC<DataDownloadInputProps> = ({ onParseUrl }) => {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [parsedResult, setParsedResult] = useState<{
    datasetName: string;
    storagePath: string;
    organization: string;
    dataset: string;
  } | null>(null);

  const parseHuggingFaceDatasetUrl = (url: string) => {
    // 匹配 HuggingFace 数据集 URL 格式
    const regex = /https:\/\/huggingface\.co\/datasets\/([^\/]+)\/([^\/]+)/;
    const match = url.match(regex);
    
    if (!match) {
      throw new Error('无效的HuggingFace数据集地址格式');
    }
    
    const organization = match[1];
    const dataset = match[2];
    const datasetName = `${organization}/${dataset}`;
    const storagePath = `huggingface.co/datasets/${datasetName}`;
    
    return {
      datasetName,
      storagePath,
      organization,
      dataset
    };
  };

  const handleParseUrl = async () => {
    if (!url.trim()) {
      setError('请输入HuggingFace数据集地址');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const parsed = parseHuggingFaceDatasetUrl(url.trim());
      console.log('✅ URL解析成功:', parsed);
      
      // 保存解析结果用于显示
      setParsedResult(parsed);
      
      // 自动填充页面表单
      await fillPageForm(parsed);
      
      // 通知父组件解析成功
      if (onParseUrl) {
        onParseUrl(parsed);
      }
      
      // 显示成功消息
      setError(''); // 清除之前的错误
      console.log('🎉 数据集信息已自动填充完成:', parsed);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '解析失败';
      setError(errorMessage);
      setParsedResult(null); // 清除解析结果
      console.error('❌ 自动填充失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 通用的输入框查找函数
  const findInputBySelectors = (selectors: string[]): HTMLInputElement | null => {
    for (const selector of selectors) {
      const input = document.querySelector(selector) as HTMLInputElement;
      if (input) {
        return input;
      }
    }
    return null;
  };

  // 通用的输入框填充函数
  const fillInput = (input: HTMLInputElement | null, value: string, fieldName: string) => {
    if (input) {
      console.log(`🔍 开始填充${fieldName}输入框:`, input);
      
      // 先聚焦到输入框
      input.focus();
      
      // 清除现有值
      input.value = '';
      
      // 设置新值
      input.value = value;
      
      // 触发多种事件以确保表单框架能够识别变化
      const events = [
        new Event('input', { bubbles: true }),
        new Event('change', { bubbles: true }),
        new Event('blur', { bubbles: true }),
        new Event('focus', { bubbles: true }),
        new KeyboardEvent('keydown', { bubbles: true, key: 'Tab' }),
        new KeyboardEvent('keyup', { bubbles: true, key: 'Tab' })
      ];
      
      events.forEach(event => {
        input.dispatchEvent(event);
      });
      
      // 强制触发React/Vue等框架的更新
      if ((input as any)._valueTracker) {
        (input as any)._valueTracker.setValue('');
        (input as any)._valueTracker.setValue(value);
      }
      
      // 尝试触发React合成事件
      const reactEvent = new Event('input', { bubbles: true });
      Object.defineProperty(reactEvent, 'target', { writable: false, value: input });
      input.dispatchEvent(reactEvent);
      
      console.log(`✅ 已填充${fieldName}:`, value);
      console.log(`   输入框元素:`, input);
      console.log(`   输入框值:`, input.value);
      console.log(`   输入框属性:`, {
        placeholder: input.placeholder,
        className: input.className,
        type: input.type,
        maxLength: input.maxLength
      });
      return true;
    } else {
      console.warn(`❌ 未找到${fieldName}输入框`);
      return false;
    }
  };

  const fillPageForm = async (parsed: {
    datasetName: string;
    storagePath: string;
    organization: string;
    dataset: string;
  }) => {
    console.log('🚀 开始填充页面表单...');
    console.log('解析结果:', parsed);
    console.log('原始URL:', url.trim());
    
    // 使用content script的方式来操作页面DOM
    try {
      // 发送消息给content script来执行填充
      const response = await chrome.runtime.sendMessage({
        type: 'FILL_DATASET_FORM',
        data: {
          datasetName: parsed.datasetName,
          storagePath: parsed.storagePath,
          openSourceUrl: url.trim()
        }
      });
      
      if (response && response.success) {
        console.log('✅ 页面表单填充成功:', response);
        setParsedResult(parsed);
      } else {
        console.error('❌ 页面表单填充失败:', response);
        setError('填充页面表单失败，请手动填充');
      }
    } catch (error) {
      console.error('❌ 发送填充消息失败:', error);
      // 回退到直接DOM操作
      await fillPageFormDirect(parsed);
    }
  };

  // 直接DOM操作的回退方案
  const fillPageFormDirect = async (parsed: {
    datasetName: string;
    storagePath: string;
    organization: string;
    dataset: string;
  }) => {
    console.log('🔄 使用直接DOM操作方式填充...');
    
    // 等待页面加载完成
    console.log('⏳ 等待页面加载完成...');
    await new Promise(resolve => setTimeout(resolve, 1000));

    let successCount = 0;

    // 填充数据集名称 - 使用多种选择器尝试
    console.log('📝 正在填充数据集名称...');
    const datasetNameInput = findInputBySelectors([
      'input[placeholder="请输入数据集名称"]',
      'input[maxlength="64"][placeholder*="数据集名称"]',
      'input.ant-input[placeholder*="数据集名称"]',
      'input.osui-input[placeholder*="数据集名称"]',
      'input[type="text"][placeholder*="数据集名称"]'
    ]);
    if (fillInput(datasetNameInput, parsed.datasetName, '数据集名称')) {
      successCount++;
    }

    // 填充存储子路径
    console.log('📁 正在填充存储子路径...');
    const storagePathInput = findInputBySelectors([
      'input[placeholder="请输入子路径名称"]',
      'input[placeholder*="子路径名称"]',
      'input.ant-input[placeholder*="子路径名称"]',
      'input.osui-input[placeholder*="子路径名称"]',
      'input[placeholder*="子路径"]'
    ]);
    if (fillInput(storagePathInput, parsed.storagePath, '存储子路径')) {
      successCount++;
    }

    // 填充开源数据集输入框
    console.log('🔗 正在填充开源数据集地址...');
    const openSourceInput = findInputBySelectors([
      'input[placeholder="请输入开源数据集"]',
      'input[placeholder*="开源数据集"]',
      'input.ant-input[placeholder*="开源数据集"]',
      'input.osui-input[placeholder*="开源数据集"]',
      'input[placeholder*="开源"]'
    ]);
    if (fillInput(openSourceInput, parsed.datasetName, '开源数据集地址')) {
      successCount++;
    }

    console.log(`🎉 填充完成！成功填充了 ${successCount}/3 个字段`);
    
    if (successCount === 0) {
      console.warn('⚠️ 警告：没有找到任何可填充的输入框，请检查页面是否正确加载');
      setError('未找到页面表单，请确保在正确的页面');
    } else if (successCount < 3) {
      console.warn(`⚠️ 只填充了 ${successCount}/3 个字段，请检查页面表单`);
      setError(`只填充了 ${successCount}/3 个字段`);
    } else {
      console.log('🎉 所有字段都填充成功！');
      setParsedResult(parsed);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleParseUrl();
    }
  };

  return (
    <div className="data-download-input">
      <div className="input-header">
        <h3>🤗 HuggingFace数据集自动填充</h3>
        <p>输入HuggingFace数据集地址，自动解析并填充页面表单</p>
      </div>
      
      <div className="input-container">
        <div className="input-group">
          <label htmlFor="dataset-url">数据集地址</label>
          <input
            id="dataset-url"
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="https://huggingface.co/datasets/nvidia/PhysicalAI-SmartSpaces"
            className={error ? 'error' : ''}
            disabled={isLoading}
          />
          {error && <div className="error-message">{error}</div>}
        </div>
        
        <button
          onClick={handleParseUrl}
          disabled={isLoading || !url.trim()}
          className="parse-button"
        >
          {isLoading ? '解析中...' : '解析并填充'}
        </button>
      </div>

      <div className="example-section">
        <h4>示例地址</h4>
        <div className="example-urls">
          <button
            type="button"
            onClick={() => setUrl('https://huggingface.co/datasets/nvidia/PhysicalAI-SmartSpaces')}
            className="example-button"
          >
            nvidia/PhysicalAI-SmartSpaces
          </button>
          <button
            type="button"
            onClick={() => setUrl('https://huggingface.co/datasets/microsoft/DialoGPT-medium')}
            className="example-button"
          >
            microsoft/DialoGPT-medium
          </button>
          <button
            type="button"
            onClick={() => setUrl('https://huggingface.co/datasets/squad')}
            className="example-button"
          >
            squad
          </button>
        </div>
      </div>

      {/* 解析结果显示区域 */}
      {parsedResult && (
        <div className="parsed-result-section">
          <h4>📋 解析结果</h4>
          <div className="result-grid">
            <div className="result-item">
              <label>数据集名称</label>
              <div className="result-value">{parsedResult.datasetName}</div>
            </div>
            <div className="result-item">
              <label>开源数据集</label>
              <div className="result-value">{url.trim()}</div>
            </div>
            <div className="result-item">
              <label>子路径名称</label>
              <div className="result-value">{parsedResult.storagePath}</div>
            </div>
          </div>
          <div className="result-note">
            ✅ 以上信息已自动填充到页面表单中
          </div>
        </div>
      )}
    </div>
  );
};

export default DataDownloadInput;
