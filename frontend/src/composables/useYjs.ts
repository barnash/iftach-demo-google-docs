import { ref, onMounted, onUnmounted } from 'vue'
import * as Y from 'yjs'
import { WebsocketProvider } from 'y-websocket'

export function useYjs() {
  const content = ref('')
  const isConnected = ref(false)
  const cursorPosition = ref(0)
  const textareaRef = ref<HTMLTextAreaElement | null>(null)

  let doc: Y.Doc
  let provider: WebsocketProvider
  let yText: Y.Text

  onMounted(() => {
    // Initialize Yjs document
    doc = new Y.Doc()

    // Connect to WebSocket server
    const wsUrl = window.location.hostname === 'localhost'
      ? 'ws://localhost:1234'
      : `ws://${window.location.hostname}:1234`
    provider = new WebsocketProvider(wsUrl, 'shared-note', doc)

    // Get shared text type
    yText = doc.getText('content')

    // Set initial content
    content.value = yText.toString()

    // Listen for connection status
    provider.on('status', (event: { status: string }) => {
      isConnected.value = event.status === 'connected'
    })

    // Listen for remote changes
    yText.observe(() => {
      const newContent = yText.toString()
      if (newContent !== content.value) {
        // Save current cursor position before updating
        if (textareaRef.value && document.activeElement === textareaRef.value) {
          cursorPosition.value = textareaRef.value.selectionStart || 0
        }

        content.value = newContent

        // Restore cursor position after DOM update
        if (textareaRef.value && document.activeElement === textareaRef.value) {
          requestAnimationFrame(() => {
            textareaRef.value?.setSelectionRange(cursorPosition.value, cursorPosition.value)
          })
        }
      }
    })

    // Sync awareness (optional: for cursor positions, user info)
    provider.awareness.setLocalStateField('user', {
      name: 'User ' + Math.floor(Math.random() * 100)
    })
  })

  onUnmounted(() => {
    provider?.destroy()
    doc?.destroy()
  })

  // Handle input from textarea
  function handleInput(event: Event) {
    const target = event.target as HTMLTextAreaElement
    const newValue = target.value
    const oldValue = content.value

    // Calculate the diff and apply to Yjs
    if (newValue !== oldValue) {
      // Find common prefix
      let prefixLen = 0
      while (
        prefixLen < oldValue.length &&
        prefixLen < newValue.length &&
        oldValue[prefixLen] === newValue[prefixLen]
      ) {
        prefixLen++
      }

      // Find common suffix
      let suffixLen = 0
      while (
        suffixLen < oldValue.length - prefixLen &&
        suffixLen < newValue.length - prefixLen &&
        oldValue[oldValue.length - 1 - suffixLen] === newValue[newValue.length - 1 - suffixLen]
      ) {
        suffixLen++
      }

      // Calculate what was deleted and inserted
      const deleteLen = oldValue.length - prefixLen - suffixLen
      const insertText = newValue.slice(prefixLen, newValue.length - suffixLen)

      // Apply changes to Yjs document
      doc.transact(() => {
        if (deleteLen > 0) {
          yText.delete(prefixLen, deleteLen)
        }
        if (insertText.length > 0) {
          yText.insert(prefixLen, insertText)
        }
      })
    }

    // Update local content
    content.value = newValue
  }

  function setTextareaRef(ref: HTMLTextAreaElement | null) {
    textareaRef.value = ref
  }

  return {
    content,
    isConnected,
    handleInput,
    setTextareaRef
  }
}
