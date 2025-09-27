/**
 * Chrome扩展错误过滤器
 * 用于过滤控制台中的第三方页面警告和runtime错误
 */

// 检查是否为开发环境
const isDevelopment = process.env.NODE_ENV === 'development';

// 需要过滤的警告关键词
const WARNING_FILTERS = [
  'TrackRoute',
  'nested',
  'PermissionProvider.tsx',
  'Tracert before fns',
  'stop propagation',
  'Portal Assistant loaded',
  'beforelog',
  'Loading "vs/css!vs/editor/editor.main" failed',
  'Could not find https://code.bdstatic.com/npm/monaco-editor',
  'overrideMethod @ hook.js',
  'Here are the modules that depend on it'
];

// 需要过滤的错误关键词
const ERROR_FILTERS = [
  'Could not establish connection',
  'Receiving end does not exist',
  'runtime.lastError',
  'Extension context invalidated',
  'Could not find https://code.bdstatic.com/npm/monaco-editor@0.28.1/min/vs/editor/editor.main.css',
  'Error: Could not find https://code.bdstatic.com/npm/monaco-editor',
  'or it was empty',
  'MutationObserver.observe.subtree'
];

// 初始化错误过滤器
export const initErrorFilter = (): void => {
  // 保存原始的控制台方法
  const originalWarn = console.warn;
  const originalError = console.error;

  // 过滤控制台警告
  console.warn = function(...args: any[]) {
    const message = args.join(' ');
    
    // 检查是否包含需要过滤的警告关键词
    const shouldFilter = WARNING_FILTERS.some(filter => 
      message.includes(filter)
    );
    
    if (shouldFilter) {
      // 在开发环境下显示已过滤的警告（便于调试）
      if (isDevelopment) {
        originalWarn.apply(console, ['[已过滤警告]', ...args]);
      }
      return;
    }
    
    // 显示其他警告
    originalWarn.apply(console, args);
  };

  // 过滤控制台错误
  console.error = function(...args: any[]) {
    const message = args.join(' ');
    
    // 检查是否包含需要过滤的错误关键词
    const shouldFilter = ERROR_FILTERS.some(filter => 
      message.includes(filter)
    );
    
    if (shouldFilter) {
      // 在开发环境下显示已过滤的错误（便于调试）
      if (isDevelopment) {
        originalError.apply(console, ['[已过滤错误]', ...args]);
      }
      return;
    }
    
    // 显示其他错误
    originalError.apply(console, args);
  };

  console.log('[AIHC助手] 错误过滤器已启用');
};

// 自动初始化过滤器
initErrorFilter();