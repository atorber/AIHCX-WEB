import React, { useState } from 'react';

interface CommandScriptTabProps {
  commandScript: string;
  onCopyText: (text: string) => Promise<void>;
  onSaveFile: (content: string, type: 'txt') => void;
}

const CommandScriptTab: React.FC<CommandScriptTabProps> = ({
  commandScript,
  onCopyText,
  onSaveFile
}) => {
  const [isCopying, setIsCopying] = useState(false);

  const handleCopy = async () => {
    setIsCopying(true);
    await onCopyText(commandScript);
    
    setTimeout(() => {
      setIsCopying(false);
    }, 1500);
  };

  const handleSave = () => {
    onSaveFile(commandScript, 'txt');
  };

  if (!commandScript) {
    return <div>没有可用的启动命令</div>;
  }

  return (
    <div className="result-container">
      <div className="result-item">
        <h3>
          任务启动命令
          <span className="action-buttons">
            <button
              className={isCopying ? 'copying' : ''}
              onClick={handleCopy}
            >
              {isCopying ? '已复制' : '一键复制'}
            </button>
            <button onClick={handleSave}>
              保存为文件
            </button>
          </span>
        </h3>
        <pre>{commandScript}</pre>
      </div>
    </div>
  );
};

export default CommandScriptTab;