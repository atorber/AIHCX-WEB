import React from 'react';
import { TabType, TaskParams } from '../types';

interface TabNavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  taskParams: TaskParams;
  pageName: string;
}

const TabNavigation: React.FC<TabNavigationProps> = ({
  activeTab,
  onTabChange,
  taskParams,
  pageName
}) => {
  // 如果是数据下载页面，不显示Tab导航
  if (taskParams.isDataDownloadPage) {
    return null;
  }

  const tabs = [
    { 
      key: 'cli' as TabType, 
      label: 'CLI命令', 
      shortLabel: 'CLI',
      icon: '⚡',
      condition: taskParams.cliItems.length > 0 
    },
    { 
      key: 'commandScript' as TabType, 
      label: '启动命令', 
      shortLabel: '启动',
      icon: '🚀',
      condition: !!taskParams.commandScript 
    },
    { 
      key: 'json' as TabType, 
      label: 'JSON参数', 
      shortLabel: 'JSON',
      icon: '📄',
      condition: taskParams.jsonItems.length > 0 
    },
    { 
      key: 'yaml' as TabType, 
      label: 'YAML参数', 
      shortLabel: 'YAML',
      icon: '📋',
      condition: taskParams.yamlItems.length > 0 
    },
    { 
      key: 'apiDocs' as TabType, 
      label: 'API文档', 
      shortLabel: 'API',
      icon: '📚',
      condition: taskParams.apiDocs.length > 0 
    },
    { 
      key: 'chat' as TabType, 
      label: 'AI聊天', 
      shortLabel: 'Chat',
      icon: '💬',
      condition: pageName === '在线服务部署详情' && !!taskParams.chatConfig 
    }
  ];

  const visibleTabs = tabs.filter(tab => tab.condition);
  
  // 调试信息
  console.log('[AIHC助手] TabNavigation - pageName:', pageName);
  console.log('[AIHC助手] TabNavigation - taskParams.chatConfig:', taskParams.chatConfig);
  console.log('[AIHC助手] TabNavigation - visibleTabs:', visibleTabs.map(t => t.key));

  return (
    <div className="tabs-compact">
      {visibleTabs.map(tab => (
        <button
          key={tab.key}
          className={`tab-btn ${activeTab === tab.key ? 'active' : ''}`}
          onClick={() => onTabChange(tab.key)}
          title={tab.label}
        >
          <span className="tab-icon">{tab.icon}</span>
          <span className="tab-text">{tab.shortLabel}</span>
        </button>
      ))}
    </div>
  );
};

export default TabNavigation;