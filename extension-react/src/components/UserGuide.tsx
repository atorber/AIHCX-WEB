import React, { useState, useEffect } from 'react';
import { shouldShowUserGuide, hideUserGuide } from '../utils/chromeApi';

const UserGuide: React.FC = () => {
  const [showGuide, setShowGuide] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  const guideSteps = [
    {
      title: '支持页面检测',
      description: '插件会自动检测您是否在AIHC控制台的支持页面，并显示相应功能'
    },
    {
      title: 'CLI命令生成',
      description: '在任务详情页可以生成创建任务的CLI命令，方便本地使用'
    },
    {
      title: '参数导出',
      description: '支持将任务参数导出为JSON、YAML格式，便于备份和修改'
    },
    {
      title: '快速复制',
      description: '一键复制命令或参数到剪贴板，提高工作效率'
    }
  ];

  useEffect(() => {
    const checkShowGuide = async () => {
      const should = await shouldShowUserGuide();
      setShowGuide(should);
    };
    
    checkShowGuide();
  }, []);

  const closeGuide = async () => {
    setShowGuide(false);
    
    if (dontShowAgain) {
      await hideUserGuide();
    }
  };

  if (!showGuide) {
    return null;
  }

  return (
    <div className="user-guide-overlay">
      <div className="user-guide">
        <div className="guide-header">
          <h3>🎉 欢迎使用 AIHC助手</h3>
          <button className="close-btn" onClick={closeGuide}>×</button>
        </div>
        
        <div className="guide-content">
          {guideSteps.map((step, index) => (
            <div key={index} className="guide-step">
              <div className="step-number">{index + 1}</div>
              <div className="step-content">
                <h4>{step.title}</h4>
                <p>{step.description}</p>
              </div>
            </div>
          ))}
        </div>
        
        <div className="guide-footer">
          <label className="checkbox-label">
            <input 
              type="checkbox" 
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
            />
            <span>不再显示此向导</span>
          </label>
          <button className="guide-btn primary" onClick={closeGuide}>
            开始使用
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserGuide;