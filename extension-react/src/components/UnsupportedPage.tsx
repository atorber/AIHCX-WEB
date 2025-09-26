import React from 'react';
import { urlPatterns } from '../utils/pageDetection';

const UnsupportedPage: React.FC = () => {
  return (
    <div className="unsupported-page">
      <div className="unsupported-header">
        <span className="unsupported-text">请在百舸AIHC控制台页面使用</span>
        <a 
          href="https://console.bce.baidu.com/aihc" 
          target="_blank" 
          rel="noopener noreferrer"
          className="console-link"
        >
          https://console.bce.baidu.com/aihc
        </a>
      </div>

      <div className="supported-pages-container">
        <h3 className="supported-title">支持的功能页面：</h3>
        <ul className="supported-pages">
          {Object.entries(urlPatterns).map(([url, name]) => (
            <li key={url} className="supported-item">
              <span className="item-name">{name}</span>
              {name === '任务列表' && (
                <span className="item-hint">
                  <i className="hint-icon">ℹ️</i>
                  需要下拉选中一个资源池
                </span>
              )}
              {name === '任务详情' && (
                <span className="item-hint">
                  <i className="hint-icon">ℹ️</i>
                  生成创建任务CLI命令、保存参数为文件
                </span>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default UnsupportedPage;