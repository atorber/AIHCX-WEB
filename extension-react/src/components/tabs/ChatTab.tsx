import React, { useState, useRef, useEffect, useCallback } from 'react';

interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatTabProps {
  chatConfig?: {
    serviceUrl: string;
    accessToken: string;
    basePath: string;
    serviceId?: string;
    isLoaded?: boolean;
  };
  isLoading?: boolean;
  error?: string;
  onLoadConfig?: (serviceId: string) => Promise<void>;
}

const ChatTab: React.FC<ChatTabProps> = ({ chatConfig, isLoading: isConfigLoading, error, onLoadConfig }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 初始化欢迎消息
  useEffect(() => {
    if (chatConfig && chatConfig.isLoaded && messages.length === 0) {
      setMessages([{
        id: '1',
        type: 'assistant',
        content: `你好！我是AI助手，已连接到您的在线服务部署。\n\n服务信息：\n- 服务地址: ${chatConfig.serviceUrl}\n- 认证方式: Bearer Token\n\n我可以帮助您与服务进行交互，请发送您的消息。`,
        timestamp: new Date()
      }]);
    }
  }, [chatConfig]);

  const sendMessage = useCallback(async () => {
    if (!inputMessage.trim() || !chatConfig || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // 构建请求URL
      const fullUrl = `${chatConfig.serviceUrl}/chat/completions`;
      
      // 添加超时控制，避免长时间等待
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30秒超时
      
      // 发送请求到OpenAI兼容接口
      const response = await fetch(fullUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': chatConfig.accessToken,
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            ...messages.map(msg => ({
              role: msg.type === 'user' ? 'user' : 'assistant',
              content: msg.content
            })),
            {
              role: 'user',
              content: inputMessage
            }
          ],
          stream: false
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        let errorMsg = `HTTP ${response.status}`;
        if (response.status === 401) {
          errorMsg = '认证失败，请检查访问令牌';
        } else if (response.status === 403) {
          errorMsg = '访问被拒绝，权限不足';
        } else if (response.status === 404) {
          errorMsg = '服务不存在或URL错误';
        } else if (response.status >= 500) {
          errorMsg = '服务器内部错误，请稍后重试';
        }
        throw new Error(errorMsg);
      }

      const data = await response.json();
      
      // 检查响应数据格式
      if (!data.choices || !Array.isArray(data.choices) || data.choices.length === 0) {
        throw new Error('服务返回了无效的响应格式');
      }

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: data.choices[0].message?.content || '抱歉，我没有收到有效的回复。',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      
      let errorContent = '抱歉，发送消息时出现错误';
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          errorContent = '请求超时，请检查网络连接或稍后重试';
        } else if (error.message.includes('Failed to fetch')) {
          errorContent = '网络连接失败，请检查网络或服务地址';
        } else if (error.message.includes('CORS')) {
          errorContent = '跨域请求被阻止，请检查服务配置';
        } else {
          errorContent = `错误：${error.message}`;
        }
      }
      
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: errorContent,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [inputMessage, chatConfig, isLoading, messages]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }, [sendMessage]);

  const clearChat = useCallback(() => {
    setMessages([]);
  }, []);

  const handleLoadConfig = useCallback(async () => {
    console.log('[ChatTab] handleLoadConfig 被调用');
    console.log('[ChatTab] chatConfig:', chatConfig);
    console.log('[ChatTab] onLoadConfig:', onLoadConfig);
    console.log('[ChatTab] serviceId:', chatConfig?.serviceId);
    
    if (chatConfig?.serviceId && onLoadConfig) {
      try {
        console.log('[ChatTab] 开始调用 onLoadConfig');
        await onLoadConfig(chatConfig.serviceId);
        console.log('[ChatTab] onLoadConfig 调用完成');
      } catch (error) {
        console.error('[ChatTab] 加载配置失败:', error);
      }
    } else {
      console.warn('[ChatTab] 无法加载配置，缺少必要条件:', {
        hasServiceId: !!chatConfig?.serviceId,
        hasOnLoadConfig: !!onLoadConfig
      });
    }
  }, [chatConfig?.serviceId, onLoadConfig]);

  // 显示配置加载状态
  if (isConfigLoading) {
    return (
      <div className="chat-container">
        <div className="chat-header">
          <h3>💬 AI 聊天助手</h3>
        </div>
        <div className="chat-messages">
          <div className="message assistant">
            <div className="message-content">
              <div className="message-text">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <div style={{ marginTop: '8px', color: '#666', fontSize: '14px' }}>
                  正在加载聊天配置...
                </div>
                <div style={{ marginTop: '4px', color: '#999', fontSize: '12px' }}>
                  正在获取服务详情信息，请稍候...
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 显示错误状态
  if (error) {
    return (
      <div className="chat-container">
        <div className="chat-header">
          <h3>💬 AI 聊天助手</h3>
        </div>
        <div className="chat-error">
          <h3>⚠️ 聊天功能不可用</h3>
          <p>加载聊天配置时出现错误：</p>
          <p style={{ color: '#f44336', fontSize: '14px', marginTop: '8px' }}>
            {error}
          </p>
          <p style={{ fontSize: '12px', color: '#666', marginTop: '12px' }}>
            请检查网络连接或稍后重试
          </p>
        </div>
      </div>
    );
  }

  // 显示配置未加载状态
  if (!chatConfig || !chatConfig.isLoaded) {
    return (
      <div className="chat-container">
        <div className="chat-header">
          <h3>💬 AI 聊天助手</h3>
        </div>
        <div className="chat-messages">
          <div className="message assistant">
            <div className="message-content">
              <div className="message-text">
                <div style={{ marginBottom: '16px', color: '#666', fontSize: '14px' }}>
                  💡 点击下方按钮加载聊天配置，即可开始与服务进行对话
                </div>
                <div style={{ marginBottom: '8px', color: '#999', fontSize: '12px' }}>
                  配置信息将包含服务的访问地址和认证token
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="chat-input" style={{ justifyContent: 'center', padding: '20px' }}>
          <button 
            onClick={handleLoadConfig}
            disabled={isConfigLoading}
            style={{
              padding: '12px 24px',
              backgroundColor: isConfigLoading ? '#ccc' : '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              cursor: isConfigLoading ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.2s'
            }}
          >
            {isConfigLoading ? '正在加载配置...' : '加载配置'}
          </button>
          <div style={{ marginTop: '8px', fontSize: '12px', color: '#999' }}>
            ServiceId: {chatConfig?.serviceId || '未设置'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h3>💬 AI 聊天助手</h3>
        <div className="chat-actions">
          <button 
            className="clear-button" 
            onClick={clearChat}
            title="清空聊天记录"
          >
            清空
          </button>
        </div>
      </div>
      
      <div className="chat-messages">
        {messages.map((message) => (
          <div key={message.id} className={`message ${message.type}`}>
            <div className="message-content">
              <div className="message-text">
                {message.content.split('\n').map((line, index) => (
                  <div key={index}>{line}</div>
                ))}
              </div>
              <div className="message-time">
                {message.timestamp.toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="message assistant">
            <div className="message-content">
              <div className="message-text">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      <div className="chat-input">
        <textarea
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="输入您的消息..."
          rows={2}
          disabled={isLoading}
        />
        <button 
          onClick={sendMessage} 
          disabled={!inputMessage.trim() || isLoading}
          className="send-button"
        >
          {isLoading ? '发送中...' : '发送'}
        </button>
      </div>
    </div>
  );
};

export default ChatTab;
