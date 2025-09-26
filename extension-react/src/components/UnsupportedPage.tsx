import React from 'react';
import { urlPatterns } from '../utils/pageDetection';

interface UnsupportedPageProps {
  currentUrl?: string;
}

const UnsupportedPage: React.FC<UnsupportedPageProps> = ({ currentUrl }) => {
  // 检查是否在百度云域名下但不在AIHC控制台
  const isInBaiduCloud = currentUrl?.includes('console.bce.baidu.com') && !currentUrl?.includes('/aihc');
  const isNotInBaiduCloud = currentUrl && !currentUrl.includes('console.bce.baidu.com');

  return (
    <div className="unsupported-page">
      <div className="unsupported-header">
        {isNotInBaiduCloud && (
          <>
            <span className="unsupported-text">🚫 该插件仅在百舸AIHC控制台中使用</span>
            <span className="unsupported-text">请访问以下地址使用插件功能：</span>
          </>
        )}
        {isInBaiduCloud && (
          <>
            <span className="unsupported-text">📍 请在AIHC控制台中使用该插件</span>
            <span className="unsupported-text">您当前在百度云控制台，请进入AIHC服务：</span>
          </>
        )}
        {!isNotInBaiduCloud && !isInBaiduCloud && (
          <span className="unsupported-text">请在百舸AIHC控制台页面使用</span>
        )}
        <a 
          href="https://console.bce.baidu.com/aihc" 
          target="_blank" 
          rel="noopener noreferrer"
          className="console-link"
        >
          🔗 进入百舸AIHC控制台
        </a>
      </div>

      <div className="supported-pages-container">
        <h3 className="supported-title">🎯 支持的功能页面：</h3>
        <ul className="supported-pages">
          {Object.entries(urlPatterns).map(([url, name]) => (
            <li key={url} className="supported-item">
              <span className="item-name">• {name}</span>
              {name === '任务列表' && (
                <span className="item-hint">
                  <i className="hint-icon">ℹ️</i>
                  需要下拉选中一个资源池
                </span>
              )}
              {name === '任务详情' && (
                <span className="item-hint">
                  <i className="hint-icon">✨</i>
                  生成创建任务CLI命令、保存参数为文件
                </span>
              )}
            </li>
          ))}
        </ul>
        
        {currentUrl && (
          <div className="current-url-info">
            <p className="current-url-label">📍 当前页面：</p>
            <p className="current-url-value">{currentUrl}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UnsupportedPage;