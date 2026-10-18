const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./firebase-adapter-DS4Sw5R9.js","./signaling-interface-Bi08jIxW.js","./p2p-adapter-DTUzgtcg.js","./websocket-adapter-B2lcr0zo.js"])))=>i.map(i=>d[i]);
(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))n(i);new MutationObserver(i=>{for(const a of i)if(a.type==="childList")for(const r of a.addedNodes)r.tagName==="LINK"&&r.rel==="modulepreload"&&n(r)}).observe(document,{childList:!0,subtree:!0});function t(i){const a={};return i.integrity&&(a.integrity=i.integrity),i.referrerPolicy&&(a.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?a.credentials="include":i.crossOrigin==="anonymous"?a.credentials="omit":a.credentials="same-origin",a}function n(i){if(i.ep)return;i.ep=!0;const a=t(i);fetch(i.href,a)}})();const ue=[{urls:["stun:stun1.l.google.com:19302","stun:stun2.l.google.com:19302"]}];class ge{constructor(e={}){this.polite=e.polite??!0,this._iceServers=e.iceServers??ue,this._onSignal=e.onSignal??(()=>{}),this._onRemoteTrack=e.onRemoteTrack??(()=>{}),this._onDataMessage=e.onDataMessage??(()=>{}),this._onConnectionState=e.onConnectionState??(()=>{}),this._onError=e.onError??(t=>console.error("[WebRTCEngine]",t)),this.pc=null,this.dataChannel=null,this._makingOffer=!1,this._ignoreOffer=!1,this._isSettingRemoteAnswerPending=!1,this._pendingCandidates=[],this._iceRestartCount=0,this._iceRestartTimer=null}init(){return this.pc&&this.close(),this.pc=new RTCPeerConnection({iceServers:this._iceServers,iceCandidatePoolSize:10}),this._pendingCandidates=[],this._setupPerfectNegotiation(),this._setupConnectionMonitor(),this.pc}close(){var e,t;clearInterval(this._iceRestartTimer),(e=this.dataChannel)==null||e.close(),(t=this.pc)==null||t.close(),this.pc=null,this.dataChannel=null,this._makingOffer=!1,this._ignoreOffer=!1,this._isSettingRemoteAnswerPending=!1,this._pendingCandidates=[],this._iceRestartCount=0}addAudioTrack(e,t){return t?this.pc.addTrack(e,t):this.pc.addTrack(e)}addVideoTrack(e,t){return t?this.pc.addTrack(e,t):this.pc.addTrack(e)}async replaceTrack(e,t){var n;const i=(n=this.pc)==null?void 0:n.getSenders().find(a=>{var r;return((r=a.track)==null?void 0:r.kind)===e});i?await i.replaceTrack(t):console.warn(`[WebRTCEngine] No ${e} sender found.`)}setTransceiverDirection(e,t){var n;const i=(n=this.pc)==null?void 0:n.getTransceivers().find(a=>{var r,s;return((s=(r=a.sender)==null?void 0:r.track)==null?void 0:s.kind)===e});i&&(i.direction=t)}async handleSignal(e){try{e.type==="offer"||e.type==="answer"?await this._handleDescription(e.payload):e.type==="ice-candidate"&&await this._handleIceCandidate(e.payload)}catch(t){this._onError(t)}}setupDataChannel(){if(this.dataChannel||!this.pc)return;const e=this.pc;this.polite?e.ondatachannel=({channel:t})=>{this.dataChannel=t,this._bindDataChannel(t)}:(this.dataChannel=e.createDataChannel("p2p-control",{ordered:!0}),this._bindDataChannel(this.dataChannel))}sendData(e){var t;this.dataChannel||this.setupDataChannel();const n=typeof e=="string"?e:JSON.stringify(e);((t=this.dataChannel)==null?void 0:t.readyState)==="open"?this.dataChannel.send(n):console.warn("[WebRTCEngine] DataChannel not open. Message dropped.")}_setupPerfectNegotiation(){const e=this.pc;e.onnegotiationneeded=async()=>{if(!this.polite||e.remoteDescription)try{this._makingOffer=!0,await e.setLocalDescription(),this._onSignal({type:e.localDescription.type,payload:{type:e.localDescription.type,sdp:e.localDescription.sdp}})}catch(t){this._onError(t)}finally{this._makingOffer=!1}},e.onicecandidate=({candidate:t})=>{t&&this._onSignal({type:"ice-candidate",payload:t.toJSON()})},e.ontrack=t=>{this._onRemoteTrack(t)}}async _handleDescription(e){const t=this.pc;if(!t||!e||!e.type)return void console.warn("[WebRTCEngine] _handleDescription: invalid or missing description/type:",e);const n=!this._makingOffer&&(t.signalingState==="stable"||this._isSettingRemoteAnswerPending),i=e.type==="offer"&&!n;if(this._ignoreOffer=!this.polite&&i,!this._ignoreOffer)if(e.type!=="answer"||t.signalingState==="have-local-offer"){if(i){if(t.signalingState!=="have-local-offer")return void console.warn("[WebRTCEngine] Ignoring colliding offer in state:",t.signalingState);await t.setLocalDescription({type:"rollback"})}this._isSettingRemoteAnswerPending=e.type==="answer";try{await t.setRemoteDescription(new RTCSessionDescription(e))}catch(a){if(this._isSettingRemoteAnswerPending=!1,a instanceof DOMException&&a.name==="InvalidStateError")return void console.warn("[WebRTCEngine] setRemoteDescription ignored (stale):",a.message);throw a}this._isSettingRemoteAnswerPending=!1,await this._flushPendingCandidates(),e.type==="offer"&&(await t.setLocalDescription(),this._onSignal({type:"answer",payload:{type:t.localDescription.type,sdp:t.localDescription.sdp}}))}else console.warn("[WebRTCEngine] Ignoring stale answer in state:",t.signalingState)}async _handleIceCandidate(e){if(e&&e.candidate)if(this.pc&&this.pc.remoteDescription&&this.pc.remoteDescription.type)try{await this.pc.addIceCandidate(new RTCIceCandidate(e))}catch(t){this._ignoreOffer||console.warn("[WebRTCEngine] addIceCandidate warning:",t)}else this._pendingCandidates.push(e)}async _flushPendingCandidates(){if(!this.pc||!this.pc.remoteDescription||!this.pc.remoteDescription.type)return;const e=[...this._pendingCandidates];this._pendingCandidates=[];for(const t of e)try{await this.pc.addIceCandidate(new RTCIceCandidate(t))}catch(n){this._ignoreOffer||console.warn("[WebRTCEngine] Flush addIceCandidate warning:",n)}}_bindDataChannel(e){e.onopen=()=>console.log("[WebRTCEngine] DataChannel open."),e.onclose=()=>console.log("[WebRTCEngine] DataChannel closed."),e.onmessage=({data:t})=>{try{this._onDataMessage(JSON.parse(t))}catch{this._onDataMessage(t)}}}_setupConnectionMonitor(){const e=this.pc;e.onconnectionstatechange=()=>{const t=e.connectionState;if(console.log(`[WebRTCEngine] Connection state: ${t}`),this._onConnectionState(t),(t==="failed"||t==="disconnected")&&this._iceRestartCount<3){if(this._iceRestartTimer)return;this._iceRestartTimer=setTimeout(()=>{this._iceRestartTimer=null,e.connectionState!=="connected"&&(this._iceRestartCount++,console.warn(`[WebRTCEngine] ICE restart #${this._iceRestartCount}...`),e.restartIce())},2e3)}t==="connected"&&(this._iceRestartCount=0,this._iceRestartTimer&&(clearTimeout(this._iceRestartTimer),this._iceRestartTimer=null))}}}class me{constructor(e={}){this._multiCamera=e.multiCamera??!1,this._videoConstraints=e.videoConstraints??{width:{min:640,ideal:1280,max:1920},height:{min:360,ideal:720,max:1080},frameRate:{ideal:30}},this._audioConstraints=e.audioConstraints??{echoCancellation:!0,noiseSuppression:!0,autoGainControl:!0},this._onError=e.onError??(t=>console.error("[MediaManager]",t)),this.primaryStream=null,this.secondaryStreams=[],this.screenStream=null,this._screenSharing=!1}async start(){await navigator.mediaDevices.getUserMedia({audio:!0,video:!0});const e=(await navigator.mediaDevices.getUserMedia({audio:this._audioConstraints,video:!1})).getAudioTracks()[0];let t=[];return this._multiCamera?t=await this._captureAllCameras():t=(await navigator.mediaDevices.getUserMedia({video:this._videoConstraints,audio:!1})).getVideoTracks(),this.primaryStream=new MediaStream([e,...t.length?[t[0]]:[]]),{audioTrack:e,videoTracks:t}}async _captureAllCameras(){const e=(await navigator.mediaDevices.enumerateDevices()).filter(i=>i.kind==="videoinput"),t=await Promise.allSettled(e.map(i=>navigator.mediaDevices.getUserMedia({video:{deviceId:{exact:i.deviceId},...this._videoConstraints},audio:!1}))),n=[];return t.forEach((i,a)=>{var r;i.status==="fulfilled"?(n.push(...i.value.getVideoTracks()),a>0&&this.secondaryStreams.push(i.value)):console.warn(`[MediaManager] Camera ${a} not captured:`,((r=i.reason)==null?void 0:r.name)??i.reason)}),n}async startScreenShare(e){this.screenStream=await navigator.mediaDevices.getDisplayMedia({video:{cursor:"always",displaySurface:"monitor",logicalSurface:!0,frameRate:{ideal:30}},audio:!0});const t=this.screenStream.getVideoTracks()[0];return this._screenSharing=!0,t.onended=async()=>{await this.stopScreenShare(e)},t}async stopScreenShare(e){var t,n;if(!this._screenSharing)return null;(t=this.screenStream)==null||t.getTracks().forEach(a=>a.stop()),this.screenStream=null,this._screenSharing=!1;const i=((n=this.primaryStream)==null?void 0:n.getVideoTracks()[0])??null;return e==null||e(i),i}get isScreenSharing(){return this._screenSharing}async switchCamera(e){var t;const n=(await navigator.mediaDevices.getUserMedia({video:{deviceId:{exact:e}},audio:!1})).getVideoTracks()[0];if((t=this.primaryStream)==null||t.getVideoTracks().forEach(i=>i.stop()),this.primaryStream){const i=this.primaryStream.getAudioTracks();this.primaryStream=new MediaStream([...i,n])}return n}async switchMicrophone(e){var t;const n=(await navigator.mediaDevices.getUserMedia({audio:{deviceId:{exact:e},...this._audioConstraints},video:!1})).getAudioTracks()[0];if((t=this.primaryStream)==null||t.getAudioTracks().forEach(i=>i.stop()),this.primaryStream){const i=this.primaryStream.getVideoTracks();this.primaryStream=new MediaStream([n,...i])}return n}setAudioMute(e){var t;(t=this.primaryStream)==null||t.getAudioTracks().forEach(n=>{n.enabled=!e})}setVideoMute(e){var t;(t=this.primaryStream)==null||t.getVideoTracks().forEach(n=>{n.enabled=!e}),this.secondaryStreams.forEach(n=>n.getVideoTracks().forEach(i=>{i.enabled=!e}))}async getDevices(){const e=await navigator.mediaDevices.enumerateDevices();return{cameras:e.filter(t=>t.kind==="videoinput"),microphones:e.filter(t=>t.kind==="audioinput"),speakers:e.filter(t=>t.kind==="audiooutput")}}stopAll(){[this.primaryStream,this.screenStream,...this.secondaryStreams].filter(Boolean).forEach(e=>e.getTracks().forEach(t=>t.stop())),this.primaryStream=null,this.screenStream=null,this.secondaryStreams=[],this._screenSharing=!1,console.log("[MediaManager] All media tracks stopped.")}}class ve{constructor(e,t={}){this._pc=e,this._intervalMs=t.intervalMs??3e3,this._onQuality=t.onQuality??(()=>{}),this._timer=null,this._prev={timestamp:0,bytesSent:0,bytesReceived:0,packetsSent:0,packetsLost:0}}start(){this._timer||(this._timer=setInterval(()=>this._collect(),this._intervalMs),console.log("[StatsMonitor] Started."))}stop(){clearInterval(this._timer),this._timer=null,console.log("[StatsMonitor] Stopped.")}async getFullReport(){return this._pc.getStats()}async _collect(){if(this._pc&&this._pc.connectionState==="connected")try{const e=await this._pc.getStats(),t=this._parseStats(e);this._onQuality(t)}catch(e){console.warn("[StatsMonitor] getStats() error:",e)}}_parseStats(e){let t=null,n=null,i=0,a=0,r="unknown";const s=Date.now(),l=(s-this._prev.timestamp)/1e3||1;let p=0,u=0,g=0,v=0;if(e.forEach(m=>{switch(m.type){case"candidate-pair":m.state==="succeeded"&&m.currentRoundTripTime!=null&&(t=Math.round(1e3*m.currentRoundTripTime)),m.localCandidateId&&(r=this._resolveConnectionType(e,m.localCandidateId));break;case"outbound-rtp":m.kind==="video"&&(p+=m.bytesSent??0,g+=m.packetsSent??0);break;case"remote-inbound-rtp":m.kind==="video"&&(v+=m.packetsLost??0);break;case"inbound-rtp":m.kind==="video"&&(u+=m.bytesReceived??0)}}),this._prev.timestamp>0){i=Math.round(8*(p-this._prev.bytesSent)/l/1e3),a=Math.round(8*(u-this._prev.bytesReceived)/l/1e3);const m=g-this._prev.packetsSent,d=v-this._prev.packetsLost;m>0&&(n=Math.min(100,Math.max(0,Math.round(d/m*100))))}return this._prev={timestamp:s,bytesSent:p,bytesReceived:u,packetsSent:g,packetsLost:v},{rtt:t,packetLoss:n,bitrateOut:i,bitrateIn:a,connectionType:r,quality:this._qualityLabel(t,n)}}_resolveConnectionType(e,t){const n=e.get(t);return n?n.candidateType==="relay"?"TURN":n.candidateType==="srflx"?"STUN":"P2P":"unknown"}_qualityLabel(e,t){return e==null||t==null?"unknown":e<100&&t<2?"excellent":e<200&&t<5?"good":e<400&&t<15?"poor":"bad"}}class ye{constructor(e={}){this._onSendPublicKey=e.onSendPublicKey??(()=>{}),this._onError=e.onError??(t=>console.error("[E2EEManager]",t)),this._keyPair=null,this._sharedKey=null,this._worker=null,this._pendingRemoteKey=null}async initialize(){this._keyPair=await crypto.subtle.generateKey({name:"ECDH",namedCurve:"P-256"},!0,["deriveKey"]);const e=await this._exportPublicKey();if(this._onSendPublicKey(e),console.log("[E2EEManager] Public key published via DataChannel."),this._pendingRemoteKey){const t=this._pendingRemoteKey;this._pendingRemoteKey=null,await this.receiveRemotePublicKey(t)}}async receiveRemotePublicKey(e){if(!this._keyPair)return console.warn("[E2EEManager] Remote key received before initialization — buffering."),void(this._pendingRemoteKey=e);try{const t=await this._importPublicKey(e);if(this._sharedKey=await crypto.subtle.deriveKey({name:"ECDH",public:t},this._keyPair.privateKey,{name:"AES-GCM",length:256},!0,["encrypt","decrypt"]),this._worker){const n=await crypto.subtle.exportKey("raw",this._sharedKey);this._worker.postMessage({type:"set-key",keyData:n},[n])}console.log("[E2EEManager] Shared AES-GCM key derived from ECDH exchange.")}catch(t){this._onError(t)}}async attachToPeerConnection(e,t){if(typeof RTCRtpScriptTransform<"u"){if(this._worker=new Worker(t,{type:"module"}),e.getSenders().forEach(n=>{n.track&&(n.transform=new RTCRtpScriptTransform(this._worker,{operation:"encrypt",kind:n.track.kind}))}),e.getReceivers().forEach(n=>{n.track&&(n.transform=new RTCRtpScriptTransform(this._worker,{operation:"decrypt",kind:n.track.kind}))}),e.addEventListener("track",n=>{const i=n.receiver;i&&!i.transform&&this._worker&&(i.transform=new RTCRtpScriptTransform(this._worker,{operation:"decrypt",kind:n.track.kind}))}),this._sharedKey){const n=await crypto.subtle.exportKey("raw",this._sharedKey);this._worker.postMessage({type:"set-key",keyData:n},[n])}console.log("[E2EEManager] RTCRtpScriptTransform attached.")}else console.warn("[E2EEManager] RTCRtpScriptTransform not supported. E2EE disabled.")}terminate(){var e;(e=this._worker)==null||e.terminate(),this._worker=null,this._sharedKey=null,this._keyPair=null}async _exportPublicKey(){const e=await crypto.subtle.exportKey("raw",this._keyPair.publicKey);return btoa(String.fromCharCode(...new Uint8Array(e)))}async _importPublicKey(e){const t=Uint8Array.from(atob(e),n=>n.charCodeAt(0)).buffer;return crypto.subtle.importKey("raw",t,{name:"ECDH",namedCurve:"P-256"},!0,[])}}const te=new Set(["firebase","nostr","custom"]);function fe(o){if(!o||typeof o!="string")throw new Error("[URI] Invalid URI: must be a non-empty string");if(!o.startsWith("xoip://"))throw new Error(`[URI] Invalid URI scheme: expected "xoip://", got "${o.slice(0,10)}"`);let e;try{e=new URL(o.replace(/^xoip:\/\//,"https://xoip.local/"))}catch{throw new Error(`[URI] Malformed URI: "${o.slice(0,50)}"`)}const t=e.pathname.split("/").filter(Boolean);if(t.length<3||t[0]!=="call")throw new Error("[URI] Invalid URI path: expected /call/<signalingType>/<TOKEN>");const n=t[1],i=t.slice(2).join("/");if(!te.has(n))throw new Error(`[URI] Unknown signalingType: "${n}". Expected: firebase | nostr | custom`);if(!i||!i.startsWith("XST1."))throw new Error('[URI] Invalid TOKEN: must start with "XST1."');const a=e.searchParams.get("room");if(!a)throw new Error("[URI] Missing required query parameter: room");const r=we(e.hash);if(!r)throw new Error("[URI] Missing required fragment: #key=<ROOM_KEY>");return{signalingType:n,token:i,roomId:a,roomKey:r}}function be({signalingType:o,token:e,roomId:t,roomKey:n}){if(!te.has(o))throw new Error(`[URI] Invalid signalingType: "${o}"`);if(!(e!=null&&e.startsWith("XST1.")))throw new Error('[URI] Invalid token: must start with "XST1."');if(!t)throw new Error("[URI] roomId is required");if(!n)throw new Error("[URI] roomKey is required");return`xoip://call/${o}/${e}?room=${encodeURIComponent(t)}#key=${encodeURIComponent(n)}`}function we(o){if(!o)return null;const e=o.startsWith("#")?o.slice(1):o;try{return new URLSearchParams(e).get("key")||null}catch{return null}}const ne={token:"xoip-v1-token",signal:"xoip-v1-signal"};function xe(){const o=new Uint8Array(32);return crypto.getRandomValues(o),oe(o)}async function ie(o){const e=j(o);return re(await crypto.subtle.importKey("raw",e,{name:"HKDF"},!1,["deriveKey"]),ne.token)}async function ae(o){const e=j(o);return re(await crypto.subtle.importKey("raw",e,{name:"HKDF"},!1,["deriveKey"]),ne.signal)}async function _e(o,e){const t=new Uint8Array(12);crypto.getRandomValues(t);const n=typeof e=="string"?new TextEncoder().encode(e):e,i=await crypto.subtle.encrypt({name:"AES-GCM",iv:t},o,n),a=new Uint8Array(t.length+i.byteLength);return a.set(t,0),a.set(new Uint8Array(i),t.length),a}async function Ce(o,e){const t=e.slice(0,12),n=e.slice(12),i=await crypto.subtle.decrypt({name:"AES-GCM",iv:t},o,n);return new Uint8Array(i)}function oe(o){return btoa(String.fromCharCode(...o)).replace(/\+/g,"-").replace(/\//g,"_").replace(/=/g,"")}function j(o){const e=o.replace(/-/g,"+").replace(/_/g,"/").padEnd(o.length+(4-o.length%4)%4,"=");return Uint8Array.from(atob(e),t=>t.charCodeAt(0))}async function re(o,e){return crypto.subtle.deriveKey({name:"HKDF",hash:"SHA-256",salt:new Uint8Array(32),info:new TextEncoder().encode(e)},o,{name:"AES-GCM",length:256},!1,["encrypt","decrypt"])}async function Ie({roomKeyBase64Url:o,type:e,roomId:t,config:n={},ttlSeconds:i=3600}){const a=Math.floor(Date.now()/1e3),r={v:1,type:e,room:t,config:n,iat:a,exp:a+i,jti:Se()},s=await ie(o),l=JSON.stringify(r),p=await _e(s,l);return`XST1.${oe(p)}`}async function ke({token:o,roomKeyBase64Url:e,expectedType:t,expectedRoomId:n}){if(!o||typeof o!="string")throw new Error("[Token] Invalid token format: must be a string");const i=o.split(".");if(i.length!==2||i[0]!=="XST1")throw new Error('[Token] Invalid token format: expected "XST1.<data>"');let a;try{a=j(i[1])}catch{throw new Error("[Token] Invalid token: failed to decode Base64URL envelope")}const r=await ie(e);let s,l;try{const p=await Ce(r,a);s=new TextDecoder().decode(p)}catch{throw new Error("[Token] Decryption failed: invalid roomKey or tampered token")}try{l=JSON.parse(s)}catch{throw new Error("[Token] Invalid token: payload is not valid JSON")}if(l.v!==1)throw new Error(`[Token] Unsupported token version: ${l.v}`);if(l.type!==t)throw new Error(`[Token] Type mismatch: token.type="${l.type}" vs URI.signalingType="${t}"`);if(l.room!==n)throw new Error(`[Token] Room mismatch: token.room="${l.room}" vs URI.roomId="${n}"`);if(Math.floor(Date.now()/1e3)>=l.exp)throw new Error(`[Token] Token expired at ${new Date(1e3*l.exp).toISOString()}`);return l}function Se(){const o=new Uint8Array(16);return crypto.getRandomValues(o),Array.from(o,e=>e.toString(16).padStart(2,"0")).join("")}const Ae="modulepreload",Re=function(o,e){return new URL(o,e).href},$={},E=function(e,t,n){let i=Promise.resolve();if(t&&t.length>0){let r=function(u){return Promise.all(u.map(g=>Promise.resolve(g).then(v=>({status:"fulfilled",value:v}),v=>({status:"rejected",reason:v}))))};const s=document.getElementsByTagName("link"),l=document.querySelector("meta[property=csp-nonce]"),p=(l==null?void 0:l.nonce)||(l==null?void 0:l.getAttribute("nonce"));i=r(t.map(u=>{if(u=Re(u,n),u in $)return;$[u]=!0;const g=u.endsWith(".css"),v=g?'[rel="stylesheet"]':"";if(!!n)for(let w=s.length-1;w>=0;w--){const C=s[w];if(C.href===u&&(!g||C.rel==="stylesheet"))return}else if(document.querySelector(`link[href="${u}"]${v}`))return;const d=document.createElement("link");if(d.rel=g?"stylesheet":Ae,g||(d.as="script"),d.crossOrigin="",d.href=u,p&&d.setAttribute("nonce",p),document.head.appendChild(d),g)return new Promise((w,C)=>{d.addEventListener("load",w),d.addEventListener("error",()=>C(new Error(`Unable to preload CSS for ${u}`)))})}))}function a(r){const s=new Event("vite:preloadError",{cancelable:!0});if(s.payload=r,window.dispatchEvent(s),!s.defaultPrevented)throw r}return i.then(r=>{for(const s of r||[])s.status==="rejected"&&a(s.reason);return e().catch(a)})};class z{static async create(e,t={},n={}){switch(e){case"firebase":{const{FirebaseSignalingAdapter:i}=await E(()=>import("./firebase-adapter-DS4Sw5R9.js"),__vite__mapDeps([0,1]),import.meta.url);let a=typeof window<"u"&&window.firebase?window.firebase:null;if(!a)try{const s=await E(()=>import("./xoip-call-yoD6TSFD.js"),[],import.meta.url);a=s.default??s,await E(()=>import("./xoip-call-DNqvg6tM.js"),[],import.meta.url)}catch{try{const l=await E(()=>import("./xoip-call-BPdA3TTP.js"),[],import.meta.url);a=l.default??l}catch{if(typeof window>"u"||!window.firebase)throw new Error("[SignalingFactory] Firebase is not installed or loaded. Add npm install firebase@8 or include Firebase scripts in HTML.");a=window.firebase}}a.apps&&a.apps.length||a.initializeApp(t);let r=n.cryptoKey??null;return!r&&n.roomKey&&(r=await ae(n.roomKey)),new i(a,{collection:t.collection??"calls",cryptoKey:r})}case"nostr":{const{NostrSignalingAdapter:i}=await E(()=>import("./p2p-adapter-DTUzgtcg.js"),__vite__mapDeps([2,1]),import.meta.url);return new i({relays:t.relays,privateKeyHex:t.privateKeyHex})}case"websocket":{const{WebSocketSignalingAdapter:i}=await E(()=>import("./websocket-adapter-B2lcr0zo.js"),__vite__mapDeps([3,1]),import.meta.url);return new i(t.url??t.wsUrl??"wss://localhost:8080")}case"custom":{const i=n.customAdapter;if(!i)throw new Error('[SignalingFactory] type="custom" requires options.customAdapter');return i}default:throw new Error(`[SignalingFactory] Unknown signalingType: "${e}". Supported: firebase | nostr | websocket | custom`)}}static isSupported(e){return["firebase","nostr","websocket","custom"].includes(e)}}const f={microphone:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
    <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
    <line x1="12" y1="19" x2="12" y2="23"/>
    <line x1="8" y1="23" x2="16" y2="23"/>
  </svg>`,microphoneOff:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <line x1="1" y1="1" x2="23" y2="23"/>
    <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"/>
    <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"/>
    <line x1="12" y1="19" x2="12" y2="23"/>
    <line x1="8" y1="23" x2="16" y2="23"/>
  </svg>`,video:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <polygon points="23 7 16 12 23 17 23 7"/>
    <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
  </svg>`,videoOff:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M16 16v1a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2m5.66 0H14a2 2 0 0 1 2 2v3.34l1 1L23 7v10"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>`,screenShare:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M13 3H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-3"/>
    <path d="M8 21h8"/>
    <path d="M12 17v4"/>
    <polyline points="17 8 21 8 21 4"/>
    <line x1="15" y1="9" x2="21" y2="3"/>
  </svg>`,screenShareStop:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M13 3H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-3"/>
    <path d="M8 21h8"/>
    <path d="M12 17v4"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>`,phoneOff:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07"/>
    <path d="M14.69 14.69A10 10 0 0 1 3.69 3.69"/>
    <line x1="23" y1="1" x2="1" y2="23"/>
  </svg>`,share:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="18" cy="5" r="3"/>
    <circle cx="6" cy="12" r="3"/>
    <circle cx="18" cy="19" r="3"/>
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
  </svg>`,list:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <line x1="8" y1="6" x2="21" y2="6"/>
    <line x1="8" y1="12" x2="21" y2="12"/>
    <line x1="8" y1="18" x2="21" y2="18"/>
    <line x1="3" y1="6" x2="3.01" y2="6"/>
    <line x1="3" y1="12" x2="3.01" y2="12"/>
    <line x1="3" y1="18" x2="3.01" y2="18"/>
  </svg>`,settings:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="12" cy="12" r="3"/>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
  </svg>`,pip:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <rect x="2" y="3" width="20" height="14" rx="2"/>
    <rect x="12" y="11" width="9" height="6" rx="1" fill="currentColor" stroke="none" opacity="0.4"/>
    <rect x="12" y="11" width="9" height="6" rx="1"/>
  </svg>`,headphones:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M3 18v-6a9 9 0 0 1 18 0v6"/>
    <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/>
  </svg>`,qrCode:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <rect x="3" y="3" width="7" height="7" rx="1"/>
    <rect x="14" y="3" width="7" height="7" rx="1"/>
    <rect x="3" y="14" width="7" height="7" rx="1"/>
    <rect x="5" y="5" width="3" height="3" fill="currentColor" stroke="none"/>
    <rect x="16" y="5" width="3" height="3" fill="currentColor" stroke="none"/>
    <rect x="5" y="16" width="3" height="3" fill="currentColor" stroke="none"/>
    <line x1="14" y1="14" x2="14" y2="14.01"/>
    <line x1="18" y1="14" x2="18" y2="14.01"/>
    <line x1="21" y1="14" x2="21" y2="14.01"/>
    <line x1="14" y1="17" x2="14" y2="17.01"/>
    <line x1="21" y1="17" x2="21" y2="17.01"/>
    <line x1="14" y1="21" x2="14" y2="21.01"/>
    <line x1="18" y1="18" x2="18" y2="21"/>
    <line x1="21" y1="21" x2="21" y2="21.01"/>
  </svg>`,close:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>`,user:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>`},De=()=>`
  <!-- Welcome Screen -->
  <div id="welcome-screen" part="welcome-screen">
    <div class="welcome-logo">⚡ XOIP</div>
    <div class="room-controls">
      <input
        type="text"
        id="room-id-input"
        placeholder="Room ID"
        readonly
        autocomplete="off"
        spellcheck="false"
        aria-label="Room ID"
      >
      <button id="btn-create" class="btn btn-primary" title="Create a new room">
        Create
      </button>
      <button id="btn-join" class="btn btn-secondary" title="Double-click Room ID field to join" disabled>
        Join
      </button>
    </div>
  </div>

  <!-- Call Container (hidden until call starts) -->
  <div id="call-container" part="call-container">
    <div id="video-room">

      <!-- Main Video Area -->
      <div id="main-video-area" class="main-video-area" part="video-main">

        <!-- Quality indicator (Network Health) -->
        <div id="quality-bar" title="Connection quality" part="quality-bar">
          <div class="quality-dot"></div>
          <span id="quality-label">—</span>
        </div>

        <!-- Vertical Audio Level Meter (Video mode active signal level) -->
        <div id="remote-level-meter" class="vertical-level-meter" part="level-meter" title="Audio level">
          <div class="meter-track">
            <div id="remote-level-fill" class="meter-fill"></div>
          </div>
        </div>

        <!-- Remote video (default, hidden when custom-remote-video used) -->
        <video id="remote-video" autoplay playsinline></video>

        <!-- Audio-only avatar overlay (shown when video is off or audio-only mode) -->
        <div id="audio-avatar" class="audio-avatar hidden" part="audio-avatar">
          <div class="avatar-glow">
            <div class="avatar-icon">${f.user}</div>
            <!-- Speaking ring — animates on VAD around avatar -->
            <div class="speaking-ring" id="speaking-ring-remote"></div>
          </div>
          <div class="avatar-label" id="audio-avatar-label">Audio call</div>
          <!-- Audio wave bars for visual activity feedback -->
          <div class="audio-wave" id="audio-wave-remote">
            <span></span><span></span><span></span><span></span><span></span>
          </div>
        </div>

        <!-- Slot for custom external player (e.g. <recplay-pe>) -->
        <slot></slot>

        <!-- Remote stream thumbnails (multi-stream switching) -->
        <div id="remote-thumbnails" part="remote-thumbnails"></div>

        <!-- PiP Self-View: floating local camera overlay inside main video -->
        <div id="pip-self-view" class="pip-self-view hidden" part="pip-self-view" title="Self View (drag to move)">
          <video id="pip-self-video" autoplay playsinline muted></video>
          <div class="pip-self-bar">
            <span class="pip-self-label">You</span>
            <button id="btn-pip-close" class="pip-close-btn" title="Close Self View" aria-label="Close self view">✕</button>
          </div>
          <!-- VAD border pulse overlay -->
          <div class="pip-vad-ring" id="pip-vad-ring"></div>
        </div>
      </div>

      <!-- Controls Bar -->
      <div class="controls-bar" part="controls-bar">
        <button id="btn-audio"     class="ctrl-btn" part="btn-audio"     title="Mute/Unmute Audio">
          ${f.microphone}
        </button>
        <button id="btn-video"     class="ctrl-btn" part="btn-video"     title="Enable/Disable Video">
          ${f.video}
        </button>
        <button id="btn-screen"    class="ctrl-btn" part="btn-screen"    title="Share Screen">
          ${f.screenShare}
        </button>
        <button id="btn-cameras"   class="ctrl-btn" part="btn-cameras"   title="Show/Hide Local Cameras">
          ${f.list}
        </button>
        <button id="btn-devices"   class="ctrl-btn" part="btn-devices"   title="Device Settings">
          ${f.settings}
        </button>
        <button id="btn-pip"       class="ctrl-btn" part="btn-pip"       title="Picture-in-Picture">
          ${f.pip}
        </button>
        <button id="btn-audiomode" class="ctrl-btn" part="btn-audiomode" title="Audio-Only Mode">
          ${f.headphones}
        </button>
        <button id="btn-share"     class="ctrl-btn" part="btn-share"     title="Copy Invite Link">
          ${f.share}
        </button>
        <button id="btn-qr"        class="ctrl-btn" part="btn-qr"        title="Show QR Code">
          ${f.qrCode}
        </button>
        <button id="btn-hangup"    class="ctrl-btn" part="btn-hangup"    title="Leave Room">
          ${f.phoneOff}
        </button>
      </div>

      <!-- Local camera panel (sidebar, hidden by default) -->
      <div id="local-cameras" class="hidden" part="local-cameras"></div>
    </div>
  </div>

  <!-- ─── Device Selector Panel ─────────────────────────────── -->
  <div id="device-panel" class="device-panel hidden" part="device-panel" role="dialog" aria-label="Device Settings">
    <div class="panel-header">
      <span class="panel-title">${f.settings} Device Settings</span>
      <button id="btn-close-devices" class="icon-btn" title="Close" aria-label="Close device settings">
        ${f.close}
      </button>
    </div>
    <div class="panel-body">
      <label class="device-label" for="select-camera">Camera</label>
      <select id="select-camera" class="device-select" aria-label="Select camera"></select>

      <label class="device-label" for="select-mic">Microphone</label>
      <select id="select-mic" class="device-select" aria-label="Select microphone"></select>

      <label class="device-label" for="select-speaker">Speaker</label>
      <select id="select-speaker" class="device-select" aria-label="Select speaker"></select>

      <!-- Mic level visualizer -->
      <label class="device-label">Mic Level</label>
      <div class="mic-level-bar" id="mic-level-bar" aria-hidden="true">
        <div class="mic-level-fill" id="mic-level-fill"></div>
      </div>

      <button id="btn-apply-devices" class="btn btn-primary" style="margin-top:12px;width:100%">
        Apply
      </button>
    </div>
  </div>

  <!-- ─── QR Code Modal ─────────────────────────────────────── -->
  <div id="qr-modal" class="modal-overlay hidden" part="qr-modal" role="dialog" aria-label="QR Code" aria-modal="true">
    <div class="modal-card">
      <div class="modal-header">
        <span class="panel-title">${f.qrCode} QR Code — Instant Join</span>
        <button id="btn-close-qr" class="icon-btn" title="Close" aria-label="Close QR modal">
          ${f.close}
        </button>
      </div>
      <p class="modal-hint">Scan to join this call instantly</p>
      <!-- QR canvas is inserted here programmatically -->
      <div id="qr-container" class="qr-container"></div>
      <div class="qr-url" id="qr-url"></div>
      <button id="btn-copy-qr-url" class="btn btn-secondary" style="width:100%;margin-top:8px">Copy link</button>
    </div>
  </div>

  <!-- Tooltip -->
  <div class="tooltip" id="tooltip" role="tooltip" aria-live="polite"></div>
`,Le=()=>`
  /* ─── Design Tokens ──────────────────────────────────────── */
  :host {
    --xoip-font-family: 'Inter', system-ui, -apple-system, sans-serif;
    --xoip-bg:          #0f172a;
    --xoip-surface:     #1e293b;
    --xoip-surface-2:   #334155;
    --xoip-primary:     #3b82f6;
    --xoip-primary-h:   #60a5fa;
    --xoip-danger:      #ef4444;
    --xoip-success:     #10b981;
    --xoip-warning:     #f59e0b;
    --xoip-text:        #f8fafc;
    --xoip-text-muted:  #94a3b8;
    --xoip-radius:      12px;
    --xoip-radius-sm:   8px;
    --xoip-controls-height: 68px;
    --xoip-transition:  0.25s ease;
    --xoip-shadow:      0 8px 32px rgba(0,0,0,0.45);

    /* Host layout */
    display: flex;
    flex-direction: column;
    font-family: var(--xoip-font-family);
    background: var(--xoip-bg);
    color: var(--xoip-text);
    border-radius: var(--xoip-radius);
    overflow: hidden;
    width: 100%;
    max-width: 960px;
    margin: auto;
    box-shadow: var(--xoip-shadow);
    position: relative;
  }

  :host([headless]) {
    display: none !important;
  }

  /* ─── Welcome Screen ─────────────────────────────────────── */
  #welcome-screen {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 24px;
    padding: 48px 32px;
    min-height: 320px;
    background: linear-gradient(135deg, var(--xoip-surface) 0%, var(--xoip-bg) 100%);
  }

  .welcome-logo {
    font-size: 42px;
    font-weight: 800;
    background: linear-gradient(135deg, var(--xoip-primary), var(--xoip-primary-h));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    letter-spacing: -1px;
    user-select: none;
  }

  .room-controls {
    display: flex;
    gap: 10px;
    width: 100%;
    max-width: 480px;
  }

  #room-id-input {
    flex: 1;
    padding: 12px 16px;
    border: 2px solid var(--xoip-surface-2);
    border-radius: var(--xoip-radius-sm);
    background: var(--xoip-surface);
    color: var(--xoip-text);
    font-size: 15px;
    font-family: var(--xoip-font-family);
    transition: border-color var(--xoip-transition);
    outline: none;
    cursor: default;
  }
  #room-id-input:focus,
  #room-id-input:not([readonly]) {
    border-color: var(--xoip-primary);
    cursor: text;
  }
  #room-id-input.error { border-color: var(--xoip-danger); }

  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 12px 20px;
    border: none;
    border-radius: var(--xoip-radius-sm);
    font-size: 14px;
    font-weight: 600;
    font-family: var(--xoip-font-family);
    cursor: pointer;
    transition: all var(--xoip-transition);
    white-space: nowrap;
  }
  .btn-primary  { background: var(--xoip-primary); color: #fff; }
  .btn-primary:hover { background: var(--xoip-primary-h); transform: translateY(-1px); box-shadow: 0 4px 16px rgba(59,130,246,0.4); }
  .btn-secondary { background: var(--xoip-surface-2); color: var(--xoip-text); }
  .btn-secondary:hover { background: #475569; }
  .btn-danger   { background: var(--xoip-danger); color: #fff; }
  .btn-danger:hover { background: #f87171; transform: scale(1.05); }
  .btn:disabled { opacity: 0.4; cursor: not-allowed; transform: none !important; box-shadow: none !important; }

  /* ─── Call Container ─────────────────────────────────────── */
  #call-container {
    display: none;
    flex-direction: column;
    flex: 1;
    position: relative;
    min-height: 420px;
    width: 100%;
  }
  #call-container.active { display: flex; }

  /* ─── Video Room ─────────────────────────────────────────── */
  #video-room {
    display: flex;
    flex-direction: column;
    flex: 1;
    position: relative;
    width: 100%;
    overflow: hidden;
  }

  /* Main video area */
  .main-video-area {
    position: relative;
    width: 100%;
    flex: 1;
    background: #000;
    min-height: 320px;
    overflow: hidden;
    box-sizing: border-box;
    border: 3px solid transparent;
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  /* Active speaker border around video area */
  .main-video-area.speaking {
    border-color: var(--xoip-success);
    box-shadow: inset 0 0 0 1px var(--xoip-success), 0 0 24px rgba(16, 185, 129, 0.45);
  }

  #remote-video {
    width: 100%;
    height: 100%;
    object-fit: contain;
    display: block;
  }

  /* ─── Vertical Audio Level Meter (Video Mode) ────────────── */
  .vertical-level-meter {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    right: 14px;
    width: 8px;
    height: 120px;
    background: rgba(15, 23, 42, 0.7);
    backdrop-filter: blur(8px);
    border: 1px solid rgba(255, 255, 255, 0.18);
    border-radius: 8px;
    padding: 2px;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    z-index: 5;
    opacity: 0;
    transition: opacity 0.25s ease, transform 0.25s ease;
    pointer-events: none;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.35);
  }
  .vertical-level-meter.active,
  .main-video-area:hover .vertical-level-meter {
    opacity: 1;
  }
  .meter-track {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: flex-end;
    border-radius: 5px;
    overflow: hidden;
    background: rgba(255, 255, 255, 0.08);
  }
  .meter-fill {
    width: 100%;
    height: 0%;
    background: linear-gradient(to top, #10b981 0%, #34d399 55%, #f59e0b 80%, #ef4444 100%);
    border-radius: 4px;
    transition: height 0.06s cubic-bezier(0, 0, 0.2, 1);
    box-shadow: 0 0 8px rgba(16, 185, 129, 0.6);
  }

  /* ─── Audio Avatar (audio-only mode / video-off overlay) ── */
  .audio-avatar {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 16px;
    background: radial-gradient(ellipse at center, #1e293b 0%, #0f172a 70%);
    z-index: 2;
    transition: opacity 0.3s ease;
  }
  .audio-avatar.hidden { display: none; }

  .avatar-glow {
    position: relative;
    width: 110px;
    height: 110px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .avatar-icon {
    width: 84px;
    height: 84px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--xoip-surface-2), var(--xoip-surface));
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--xoip-text-muted);
    border: 3px solid rgba(255, 255, 255, 0.12);
    position: relative;
    z-index: 1;
    transition: border-color 0.25s ease, box-shadow 0.25s ease, transform 0.25s ease, color 0.25s ease;
  }
  .avatar-icon svg { width: 40px; height: 40px; }

  /* Speaking border around avatar in audio-only mode */
  .audio-avatar.speaking .avatar-icon {
    border-color: var(--xoip-success);
    color: var(--xoip-success);
    box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.25), 0 0 28px rgba(16, 185, 129, 0.55);
    transform: scale(1.06);
  }

  .avatar-label {
    font-size: 14px;
    color: var(--xoip-text-muted);
    font-weight: 500;
    letter-spacing: 0.3px;
  }

  /* ─── Audio Wave (VAD visualization for audio-only) ──────── */
  .audio-wave {
    display: flex;
    align-items: flex-end;
    gap: 3px;
    height: 24px;
    opacity: 0;
    transition: opacity 0.3s;
  }
  .audio-wave.active { opacity: 1; }
  .audio-wave span {
    display: block;
    width: 3px;
    min-height: 4px;
    background: var(--xoip-primary);
    border-radius: 2px;
    animation: wave-bar 1s ease-in-out infinite;
  }
  .audio-wave span:nth-child(1) { animation-delay: 0s;    height: 8px; }
  .audio-wave span:nth-child(2) { animation-delay: 0.15s; height: 14px; }
  .audio-wave span:nth-child(3) { animation-delay: 0.3s;  height: 20px; }
  .audio-wave span:nth-child(4) { animation-delay: 0.15s; height: 14px; }
  .audio-wave span:nth-child(5) { animation-delay: 0s;    height: 8px; }
  @keyframes wave-bar {
    0%, 100% { transform: scaleY(0.4); opacity: 0.6; }
    50%       { transform: scaleY(1);   opacity: 1; }
  }

  /* ─── Speaking Ring (VAD pulsating border around avatar) ─── */
  .speaking-ring {
    position: absolute;
    inset: 4px;
    border-radius: 50%;
    border: 3px solid var(--xoip-success);
    opacity: 0;
    transform: scale(0.9);
    transition: opacity 0.2s ease, transform 0.2s ease;
    pointer-events: none;
  }
  .speaking-ring.active {
    opacity: 1;
    transform: scale(1.08);
    animation: pulse-ring 1s ease-in-out infinite alternate;
  }
  @keyframes pulse-ring {
    from { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.6); }
    to   { box-shadow: 0 0 0 14px rgba(16, 185, 129, 0); }
  }

  /* ─── Thumbnails ─────────────────────────────────────────── */
  #remote-thumbnails {
    position: absolute;
    top: 10px;
    left: 10px;
    right: 10px;
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    background: rgba(0,0,0,0.45);
    backdrop-filter: blur(8px);
    border-radius: var(--xoip-radius-sm);
    padding: 0;
    max-height: 0;
    opacity: 0;
    overflow: hidden;
    pointer-events: none;
    transition: max-height 0.35s ease, opacity 0.2s ease, padding 0.2s ease;
    z-index: 3;
  }

  #video-room:hover #remote-thumbnails,
  #video-room:focus-within #remote-thumbnails {
    max-height: 140px;
    opacity: 1;
    pointer-events: auto;
    padding: 8px;
  }

  @media (hover: none) {
    #remote-thumbnails {
      max-height: 120px;
      opacity: 1;
      pointer-events: auto;
      padding: 8px;
    }
  }

  #remote-thumbnails video {
    height: 90px;
    border-radius: 6px;
    background: #111;
    border: 2px solid transparent;
    cursor: pointer;
    transition: border-color 0.2s, transform 0.2s;
  }
  #remote-thumbnails video:hover {
    border-color: var(--xoip-primary);
    transform: scale(1.04);
  }

  /* Local camera sidebar */
  #local-cameras {
    position: absolute;
    right: 10px;
    top: 10px;
    bottom: calc(var(--xoip-controls-height) + 10px);
    width: 160px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    overflow-y: auto;
    z-index: 4;
    background: rgba(0,0,0,0.35);
    backdrop-filter: blur(6px);
    border-radius: var(--xoip-radius-sm);
    padding: 6px;
    border: 1px solid rgba(255,255,255,0.08);
    transition: transform 0.3s ease, opacity 0.3s ease, border-color 0.2s ease, box-shadow 0.2s ease;
  }
  #local-cameras.speaking {
    border-color: rgba(16, 185, 129, 0.6);
    box-shadow: 0 0 16px rgba(16, 185, 129, 0.35);
  }
  #local-cameras.hidden {
    transform: translateX(calc(100% + 30px));
    opacity: 0;
    pointer-events: none;
    visibility: hidden;
  }
  #local-cameras video {
    width: 100%;
    border-radius: 6px;
    background: #111;
    position: relative;
    border: 2px solid transparent;
    box-sizing: border-box;
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
  }
  #local-cameras.speaking video {
    border-color: var(--xoip-success);
    box-shadow: 0 0 10px rgba(16, 185, 129, 0.4);
  }


  /* ─── PiP Self-View (floating local camera inside main video) ── */
  .pip-self-view {
    position: absolute;
    bottom: 16px;
    left: 16px;
    width: 160px;
    aspect-ratio: 16 / 9;
    border-radius: 12px;
    overflow: hidden;
    z-index: 8;
    cursor: grab;
    box-shadow: 0 8px 28px rgba(0,0,0,0.6), 0 0 0 2px rgba(255,255,255,0.12);
    background: #000;
    transition: opacity 0.3s ease, transform 0.3s ease, box-shadow 0.25s ease;
    user-select: none;
  }
  .pip-self-view:active { cursor: grabbing; }
  .pip-self-view.hidden {
    opacity: 0;
    pointer-events: none;
    transform: scale(0.85) translateY(20px);
  }
  .pip-self-view video {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    transform: scaleX(-1); /* mirror effect */
  }

  /* Label bar (shows on hover) */
  .pip-self-bar {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 4px 8px;
    background: linear-gradient(to top, rgba(0,0,0,0.7), transparent);
    opacity: 0;
    transition: opacity 0.2s ease;
    pointer-events: none;
  }
  .pip-self-view:hover .pip-self-bar { opacity: 1; }
  .pip-self-bar .pip-close-btn { pointer-events: auto; }

  .pip-self-label {
    font-size: 11px;
    font-weight: 600;
    color: rgba(255,255,255,0.9);
    letter-spacing: 0.4px;
    text-transform: uppercase;
  }

  .pip-close-btn {
    width: 20px; height: 20px;
    border: none;
    background: rgba(255,255,255,0.18);
    color: #fff;
    border-radius: 50%;
    font-size: 10px;
    line-height: 1;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.2s;
    padding: 0;
  }
  .pip-close-btn:hover { background: var(--xoip-danger); }

  /* VAD glow ring around self-view when speaking */
  .pip-vad-ring {
    position: absolute;
    inset: 0;
    border-radius: 12px;
    border: 3px solid transparent;
    pointer-events: none;
    transition: border-color 0.15s ease, box-shadow 0.15s ease;
  }
  .pip-self-view.speaking .pip-vad-ring {
    border-color: var(--xoip-success);
    box-shadow: inset 0 0 0 1px var(--xoip-success), 0 0 18px rgba(16, 185, 129, 0.55);
    animation: pip-pulse 1s ease-in-out infinite alternate;
  }
  @keyframes pip-pulse {
    from { box-shadow: inset 0 0 0 1px var(--xoip-success), 0 0 8px rgba(16, 185, 129, 0.4); }
    to   { box-shadow: inset 0 0 0 1px var(--xoip-success), 0 0 24px rgba(16, 185, 129, 0.7); }
  }

  /* ─── Controls Bar ───────────────────────────────────────── */
  .controls-bar {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    min-height: var(--xoip-controls-height);
    padding: 10px 16px;
    background: rgba(15, 23, 42, 0.95);
    backdrop-filter: blur(12px);
    border-top: 1px solid rgba(255,255,255,0.08);
    z-index: 10;
    position: relative;
    flex-wrap: wrap;
  }

  .ctrl-btn {
    width: 44px;
    height: 44px;
    border: none;
    border-radius: 50%;
    background: var(--xoip-surface-2);
    color: var(--xoip-text);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all var(--xoip-transition);
    flex-shrink: 0;
    position: relative;
  }
  .ctrl-btn svg { width: 18px; height: 18px; pointer-events: none; }
  .ctrl-btn:hover { background: var(--xoip-primary); transform: scale(1.12); box-shadow: 0 4px 16px rgba(59,130,246,0.35); }
  .ctrl-btn.active { background: var(--xoip-primary); color: #fff; box-shadow: 0 4px 16px rgba(59,130,246,0.45); }
  .ctrl-btn.muted  { background: var(--xoip-danger); }
  .ctrl-btn.screen-active { background: var(--xoip-success); }
  .ctrl-btn.pip-active { background: var(--xoip-warning); color: #000; }
  .ctrl-btn.audiomode-active { background: var(--xoip-primary); color: #fff; }
  #btn-hangup { background: var(--xoip-danger); }
  #btn-hangup:hover { background: #f87171; box-shadow: 0 4px 16px rgba(239,68,68,0.4); }

  /* ─── Quality indicator (Network Health) ────────────────── */
  #quality-bar {
    position: absolute;
    top: 10px;
    right: 10px;
    display: flex;
    align-items: center;
    gap: 6px;
    background: rgba(0,0,0,0.55);
    backdrop-filter: blur(6px);
    border-radius: 20px;
    padding: 4px 10px;
    font-size: 11px;
    color: var(--xoip-text-muted);
    z-index: 5;
    transition: opacity 0.3s;
    cursor: default;
  }
  #quality-bar .quality-dot {
    width: 8px; height: 8px;
    border-radius: 50%;
    background: var(--xoip-text-muted);
    transition: background 0.5s;
  }
  #quality-bar.excellent .quality-dot { background: var(--xoip-success); }
  #quality-bar.good      .quality-dot { background: #4ade80; }
  #quality-bar.poor      .quality-dot { background: var(--xoip-warning); }
  #quality-bar.bad       .quality-dot { background: var(--xoip-danger); }

  /* Network quality pulse animation on poor/bad quality */
  #quality-bar.poor .quality-dot,
  #quality-bar.bad  .quality-dot {
    animation: quality-pulse 1s ease-in-out infinite;
  }
  @keyframes quality-pulse {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0.4; }
  }

  /* ─── Device Selector Panel ──────────────────────────────── */
  .device-panel {
    position: absolute;
    bottom: calc(var(--xoip-controls-height) + 10px);
    left: 50%;
    transform: translateX(-50%);
    width: 320px;
    background: var(--xoip-surface);
    border: 1px solid var(--xoip-surface-2);
    border-radius: var(--xoip-radius);
    box-shadow: 0 12px 40px rgba(0,0,0,0.6);
    z-index: 20;
    overflow: hidden;
    transition: opacity 0.2s, transform 0.2s;
    transform-origin: bottom center;
  }
  .device-panel.hidden {
    opacity: 0;
    pointer-events: none;
    transform: translateX(-50%) translateY(12px) scale(0.97);
  }

  .panel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 16px 12px;
    border-bottom: 1px solid var(--xoip-surface-2);
  }
  .panel-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    font-weight: 600;
    color: var(--xoip-text);
  }
  .panel-title svg { width: 16px; height: 16px; color: var(--xoip-primary); }

  .icon-btn {
    width: 30px; height: 30px;
    border: none;
    background: transparent;
    color: var(--xoip-text-muted);
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.2s, color 0.2s;
  }
  .icon-btn:hover { background: var(--xoip-surface-2); color: var(--xoip-text); }
  .icon-btn svg { width: 16px; height: 16px; }

  .panel-body {
    padding: 14px 16px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .device-label {
    font-size: 11px;
    font-weight: 600;
    color: var(--xoip-text-muted);
    text-transform: uppercase;
    letter-spacing: 0.6px;
    margin-top: 4px;
  }

  .device-select {
    width: 100%;
    padding: 9px 12px;
    border: 1px solid var(--xoip-surface-2);
    border-radius: var(--xoip-radius-sm);
    background: var(--xoip-bg);
    color: var(--xoip-text);
    font-size: 13px;
    font-family: var(--xoip-font-family);
    cursor: pointer;
    outline: none;
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='%2394a3b8' viewBox='0 0 24 24'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 10px center;
    padding-right: 30px;
    transition: border-color 0.2s;
  }
  .device-select:focus { border-color: var(--xoip-primary); }
  .device-select option { background: #1e293b; }

  /* Mic level bar */
  .mic-level-bar {
    width: 100%;
    height: 6px;
    background: var(--xoip-surface-2);
    border-radius: 3px;
    overflow: hidden;
    margin-top: 2px;
  }
  .mic-level-fill {
    height: 100%;
    width: 0%;
    background: linear-gradient(90deg, var(--xoip-success), var(--xoip-warning));
    border-radius: 3px;
    transition: width 0.05s linear;
  }

  /* ─── QR Modal ───────────────────────────────────────────── */
  .modal-overlay {
    position: absolute;
    inset: 0;
    background: rgba(0,0,0,0.65);
    backdrop-filter: blur(6px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 30;
    transition: opacity 0.2s;
  }
  .modal-overlay.hidden {
    opacity: 0;
    pointer-events: none;
  }

  .modal-card {
    background: var(--xoip-surface);
    border: 1px solid var(--xoip-surface-2);
    border-radius: var(--xoip-radius);
    padding: 0;
    width: 300px;
    box-shadow: 0 20px 60px rgba(0,0,0,0.7);
    overflow: hidden;
  }

  .modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 16px 12px;
    border-bottom: 1px solid var(--xoip-surface-2);
  }

  .modal-hint {
    font-size: 12px;
    color: var(--xoip-text-muted);
    text-align: center;
    padding: 8px 16px 0;
  }

  .qr-container {
    padding: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #fff;
    margin: 12px 16px;
    border-radius: var(--xoip-radius-sm);
    min-height: 200px;
  }

  .qr-container canvas {
    display: block;
    max-width: 100%;
    image-rendering: pixelated;
  }

  .qr-url {
    font-size: 10px;
    color: var(--xoip-text-muted);
    text-align: center;
    padding: 0 16px;
    word-break: break-all;
    line-height: 1.4;
  }

  .modal-card .btn {
    border-radius: 0;
    border-top: 1px solid var(--xoip-surface-2);
    border-radius: 0 0 var(--xoip-radius) var(--xoip-radius);
    margin-top: 12px;
  }

  /* ─── Tooltip ────────────────────────────────────────────── */
  .tooltip {
    position: fixed;
    background: rgba(15,23,42,0.95);
    color: var(--xoip-text);
    padding: 6px 12px;
    border-radius: 6px;
    font-size: 13px;
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.25s;
    z-index: 10000;
    white-space: nowrap;
  }

  /* ─── Slot (custom external element) ────────────────────── */
  ::slotted(*) {
    max-width: 100%;
    max-height: 100%;
    width: auto;
    height: auto;
    object-fit: contain;
  }

  /* ─── Scrollbar ──────────────────────────────────────────── */
  * { scrollbar-width: thin; scrollbar-color: var(--xoip-surface-2) transparent; }
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: var(--xoip-surface-2); border-radius: 4px; }
`,se=["apiKey","authDomain","projectId","storageBucket","messagingSenderId","appId","collection"];async function Ee(o){if(!o||typeof o!="object")return"";let e;if(o.apiKey||o.projectId){const n=se.map(i=>o[i]??"");e=JSON.stringify(n)}else e=JSON.stringify(o);const t=new TextEncoder().encode(e);if(typeof CompressionStream<"u"){const n=new CompressionStream("gzip"),i=n.writable.getWriter();i.write(t),i.close();const a=await new Response(n.readable).arrayBuffer();return btoa(String.fromCharCode(...new Uint8Array(a)))}return btoa(String.fromCharCode(...t))}async function W(o){if(!o||typeof o!="string")return{};try{const e=atob(o.trim()),t=Uint8Array.from(e,a=>a.charCodeAt(0));let n;if(typeof DecompressionStream<"u"){const a=new DecompressionStream("gzip"),r=a.writable.getWriter();r.write(t),r.close();const s=await new Response(a.readable).arrayBuffer();n=new TextDecoder().decode(s)}else n=new TextDecoder().decode(t);const i=JSON.parse(n);return Array.isArray(i)?Object.fromEntries(se.map((a,r)=>[a,i[r]]).filter(([,a])=>a!=null&&a!=="")):typeof i=="object"&&i!==null?i:{}}catch(e){return console.warn("[xoip-call] Failed to decompress signaling-token:",e),{}}}const Te=typeof HTMLElement<"u"?HTMLElement:class{};class Ue extends Te{static compressConfig(e){return Ee(e)}static decompressConfig(e){return W(e)}static get observedAttributes(){return["src","signaling-type","signaling-config","signaling-token","ice-servers","multi-camera","headless","e2ee-enabled","custom-remote-video","room-id","audio-only","vad-threshold"]}constructor(){super(),this.attachShadow({mode:"open"}),this._engine=null,this._media=null,this._stats=null,this._e2ee=null,this._signaling=null,this._callState="idle",this._audioMuted=!1,this._videoMuted=!1,this._localCamerasVisible=!1,this._audioOnlyMode=!1,this._pipActive=!1,this._remoteStreams=new Map,this._cameraTrack=null,this._vadAudioCtx=null,this._vadAnalyserLocal=null,this._vadAnalyserRemote=null,this._vadLocalActive=!1,this._vadRemoteActive=!1,this._vadRafId=null,this._micLevelRafId=null,this._els={},this._tooltipTimer=null,this._iceFailoverTimer=null,this._turnRequested=!1,this._xoipSession=null}connectedCallback(){this._render(),this._bindElements(),this._setupUI(),this._checkUrlParams();const e=this.getAttribute("room-id");e&&(this._els.roomInput.value=e,this._els.joinBtn.disabled=!1)}disconnectedCallback(){this._cleanup(!0)}attributeChangedCallback(e,t,n){t!==n&&(e==="room-id"&&n&&this._callState==="idle"&&this._els.roomInput&&(this._els.roomInput.value=n,this._els.joinBtn.disabled=!1),e==="src"&&n&&this._callState==="idle"&&this.connect(n).catch(i=>this._handleError("CONNECT_FAILED",i)))}async connect(e){if(this._callState==="idle"){this._callState="calling";try{const{signalingType:t,token:n,roomId:i,roomKey:a}=fe(e),r=await ke({token:n,roomKeyBase64Url:a,expectedType:t,expectedRoomId:i});this._xoipSession={signalingType:t,token:n,roomId:i,roomKey:a,tokenPayload:r,shareURI:e},this._signaling=await z.create(t,r.config??{},{roomKey:a}),this._els.roomInput&&(this._els.roomInput.value=i),await this._initSignaling("polite"),await this._startMedia(),await this._signaling.joinRoom(i),this._emit("room-joined",{roomId:i,uri:e}),this._showCallScreen()}catch(t){this._callState="idle",this._xoipSession=null,this._handleError("CONNECT_FAILED",t)}}else console.warn("[xoip-call] connect() called while not idle. Current state:",this._callState)}addIceServers(e){var t,n;Array.isArray(e)&&e.length&&((n=(t=this._engine)==null?void 0:t.addIceServers)==null||n.call(t,e))}async restartIce(){var e,t;await((t=(e=this._engine)==null?void 0:e.restartIce)==null?void 0:t.call(e))}set signalingAdapter(e){this._signaling=e}get signalingAdapter(){return this._signaling}get localStream(){var e;return((e=this._media)==null?void 0:e.primaryStream)??null}get remoteStreams(){return this._remoteStreams}async createRoom(){var e,t;if(this._callState==="idle"){this._callState="calling";try{const n=xe(),i=await ae(n);await this._initSignaling("impolite",{roomKey:n,cryptoKey:i});const a=await this._signaling.createRoom();this._els.roomInput.value=a;let r=null;try{const s=this.getAttribute("signaling-type")||"firebase";let l={};const p=this.getAttribute("signaling-token");if(p)l=await W(p);else{const g=this.getAttribute("signaling-config");try{l=g?JSON.parse(g):{}}catch{}}(t=(e=this._signaling)==null?void 0:e._relayUrls)!=null&&t.length&&(l.relays=[...this._signaling._relayUrls]);const u=await Ie({roomKeyBase64Url:n,type:s,roomId:a,config:l});r=be({signalingType:s,token:u,roomId:a,roomKey:n}),this._xoipSession={signalingType:s,token:u,roomId:a,roomKey:n,shareURI:r,tokenPayload:{config:l}}}catch(s){console.warn("[xoip-call] Failed to generate xoip:// URI during createRoom:",s)}return await this._startMedia(),this._emit("room-created",{roomId:a,shareURI:r}),this._showCallScreen(),a}catch(n){this._handleError("CREATE_ROOM_FAILED",n),this._callState="idle"}}}async joinRoom(e){if(this._callState==="idle"){if(e&&typeof e=="string"&&e.trim().startsWith("xoip://"))return this.connect(e.trim());this._callState="calling";try{this._els.roomInput.value=e,await this._initSignaling("polite"),await this._startMedia(),await this._signaling.joinRoom(e),this._emit("room-joined",{roomId:e}),this._showCallScreen()}catch(t){this._handleError("JOIN_ROOM_FAILED",t),this._callState="idle"}}}async leaveRoom(){var e;this._callState!=="idle"&&(await((e=this._signaling)==null?void 0:e.endRoom()),this._cleanup(!1),this._emit("call-ended",{reason:"local_hangup"}),this._resetUI())}setAudioMute(e){var t;this._audioMuted=e,(t=this._media)==null||t.setAudioMute(e);const n=this._els.audioBtn;n&&(n.innerHTML=e?f.microphoneOff:f.microphone,n.classList.toggle("muted",e),n.title=e?"Unmute Audio":"Mute Audio")}setVideoMute(e){var t;this._videoMuted=e,(t=this._media)==null||t.setVideoMute(e);const n=this._els.videoBtn;n&&(n.innerHTML=e?f.videoOff:f.video,n.classList.toggle("muted",e),n.title=e?"Enable Video":"Disable Video")}async startScreenShare(){var e,t;if(this._media&&this._engine)try{const n=await this._media.startScreenShare(async i=>{await this._engine.replaceTrack("video",i),this._updateScreenBtn(!1),this._emit("screen-share-stopped",{})});this._cameraTrack=((t=(e=this._engine.pc)==null?void 0:e.getSenders().find(i=>{var a;return((a=i.track)==null?void 0:a.kind)==="video"}))==null?void 0:t.track)??null,await this._engine.replaceTrack("video",n),this._updateScreenBtn(!0),this._localCamerasVisible&&this._renderLocalCameras(),this._emit("screen-share-started",{})}catch(n){n.name!=="NotAllowedError"&&this._handleError("SCREEN_SHARE_FAILED",n)}}async stopScreenShare(){var e;(e=this._media)!=null&&e.isScreenSharing&&(await this._media.stopScreenShare(async t=>{await this._engine.replaceTrack("video",t),this._localCamerasVisible&&this._renderLocalCameras()}),this._updateScreenBtn(!1),this._localCamerasVisible&&this._renderLocalCameras(),this._emit("screen-share-stopped",{}))}async switchCamera(e){if(!this._media||!this._engine)return;const t=await this._media.switchCamera(e);await this._engine.replaceTrack("video",t),this._localCamerasVisible&&this._renderLocalCameras()}sendData(e){var t;(t=this._engine)==null||t.sendData(e)}getStats(){var e;return((e=this._stats)==null?void 0:e.getFullReport())??Promise.resolve(null)}_render(){this.shadowRoot.innerHTML=`<style>${Le()}</style>${De()}`}_bindElements(){const e=t=>this.shadowRoot.getElementById(t);this._els={welcomeScreen:e("welcome-screen"),callContainer:e("call-container"),videoRoom:e("video-room"),roomInput:e("room-id-input"),createBtn:e("btn-create"),joinBtn:e("btn-join"),remoteVideo:e("remote-video"),remoteThumbs:e("remote-thumbnails"),localCameras:e("local-cameras"),audioBtn:e("btn-audio"),videoBtn:e("btn-video"),screenBtn:e("btn-screen"),camerasBtn:e("btn-cameras"),devicesBtn:e("btn-devices"),pipBtn:e("btn-pip"),audiomodeBtn:e("btn-audiomode"),shareBtn:e("btn-share"),qrBtn:e("btn-qr"),hangupBtn:e("btn-hangup"),qualityBar:e("quality-bar"),qualityLabel:e("quality-label"),tooltip:e("tooltip"),devicePanel:e("device-panel"),closePanelBtn:e("btn-close-devices"),selectCamera:e("select-camera"),selectMic:e("select-mic"),selectSpeaker:e("select-speaker"),micLevelFill:e("mic-level-fill"),applyDevicesBtn:e("btn-apply-devices"),qrModal:e("qr-modal"),closeQrBtn:e("btn-close-qr"),qrContainer:e("qr-container"),qrUrl:e("qr-url"),copyQrUrlBtn:e("btn-copy-qr-url"),mainVideoArea:e("main-video-area"),remoteLevelMeter:e("remote-level-meter"),remoteLevelFill:e("remote-level-fill"),audioAvatar:e("audio-avatar"),audioWaveRemote:e("audio-wave-remote"),speakingRingRemote:e("speaking-ring-remote"),pipSelfView:e("pip-self-view"),pipSelfVideo:e("pip-self-video"),pipCloseBtn:e("btn-pip-close")}}_setupUI(){var e;const t=this._els;t.createBtn.addEventListener("click",()=>this.createRoom()),t.joinBtn.addEventListener("click",async()=>{const n=t.roomInput.value.trim();n&&await this.joinRoom(n)}),t.roomInput.addEventListener("dblclick",()=>{t.roomInput.readOnly=!1,t.joinBtn.disabled=!1,t.roomInput.focus(),t.roomInput.select()}),t.audioBtn.addEventListener("click",()=>this.setAudioMute(!this._audioMuted)),t.videoBtn.addEventListener("click",()=>this.setVideoMute(!this._videoMuted)),t.hangupBtn.addEventListener("click",()=>this.leaveRoom()),t.shareBtn.addEventListener("click",()=>this._shareRoom()),t.camerasBtn.addEventListener("click",()=>this._toggleLocalCameras()),t.screenBtn.addEventListener("click",()=>{var n;(n=this._media)!=null&&n.isScreenSharing?this.stopScreenShare():this.startScreenShare()}),t.devicesBtn.addEventListener("click",()=>this._toggleDevicePanel()),t.closePanelBtn.addEventListener("click",()=>this._closeDevicePanel()),t.applyDevicesBtn.addEventListener("click",()=>this._applyDeviceSelection()),t.pipBtn.addEventListener("click",()=>this._togglePiP()),(e=t.pipCloseBtn)==null||e.addEventListener("click",n=>{n.stopPropagation(),this.exitPiP()}),this._setupPipSelfView(),t.audiomodeBtn.addEventListener("click",()=>this.setAudioOnlyMode(!this._audioOnlyMode)),t.qrBtn.addEventListener("click",()=>this._openQrModal()),t.closeQrBtn.addEventListener("click",()=>this._closeQrModal()),t.qrModal.addEventListener("click",n=>{n.target===t.qrModal&&this._closeQrModal()}),t.copyQrUrlBtn.addEventListener("click",async()=>{const n=t.qrUrl.textContent;if(n)try{await navigator.clipboard.writeText(n),this._showTooltip("Link copied!",t.copyQrUrlBtn)}catch{this._showTooltip("Copy failed",t.copyQrUrlBtn)}}),document.addEventListener("keydown",n=>{n.key==="Escape"&&(this._closeDevicePanel(),this._closeQrModal())})}_checkUrlParams(){const e=new URLSearchParams(window.location.search),t=e.get("uri")||e.get("src");if(t&&t.startsWith("xoip://"))return void setTimeout(()=>this.connect(t).catch(i=>this._handleError("CONNECT_FAILED",i)),0);if(window.location.hash){const i=window.location.hash.slice(1);if(i.startsWith("xoip://"))return void setTimeout(()=>this.connect(decodeURIComponent(i)).catch(a=>this._handleError("CONNECT_FAILED",a)),0);try{const a=new URLSearchParams(i),r=a.get("uri")||a.get("src");if(r&&r.startsWith("xoip://"))return void setTimeout(()=>this.connect(r).catch(s=>this._handleError("CONNECT_FAILED",s)),0)}catch{}}const n=e.get("room");if(n&&(this._els.roomInput.value=n,this._els.roomInput.readOnly=!1,this._els.joinBtn.disabled=!1),window.location.hash)try{const i=new URLSearchParams(window.location.hash.slice(1)),a=i.get("room");a&&!n&&(this._els.roomInput.value=a,this._els.roomInput.readOnly=!1,this._els.joinBtn.disabled=!1);const r=i.get("type");r&&this.setAttribute("signaling-type",r);const s=i.get("token");s&&this.setAttribute("signaling-token",s);const l=i.get("cfg");if(l)if(l.startsWith("H4sI"))this.setAttribute("signaling-token",l);else try{const p=atob(l);this.setAttribute("signaling-config",p)}catch{}}catch(i){console.warn("[xoip-call] Failed to parse URL hash config:",i)}}async _initSignaling(e,t={}){var n,i;let a;this._signaling?t.cryptoKey&&((i=(n=this._signaling).setCryptoKey)==null||i.call(n,t.cryptoKey)):await this._createDefaultSignaling(t),await this._signaling.connect();try{a=JSON.parse(this.getAttribute("ice-servers")??"[]")}catch{a=[]}this._engine=new ge({polite:e==="polite",iceServers:a.length?a:void 0,onSignal:r=>this._signaling.sendSignal(r),onRemoteTrack:r=>this._handleRemoteTrack(r),onDataMessage:r=>this._handleDataMessage(r),onConnectionState:r=>this._handleConnectionState(r),onError:r=>this._handleError("ENGINE_ERROR",r)}),this._engine.init(),this._signaling.onSignal(r=>this._engine.handleSignal(r)),this._signaling.onRoomState(r=>{r==="ended"&&this._handleRemoteHangup()})}async _createDefaultSignaling(e={}){const t=this.getAttribute("signaling-type")??"firebase";let n={};const i=this.getAttribute("signaling-token");if(i)n=await W(i);else{const a=this.getAttribute("signaling-config");try{n=a?JSON.parse(a):{}}catch{n={}}}this._signaling=await z.create(t,n,e)}async _startMedia(){const e=this.hasAttribute("multi-camera");this._media=new me({multiCamera:e,onError:a=>this._handleError("MEDIA_ERROR",a)});const{audioTrack:t,videoTracks:n}=await this._media.start();this._engine.addAudioTrack(t,this._media.primaryStream);const i=[this._media.primaryStream,...this._media.secondaryStreams];n.forEach((a,r)=>{this._engine.addVideoTrack(a,i[r]??new MediaStream([a]))}),this._engine.setupDataChannel(),this.hasAttribute("e2ee-enabled")&&this._initE2EE().catch(a=>this._handleError("E2EE_ERROR",a)),this._stats=new ve(this._engine.pc,{onQuality:a=>{this._emit("network-quality",a),this._updateQualityUI(a)}}),this._stats.start(),this._startVAD()}async _initE2EE(){this._e2ee=new ye({onSendPublicKey:t=>{this._engine.sendData({type:"e2ee-pubkey",key:t})},onError:t=>this._handleError("E2EE_ERROR",t)}),await this._waitForDataChannelOpen(),await this._e2ee.initialize();const e=new URL("data:text/javascript;base64,LyoqCiAqIEBmaWxlb3ZlcnZpZXcgZTJlZS13b3JrZXIuanMg4oCUIFdlYiBXb3JrZXIg0LTQu9GPIFJUQ1J0cFNjcmlwdFRyYW5zZm9ybS4KICoKICog0JLRi9C/0L7Qu9C90Y/QtdGCIEFFUy1HQ00g0YjQuNGE0YDQvtCy0LDQvdC40LUv0LTQtdGI0LjRhNGA0L7QstCw0L3QuNC1INC80LXQtNC40LAt0LrQsNC00YDQvtCyINCyINGE0L7QvdC+0LLQvtC8INC/0L7RgtC+0LrQtSwKICog0L3QtSDQsdC70L7QutC40YDRg9GPIFVJINC4INC90LUg0LLRi9C30YvQstCw0Y8g0L/RgNC+0YHQsNC00L7QuiBGUFMuCiAqCiAqINCk0L7RgNC80LDRgiDQt9Cw0YjQuNGE0YDQvtCy0LDQvdC90L7Qs9C+INC60LDQtNGA0LA6CiAqICAgWyA0IGJ5dGVzOiBJViBjb3VudGVyIChiaWctZW5kaWFuIHVpbnQzMikgfCA4IGJ5dGVzOiByYW5kb20gc2FsdCB8IGNpcGhlcnRleHQgXQogKgogKiDQn9GA0L7RgtC+0LrQvtC7INGB0L7QvtCx0YnQtdC90LjQuSDQvtGCINC+0YHQvdC+0LLQvdC+0LPQviDQv9C+0YLQvtC60LA6CiAqICAgeyB0eXBlOiAnc2V0LWtleScsIGtleURhdGE6IEFycmF5QnVmZmVyIH0gIC0g0YPRgdGC0LDQvdC+0LLQuNGC0YwgQUVTINC60LvRjtGHCiAqLwoKJ3VzZSBzdHJpY3QnOwoKLyoqIEB0eXBlIHtDcnlwdG9LZXl8bnVsbH0gKi8KbGV0IGFlc0tleSA9IG51bGw7CgovKiogSVYgY291bnRlciDQtNC70Y8g0L/RgNC10LTQvtGC0LLRgNCw0YnQtdC90LjRjyDQv9C+0LLRgtC+0YDQvdC+0LPQviDQuNGB0L/QvtC70YzQt9C+0LLQsNC90LjRjyDQvdC+0L3RgdCwICovCmxldCBpdkNvdW50ZXIgPSAwOwoKLy8g4pSA4pSA4pSAINCS0YXQvtC00Y/RidC40LUg0YHQvtC+0LHRidC10L3QuNGPINC+0YIgRTJFRU1hbmFnZXIg4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSACgpzZWxmLm9ucnRjdHJhbnNmb3JtID0gKGV2ZW50KSA9PiB7CiAgY29uc3QgdHJhbnNmb3JtZXIgPSBldmVudC50cmFuc2Zvcm1lcjsKICBjb25zdCB7IG9wZXJhdGlvbiwga2luZCB9ID0gdHJhbnNmb3JtZXIub3B0aW9uczsKCiAgdHJhbnNmb3JtZXIucmVhZGFibGUKICAgIC5waXBlVGhyb3VnaChuZXcgVHJhbnNmb3JtU3RyZWFtKHsKICAgICAgdHJhbnNmb3JtOiBvcGVyYXRpb24gPT09ICdlbmNyeXB0JwogICAgICAgID8gZW5jcnlwdEZyYW1lCiAgICAgICAgOiBkZWNyeXB0RnJhbWUsCiAgICB9KSkKICAgIC5waXBlVG8odHJhbnNmb3JtZXIud3JpdGFibGUpCiAgICAuY2F0Y2goZSA9PiBjb25zb2xlLmVycm9yKGBbRTJFRVdvcmtlcl0gVHJhbnNmb3JtIGVycm9yICgke29wZXJhdGlvbn0vJHtraW5kfSk6YCwgZSkpOwp9OwoKc2VsZi5vbm1lc3NhZ2UgPSBhc3luYyAoZXZlbnQpID0+IHsKICBjb25zdCBtc2cgPSBldmVudC5kYXRhOwogIGlmIChtc2cudHlwZSA9PT0gJ3NldC1rZXknKSB7CiAgICBhZXNLZXkgPSBhd2FpdCBjcnlwdG8uc3VidGxlLmltcG9ydEtleSgKICAgICAgJ3JhdycsCiAgICAgIG1zZy5rZXlEYXRhLAogICAgICB7IG5hbWU6ICdBRVMtR0NNJyB9LAogICAgICBmYWxzZSwKICAgICAgWydlbmNyeXB0JywgJ2RlY3J5cHQnXQogICAgKTsKICAgIGNvbnNvbGUubG9nKCdbRTJFRVdvcmtlcl0gQUVTLUdDTSBrZXkgbG9hZGVkLicpOwogIH0KfTsKCi8vIOKUgOKUgOKUgCBFbmNyeXB0IOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgAoKYXN5bmMgZnVuY3Rpb24gZW5jcnlwdEZyYW1lKGVuY29kZWRGcmFtZSwgY29udHJvbGxlcikgewogIGlmICghYWVzS2V5KSB7CiAgICAvLyDQmtC70Y7RhyDQtdGJ0ZEg0L3QtSDQv9C+0LvRg9GH0LXQvSDigJQg0L/RgNC+0L/Rg9GB0LrQsNC10Lwg0LrQsNC00YAg0LHQtdC3INC40LfQvNC10L3QtdC90LjQuQogICAgY29udHJvbGxlci5lbnF1ZXVlKGVuY29kZWRGcmFtZSk7CiAgICByZXR1cm47CiAgfQoKICB0cnkgewogICAgY29uc3QgaXYgPSBtYWtlSVYoKTsKICAgIGNvbnN0IGNpcGhlcnRleHQgPSBhd2FpdCBjcnlwdG8uc3VidGxlLmVuY3J5cHQoCiAgICAgIHsgbmFtZTogJ0FFUy1HQ00nLCBpdiB9LAogICAgICBhZXNLZXksCiAgICAgIGVuY29kZWRGcmFtZS5kYXRhCiAgICApOwoKICAgIC8vINCh0L7QsdC40YDQsNC10Lw6IFtJViAoMTIgYnl0ZXMpXSArIFtjaXBoZXJ0ZXh0XQogICAgY29uc3QgZW5jcnlwdGVkID0gbmV3IFVpbnQ4QXJyYXkoaXYuYnl0ZUxlbmd0aCArIGNpcGhlcnRleHQuYnl0ZUxlbmd0aCk7CiAgICBlbmNyeXB0ZWQuc2V0KGl2LCAwKTsKICAgIGVuY3J5cHRlZC5zZXQobmV3IFVpbnQ4QXJyYXkoY2lwaGVydGV4dCksIGl2LmJ5dGVMZW5ndGgpOwoKICAgIGVuY29kZWRGcmFtZS5kYXRhID0gZW5jcnlwdGVkLmJ1ZmZlcjsKICAgIGNvbnRyb2xsZXIuZW5xdWV1ZShlbmNvZGVkRnJhbWUpOwogIH0gY2F0Y2ggKGUpIHsKICAgIGNvbnNvbGUuZXJyb3IoJ1tFMkVFV29ya2VyXSBFbmNyeXB0IGVycm9yOicsIGUpOwogICAgLy8g0J/RgNC4INC+0YjQuNCx0LrQtSDRiNC40YTRgNC+0LLQsNC90LjRjyDigJQg0L/RgNC+0L/Rg9GB0LrQsNC10Lwg0LrQsNC00YAgKNC90LUg0LrRgNC40LzQuNC90LDQu9GM0L3QviwgUW9TINC/0YDQtdC00L/QvtGH0YLQuNGC0LXQu9GM0L3QtdC1KQogICAgY29udHJvbGxlci5lbnF1ZXVlKGVuY29kZWRGcmFtZSk7CiAgfQp9CgovLyDilIDilIDilIAgRGVjcnlwdCDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIAKCmFzeW5jIGZ1bmN0aW9uIGRlY3J5cHRGcmFtZShlbmNvZGVkRnJhbWUsIGNvbnRyb2xsZXIpIHsKICBpZiAoIWFlc0tleSkgewogICAgY29udHJvbGxlci5lbnF1ZXVlKGVuY29kZWRGcmFtZSk7CiAgICByZXR1cm47CiAgfQoKICB0cnkgewogICAgY29uc3QgZGF0YSA9IG5ldyBVaW50OEFycmF5KGVuY29kZWRGcmFtZS5kYXRhKTsKICAgIGNvbnN0IGl2ID0gZGF0YS5zbGljZSgwLCAxMik7CiAgICBjb25zdCBjaXBoZXJ0ZXh0ID0gZGF0YS5zbGljZSgxMik7CgogICAgY29uc3QgcGxhaW50ZXh0ID0gYXdhaXQgY3J5cHRvLnN1YnRsZS5kZWNyeXB0KAogICAgICB7IG5hbWU6ICdBRVMtR0NNJywgaXYgfSwKICAgICAgYWVzS2V5LAogICAgICBjaXBoZXJ0ZXh0CiAgICApOwoKICAgIGVuY29kZWRGcmFtZS5kYXRhID0gcGxhaW50ZXh0OwogICAgY29udHJvbGxlci5lbnF1ZXVlKGVuY29kZWRGcmFtZSk7CiAgfSBjYXRjaCAoZSkgewogICAgLy8g0JTQtdC60L7QtCDQvtGI0LjQsdC60LAg0YLQuNC/0LjRh9C90LAg0L/RgNC4INC60LDQtNGA0LDRhSDQv9C10YDQtdC00LDQvdC90YvRhSDQtNC+INC+0LHQvNC10L3QsCDQutC70Y7Rh9Cw0LzQuCDigJQg0L/RgNC+0YHRgtC+INC00YDQvtC/0LDQtdC8CiAgICBjb25zb2xlLndhcm4oJ1tFMkVFV29ya2VyXSBEZWNyeXB0IGZhaWxlZCDigJQgZnJhbWUgZHJvcHBlZCAoZXhwZWN0ZWQgZHVyaW5nIGtleSBleGNoYW5nZSkuJyk7CiAgfQp9CgovLyDilIDilIDilIAgSVYgR2VuZXJhdGlvbiDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIAKCi8qKgogKiDQpNC+0YDQvNC40YDRg9C10YIgMTIt0LHQsNC50YLQvdGL0Lkg0L3QvtC90YEg0LTQu9GPIEFFUy1HQ006CiAqICAgWzQgYnl0ZXMgY291bnRlcl1bOCBieXRlcyByYW5kb20gc2FsdF0KICog0KHQvtCy0LzQtdGJ0LXQvdC40LUgY291bnRlciArIHJhbmRvbSDQv9GA0LDQutGC0LjRh9C10YHQutC4INC40YHQutC70Y7Rh9Cw0LXRgiDQutC+0LvQu9C40LfQuNC4IElWLgogKi8KZnVuY3Rpb24gbWFrZUlWKCkgewogIGNvbnN0IGl2ID0gbmV3IFVpbnQ4QXJyYXkoMTIpOwogIC8vIDQg0LHQsNC50YLQsDog0YHRh9C10YLRh9C40LogKGJpZy1lbmRpYW4pCiAgbmV3IERhdGFWaWV3KGl2LmJ1ZmZlcikuc2V0VWludDMyKDAsIGl2Q291bnRlcisrLCBmYWxzZSk7CiAgLy8gOCDQsdCw0LnRgjog0YHQu9GD0YfQsNC50L3Ri9C5IHNhbHQg0LTQu9GPINC00L7Qv9C+0LvQvdC40YLQtdC70YzQvdC+0Lkg0Y3QvdGC0YDQvtC/0LjQuAogIGNyeXB0by5nZXRSYW5kb21WYWx1ZXMoaXYuc3ViYXJyYXkoNCkpOwogIHJldHVybiBpdjsKfQo=",import.meta.url).href;await this._e2ee.attachToPeerConnection(this._engine.pc,e)}_waitForDataChannelOpen(){return new Promise((e,t)=>{const n=setTimeout(()=>t(new Error("[E2EE] DataChannel open timeout")),6e4),i=()=>{var a;const r=(a=this._engine)==null?void 0:a.dataChannel;if(!r)return this._callState==="idle"?(clearTimeout(n),void t(new Error("[E2EE] Call ended before DataChannel opened"))):void setTimeout(i,200);(s=>{if(s.readyState==="open")return clearTimeout(n),void e();const l=()=>{clearTimeout(n),s.removeEventListener("open",l),e()};s.addEventListener("open",l),s.readyState==="open"&&l()})(r)};i()})}_handleRemoteTrack(e){var t;const n=e.track,i=((t=e.streams)==null?void 0:t[0])??new MediaStream([n]);if(this._remoteStreams.set(n.id,i),n.kind==="audio"&&(this._els.remoteVideo.srcObject||(this._els.remoteVideo.srcObject=i,this._els.remoteVideo.play().catch(a=>{console.warn("[xoip-call] Audio playback warning:",a)})),this._attachRemoteVAD(i)),n.kind==="video"){const a=this.getAttribute("custom-remote-video");let r=this._els.remoteVideo;if(a){const s=document.querySelector(a);if(s){const l=typeof s.getVideoElement=="function"?s.getVideoElement():s.tagName==="VIDEO"?s:null;l&&(r=l,this._els.remoteVideo.style.display="none",this._emit("use-custom-video",{element:s}))}}r&&!r.srcObject&&(r.srcObject=i,r.play().catch(s=>{console.warn("[xoip-call] targetVideo.play() warning:",s)})),this._addRemoteThumbnail(n.id,i),this._attachRemoteVAD(i)}this._emit("remote-stream-ready",{stream:i,track:n})}_addRemoteThumbnail(e,t){var n;const i=document.createElement("video");i.srcObject=t,i.autoplay=!0,i.playsInline=!0,i.muted=!0,i.dataset.trackId=e,i.play().catch(()=>{}),i.addEventListener("click",()=>{const a=this._els.remoteVideo;a&&a.style.display!=="none"&&(a.srcObject=t),this._emit("switch-remote-stream",{stream:t})}),(n=this._els.remoteThumbs)==null||n.appendChild(i)}_handleDataMessage(e){var t;(e==null?void 0:e.type)==="e2ee-pubkey"&&e.key?(t=this._e2ee)==null||t.receiveRemotePublicKey(e.key):this._emit("channel-message",{data:e})}_handleConnectionState(e){console.log(`[xoip-call] PeerConnection state: ${e}`),e==="connected"&&(this._callState="connected",this._clearIceFailoverTimer(),this._turnRequested=!1),e==="checking"&&this._startIceFailoverTimer(),e==="failed"&&(this._clearIceFailoverTimer(),this._turnRequested&&this._emitXoipError("ERR_TURN_REQUIRED","P2P connection failed even after TURN request"),this._handleError("CONNECTION_FAILED",new Error("PeerConnection failed"))),e==="disconnected"&&this._startIceFailoverTimer()}_startIceFailoverTimer(){this._iceFailoverTimer||this._callState==="connected"||(this._iceFailoverTimer=setTimeout(()=>{var e,t;this._iceFailoverTimer=null,this._callState!=="connected"&&(console.warn("[xoip-call] ICE Failover Timer fired: requesting TURN servers"),this._turnRequested=!0,this._emit("xoip-need-turn",{message:"Direct P2P connection failed. TURN servers are required.",roomId:((e=this._signaling)==null?void 0:e.roomId)??((t=this._xoipSession)==null?void 0:t.roomId)}))},6e3))}_clearIceFailoverTimer(){this._iceFailoverTimer&&(clearTimeout(this._iceFailoverTimer),this._iceFailoverTimer=null)}_emitXoipError(e,t){this.dispatchEvent(new CustomEvent("xoip-error",{bubbles:!0,composed:!0,detail:{code:e,message:t}}))}_showCallScreen(){this._els.welcomeScreen.style.display="none",this._els.callContainer.classList.add("active"),this.hasAttribute("audio-only")&&this.setAudioOnlyMode(!0)}_resetUI(){var e,t,n,i;this._els.callContainer.classList.remove("active"),this._els.welcomeScreen.style.display="",this._els.remoteVideo.srcObject=null,this._els.remoteVideo.style.display="",this._els.remoteThumbs.innerHTML="",this._els.localCameras.innerHTML="",this._els.roomInput.value="",this._els.roomInput.readOnly=!0,this._els.joinBtn.disabled=!0,this._updateQualityUI({quality:"unknown"}),this.setAudioMute(!1),this.setVideoMute(!1),this.setAudioOnlyMode(!1),this._closeDevicePanel(),this._closeQrModal(),this._updateCamerasBtn(!1),(e=this._els.mainVideoArea)==null||e.classList.remove("speaking"),(t=this._els.audioAvatar)==null||t.classList.remove("speaking"),(n=this._els.localCameras)==null||n.classList.remove("speaking"),this._els.remoteLevelFill&&(this._els.remoteLevelFill.style.height="0%",(i=this._els.remoteLevelMeter)==null||i.classList.remove("active")),this._pipActive&&this.exitPiP(),this._els.pipSelfVideo&&(this._els.pipSelfVideo.srcObject=null),this._callState="idle",this._remoteStreams.clear()}_renderLocalCameras(){var e,t,n;if(!this._els.localCameras)return;this._els.localCameras.querySelectorAll("video").forEach(a=>{a.srcObject=null,a.remove()});const i=[];(e=this._media)!=null&&e.primaryStream&&i.push(...this._media.primaryStream.getVideoTracks()),(n=(t=this._media)==null?void 0:t.secondaryStreams)!=null&&n.length&&this._media.secondaryStreams.forEach(a=>{i.push(...a.getVideoTracks())}),i.forEach(a=>{const r=document.createElement("video");r.srcObject=new MediaStream([a]),r.autoplay=!0,r.playsInline=!0,r.muted=!0,this._els.localCameras.appendChild(r),r.play().catch(()=>{})})}_toggleLocalCameras(){this._localCamerasVisible=!this._localCamerasVisible,this._els.localCameras.classList.toggle("hidden",!this._localCamerasVisible),this._updateCamerasBtn(this._localCamerasVisible),this._localCamerasVisible&&this._renderLocalCameras()}_updateCamerasBtn(e){const t=this._els.camerasBtn;t&&(t.classList.toggle("active",e),t.title=e?"Hide Local Cameras":"Show Local Cameras")}_updateScreenBtn(e){const t=this._els.screenBtn;t&&(t.innerHTML=e?f.screenShareStop:f.screenShare,t.classList.toggle("screen-active",e),t.title=e?"Stop Screen Share":"Share Screen")}_updateQualityUI({quality:e,rtt:t,packetLoss:n}){const i=this._els.qualityBar,a=this._els.qualityLabel;if(!i||!a)return;i.className=e!==void 0?e:"";const r=t!=null?`${t}ms`:"—",s=n!=null?`${n}%`:"";a.textContent=t!=null?`${r} ${s}`.trim():e??"—",i.title=`RTT: ${r}  Loss: ${s}  Type: ${e??"?"}`}_showTooltip(e,t){clearTimeout(this._tooltipTimer);const n=this._els.tooltip;if(n){if(n.textContent=e,t){const i=t.getBoundingClientRect(),a=this.getBoundingClientRect();n.style.left=i.left-a.left+"px",n.style.top=i.top-a.top-36+"px"}n.style.opacity="1",this._tooltipTimer=setTimeout(()=>{n.style.opacity="0"},2500)}}_buildShareUrl(e=!1){var t;if((t=this._xoipSession)!=null&&t.shareURI)return`${location.origin}${location.pathname}#uri=${encodeURIComponent(this._xoipSession.shareURI)}`;const n=this._els.roomInput.value;if(!n)return null;let i=`${location.origin}${location.pathname}?room=${encodeURIComponent(n)}`;const a=this.getAttribute("signaling-type")||"firebase",r=[];if(a!=="firebase"&&r.push(`type=${encodeURIComponent(a)}`),e||this.hasAttribute("embed-config-in-share")){const s=this.getAttribute("signaling-token");if(s)r.push(`token=${encodeURIComponent(s)}`);else{const l=this.getAttribute("signaling-config");if(l)try{r.push(`cfg=${btoa(l)}`)}catch{}}}return r.length>0&&(i+=`#${r.join("&")}`),i}async _shareRoom(){const e=this._buildShareUrl();if(e)try{await navigator.clipboard.writeText(e),this._showTooltip("Link copied!",this._els.shareBtn)}catch{this._showTooltip("Copy failed",this._els.shareBtn)}}_handleRemoteHangup(){this._cleanup(!1),this._emit("call-ended",{reason:"remote_hangup"}),this._resetUI()}_cleanup(e){var t,n,i,a,r;(t=this._stats)==null||t.stop(),(n=this._e2ee)==null||n.terminate(),(i=this._media)==null||i.stopAll(),(a=this._engine)==null||a.close(),this._stopVAD(),this._stopMicLevel(),e&&((r=this._signaling)==null||r.disconnect()),this._clearIceFailoverTimer(),this._turnRequested=!1,e&&(this._xoipSession=null),this._stats=null,this._e2ee=null,this._engine=null,e&&(this._signaling=null),this._media=null}async getDevices(){const e=await navigator.mediaDevices.enumerateDevices();return{cameras:e.filter(t=>t.kind==="videoinput"),microphones:e.filter(t=>t.kind==="audioinput"),speakers:e.filter(t=>t.kind==="audiooutput")}}async _toggleDevicePanel(){const e=this._els.devicePanel;e.classList.contains("hidden")?(await this._populateDevicePanel(),e.classList.remove("hidden"),this._startMicLevel(),this._els.devicesBtn.classList.add("active")):this._closeDevicePanel()}_closeDevicePanel(){var e,t;(e=this._els.devicePanel)==null||e.classList.add("hidden"),(t=this._els.devicesBtn)==null||t.classList.remove("active"),this._stopMicLevel()}async _populateDevicePanel(){var e,t,n,i,a,r,s,l,p,u;const{cameras:g,microphones:v,speakers:m}=await this.getDevices(),d=(a=(i=(n=(t=(e=this._media)==null?void 0:e.primaryStream)==null?void 0:t.getVideoTracks())==null?void 0:n[0])==null?void 0:i.getSettings())==null?void 0:a.deviceId,w=(u=(p=(l=(s=(r=this._media)==null?void 0:r.primaryStream)==null?void 0:s.getAudioTracks())==null?void 0:l[0])==null?void 0:p.getSettings())==null?void 0:u.deviceId,C=(U,Q,B)=>{U.innerHTML="",Q.forEach(S=>{const A=document.createElement("option");A.value=S.deviceId,A.textContent=S.label||`Device ${S.deviceId.slice(0,8)}`,S.deviceId===B&&(A.selected=!0),U.appendChild(A)})};C(this._els.selectCamera,g,d),C(this._els.selectMic,v,w);const k=this._els.selectSpeaker;m.length>0&&typeof this._els.remoteVideo.setSinkId=="function"?(C(k,m,null),k.disabled=!1):(k.innerHTML="<option>Not supported in this browser</option>",k.disabled=!0)}async _applyDeviceSelection(){const e=this._els.selectCamera.value,t=this._els.selectMic.value,n=this._els.selectSpeaker.value;try{if(e&&this._media&&this._engine){const i=await this._media.switchCamera(e);await this._engine.replaceTrack("video",i),this._localCamerasVisible&&this._renderLocalCameras()}}catch(i){this._handleError("DEVICE_SWITCH_FAILED",i)}try{if(t&&this._media&&this._engine){const i=await this._media.switchMicrophone(t);await this._engine.replaceTrack("audio",i),this._startVAD()}}catch(i){this._handleError("DEVICE_SWITCH_FAILED",i)}try{n&&typeof this._els.remoteVideo.setSinkId=="function"&&await this._els.remoteVideo.setSinkId(n)}catch(i){console.warn("[xoip-call] setSinkId failed:",i)}this._closeDevicePanel(),this._showTooltip("Devices applied",this._els.devicesBtn)}_startMicLevel(){var e;this._stopMicLevel();const t=(e=this._media)==null?void 0:e.primaryStream;if(t)try{const n=this._vadAudioCtx??new AudioContext;this._vadAudioCtx=n;const i=n.createMediaStreamSource(t),a=n.createAnalyser();a.fftSize=256,i.connect(a);const r=new Uint8Array(a.frequencyBinCount),s=()=>{a.getByteFrequencyData(r);const l=r.reduce((u,g)=>u+g,0)/r.length,p=Math.min(100,l/128*100);this._els.micLevelFill&&(this._els.micLevelFill.style.width=`${p}%`),this._micLevelRafId=requestAnimationFrame(s)};this._micLevelRafId=requestAnimationFrame(s)}catch(n){console.warn("[xoip-call] Mic level visualizer error:",n)}}_stopMicLevel(){this._micLevelRafId&&(cancelAnimationFrame(this._micLevelRafId),this._micLevelRafId=null),this._els.micLevelFill&&(this._els.micLevelFill.style.width="0%")}async _togglePiP(){this._pipActive?await this.exitPiP():await this.enterPiP()}async enterPiP(){var e;const t=this._els.pipSelfView,n=this._els.pipSelfVideo;if(!t||!n)return;const i=(e=this._media)==null?void 0:e.primaryStream;i&&i.getVideoTracks().length?(n.srcObject=i,n.play().catch(()=>{}),t.classList.remove("hidden"),this._pipActive=!0,this._els.pipBtn&&(this._els.pipBtn.classList.add("pip-active"),this._els.pipBtn.title="Hide Self View")):this._showTooltip("No local camera",this._els.pipBtn)}async exitPiP(){const e=this._els.pipSelfView,t=this._els.pipSelfVideo;e&&e.classList.add("hidden"),t&&(t.srcObject=null),this._pipActive=!1,this._els.pipBtn&&(this._els.pipBtn.classList.remove("pip-active"),this._els.pipBtn.title="Picture-in-Picture")}_setupPipSelfView(){const e=this._els.pipSelfView;if(!e)return;let t=!1,n=0,i=0,a=0,r=0;const s=()=>this._els.mainVideoArea,l=()=>{t=!1};e.addEventListener("pointerdown",p=>{if(p.target.closest(".pip-close-btn"))return;t=!0,n=p.clientX,i=p.clientY;const u=e.getBoundingClientRect(),g=s(),v=g==null?void 0:g.getBoundingClientRect();v&&(a=u.left-v.left,r=v.bottom-u.bottom,e.style.left=a+"px",e.style.bottom=r+"px",e.style.right="auto",e.style.top="auto",e.setPointerCapture(p.pointerId),p.preventDefault())}),e.addEventListener("pointermove",p=>{if(!t)return;const u=p.clientX-n,g=p.clientY-i,v=s(),m=v==null?void 0:v.getBoundingClientRect();if(!m)return;const d=e.offsetWidth,w=e.offsetHeight;let C=Math.max(0,Math.min(a+u,m.width-d)),k=Math.max(0,Math.min(r-g,m.height-w));e.style.left=C+"px",e.style.bottom=k+"px"}),e.addEventListener("pointerup",l),e.addEventListener("pointercancel",l)}_startVAD(){var e,t;this._stopVAD();const n=parseInt(this.getAttribute("vad-threshold")??"15",10);try{const i=this._vadAudioCtx??new(window.AudioContext||window.webkitAudioContext);this._vadAudioCtx=i;const a=(e=this._media)==null?void 0:e.primaryStream;if(a!=null&&a.getAudioTracks().length){const u=i.createMediaStreamSource(a),g=i.createAnalyser();g.fftSize=512,g.smoothingTimeConstant=.6,u.connect(g),this._vadAnalyserLocal=g}const r=(t=this._els.remoteVideo)==null?void 0:t.srcObject;r instanceof MediaStream&&r.getAudioTracks().length>0&&this._attachRemoteVAD(r);let s=null,l=null;const p=()=>{var u,g;if(this._vadAnalyserLocal){s&&s.length===this._vadAnalyserLocal.frequencyBinCount||(s=new Uint8Array(this._vadAnalyserLocal.frequencyBinCount)),this._vadAnalyserLocal.getByteFrequencyData(s);const v=s.reduce((m,d)=>m+d,0)/s.length;this._updateLocalSpeaking(v>n)}else this._updateLocalSpeaking(!1);if(this._vadAnalyserRemote){l&&l.length===this._vadAnalyserRemote.frequencyBinCount||(l=new Uint8Array(this._vadAnalyserRemote.frequencyBinCount)),this._vadAnalyserRemote.getByteFrequencyData(l);const v=l.reduce((d,w)=>d+w,0)/l.length,m=v>n;if(this._updateRemoteSpeaking(m),this._els.remoteLevelFill){const d=Math.min(100,Math.max(0,Math.round(v/90*100)));this._els.remoteLevelFill.style.height=`${d}%`,(u=this._els.remoteLevelMeter)==null||u.classList.toggle("active",v>Math.max(3,n/3))}}else this._updateRemoteSpeaking(!1),this._els.remoteLevelFill&&(this._els.remoteLevelFill.style.height="0%",(g=this._els.remoteLevelMeter)==null||g.classList.remove("active"));this._vadRafId=requestAnimationFrame(p)};this._vadRafId=requestAnimationFrame(p)}catch(i){console.warn("[xoip-call] VAD init error:",i)}}_attachRemoteVAD(e){if(e&&e instanceof MediaStream&&e.getAudioTracks().length)try{this._vadAudioCtx||(this._vadAudioCtx=new(window.AudioContext||window.webkitAudioContext));const t=this._vadAudioCtx,n=t.createMediaStreamSource(e),i=t.createAnalyser();i.fftSize=512,i.smoothingTimeConstant=.6,n.connect(i),this._vadAnalyserRemote=i}catch(t){console.warn("[xoip-call] Remote VAD attach error:",t)}}_stopVAD(){var e;this._vadRafId&&(cancelAnimationFrame(this._vadRafId),this._vadRafId=null),this._vadAnalyserLocal=null,this._vadAnalyserRemote=null,this._els.remoteLevelFill&&(this._els.remoteLevelFill.style.height="0%",(e=this._els.remoteLevelMeter)==null||e.classList.remove("active")),this._updateLocalSpeaking(!1),this._updateRemoteSpeaking(!1)}_updateLocalSpeaking(e){var t,n;e!==this._vadLocalActive&&(this._vadLocalActive=e,(t=this._els.localCameras)==null||t.classList.toggle("speaking",e),this._pipActive&&((n=this._els.pipSelfView)==null||n.classList.toggle("speaking",e)),this._emit(e?"speaking-start":"speaking-stop",{source:"local"}))}_updateRemoteSpeaking(e){var t,n,i,a;e!==this._vadRemoteActive&&(this._vadRemoteActive=e,(t=this._els.mainVideoArea)==null||t.classList.toggle("speaking",e),(n=this._els.audioAvatar)==null||n.classList.toggle("speaking",e),(i=this._els.speakingRingRemote)==null||i.classList.toggle("active",e),this._audioOnlyMode&&((a=this._els.audioWaveRemote)==null||a.classList.toggle("active",e)),this._emit(e?"speaking-start":"speaking-stop",{source:"remote"}))}setAudioOnlyMode(e){this._audioOnlyMode=e;const t=this._els.audiomodeBtn,n=this._els.audioAvatar,i=this._els.remoteVideo;e?(n==null||n.classList.remove("hidden"),i&&(i.style.opacity="0"),t==null||t.classList.add("audiomode-active"),t&&(t.title="Disable Audio-Only Mode"),this.setVideoMute(!0)):(n==null||n.classList.add("hidden"),i&&(i.style.opacity=""),t==null||t.classList.remove("audiomode-active"),t&&(t.title="Audio-Only Mode"))}_openQrModal(){const e=this._buildShareUrl();if(!e)return void this._showTooltip("No room to share",this._els.qrBtn);this._els.qrUrl.textContent=e,this._els.qrContainer.innerHTML="";const t=this._generateQrCanvas(e);this._els.qrContainer.appendChild(t),this._els.qrModal.classList.remove("hidden")}_closeQrModal(){var e;(e=this._els.qrModal)==null||e.classList.add("hidden")}_generateQrCanvas(e){const t=document.createElement("canvas");if(new TextEncoder().encode(e).length>270){t.style.display="none";const l=document.createElement("textarea");return l.readOnly=!0,l.value=e,l.style.cssText="width:100%;height:80px;font-size:11px;border:1px solid #334155;background:#0f172a;color:#f8fafc;resize:none;outline:none;font-family:monospace;padding:8px;border-radius:6px",this._els.qrContainer.appendChild(l),t}const n=this._buildQrMatrix(e);if(!n)return t.width=200,t.height=200,t;const i=n.length,a=Math.max(3,Math.floor(220/(i+4))),r=(i+4)*a;t.width=r,t.height=r,t.style.maxWidth="100%",t.style.height="auto";const s=t.getContext("2d");s.fillStyle="#ffffff",s.fillRect(0,0,r,r),s.fillStyle="#0f172a";for(let l=0;l<i;l++)for(let p=0;p<i;p++)n[l][p]&&s.fillRect((p+2)*a,(l+2)*a,a,a);return t}_buildQrMatrix(e){try{return this._qrGenerate(e,"L")}catch(t){return console.warn("[xoip-call] QR generation failed:",t),null}}_qrGenerate(e,t="L"){const n=new Uint8Array(256),i=new Uint8Array(256);for(let c=0,h=1;c<255;c++)n[c]=h,i[h]=c,h=h<<1^(h>=128?285:0);n[255]=n[0];const a=(c,h)=>c&&h?n[(i[c]+i[h])%255]:0,r=(c,h)=>{const x=((K,Y)=>{let I=[1];for(let F=0;F<Y;F++){const Z=new Uint8Array(I.length+1);for(let L=0;L<I.length;L++)Z[L]^=a(I[L],n[F]),Z[L+1]^=I[L];I=Array.from(Z)}return I})(0,h),y=new Uint8Array(h);for(const K of c){const Y=K^y[0];y.copyWithin(0,1),y[h-1]=0;for(let I=0;I<h;I++)y[I]^=a(x[I+1],Y)}return y},s=[null,[1,19,7,1],[2,34,10,1],[3,55,15,1],[4,80,20,2],[5,108,26,2],[6,136,18,2],[7,156,20,4],[8,194,24,2],[9,232,30,3],[10,274,18,4]],l=Array.from(new TextEncoder().encode(e)),p=l.length;let u=s.findIndex((c,h)=>h>0&&c&&c[1]>=p+2);if(u<0)return null;const[,g,v,m]=s[u],d=17+4*u,w=new Uint8Array(g);w[0]=64,w[0]|=p>>4&15,w[1]=(15&p)<<4|l[0]>>4&15;for(let c=0;c<p-1;c++)w[2+c]=(15&l[c])<<4|l[c+1]>>4&15;w[2+p-1]=(15&l[p-1])<<4;let C=3+p-1;const k=[236,17];for(let c=0;C<g;C++,c++)w[C]=k[c%2];const U=v,Q=Math.floor(g/m),B=[],S=[],A=[];for(let c=0;c<m;c++){const h=c*Q,x=c===m-1?g:h+Q,y=w.slice(h,x);S.push(y),A.push(r(y,U))}const pe=Math.max(...S.map(c=>c.length));for(let c=0;c<pe;c++)for(const h of S)c<h.length&&B.push(h[c]);for(let c=0;c<U;c++)for(const h of A)B.push(h[c]);const V=[];for(const c of B)for(let h=7;h>=0;h--)V.push(c>>h&1);const he=[0,7,7,7,7,7,0,0,0,0];for(let c=0;c<he[u];c++)V.push(0);const O=Array.from({length:d},()=>new Array(d).fill(null)),H=Array.from({length:d},()=>new Array(d).fill(!1)),R=(c,h,x,y=!1)=>{c<0||c>=d||h<0||h>=d||(O[c][h]=x,y&&(H[c][h]=!0))},G=(c,h)=>{for(let x=-1;x<=7;x++)for(let y=-1;y<=7;y++)R(c+x,h+y,x>=0&&x<=6&&y>=0&&y<=6&&(x===0||x===6||y===0||y===6||x>=2&&x<=4&&y>=2&&y<=4),!0)};G(0,0),G(0,d-7),G(d-7,0);for(let c=8;c<d-8;c++)R(6,c,c%2==0,!0),R(c,6,c%2==0,!0);R(d-8,8,!0,!0);const q=[1,1,1,0,1,1,1,1,1,0,0,0,1,0,0],X=[[8,0],[8,1],[8,2],[8,3],[8,4],[8,5],[8,7],[8,8],[7,8],[5,8],[4,8],[3,8],[2,8],[1,8],[0,8]],P=[[d-1,8],[d-2,8],[d-3,8],[d-4,8],[d-5,8],[d-6,8],[d-7,8],[8,d-8],[8,d-7],[8,d-6],[8,d-5],[8,d-4],[8,d-3],[8,d-2],[8,d-1]];for(let c=0;c<15;c++)R(X[c][0],X[c][1],q[c]===1,!0),P[c]&&R(P[c][0],P[c][1],q[c]===1,!0);let J=0,M=!0;for(let c=d-1;c>=1;c-=2){c===6&&(c=5);for(let h=M?d-1:0;M?h>=0:h<d;h+=M?-1:1)for(let x=0;x<2;x++){const y=c-x;if(!H[h][y]){const K=J<V.length?V[J++]:0;R(h,y,((h+y)%2==0?1^K:K)===1)}}M=!M}for(let c=0;c<d;c++)for(let h=0;h<d;h++)O[c][h]===null&&(O[c][h]=!1);return O}_handleError(e,t){console.error(`[xoip-call] Error [${e}]:`,t),this._emit("error",{code:e,message:t==null?void 0:t.message,error:t})}_emit(e,t={}){this.dispatchEvent(new CustomEvent(e,{detail:t,bubbles:!0,composed:!0}))}}class Be{async announce(e){throw new Error("[DiscoveryProvider] announce() must be implemented")}async resolve(e){throw new Error("[DiscoveryProvider] resolve() must be implemented")}async remove(e){throw new Error("[DiscoveryProvider] remove() must be implemented")}async connect(){}async close(){}static createAnnouncement({roomId:e,signalingType:t,token:n,endpoint:i,ttlSeconds:a=300}){return{v:1,room:e,signaling:{type:t,...i&&{endpoint:i},...n&&{token:n}},expires:Math.floor(Date.now()/1e3)+a}}static isExpired(e){return!(e!=null&&e.expires)||Math.floor(Date.now()/1e3)>=e.expires}}const Me="https://api.nostr.watch/v1/online",Ke=["wss://greenart7c3.feeds.relay.tools/","wss://relay.primal.net","wss://relay.damus.io","wss://nos.lol","wss://nostr.mom","wss://relay.nostr.band"];class Qe extends Be{constructor(e={}){super(),this._configuredRelays=e.configuredRelays??["wss://greenart7c3.feeds.relay.tools/","wss://relay.primal.net","wss://relay.damus.io","wss://nos.lol"],this._candidateRelays=e.candidateRelays??Ke,this._selectCount=e.selectCount??5,this._nostrWatchApiUrl=e.nostrWatchApiUrl??Me,this._discoveryTimeoutMs=e.discoveryTimeoutMs??2e3,this._enableHttpFetch=e.enableHttpFetch??(typeof window>"u"||!!e.nostrWatchApiUrl),this._cachedRelays=null,this._cacheExpiresAt=0,this._cacheTtlMs=3e5}async announce(e){console.warn("[NostrRelayDiscovery] announce() is not implemented in relay discovery. Use NostrSignalingAdapter.")}async resolve(e){return null}async remove(e){}async discoverRelays(){if(this._cachedRelays&&Date.now()<this._cacheExpiresAt)return console.log("[NostrRelayDiscovery] Using cached relays."),this._cachedRelays.map(e=>e.url);try{const e=await Promise.race([this._runDiscoveryPipeline(),Oe(this._discoveryTimeoutMs,"Discovery timeout")]);return this._cachedRelays=e,this._cacheExpiresAt=Date.now()+this._cacheTtlMs,console.log(`[NostrRelayDiscovery] Selected ${e.length} relays.`),e.map(t=>t.url)}catch(e){return console.warn(`[NostrRelayDiscovery] Discovery failed (${e.message}). Falling back to configured relays.`),this._configuredRelays}}async _runDiscoveryPipeline(){let e=[];if(this._enableHttpFetch&&this._nostrWatchApiUrl)try{const[r]=await Promise.allSettled([this._fetchNostrWatchRelays()]);r.status==="fulfilled"&&(e=r.value)}catch{e=[]}const t=[...this._configuredRelays,...this._candidateRelays||[],...e].map(r=>Ve(r)).filter(Boolean),n=[...new Set(t)];console.log(`[NostrRelayDiscovery] Candidates: ${n.length} (configured: ${this._configuredRelays.length}, candidates: ${(this._candidateRelays||[]).length}, discovered: ${e.length})`);const i=(await Promise.allSettled(n.map(r=>this._checkRelayHealth(r)))).filter(r=>r.status==="fulfilled"&&r.value!==null).map(r=>r.value);console.log(`[NostrRelayDiscovery] Healthy relays: ${i.length}/${n.length}`),i.sort((r,s)=>r.latency-s.latency);const a=i.slice(0,this._selectCount);return a.length===0?this._configuredRelays.map(r=>({url:r,latency:1/0,readable:!0,writable:!0})):a}async _fetchNostrWatchRelays(){if(!this._nostrWatchApiUrl||!this._enableHttpFetch)return[];const e=new AbortController,t=setTimeout(()=>e.abort(),this._discoveryTimeoutMs);try{const n=await fetch(this._nostrWatchApiUrl,{signal:e.signal,headers:{Accept:"application/json"}});if(!n.ok)throw new Error(`nostr.watch HTTP ${n.status}`);const i=await n.json();return Array.isArray(i)?i.filter(a=>typeof a=="string"):Array.isArray(i.relays)?i.relays.filter(a=>typeof a=="string"):Array.isArray(i.online)?i.online.filter(a=>typeof a=="string"):[]}catch(n){throw n.name==="AbortError"?new Error("nostr.watch request timed out"):n}finally{clearTimeout(t)}}async _checkRelayHealth(e){return new Promise(t=>{const n=Date.now();let i=!1,a=null;const r=l=>{if(!i){if(i=!0,clearTimeout(s),a){a.onopen=null,a.onerror=null,a.onclose=null;try{a.close()}catch{}}t(l)}},s=setTimeout(()=>{r(null)},1200);try{a=new WebSocket(e)}catch{return void r(null)}a.onopen=()=>{const l=Date.now()-n;r({url:e,latency:l,readable:!0,writable:!0})},a.onerror=()=>{r(null)},a.onclose=()=>{r(null)}})}}function Ve(o){return o&&typeof o=="string"?(o=o.trim()).startsWith("ws://")?o.replace("ws://","wss://"):o.startsWith("wss://")?o:o.startsWith("http://")?o.replace("http://","wss://"):o.startsWith("https://")?o.replace("https://","wss://"):o.includes("://")?null:`wss://${o}`:null}function Oe(o,e="Timeout"){return new Promise((t,n)=>setTimeout(()=>n(new Error(e)),o))}typeof customElements>"u"||customElements.get("xoip-call")||customElements.define("xoip-call",Ue);const _=document.getElementById("xoip"),le=document.getElementById("event-log-list")||document.getElementById("event-log"),ce=document.getElementById("uri-input"),Ne=document.getElementById("uri-display"),Ge=document.getElementById("uri-text"),Pe=document.getElementById("uri-timestamp"),T=document.getElementById("btn-copy-uri"),ee=document.getElementById("btn-clear-log");ee&&ee.addEventListener("click",()=>{le.innerHTML=""});const Ye=new Qe({configuredRelays:["wss://greenart7c3.feeds.relay.tools/","wss://relay.primal.net","wss://relay.damus.io","wss://nos.lol"],selectCount:3,discoveryTimeoutMs:2e3});let D="";function b(o,e){const t=document.createElement("div");t.className="entry";const n=new Date().toLocaleTimeString("en",{hour12:!1});t.innerHTML=`<span style="color:#64748b">[${n}]</span> <span class="ev-name">${o}</span> <span class="ev-detail">${JSON.stringify(e)}</span>`,le.prepend(t)}function N(o){D=o,ce.value=o,Ge.textContent=o,Pe.textContent=new Date().toLocaleTimeString(),Ne.style.display="flex",T.disabled=!1}async function de(){const o=document.getElementById("relays-status-text"),e=document.getElementById("badge-relays");o&&(o.textContent="🔍 Checking relays (Health Check)..."),b("discovery-pipeline",{action:"start",timeoutMs:2e3});try{const t=await Ye.discoverRelays();return(!_._callState||_._callState==="idle")&&_.setAttribute("signaling-config",JSON.stringify({relays:t})),o&&(o.innerHTML=`<span style="color:#34d399; font-weight:600;">✓ Active (${t.length}):</span> `+t.map(n=>`<span style="color:#e2e8f0; background:#1e293b; padding:2px 6px; border-radius:4px; font-family:monospace; font-size:11px;">${n.replace("wss://","")}</span>`).join(" ")),e&&(e.textContent=`⚡ Relays: ${t.length} active`,e.className="badge badge-green"),b("discovery-pipeline",{status:"healthy",relays:t}),t}catch(t){return console.warn("[Discovery] Failed, fallback to configured:",t),b("⚠️ discovery-fallback",{message:t.message}),o&&(o.textContent="Using default relays (fallback)"),null}}const Fe=decodeURIComponent(window.location.hash||""),Ze=decodeURIComponent(window.location.search||""),We=Fe.includes("xoip://")||Ze.includes("xoip://");if(!We)de();else{const o=document.getElementById("relays-status-text"),e=document.getElementById("badge-relays");o&&(o.textContent="Using relays from incoming URI"),e&&(e.textContent="🔗 Peer Mode",e.className="badge badge-green")}document.getElementById("btn-discover-relays").addEventListener("click",async()=>{await de()});document.getElementById("btn-create-uri").addEventListener("click",async()=>{try{b("uri-creating",{type:"nostr"}),await _.createRoom()}catch(o){b("❌ create-failed",{message:o.message})}});document.getElementById("btn-connect-uri").addEventListener("click",async()=>{const o=ce.value.trim();if(!o){alert("Please paste a xoip:// URI into the input field!");return}try{b("uri-connecting",{uri:o.slice(0,35)+"..."}),N(o),await _.connect(o)}catch(e){b("❌ connect-failed",{message:e.message}),alert("Connection error via URI: "+e.message)}});T.addEventListener("click",async()=>{if(!D)return;await navigator.clipboard.writeText(D),b("📋 copied-uri",{uri:D.slice(0,35)+"..."});const o=T.textContent;T.textContent="✅ Copied!",setTimeout(()=>{T.textContent=o},2e3)});document.getElementById("btn-open-peer").addEventListener("click",()=>{var t;const o=D||((t=_._xoipSession)==null?void 0:t.shareURI);let e=`${location.origin}${location.pathname}`;o&&(e+=`#uri=${encodeURIComponent(o)}`),window.open(e,"_blank"),b("👥 open-peer-tab",{targetUrl:e.slice(0,40)+"..."})});document.getElementById("btn-send-ping").addEventListener("click",()=>{const o={type:"ping",text:"Hello from Nostr peer via xoip:// URI!",timestamp:Date.now()};try{_.sendData(o),b("📤 sent-data",o)}catch(e){b("❌ send-failed",{message:e.message})}});window.addEventListener("DOMContentLoaded",async()=>{let o=null;if(window.location.hash){const e=window.location.hash.slice(1);if(e.startsWith("xoip://"))o=decodeURIComponent(e);else try{const t=new URLSearchParams(e),n=t.get("uri")||t.get("src");n&&n.startsWith("xoip://")&&(o=n)}catch{}}if(!o){const e=new URLSearchParams(window.location.search),t=e.get("uri")||e.get("src");t&&t.startsWith("xoip://")&&(o=t)}o&&(b("🔗 auto-detected-uri",{uri:o.slice(0,35)+"..."}),N(o),setTimeout(()=>{_.connect(o).catch(e=>{b("❌ auto-connect-failed",{message:e.message})})},100))});_.addEventListener("room-created",({detail:o})=>{var t;const e=o.shareURI||((t=_._xoipSession)==null?void 0:t.shareURI);e&&N(e),b("room-created",{roomId:`${o.roomId.slice(0,16)}...`,hasURI:!!e}),console.log("[xoip-demo] Nostr Room created. shareURI:",e)});_.addEventListener("room-joined",({detail:o})=>{const e=o.uri||D;e&&N(e),b("room-joined",{roomId:`${o.roomId.slice(0,16)}...`}),console.log("[xoip-demo] Joined Nostr room:",o.roomId)});_.addEventListener("remote-stream-ready",({detail:o})=>{var e,t,n;b("remote-stream-ready",{trackId:(e=o.track)==null?void 0:e.id,kind:(t=o.track)==null?void 0:t.kind}),console.log("[xoip-demo] Remote stream track ready:",(n=o.track)==null?void 0:n.kind)});_.addEventListener("channel-message",({detail:o})=>{b("channel-message",o.data),console.log("[xoip-demo] DataChannel message received:",o.data)});_.addEventListener("network-quality",({detail:o})=>{b("network-quality",{rtt:o.rtt,loss:`${o.packetLoss}%`,quality:o.quality})});_.addEventListener("call-ended",({detail:o})=>{b("call-ended",o),D="",T.disabled=!0,console.log("[xoip-demo] Call ended:",o.reason)});_.addEventListener("error",({detail:o})=>{b("❌ error",{code:o.code,msg:o.message}),console.error("[xoip-demo] Error:",o)});export{_e as a,oe as b,j as c,Ce as d};
