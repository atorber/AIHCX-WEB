import React from 'react';

const LoadingIndicator: React.FC = () => {
  return (
    <div className="loading-indicator">
      <div className="loading-spinner"></div>
      <span>正在加载...</span>
    </div>
  );
};

export default LoadingIndicator;