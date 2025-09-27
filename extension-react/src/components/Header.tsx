import React from 'react';

interface HeaderProps {
  pageName: string;
}

const Header: React.FC<HeaderProps> = ({ pageName }) => {
  return (
    <div className="header">
      <div className="header-content">
        <div className="header-left">
          <h2>{pageName}</h2>
          <p>切换Tab按钮可以查看对应内容</p>
        </div>
      </div>
    </div>
  );
};

export default Header;