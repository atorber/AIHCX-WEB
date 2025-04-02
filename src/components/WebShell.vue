<template>
  <div class="webshell-container">
    <div ref="terminalRef" class="terminal"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { Terminal } from 'xterm'
import { FitAddon } from 'xterm-addon-fit'
import 'xterm/css/xterm.css'

const props = defineProps({
  socketUrl: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['message'])

const terminalRef = ref(null)
const terminal = ref(null)
const fitAddon = ref(null)
const socket = ref(null)
const pingTimer = ref(null)

// 连接状态常量
const GENERAL_LINK = 1
const PENDING_LINK = 0
const SUCCESS_LINK = -1
const linkStatus = ref(GENERAL_LINK)

// 初始化终端
const initTerminal = () => {
  terminal.value = new Terminal({
    cursorBlink: true,
    fontSize: 14,
    fontFamily: 'Menlo, Monaco, "Courier New", monospace',
    theme: {
      background: '#1e1e1e',
      foreground: '#ffffff'
    }
  })

  fitAddon.value = new FitAddon()
  terminal.value.loadAddon(fitAddon.value)

  terminal.value.open(terminalRef.value)
  fitAddon.value.fit()

  terminal.value.onData(data => {
    emit('message', data)
  })
}

// WebSocket 编码
const webShellEncode = (text) => {
  const textEncoder = window.TextEncoder ? new TextEncoder() : null
  if (textEncoder) {
    return textEncoder.encode(text)
  }
  const utf8 = encodeURIComponent(text)
  const textArray = utf8.split('').map(item => item.charCodeAt(0))
  return new Uint8Array(textArray)
}

// 安全发送消息
const safeSend = (data) => {
  if (socket.value?.readyState === WebSocket.OPEN) {
    socket.value.send(data)
  } else {
    console.error('WebSocket未连接，当前状态:', socket.value?.readyState)
  }
}

// 心跳包
const ping = () => {
  safeSend(webShellEncode('\x00\x00\x00'))
}

// 调整终端大小
const resize = () => {
  fitAddon.value?.fit()
}

// 设置 WebSocket 连接
const setUpSocket = () => {
  linkStatus.value = PENDING_LINK
  try {
    socket.value = new WebSocket(props.socketUrl)
    socket.value.binaryType = 'arraybuffer'

    socket.value.onopen = () => {
      terminal.value.writeln('连接成功')
      linkStatus.value = SUCCESS_LINK
      pingTimer.value = window.setInterval(ping, 30000)
      resize()
    }

    socket.value.onmessage = (e) => {
      if (typeof e.data === 'string') {
        terminal.value.write(e.data.replace(/\r$/g, '\r\n'))
      } else if (e.data instanceof ArrayBuffer) {
        const decoder = new TextDecoder('utf-8')
        const text = decoder.decode(new Uint8Array(e.data))
        terminal.value.write(text.replace(/\r$/g, '\r\n'))
      }
    }

    socket.value.onclose = () => {
      clearInterval(pingTimer.value)
      linkStatus.value = GENERAL_LINK
    }

    socket.value.onerror = (error) => {
      closeSocket(error.code)
      linkStatus.value = GENERAL_LINK
      terminal.value.writeln(`连接失败: ${error.code}`)
    }
  } catch (e) {
    terminal.value.writeln(`连接失败: ${e}`)
  }
}

// 关闭 WebSocket 连接
const closeSocket = (code, reason) => {
  clearInterval(pingTimer.value)
  socket.value?.close(code, reason)
}

// 连接 WebSocket
const connectWebSSH = () => {
  if (linkStatus.value === PENDING_LINK) return
  if (linkStatus.value === SUCCESS_LINK) {
    closeSocket()
    setUpSocket()
    return
  }
  if (linkStatus.value === GENERAL_LINK) {
    setUpSocket()
  }
}

// 发送消息
const sendMessage = (data) => {
  safeSend(webShellEncode(`\x00${data}`))
}

onMounted(() => {
  initTerminal()
  connectWebSSH()
  window.addEventListener('resize', resize)
})

onUnmounted(() => {
  window.removeEventListener('resize', resize)
  closeSocket()
})

defineExpose({
  terminalRef: terminal,
  writeln: (text) => terminal.value?.writeln(text),
  write: (text) => terminal.value?.write(text),
  resize
})
</script>

<style scoped>
.webshell-container {
  width: 100%;
  height: 100%;
  background: #1e1e1e;
  padding: 10px;
  border-radius: 4px;
}

.terminal {
  width: 100%;
  height: 100%;
}
</style> 