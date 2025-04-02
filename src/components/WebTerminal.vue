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
  },
  style: {
    type: Object,
    default: () => ({})
  },
  width: {
    type: [Number, String],
    default: '100%'
  },
  height: {
    type: [Number, String],
    default: '100%'
  }
})

const emit = defineEmits(['message', 'fullScreen', 'connect', 'disconnect'])

const terminalRef = ref(null)
const terminal = ref(null)
const fitAddon = ref(null)
const socket = ref(null)
const pingTimer = ref(null)
const mutationObserver = ref(null)

// 连接状态常量
const GENERAL_LINK = 1
const PENDING_LINK = 0
const SUCCESS_LINK = -1
const linkStatus = ref(GENERAL_LINK)

// 初始化终端
const initTerminal = () => {
  terminal.value = new Terminal({
    cursorBlink: true,
    cursorStyle: 'block',
    fontSize: 14,
    fontFamily: 'Menlo, Monaco, "Courier New", monospace',
    tabStopWidth: 4,
    theme: {
      background: '#1e1e1e',
      foreground: '#ffffff'
    }
  })

  fitAddon.value = new FitAddon()
  terminal.value.loadAddon(fitAddon.value)

  terminal.value.open(terminalRef.value)
  fitAddon.value.fit()
  terminal.value.focus()

  terminal.value.onData(data => {
    console.log('[WebTerminal] 收到终端输入:', {
      data,
      length: data.length,
      timestamp: new Date().toISOString()
    })
    sendMessage(data)
  })

  // 监听终端容器大小变化
  if (terminalRef.value) {
    mutationObserver.value = new MutationObserver(() => {
      const terminal = document.querySelector('.terminal')
      if (terminal) {
        terminal.style.height = '100%'
        fitAddon.value?.fit()
      }
    })
    mutationObserver.value.observe(terminalRef.value, { childList: true, subtree: false })
  }
}

// WebSocket 编码
const webShellEncode = (text) => {
  console.log('[WebTerminal] 开始编码消息:', {
    originalText: text,
    length: text.length,
    timestamp: new Date().toISOString()
  })
  const textEncoder = window.TextEncoder ? new TextEncoder() : null
  if (textEncoder) {
    const encoded = textEncoder.encode(text)
    console.log('[WebTerminal] 使用TextEncoder编码完成:', {
      encodedLength: encoded.length,
      timestamp: new Date().toISOString()
    })
    return encoded
  }
  const utf8 = encodeURIComponent(text)
  const textArray = utf8.split('').map(item => item.charCodeAt(0))
  const result = new Uint8Array(textArray)
  console.log('[WebTerminal] 使用encodeURIComponent编码完成:', {
    encodedLength: result.length,
    timestamp: new Date().toISOString()
  })
  return result
}

// 安全发送消息
const safeSend = (data) => {
  if (socket.value?.readyState === WebSocket.OPEN) {
    console.log('[WebTerminal] 准备发送消息:', {
      dataLength: data.length,
      socketState: socket.value.readyState,
      timestamp: new Date().toISOString()
    })
    socket.value.send(data)
    console.log('[WebTerminal] 消息发送完成')
  } else {
    console.error('[WebTerminal] WebSocket未连接，无法发送消息:', {
      socketState: socket.value?.readyState,
      socketStateText: socket.value?.readyState === WebSocket.OPEN ? 'OPEN' : 
                      socket.value?.readyState === WebSocket.CLOSED ? 'CLOSED' : 
                      socket.value?.readyState === WebSocket.CONNECTING ? 'CONNECTING' : 'CLOSING',
      timestamp: new Date().toISOString()
    })
  }
}

// 心跳包
const ping = () => {
  console.log('[WebTerminal] 发送心跳包')
  safeSend(webShellEncode('\x00\x00\x00'))
}

// 调整终端大小
const resize = (socketSendData = safeSend, sizeArgs = null) => {
  console.log('[WebTerminal] 调整终端大小')
  fitAddon.value?.fit()
  const size = sizeArgs || {
    rows: terminal.value?.rows || 0,
    cols: terminal.value?.cols || 0
  }
  const sizeMsg = { Height: size.rows, Width: size.cols }
  // 通过4号通道传递terminal size
  const textEncoder = new TextEncoder()
  socketSendData(textEncoder.encode('\x04' + JSON.stringify(sizeMsg)))
}

// 设置 WebSocket 连接
const setUpSocket = () => {
  console.log('[WebTerminal] 开始设置WebSocket连接')
  linkStatus.value = PENDING_LINK
  try {
    socket.value = new WebSocket(props.socketUrl)
    socket.value.binaryType = 'arraybuffer'

    socket.value.onopen = () => {
      console.log('[WebTerminal] WebSocket连接成功')
      terminal.value.writeln('连接成功')
      linkStatus.value = SUCCESS_LINK
      pingTimer.value = window.setInterval(ping, 30000)
      resize()
      emit('connect')
    }

    socket.value.onmessage = (e) => {
      console.log('[WebTerminal] 收到消息:', e.data)
      if (typeof e.data === 'string') {
        terminal.value.write(e.data.replace(/\r$/g, '\r\n'))
      } else if (e.data instanceof ArrayBuffer) {
        const decoder = new TextDecoder('utf-8')
        const text = decoder.decode(new Uint8Array(e.data))
        terminal.value.write(text.replace(/\r$/g, '\r\n'))
      }
    }

    socket.value.onclose = () => {
      console.log('[WebTerminal] WebSocket连接关闭')
      clearInterval(pingTimer.value)
      linkStatus.value = GENERAL_LINK
      emit('disconnect')
    }

    socket.value.onerror = (error) => {
      console.error('[WebTerminal] WebSocket错误:', error)
      closeSocket(error.code)
      linkStatus.value = GENERAL_LINK
      terminal.value.writeln(`连接失败: ${error.code}`)
      emit('disconnect')
    }
  } catch (e) {
    console.error('[WebTerminal] 设置WebSocket连接失败:', e)
    terminal.value.writeln(`连接失败: ${e}`)
    emit('disconnect')
  }
}

// 关闭 WebSocket 连接
const closeSocket = (code, reason) => {
  console.log('[WebTerminal] 关闭WebSocket连接, code:', code, 'reason:', reason)
  clearInterval(pingTimer.value)
  socket.value?.close(code, reason)
}

// 连接 WebSocket
const connectWebSSH = () => {
  console.log('[WebTerminal] 尝试连接WebSSH, 当前状态:', linkStatus.value)
  if (linkStatus.value === PENDING_LINK) {
    console.log('[WebTerminal] 连接正在进行中，跳过')
    return
  }
  if (linkStatus.value === SUCCESS_LINK) {
    console.log('[WebTerminal] 已连接，重新连接')
    closeSocket()
    setUpSocket()
    return
  }
  if (linkStatus.value === GENERAL_LINK) {
    console.log('[WebTerminal] 开始新连接')
    setUpSocket()
  }
}

// 发送消息
const sendMessage = (data) => {
  console.log('[WebTerminal] 发送终端消息:', {
    data,
    length: data.length,
    timestamp: new Date().toISOString(),
    socketState: socket.value?.readyState,
    socketStateText: socket.value?.readyState === WebSocket.OPEN ? 'OPEN' : 
                    socket.value?.readyState === WebSocket.CLOSED ? 'CLOSED' : 
                    socket.value?.readyState === WebSocket.CONNECTING ? 'CONNECTING' : 'CLOSING'
  })
  safeSend(webShellEncode(`\x00${data}`))
}

// 销毁终端
const disposeTerminal = () => {
  try {
    if (terminal.value) {
      // 先移除所有插件
      terminal.value.loadedAddons?.forEach(addon => {
        try {
          terminal.value.removeAddon(addon)
        } catch (e) {
          console.warn('[WebTerminal] 移除插件失败:', e)
        }
      })
      terminal.value.dispose()
    }
    mutationObserver.value?.disconnect()
  } catch (e) {
    console.warn('[WebTerminal] 销毁终端时发生错误:', e)
  }
}

onMounted(() => {
  initTerminal()
  connectWebSSH()
  window.addEventListener('resize', () => resize())
})

onUnmounted(() => {
  window.removeEventListener('resize', () => resize())
  disposeTerminal()
  closeSocket()
})

defineExpose({
  terminalRef: terminal,
  writeln: (text) => terminal.value?.writeln(text),
  write: (text) => terminal.value?.write(text),
  resize,
  setup: initTerminal,
  dispose: disposeTerminal,
  fit: () => fitAddon.value?.fit(),
  connect: connectWebSSH,
  disconnect: closeSocket
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