import React, { useState } from 'react';

interface CLIItem {
  title: string;
  text: string;
  doc?: string;
}

interface CLICommandTabProps {
  items: CLIItem[];
  onCopyText: (text: string) => Promise<void>;
  onOpenUrl: (url: string) => void;
}

const CLICommandTab: React.FC<CLICommandTabProps> = ({
  items,
  onCopyText,
  onOpenUrl
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

  if (items.length === 0) {
    return <div>没有可用的CLI命令</div>;
  }

  return (
    <div className="result-container">
      {items.map((item, index) => {
        const isWarning = item.title.includes('⚠️');
        return (
          <div key={index} className="result-item">
            <h3 className={isWarning ? 'warning-title' : ''}>
              {item.title}
              {!isWarning && (
                <span className="action-buttons">
                  <button
                    className={copyingItems.has(item.title) ? 'copying' : ''}
                    onClick={() => handleCopy(item.text, item.title)}
                  >
                    {copyingItems.has(item.title) ? '已复制' : '一键复制'}
                  </button>
                  {item.doc && (
                    <button onClick={() => onOpenUrl(item.doc!)}>
                      CLI使用手册
                    </button>
                  )}
                </span>
              )}
            </h3>
            <div className={isWarning ? 'warning-text' : ''}>
              {isWarning ? item.text : <pre>{item.text}</pre>}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default CLICommandTab;