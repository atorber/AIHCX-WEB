import React from 'react';
import { Message } from '../types';

interface MessageDisplayProps {
  message: Message;
  onDismiss: () => void;
}

const MessageDisplay: React.FC<MessageDisplayProps> = ({ message, onDismiss }) => {
  return (
    <div className={`message ${message.type}`}>
      <div className="message-content">
        <span className="message-text">{message.text}</span>
        <button className="message-close" onClick={onDismiss} title="关闭">
          <span>×</span>
        </button>
      </div>
    </div>
  );
};

export default MessageDisplay;