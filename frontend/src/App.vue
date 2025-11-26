<template>
  <div class="app">
    <header class="header">
      <h1>Realtime Collaborative Notes</h1>
      <div class="status">
        <span :class="['status-indicator', { connected: isConnected }]"></span>
        <span class="status-text">{{ isConnected ? 'Connected' : 'Disconnected' }}</span>
      </div>
    </header>

    <main class="main">
      <textarea
        :ref="setTextareaRef"
        :value="content"
        @input="handleInput"
        placeholder="Start typing... Your changes will sync in realtime with other users."
        class="editor"
      />
    </main>

    <footer class="footer">
      <p>Open this page in multiple tabs or browsers to see realtime collaboration in action!</p>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { useYjs } from './composables/useYjs'

const { content, isConnected, handleInput, setTextareaRef } = useYjs()
</script>

<style scoped>
.app {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 2px solid #e0e0e0;
}

h1 {
  margin: 0;
  font-size: 24px;
  color: #333;
}

.status {
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: #e74c3c;
  transition: background-color 0.3s ease;
}

.status-indicator.connected {
  background-color: #2ecc71;
}

.status-text {
  font-size: 14px;
  color: #666;
  font-weight: 500;
}

.main {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.editor {
  width: 100%;
  min-height: 500px;
  padding: 20px;
  font-size: 16px;
  line-height: 1.6;
  font-family: 'Menlo', 'Monaco', 'Courier New', monospace;
  border: none;
  outline: none;
  resize: vertical;
  box-sizing: border-box;
}

.editor::placeholder {
  color: #999;
}

.footer {
  margin-top: 20px;
  text-align: center;
}

.footer p {
  color: #666;
  font-size: 14px;
  margin: 0;
}
</style>
