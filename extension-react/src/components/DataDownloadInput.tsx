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

  const fillPageForm = async (parsed: {
    datasetName: string;
    storagePath: string;
    organization: string;
    dataset: string;
  }) => {
    console.log('🚀 开始填充页面表单...');
    console.log('解析结果:', parsed);
    console.log('原始URL:', url.trim());
    
    // 直接使用chrome.tabs.sendMessage方式，跳过background script
    try {
      // 获取当前活动标签页
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab?.id) {
        throw new Error('无法获取当前活动标签页');
      }
      
      console.log('📤 直接向content script发送消息...', tab.url);
      
      // 直接发送消息给content script
      const response = await chrome.tabs.sendMessage(tab.id, {
        type: 'FILL_DATASET_FORM',
        data: {
          datasetName: parsed.datasetName,
          storagePath: parsed.storagePath,
          openSourceUrl: url.trim()
        }
      });
      
      console.log('📥 收到content script响应:', response);
      
      if (response && response.success) {
        console.log('✅ 页面表单填充成功:', response);
        setParsedResult(parsed);
      } else {
        console.error('❌ 页面表单填充失败:', response);
        setError(`填充失败：${response?.error || '未知错误'}`);
      }
    } catch (error) {
      console.error('❌ 发送填充消息失败:', error);
      
      // 提供手动填充指导
      const instructions = [
        '自动填充失败，请手动在浏览器控制台中执行以下代码：',
        '',
        '// 填充数据集名称',
        'const datasetInput = document.querySelector(\'input[placeholder="请输入数据集名称"]\')',
        'if(datasetInput) {',
        '  datasetInput.value = "' + parsed.datasetName + '";',
        '  datasetInput.dispatchEvent(new Event("input", {bubbles: true}));',
        '}',
        '',
        '// 填充存储子路径',
        'const pathInput = document.querySelector(\'input[placeholder="请输入子路径名称"]\')',
        'if(pathInput) {',
        '  pathInput.value = "' + parsed.storagePath + '";',
        '  pathInput.dispatchEvent(new Event("input", {bubbles: true}));',
        '}',
        '',
        '// 填充开源数据集',
        'const sourceInput = document.querySelector(\'input[placeholder="请输入开源数据集"]\')',
        'if(sourceInput) {',
        '  sourceInput.value = "' + parsed.datasetName + '";',
        '  sourceInput.dispatchEvent(new Event("input", {bubbles: true}));',
        '}'
      ].join('\n');
      
      setError('自动填充失败，请在控制台手动执行填充代码');
      
      // 复制指令到剪贴板
      try {
        await navigator.clipboard.writeText(instructions);
        console.log('📋 手动填充指令已复制到剪贴板');
      } catch {
        console.log('📋 手动填充指令:', instructions);
      }
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
