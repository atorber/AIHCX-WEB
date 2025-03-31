<template>
  <div class="terminal-container">
    <div id="terminal"></div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, onUnmounted } from 'vue';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { WebLinksAddon } from '@xterm/addon-web-links';
import { WebglAddon } from '@xterm/addon-webgl';

const props = defineProps<{
  url: string;
}>();

console.log("WebTerminal props", props);

let terminal: Terminal;
let fitAddon: FitAddon;
let webglAddon: WebglAddon;

onMounted(async () => {
  // 创建终端实例
  terminal = new Terminal({
    cursorBlink: true,
    fontSize: 14,
    fontFamily: 'Menlo, Monaco, "Courier New", monospace',
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

  // 尝试加载WebGL插件
  try {
    webglAddon = new WebglAddon();
    terminal.loadAddon(webglAddon);
    console.log("WebGL addon loaded");
  } catch (e) {
    console.warn('WebGL addon failed to load, falling back to canvas renderer');
  }

  // 打开终端
  terminal.open(document.getElementById('terminal') as HTMLElement);
  fitAddon.fit();

  // 创建WebSocket连接
  const ws = new WebSocket(props.url);
  
  ws.onopen = () => {
    terminal.write('\r');
    console.log('wss connected');
  };

  ws.onmessage = async (event) => {
    console.log("WebSocket message received", event.data);
    try {
      let data;
      if (event.data instanceof Blob) {
        // 处理 Blob 类型的消息
        const text = await event.data.text();
        try {
          data = JSON.parse(text);
        } catch (e) {
          // 如果不是 JSON，直接作为文本输出
          terminal.write(text);
          return;
        }
      } else {
        // 处理文本类型的消息
        try {
          data = JSON.parse(event.data);
        } catch (e) {
          // 如果不是 JSON，直接作为文本输出
          terminal.write(event.data);
          return;
        }
      }

      console.warn('Received message:', data);
      if (data.operation === 'stdout') {
        terminal.write(data.data);
      } else {
        console.warn('invalid msg operation: ' + JSON.stringify(data));
      }
    } catch (e) {
      console.warn('Error processing message:', e);
      // 如果处理失败，尝试直接输出原始数据
      if (event.data instanceof Blob) {
        const text = await event.data.text();
        terminal.write(text);
      } else {
        terminal.write(event.data);
      }
    }
  };

  ws.onerror = (error) => {
    console.warn('Connection error:', error);
  };

  ws.onclose = () => {
    console.warn('wss disconnected');
    terminal.write('Connection closed');
  };

  // 处理终端输入
  terminal.onData((data) => {
    console.log("terminal onData", data);
    const msg = { operation: 'stdin', data: data };
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(msg));
    }
  });

  // 处理终端大小变化
  terminal.onResize((size) => {
    console.log("terminal onResize", size);
    const msg = { operation: 'resize', cols: size.cols, rows: size.rows };
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(msg));
    }
  });

  // 处理窗口大小变化
  window.addEventListener('resize', () => {
    console.log("window resize");
    fitAddon.fit();
    const size = terminal;
    const msg = { operation: 'resize', cols: size.cols, rows: size.rows };
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(msg));
    }
  });
});

onUnmounted(() => {
  console.log("WebTerminal onUnmounted");
  if (webglAddon) {
    webglAddon.dispose();
  }
  terminal.dispose();
  console.log("Terminal disposed");
});
</script>

<style>
.terminal-container {
  width: 100%;
  height: 100%;
  background-color: #1e1e1e;
  padding: 10px;
}

#terminal {
  width: 100%;
  height: 100%;
}
</style> 