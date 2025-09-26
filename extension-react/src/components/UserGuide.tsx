import React, { useState, useEffect } from 'react';
import { shouldShowUserGuide, hideUserGuide } from '../utils/chromeApi';

const UserGuide: React.FC = () => {
  const [showGuide, setShowGuide] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const guideSteps = [
    {
      title: '\uD83D\uDD0D 支持页面检测',
      description: '插件会自动检测您是否在AIHC控制台的支持页面，并显示相应功能',
      icon: '\uD83D\uDD0D'
    },
    {
      title: '\u2699\uFE0F CLI命令生成',
      description: '在任务详情页可以生成创建任务的CLI命令，方便本地使用',
      icon: '\u2699\uFE0F'
    },
    {
      title: '\uD83D\uDCC4 参数导出',
      description: '支持将任务参数导出为JSON、YAML格式，便于备份和修改',
      icon: '\uD83D\uDCC4'
    },
    {
      title: '\uD83D\uDE80 快速复制',
      description: '一键复制命令或参数到剪贴板，提高工作效率',
      icon: '\uD83D\uDE80'
    }
  ];

  useEffect(() => {
    const checkShowGuide = async () => {
      const should = await shouldShowUserGuide();
      setShowGuide(should);
      if (should) {
        // 延迟显示动画效果
        setTimeout(() => setIsVisible(true), 100);
      }
    };
    
    checkShowGuide();
  }, []);

  const closeGuide = async () => {
    setIsVisible(false);
    
    // 等待动画完成后再隐藏
    setTimeout(() => {
      setShowGuide(false);
      if (dontShowAgain) {
        hideUserGuide();
      }
    }, 300);
  };

  if (!showGuide) {
    return null;
  }

  return (
    <div className={`user-guide-overlay ${isVisible ? 'show' : ''}`}>
      <div className={`user-guide ${isVisible ? 'show' : ''}`}>
        <div className="guide-header">
          <div className="header-content">
            <div className="header-icon">🎉</div>
            <h3>欢迎使用 AIHC助手</h3>
            <p className="version-tag">v0.5.0</p>
          </div>
          <button className="close-btn" onClick={closeGuide} title="关闭">
            <span>×</span>
          </button>
        </div>
        
        <div className="guide-content">
          <div className="welcome-message">
            <p>为AIHC用户提供便捷的CLI命令生成和参数管理功能</p>
          </div>
          
          {guideSteps.map((step, index) => (
            <div key={index} className={`guide-step step-${index + 1}`}>
              <div className="step-number">
                <span className="number">{index + 1}</span>
                <div className="step-icon">{step.icon}</div>
              </div>
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
            <span className="checkbox-text">不再显示此向导</span>
          </label>
          <button className="guide-btn primary" onClick={closeGuide}>
            <span>开始使用</span>
            <span className="btn-icon">→</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserGuide;