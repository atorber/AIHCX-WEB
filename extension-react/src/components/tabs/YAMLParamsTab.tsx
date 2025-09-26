import React, { useState } from 'react';

interface YAMLItem {
  title: string;
  text: string;
}

interface YAMLParamsTabProps {
  items: YAMLItem[];
  onCopyText: (text: string) => Promise<void>;
  onSaveFile: (content: string, type: 'yaml') => void;
}

const YAMLParamsTab: React.FC<YAMLParamsTabProps> = ({
  items,
  onCopyText,
  onSaveFile
}) => {
  const [copyingItems, setCopyingItems] = useState<Set<string>>(new Set());

  const handleCopy = async (text: string, itemTitle: string) => {
    setCopyingItems(prev => new Set(prev).add(itemTitle));
    await onCopyText(text);
    
    setTimeout(() => {
      setCopyingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemTitle);
        return newSet;
      });
    }, 1500);
  };

  const handleSave = (content: string) => {
    onSaveFile(content, 'yaml');
  };

  if (items.length === 0) {
    return <div>没有可用的YAML参数</div>;
  }

  return (
    <div className="result-container">
      {items.map((item, index) => (
        <div key={index} className="result-item">
          <h3>
            {item.title}
            <span className="action-buttons">
              <button
                className={copyingItems.has(item.title) ? 'copying' : ''}
                onClick={() => handleCopy(item.text, item.title)}
              >
                {copyingItems.has(item.title) ? '已复制' : '一键复制'}
              </button>
              <button onClick={() => handleSave(item.text)}>
                保存为文件
              </button>
            </span>
          </h3>
          <pre>{item.text}</pre>
        </div>
      ))}
    </div>
  );
};

export default YAMLParamsTab;