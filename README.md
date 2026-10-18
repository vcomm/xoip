# @vcomm/xoip-call ⚡

> **Production-ready, modular WebRTC Custom Element (`<xoip-call>`)** with Perfect Negotiation, Multi-Camera support, Screen Sharing, hardware-accelerated End-to-End Encryption (E2EE), and swappable signaling adapters (Firebase Firestore, WebSocket, and decentralized Nostr P2P).

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](#features)
[![Zero Dependencies Core](https://img.shields.io/badge/Dependencies-Zero%20Core-green.svg)](#features)

---

## 🌐 Live Demo & Local Development

- **Live Demo (GitHub Pages):** [https://vcomm.github.io/xoip/](https://vcomm.github.io/xoip/)

```bash
# 1. Install dependencies
npm install

# 2. Run local dev server
npm run dev

# 3. Build & Deploy to GitHub Pages (dist only)
npm run deploy
```

---

## ✨ Features

- **🌐 Zero Dependencies Core:** The entire engine, media manager, data channel, E2EE, WebSocket, and Nostr P2P adapters run strictly on native Web Standards (`RTCPeerConnection`, `Web Crypto API`, `Web Workers`, `WebSocket`).
- **🤝 W3C Perfect Negotiation:** Completely eliminates offer/answer race conditions, glare, and collision errors through sequential rollback and trickle ICE queueing.
- **🔇 Zero-Renegotiation Mute:** Instantaneous audio and video mute/unmute via hardware track enabling without triggering costly SDP renegotiations.
- **📹 Multi-Camera & Screen Share:** Seamless camera switching (`switchCamera`), multi-camera simultaneous ingestion, and one-click screen sharing with automatic fallback to webcam.
- **🔒 Built-in E2EE:** Real-time WebRTC Insertable Streams encryption via a dedicated Web Worker using ECDH (P-256) key exchange and AES-GCM (128-bit) frame encryption.
- **🔌 Pluggable Signaling:**
  - **Firebase Firestore:** Plug-and-play cloud signaling (compat v8/v9/v10).
  - **Nostr P2P (NIP-04/NIP-44):** 100% serverless, censorship-resistant decentralized signaling over public Nostr relays.
  - **WebSocket:** High-speed real-time duplex signaling server adapter.
  ```javascript
    // server.js (Node.js + ws) Example
    import { WebSocketServer } from 'ws';
    import crypto from 'crypto';

    const wss = new WebSocketServer({ port: 8080 });
    const rooms = new Map(); // roomId -> Set<ws>

    wss.on('connection', (ws) => {
      let currentRoom = null;

      ws.on('message', (raw) => {
        try {
          const msg = JSON.parse(raw);

          if (msg.type === 'create-room') {
            currentRoom = crypto.randomUUID();
            rooms.set(currentRoom, new Set([ws]));
            ws.send(JSON.stringify({ type: 'room-created', roomId: currentRoom }));
          } 
          else if (msg.type === 'join-room') {
            currentRoom = msg.roomId;
            const room = rooms.get(currentRoom);
            if (room) {
              room.add(ws);
              ws.send(JSON.stringify({ type: 'room-joined' }));
            } else {
              ws.send(JSON.stringify({ type: 'error', message: 'Room not found' }));
            }
          } 
          else if (msg.type === 'signal') {
            // Пересылаем SDP/ICE всем остальным участникам комнаты
            const room = rooms.get(currentRoom);
            if (room) {
              const out = JSON.stringify({ type: 'signal', payload: msg.payload });
              room.forEach(client => {
                if (client !== ws && client.readyState === ws.OPEN) client.send(out);
              });
            }
          }
        } catch (err) {
          console.error('Invalid message', err);
        }
      });

      ws.on('close', () => {
        if (currentRoom && rooms.has(currentRoom)) {
          const room = rooms.get(currentRoom);
          room.delete(ws);
          if (room.size === 0) rooms.delete(currentRoom);
          else {
            room.forEach(c => c.send(JSON.stringify({ type: 'room-ended' })));
          }
        }
      });
    });

    console.log('Signaling server listening on ws://localhost:8080');
  ```
- **🎨 Deep Customization:** Custom CSS properties (`--xoip-*`), Shadow DOM `::part()` styling, and `<slot>` for external video players (e.g. `<recplay-pe>`).
- **📘 First-class TypeScript:** Complete definitions in `types/index.d.ts`.

---

## 📦 Installation

```bash
npm install @vcomm/xoip-call
```

Or use directly via CDN (no build step required):

```html
<script type="module" src="https://cdn.jsdelivr.net/npm/@vcomm/xoip-call/dist/index.js"></script>
```

---

## 🚀 Quick Start

### 1. Plain HTML

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>XOIP Call</title>
  <script type="module" src="node_modules/@vcomm/xoip-call/dist/index.js"></script>
</head>
<body>

  <!-- Minimal usage with WebSocket signaling -->
  <xoip-call
    signaling-type="websocket"
    signaling-config='{ "url": "wss://your-signaling-server.com" }'
  ></xoip-call>

</body>
</html>
```

---

### 2. React / Next.js

```tsx
import React, { useEffect, useRef } from 'react';
import '@vcomm/xoip-call';
import type { XoipCallElement } from '@vcomm/xoip-call';

export const VideoChat: React.FC = () => {
  const xoipRef = useRef<XoipCallElement>(null);

  useEffect(() => {
    const el = xoipRef.current;
    if (!el) return;

    const handleRoomJoined = (e: CustomEvent<{ roomId: string }>) => {
      console.log('Joined room:', e.detail.roomId);
    };

    el.addEventListener('room-joined', handleRoomJoined as EventListener);
    return () => el.removeEventListener('room-joined', handleRoomJoined as EventListener);
  }, []);

  return (
    <xoip-call
      ref={xoipRef}
      signaling-type="firebase"
      signaling-config={JSON.stringify({
        apiKey: "YOUR_API_KEY",
        authDomain: "YOUR_PROJECT.firebaseapp.com",
        projectId: "YOUR_PROJECT_ID",
      })}
    />
  );
};
```

---

### 3. Vue 3

```vue
<template>
  <xoip-call
    ref="xoip"
    signaling-type="nostr"
    signaling-config='{ "relays": ["wss://relay.damus.io", "wss://relay.primal.net"] }'
    @room-created="onRoomCreated"
  />
</template>

<script setup>
import { ref } from 'vue';
import '@vcomm/xoip-call';

const xoip = ref(null);
const onRoomCreated = (e) => {
  console.log('Room created with Nostr pubkey:', e.detail.roomId);
};
</script>
```

---

## ⚙️ HTML Attributes

| Attribute | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `signaling-type` | `"firebase" \| "websocket" \| "nostr"` | `"firebase"` | Built-in signaling adapter type |
| `signaling-config` | JSON string | `"{}"` | Configuration passed to adapter (URL, credentials, relays) |
| `signaling-token` | Base64 Gzip string | `""` | Compressed/masked credentials token (eliminates raw API keys from HTML) |
| `ice-servers` | JSON string array | Google STUN | Custom STUN/TURN servers list |
| `custom-remote-video`| CSS Selector | `null` | Query selector for external player (e.g. `"#myPlayer"`) |
| `multi-camera` | boolean flag | `false` | Ingest all connected cameras simultaneously |
| `e2ee-enabled` | boolean flag | `false` | Enable hardware-accelerated Insertable Streams E2EE |
| `audio-only` | boolean flag | `false` | Start call in audio-only mode (shows avatar + VAD wave) |
| `vad-threshold` | number (0-255) | `15` | Voice Activity Detection sensitivity threshold |
| `headless` | boolean flag | `false` | Hide UI for custom headless programmatic control |

---

## 🛠️ Programmatic API

```typescript
const el = document.querySelector('xoip-call');

// Room management
const roomId = await el.createRoom();      // Create room (caller / impolite peer)
await el.joinRoom('room-id-123');           // Join existing room (callee / polite peer)
await el.leaveRoom();                       // End call and hang up

// Config Masking & Tokenization (protect keys from repos)
import { compressConfig, decompressConfig } from '@vcomm/xoip-call';
const token = await compressConfig({ apiKey: "AIza...", projectId: "my-app", ... });
el.setAttribute('signaling-token', token);

// Media & Device controls
el.setAudioMute(true);                      // Mute microphone (instant, 0ms)
el.setVideoMute(true);                      // Turn off camera
await el.startScreenShare();                // Start screen sharing
await el.stopScreenShare();                 // Revert back to webcam
await el.switchCamera('device-id-xyz');     // Switch camera source
const devices = await el.getDevices();      // Enumerate cameras, microphones, speakers

// Advanced Features
await el.enterPiP();                        // Picture-in-Picture mode
await el.exitPiP();                         // Exit Picture-in-Picture
el.setAudioOnlyMode(true);                  // Toggle audio-only mode

// DataChannel & Metrics
el.sendData({ text: 'Hello!' });            // Send arbitrary JSON over DataChannel
const stats = await el.getStats();          // Get full WebRTC RTCStatsReport

// Custom Signaling Adapter Injection
import { WebSocketSignalingAdapter } from '@vcomm/xoip-call/signaling/websocket';
el.signalingAdapter = new WebSocketSignalingAdapter('wss://signal.example.com');
```

---

## 📡 Custom Events

`<xoip-call>` dispatches bubbling Custom Events through the DOM:

| Event Name | `detail` Payload | Description |
| :--- | :--- | :--- |
| `room-created` | `{ roomId: string }` | Room created by caller |
| `room-joined` | `{ roomId: string }` | Callee successfully joined room |
| `call-ended` | `{ reason: string }` | Call ended locally or by remote peer |
| `remote-stream-ready` | `{ stream: MediaStream, track: MediaStreamTrack }` | Remote video or audio track attached |
| `channel-message` | `{ data: any }` | Inbound message received via DataChannel |
| `network-quality` | `{ quality, rtt, packetLoss }` | Real-time network telemetry update |
| `speaking-start` | `{ source: 'local' \| 'remote' }` | Voice activity detected (VAD) |
| `speaking-stop` | `{ source: 'local' \| 'remote' }` | Voice activity ceased |
| `screen-share-started`| `{}` | Screen share began |
| `screen-share-stopped`| `{}` | Screen share ended |
| `error` | `{ code: string, message: string, error }` | Any runtime engine/media/signaling error |

---

## 🎨 Styling: CSS Variables & Shadow Parts

### CSS Custom Properties

```css
xoip-call {
  --xoip-bg:          #0b0f19;
  --xoip-surface:     #111827;
  --xoip-surface-2:   #1f2937;
  --xoip-primary:     #3b82f6;
  --xoip-primary-h:   #2563eb;
  --xoip-danger:      #ef4444;
  --xoip-radius:      16px;
  --xoip-radius-sm:   10px;
}
```

### Shadow Parts

Target specific internal elements cleanly from outside:

```css
xoip-call::part(controls-bar) {
  background: rgba(15, 23, 42, 0.85);
  backdrop-filter: blur(12px);
}

xoip-call::part(btn-hangup) {
  border-radius: 50%;
  transform: scale(1.1);
}
```

Available parts: `welcome-screen`, `call-container`, `video-main`, `controls-bar`, `btn-audio`, `btn-video`, `btn-screen`, `btn-cameras`, `btn-devices`, `btn-pip`, `btn-audiomode`, `btn-share`, `btn-qr`, `btn-hangup`, `quality-bar`, `audio-avatar`, `speaking-badge`, `device-panel`, `qr-modal`, `remote-thumbnails`.

---

## 📄 License

[MIT](LICENSE) © VCOMM Team
