import { WebSocketServer } from 'ws'
import { setupWSConnection } from 'y-websocket/bin/utils'

const PORT = 1234
const HOST = '0.0.0.0'

// Create WebSocket server
const wss = new WebSocketServer({ port: PORT, host: HOST })

// Handle new WebSocket connections
wss.on('connection', (ws, req) => {
  console.log('Client connected')
  setupWSConnection(ws, req, { docName: 'shared-note' })
})

console.log(`WebSocket server running on ws://${HOST}:${PORT}`)
console.log(`Accessible on network at ws://192.168.128.13:${PORT}`)
