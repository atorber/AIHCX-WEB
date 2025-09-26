import React from 'react';
import { TabType, TaskParams } from '../types';

interface TabNavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  taskParams: TaskParams;
}

const TabNavigation: React.FC<TabNavigationProps> = ({
  activeTab,
  onTabChange,
  taskParams
}) => {
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
    }
  ];

  const visibleTabs = tabs.filter(tab => tab.condition);

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