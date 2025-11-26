# Realtime Collaborative Notes

A minimal realtime collaborative notes application built with Vue 3, TypeScript, and Yjs CRDT for conflict-free synchronization.

## Features

- **Realtime Collaboration**: Multiple users can edit the same document simultaneously
- **Conflict-Free Sync**: Uses Yjs CRDT for automatic conflict resolution
- **WebSocket Communication**: Fast, bidirectional communication
- **Simple Interface**: Clean textarea editor with connection status
- **In-Memory Storage**: Notes persist while server is running

## Tech Stack

- **Frontend**: Vue 3, TypeScript, Vite
- **Backend**: Node.js, WebSocket (ws), TypeScript
- **Sync**: Yjs CRDT, y-websocket
- **Build**: Vite, tsx

## Project Structure

```
.
├── backend/
│   └── src/
│       └── server.ts          # WebSocket server
├── frontend/
│   ├── src/
│   │   ├── composables/
│   │   │   └── useYjs.ts      # Yjs integration
│   │   ├── App.vue            # Main editor component
│   │   └── main.ts            # Vue app entry
│   ├── index.html             # HTML entry point
│   └── vite.config.ts         # Vite configuration
└── package.json               # Dependencies and scripts
```

## Getting Started

### Prerequisites

- Node.js 20+ installed

### Installation

1. Install dependencies:
```bash
npm install
```

### Development

Run both backend and frontend servers:
```bash
npm run dev
```

This starts:
- Backend WebSocket server on `ws://localhost:1234`
- Frontend dev server on `http://localhost:5173`

Or run them separately:
```bash
# Backend only
npm run dev:backend

# Frontend only
npm run dev:frontend
```

### Testing Collaboration

1. Open `http://localhost:5173` in your browser
2. Open the same URL in another tab or browser window
3. Start typing in one window - changes appear instantly in the other!

### Building for Production

```bash
npm run build
```

This compiles:
- Backend TypeScript to `backend/dist/`
- Frontend to `frontend/dist/`

## How It Works

### Backend (backend/src/server.ts)

- Creates WebSocket server on port 1234
- Manages Yjs documents in memory
- Handles client connections and sync protocol
- Broadcasts updates to all connected clients
- Maintains document state (in-memory only)

### Frontend (frontend/src/)

**useYjs.ts Composable:**
- Initializes Yjs document
- Establishes WebSocket connection
- Provides reactive bindings for Vue
- Handles text diff calculations
- Manages cursor position preservation

**App.vue Component:**
- Displays textarea editor
- Shows connection status
- Binds textarea to Yjs shared text
- Preserves cursor during remote updates

### Synchronization

Yjs CRDT handles:
- Automatic conflict resolution
- Efficient delta synchronization
- Network resilience (offline edits sync when reconnected)
- Consistency across all clients

## Architecture

```
┌─────────────┐         WebSocket          ┌─────────────┐
│   Client 1  │◄──────────────────────────►│             │
│  (Browser)  │                             │  WebSocket  │
└─────────────┘                             │   Server    │
                                            │  (Node.js)  │
┌─────────────┐         WebSocket          │             │
│   Client 2  │◄──────────────────────────►│   + Yjs     │
│  (Browser)  │                             │             │
└─────────────┘                             └─────────────┘

Each client maintains Yjs document
Server broadcasts updates between clients
CRDT ensures consistency
```

## Key Implementation Details

### Cursor Position Preservation

The app tracks cursor position and restores it after remote updates to prevent the cursor from jumping to the end of the textarea.

### Efficient Text Sync

Instead of sending the entire document on every keystroke, the app calculates minimal diffs:
1. Find common prefix and suffix
2. Determine what was deleted/inserted
3. Apply only the delta to Yjs
4. Yjs broadcasts minimal update to other clients

### Connection Status

Real-time connection indicator shows whether the client is connected to the WebSocket server.

## Limitations (MVP Scope)

- **In-memory only**: Notes are lost when server restarts
- **Single document**: All users edit the same shared note
- **No authentication**: Open to all connections
- **No user awareness**: Can't see other users' cursors
- **Basic editor**: Plain textarea (no rich text)

## Future Enhancements

- Multiple documents with URL routing
- Persistence (database or file storage)
- User authentication
- Cursor position awareness (see other users typing)
- Rich text editing (CodeMirror/Monaco integration)
- Document history/versioning
- Export functionality

## Troubleshooting

**Connection issues:**
- Ensure backend is running on port 1234
- Check browser console for WebSocket errors
- Verify firewall isn't blocking WebSocket connections

**Changes not syncing:**
- Check connection status indicator
- Refresh the page
- Restart backend server

**Port already in use:**
- Change port in `backend/src/server.ts` and `frontend/src/composables/useYjs.ts`

## License

MIT
