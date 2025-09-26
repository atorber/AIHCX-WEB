import React from 'react';

interface HeaderProps {
  pageName: string;
  onClose?: () => void;
}

const Header: React.FC<HeaderProps> = ({ pageName, onClose }) => {
  return (
    <div className="header">
      <div className="header-content">
        <div className="header-left">
          <h2>{pageName}</h2>
          <p>切换Tab按钮可以查看对应内容</p>
        </div>
        {onClose && (
          <div className="header-right">
            <button
              className="close-button"
              onClick={onClose}
              title="关闭侧边栏"
            >
              ×
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Header;