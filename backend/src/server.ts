import { WebSocketServer, WebSocket } from 'ws'
import * as Y from 'yjs'
import { setPersistence } from 'y-websocket/bin/utils'

const PORT = 1234
const HOST = '0.0.0.0'

// Create WebSocket server
const wss = new WebSocketServer({ port: PORT, host: HOST })

// Store Yjs documents in memory
const docs = new Map<string, WSSharedDoc>()

// Extended WebSocket with additional properties
interface WSWithAlive extends WebSocket {
  isAlive?: boolean
}

// Document with cleanup tracking
class WSSharedDoc extends Y.Doc {
  name: string
  conns: Map<WebSocket, Set<number>>

  constructor(name: string) {
    super()
    this.name = name
    this.conns = new Map()
  }
}

// Get or create document
function getYDoc(docname: string): WSSharedDoc {
  let doc = docs.get(docname)
  if (!doc) {
    doc = new WSSharedDoc(docname)
    docs.set(docname, doc)
  }
  return doc
}

// Handle new WebSocket connections
wss.on('connection', (ws: WSWithAlive, req) => {
  ws.isAlive = true

  // Extract document name from URL (default to 'shared-note')
  const docName = 'shared-note'
  const doc = getYDoc(docName)

  // Initialize connection set for this websocket
  doc.conns.set(ws, new Set())

  // Send initial sync
  const encoder = Y.encoding.createEncoder()
  Y.encoding.writeVarUint(encoder, 0) // messageSync
  const syncEncoder = Y.encoding.createEncoder()
  Y.writeSyncStep1(syncEncoder, doc)
  Y.encoding.writeVarUint8Array(encoder, Y.encoding.toUint8Array(syncEncoder))
  ws.send(Y.encoding.toUint8Array(encoder))

  // Handle messages from client
  ws.on('message', (message: Buffer) => {
    const uint8Array = new Uint8Array(message)
    const encoder = Y.readMessage(doc, uint8Array, true)

    if (encoder !== null) {
      // Broadcast update to all connected clients except sender
      const update = Y.encoding.toUint8Array(encoder)
      doc.conns.forEach((_, conn) => {
        if (conn !== ws && conn.readyState === WebSocket.OPEN) {
          conn.send(update)
        }
      })
    }
  })

  // Handle pong (for keepalive)
  ws.on('pong', () => {
    ws.isAlive = true
  })

  // Handle connection close
  ws.on('close', () => {
    doc.conns.delete(ws)

    // If no more connections, keep doc in memory (in-memory persistence)
    // Could clean up here if desired, but for MVP we keep it
    console.log(`Client disconnected. Remaining connections: ${doc.conns.size}`)
  })

  console.log(`Client connected to document: ${docName}. Total connections: ${doc.conns.size}`)
})

// Keepalive ping interval
const interval = setInterval(() => {
  wss.clients.forEach((ws: WSWithAlive) => {
    if (ws.isAlive === false) {
      return ws.terminate()
    }
    ws.isAlive = false
    ws.ping()
  })
}, 30000)

wss.on('close', () => {
  clearInterval(interval)
})

console.log(`WebSocket server running on ws://${HOST}:${PORT}`)
console.log(`Accessible on network at ws://192.168.128.13:${PORT}`)
