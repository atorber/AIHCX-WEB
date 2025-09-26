import React, { useState, useEffect } from 'react';
import { BaiduCredentials } from '../types';
import { getCredentials, saveCredentials } from '../utils/chromeApi';

const OptionsContainer: React.FC = () => {
  const [credentials, setCredentials] = useState<BaiduCredentials>({
    ak: '',
    sk: '',
    endpoint: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{type: string, text: string} | null>(null);

  useEffect(() => {
    loadCredentials();
  }, []);

  const loadCredentials = async () => {
    setIsLoading(true);
    try {
      const saved = await getCredentials();
      if (saved) {
        setCredentials(saved);
      }
    } catch (error) {
      console.error('加载凭证失败:', error);
      showMessage('error', '加载设置失败');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!credentials.ak || !credentials.sk) {
      showMessage('error', '请填写AccessKey和SecretKey');
      return;
    }

    setIsLoading(true);
    try {
      await saveCredentials(credentials);
      showMessage('success', '设置已保存');
    } catch (error) {
      console.error('保存凭证失败:', error);
      showMessage('error', '保存设置失败');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof BaiduCredentials, value: string) => {
    setCredentials(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => {
      setMessage(null);
    }, 3000);
  };

  return (
    <div className="options-container">
      <div className="options-header">
        <h1>AIHC助手 - 设置</h1>
        <p>配置您的百度云API凭证以使用AIHC服务</p>
      </div>

      <form className="credentials-form" onSubmit={handleSave}>
        <div className="form-group">
          <label htmlFor="ak">Access Key (AK)</label>
          <input
            type="text"
            id="ak"
            value={credentials.ak}
            onChange={(e) => handleInputChange('ak', e.target.value)}
            placeholder="请输入您的Access Key"
            required
          />
          <small>在百度云控制台的"安全认证"页面获取</small>
        </div>

        <div className="form-group">
          <label htmlFor="sk">Secret Key (SK)</label>
          <input
            type="password"
            id="sk"
            value={credentials.sk}
            onChange={(e) => handleInputChange('sk', e.target.value)}
            placeholder="请输入您的Secret Key"
            required
          />
          <small>请妥善保管您的Secret Key</small>
        </div>

        <div className="form-group">
          <label htmlFor="endpoint">API端点 (可选)</label>
          <input
            type="text"
            id="endpoint"
            value={credentials.endpoint || ''}
            onChange={(e) => handleInputChange('endpoint', e.target.value)}
            placeholder="https://aihc.bj.baidubce.com"
          />
          <small>留空将使用默认端点</small>
        </div>

        <div className="form-actions">
          <button type="submit" disabled={isLoading}>
            {isLoading ? '保存中...' : '保存设置'}
          </button>
        </div>
      </form>

      {message && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="help-section">
        <h3>使用说明</h3>
        <ol>
          <li>登录百度云控制台，进入"安全认证"页面</li>
          <li>创建或查看您的Access Key和Secret Key</li>
          <li>将凭证填写到上方表单并保存</li>
          <li>在AIHC控制台页面使用插件功能</li>
        </ol>
        
        <h3>支持的页面</h3>
        <ul>
          <li>资源池列表和详情页面</li>
          <li>队列列表页面</li>
          <li>任务列表和详情页面</li>
        </ul>
      </div>
    </div>
  );
};

export default OptionsContainer;