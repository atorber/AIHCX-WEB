<template>
  <div class="terminal-container">
    <div id="terminal" class="terminal"></div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, onUnmounted } from 'vue';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { WebLinksAddon } from '@xterm/addon-web-links';

const props = defineProps<{
  url: string;
}>();

console.log("WebTerminal props", props);

let terminal: Terminal;
let fitAddon: FitAddon;
let ws: WebSocket;
let handleResize: () => void;

onMounted(async () => {
  // 创建终端实例
  terminal = new Terminal({
    cursorBlink: true,
    fontSize: 14,
    fontFamily: 'Menlo, Monaco, "Courier New", monospace',
    convertEol: true,
    scrollback: 1000,
    cols: 120,
    rows: 30,
    allowTransparency: false,
    cursorStyle: 'block',
    cursorWidth: 1,
    theme: {
      background: '#1e1e1e',
      foreground: '#ffffff',
      cursor: '#ffffff',
      black: '#000000',
      red: '#cd3131',
      green: '#0dbc79',
      yellow: '#e5e510',
      blue: '#2472c8',
      magenta: '#bc3fbc',
      cyan: '#11a8cd',
      white: '#e5e5e5',
      brightBlack: '#666666',
      brightRed: '#f14c4c',
      brightGreen: '#23d18b',
      brightYellow: '#f5f543',
      brightBlue: '#3b8eea',
      brightMagenta: '#d670d6',
      brightCyan: '#29b8db',
      brightWhite: '#e5e5e5'
    }
  });

  // 添加插件
  fitAddon = new FitAddon();
  terminal.loadAddon(fitAddon);
  terminal.loadAddon(new WebLinksAddon());

  // 打开终端
  const terminalElement = document.getElementById('terminal');
  terminal.open(terminalElement as HTMLElement);
  
  // 创建WebSocket连接
  try {
    ws = new WebSocket(props.url);
    
    ws.addEventListener('open', () => {
      console.log('WebSocket连接已建立');
      terminal.clear();
      terminal.reset();
      
      // 发送初始化命令
      ws.send(JSON.stringify({
        operation: 'resize',
        cols: terminal.cols,
        rows: terminal.rows
      }));
    });

    // 处理收到的消息
    ws.addEventListener('message', async (event) => {
      try {
        let data = event.data;
        
        // 如果是Blob类型，转换为文本
        if (data instanceof Blob) {
          data = await data.text();
          console.log("接收到Blob数据:", data);
        }
        
        // 尝试解析为JSON
        try {
          const jsonData = JSON.parse(data);
          console.log("接收到JSON数据:", jsonData);
          
          if (jsonData.operation === 'stdout') {
            terminal.write(jsonData.data);
          } else if (jsonData.operation === 'stderr') {
            terminal.write('\x1b[31m' + jsonData.data + '\x1b[0m');
          } else {
            console.log('未知操作类型:', jsonData.operation);
          }
        } catch (e) {
          // 不是JSON格式，直接写入终端
          console.log("接收到非JSON数据:", data);
          terminal.write(data);
        }
      } catch (error) {
        console.error('处理WebSocket消息时出错:', error);
      }
    });

    // 处理终端输入
    terminal.onData((data) => {
      if (ws?.readyState === WebSocket.OPEN) {
        console.log("发送数据:", data);
        ws.send(JSON.stringify({
          operation: 'stdin',
          data: data
        }));
      } else {
        console.warn('WebSocket未连接，无法发送数据');
      }
    });

    ws.addEventListener('error', (error) => {
      console.error('WebSocket连接错误:', error);
      terminal.write('\r\n\x1b[31mWebSocket连接错误\x1b[0m\r\n');
    });

    ws.addEventListener('close', (event) => {
      console.warn('WebSocket连接已关闭:', event);
      terminal.write('\r\n\x1b[31mWebSocket连接已关闭\x1b[0m\r\n');
    });

  } catch (error) {
    console.error('创建WebSocket连接失败:', error);
    terminal.write('\r\n\x1b[31m创建WebSocket连接失败\x1b[0m\r\n');
  }

  // 确保终端大小适应容器
  setTimeout(() => {
    fitAddon.fit();
    terminal.focus();
  }, 100);

  // 处理终端大小变化
  terminal.onResize((size) => {
    console.log("终端大小变化:", size);
    if (ws?.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        operation: 'resize',
        cols: size.cols,
        rows: size.rows
      }));
    }
  });

  // 处理窗口大小变化
  handleResize = () => {
    console.log("窗口大小变化");
    fitAddon.fit();
    if (ws?.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        operation: 'resize',
        cols: terminal.cols,
        rows: terminal.rows
      }));
    }
  };

  window.addEventListener('resize', handleResize);
  handleResize(); // 初始化时调用一次
});

onUnmounted(() => {
  console.log("终端组件卸载");
  if (ws) {
    ws.close();
  }
  if (terminal) {
    terminal.dispose();
  }
  window.removeEventListener('resize', handleResize);
});
</script>

<style>
.terminal-container {
  width: 100%;
  height: 100%;
  background-color: #1e1e1e;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
}

.terminal {
  width: 100%;
  height: 100%;
  padding: 4px;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

:deep(.xterm) {
  height: 100%;
  padding: 0;
  position: relative;
}

:deep(.xterm-viewport) {
  overflow-y: auto;
  background-color: #1e1e1e !important;
  width: 100% !important;
}

:deep(.xterm-screen) {
  background-color: #1e1e1e !important;
}

:deep(.xterm-cursor-layer) {
  z-index: 1;
}

:deep(.xterm-decoration-container) {
  z-index: 2;
}

:deep(.xterm-selection-layer) {
  z-index: 3;
}

:deep(.xterm-rows) {
  padding: 2px;
}
</style> 