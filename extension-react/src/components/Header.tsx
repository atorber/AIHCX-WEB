import React from 'react';

interface HeaderProps {
  pageName: string;
}

const Header: React.FC<HeaderProps> = ({ pageName }) => {
  return (
    <div className="header">
      <h1>AIHC助手</h1>
      <p>{pageName}</p>
    </div>
  );
};

export default Header;