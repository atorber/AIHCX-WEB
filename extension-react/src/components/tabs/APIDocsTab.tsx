import React from 'react';

interface APIDocItem {
  title: string;
  text: string;
}

interface APIDocsTabProps {
  items: APIDocItem[];
  onOpenUrl: (url: string) => void;
}

const APIDocsTab: React.FC<APIDocsTabProps> = ({
  items,
  onOpenUrl
}) => {
  if (items.length === 0) {
    return <div>没有可用的API文档</div>;
  }

  return (
    <div className="result-container">
      {items.map((item, index) => (
        <div key={index} className="result-item">
          <h3>
            {item.title}
            <button onClick={() => onOpenUrl(item.text)}>
              查看说明文档
            </button>
          </h3>
          <a href={item.text} target="_blank" rel="noopener noreferrer">
            {item.text}
          </a>
        </div>
      ))}
    </div>
  );
};

export default APIDocsTab;