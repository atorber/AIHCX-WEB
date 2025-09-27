import React from 'react';

interface APIDocItem {
  title: string;
  text: string;
  requestExample?: string;
}

interface APIDocsTabProps {
  items: APIDocItem[];
  onOpenUrl: (url: string) => void;
  onCopyText?: (text: string) => Promise<void>;
}

const APIDocsTab: React.FC<APIDocsTabProps> = ({
  items,
  onOpenUrl,
  onCopyText
}) => {
  if (items.length === 0) {
    return <div>没有可用的API文档</div>;
  }

  const handleCopyRequestExample = async (text: string) => {
    if (onCopyText) {
      await onCopyText(text);
    }
  };

  return (
    <div className="result-container">
      {items.map((item, index) => {
        const isWarning = item.title.includes('⚠️');
        return (
          <div key={index} className="result-item">
            <h3 className={isWarning ? 'warning-title' : ''}>
              {item.title}
            </h3>
            <div className="api-doc-content">
              {isWarning ? (
                <div className="warning-text">
                  {item.requestExample}
                </div>
              ) : (
                <>
                  <div className="api-doc-url">
                    <strong>接口文档地址：</strong>
                    <a href={item.text} target="_blank" rel="noopener noreferrer">
                      {item.text}
                    </a>
                    <button onClick={() => onOpenUrl(item.text)}>
                      查看说明文档
                    </button>
                  </div>
                  {item.requestExample && (
                    <div className="api-request-example">
                      <strong>请求示例：</strong>
                      <div className="request-example-content">
                        <pre>{item.requestExample}</pre>
                      </div>
                      {onCopyText && (
                        <button 
                          className="copy-button"
                          onClick={() => handleCopyRequestExample(item.requestExample!)}
                        >
                          复制请求示例
                        </button>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default APIDocsTab;