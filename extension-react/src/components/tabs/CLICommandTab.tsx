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
      {items.map((item, index) => (
        <div key={index} className="result-item">
          <h3>
            {item.title}
            <span className="action-buttons">
              <button
                className={copyingItems.has(item.title) ? 'copying' : ''}
                onClick={() => handleCopy(item.text, item.title)}
              >
                {copyingItems.has(item.title) ? '已复制' : '复制命令到剪贴板'}
              </button>
              {item.doc && (
                <button onClick={() => onOpenUrl(item.doc!)}>
                  CLI使用手册
                </button>
              )}
            </span>
          </h3>
          <pre>{item.text}</pre>
        </div>
      ))}
    </div>
  );
};

export default CLICommandTab;