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
    { key: 'cli' as TabType, label: 'CLI命令', condition: taskParams.cliItems.length > 0 },
    { key: 'commandScript' as TabType, label: '启动命令', condition: !!taskParams.commandScript },
    { key: 'json' as TabType, label: 'JSON参数', condition: taskParams.jsonItems.length > 0 },
    { key: 'yaml' as TabType, label: 'YAML参数', condition: taskParams.yamlItems.length > 0 },
    { key: 'apiDocs' as TabType, label: 'API文档', condition: taskParams.apiDocs.length > 0 }
  ];

  const visibleTabs = tabs.filter(tab => tab.condition);

  return (
    <div className="tabs">
      {visibleTabs.map(tab => (
        <button
          key={tab.key}
          className={activeTab === tab.key ? 'active' : ''}
          onClick={() => onTabChange(tab.key)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export default TabNavigation;