import React from 'react';

interface HeaderProps {
  pageName: string;
}

const Header: React.FC<HeaderProps> = ({ pageName }) => {
  return (
    <div className="header">
      {/* <h1>AIHC助手</h1>
      <p>{pageName}</p> */}
      <h2>{pageName}</h2>
      <p>切换Tab按钮可以查看对应内容</p>
    </div>
  );
};

export default Header;