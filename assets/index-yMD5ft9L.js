const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./firebase-adapter-By9Gq8uh.js","./signaling-interface-Bi08jIxW.js","./p2p-adapter-DTUzgtcg.js","./websocket-adapter-B2lcr0zo.js"])))=>i.map(i=>d[i]);
(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))n(i);new MutationObserver(i=>{for(const s of i)if(s.type==="childList")for(const a of s.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&n(a)}).observe(document,{childList:!0,subtree:!0});function t(i){const s={};return i.integrity&&(s.integrity=i.integrity),i.referrerPolicy&&(s.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?s.credentials="include":i.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function n(i){if(i.ep)return;i.ep=!0;const s=t(i);fetch(i.href,s)}})();const ye="webrtc_qos_channel",x={LOW:0,NORMAL:1,HIGH:2,CRITICAL:3},ee={"ice.failed":x.CRITICAL,"qos.congestion":x.CRITICAL,"candidate.changed":x.HIGH,"policy.updated":x.HIGH,"telemetry.summary":x.NORMAL,"statistics.persist":x.LOW};function V(){return typeof crypto<"u"&&typeof crypto.randomUUID=="function"?crypto.randomUUID():"uuid-"+Date.now()+"-"+Math.random().toString(36).substring(2,15)}class fe{constructor(e={}){this._logInProgress=!1,this.channelName=e.channelName||"worker-event-bus",this.allowedTopics=e.allowedTopics||null,this.maxPayloadSize=e.maxPayloadSize||65536,this.absoluteMaxPayloadSize=262144,this.maxCacheSize=e.maxCacheSize||1e3,this.sourceName=e.sourceName||(typeof window>"u"?"worker-"+V().substring(0,8):"main-thread"),typeof BroadcastChannel<"u"?(this.channel=new BroadcastChannel(this.channelName),this.channel.onmessage=t=>this._onChannelMessage(t.data)):(console.warn("[WorkerEventBus] BroadcastChannel is not supported in this environment."),this.channel=null),this.subscriptions=new Map,this.replayCache=new Map,this.pendingRequests=new Map,this.serviceRegistry=new Map,this.incomingQueue={[x.CRITICAL]:[],[x.HIGH]:[],[x.NORMAL]:[],[x.LOW]:[]},this.queueProcessing=!1,this.heartbeatInterval=null,e.enableHeartbeat!==!1&&this._startHeartbeat()}_matchTopic(e,t){if(e==="*"||e==="**")return!0;if(!e.includes("*"))return e===t;const n="^"+e.replace(/\./g,"\\.").replace(/\*\*/g,".*").replace(/\*/g,"[^.]+")+"$";try{return new RegExp(n).test(t)}catch{return!1}}_log(e,t,n={}){if(this._logInProgress)console.warn(`[WorkerEventBus] Re-entrant log prevented for level ${e}`);else{this._logInProgress=!0;try{const i=`system.${e}`,s={text:t,...n};this._publishRaw(i,s,{priority:x.LOW,skipAudit:!0})}finally{this._logInProgress=!1}}}_validateMessage(e){if(!e||typeof e!="object"||typeof e.id!="string"||typeof e.topic!="string"||e.topic.length>128||typeof e.timestamp!="number"||e.payload===void 0)return!1;if(!e.topic.startsWith("system.")){if(this.allowedTopics&&!this.allowedTopics.some(t=>this._matchTopic(t,e.topic)))return!1;try{if(new TextEncoder().encode(JSON.stringify(e.payload)).length>Math.min(this.maxPayloadSize,this.absoluteMaxPayloadSize))return!1}catch{return!1}}return!0}publish(e,t,n={}){return this._publishRaw(e,t,n)}_publishRaw(e,t,n={}){const i=n.priority!==void 0?n.priority:ee[e]!==void 0?ee[e]:x.NORMAL,s={id:V(),type:n.type||"event",topic:e,source:this.sourceName,timestamp:Date.now(),payload:t,priority:i};if(n.replyTo&&(s.replyTo=n.replyTo),n.requestId&&(s.requestId=n.requestId),!this._validateMessage(s))return this._log("error",`Message validation failed for topic: ${e}`),null;if(n.skipAudit||e.startsWith("system.")||this._log("log",`Published to topic: ${e}`,{msgId:s.id,priority:i}),this._enqueueMessage(s),this.channel)try{this.channel.postMessage(s)}catch(a){this._log("error",`Failed to broadcast message: ${a.message}`,{topic:e})}return s.id}subscribe(e,t,n={}){const i=V();this.subscriptions.set(i,{topicPattern:e,handler:t,options:n}),this._log("log",`Subscribed to topic pattern: ${e}`,{subscriptionId:i});for(const[s,a]of this.replayCache.entries())this._matchTopic(e,s)&&setTimeout(()=>{this._deliverMessageToSubscriber(a,t)},0);return i}unsubscribe(e){if(this.subscriptions.has(e)){const t=this.subscriptions.get(e);return this.subscriptions.delete(e),this._log("log",`Unsubscribed from topic pattern: ${t.topicPattern}`,{subscriptionId:e}),!0}return!1}async request(e,t,n={}){const i=V(),s=n.timeout||5e3;return new Promise((a,r)=>{const l=setTimeout(()=>{this.pendingRequests.delete(i),this._log("warn",`Request to topic ${e} timed out after ${s}ms`,{requestId:i}),r(new Error(`Request timed out after ${s}ms`))},s);this.pendingRequests.set(i,{resolve:a,reject:r,timeoutId:l}),this._log("log",`Sending request to topic: ${e}`,{requestId:i}),this._publishRaw(e,t,{...n,type:"request",replyTo:i})})}reply(e,t){this._log("log",`Replying to request: ${e}`),this._publishRaw(`reply.${e}`,t,{type:"response",requestId:e})}_onChannelMessage(e){e&&typeof e=="object"&&e.source!==this.sourceName&&typeof e.topic=="string"&&this._enqueueMessage(e)}_enqueueMessage(e){if(!e||typeof e.topic!="string")return;const t=e.priority!==void 0?e.priority:x.NORMAL;(this.incomingQueue[t]||this.incomingQueue[x.NORMAL]).push(e),e.type!=="event"||e.topic.startsWith("system.")||e.topic.startsWith("reply.")||this._updateReplayCache(e.topic,e),this._scheduleQueueProcessing()}_updateReplayCache(e,t){if(this.replayCache.has(e))this.replayCache.delete(e);else if(this.replayCache.size>=this.maxCacheSize){const n=this.replayCache.keys().next().value;this.replayCache.delete(n)}this.replayCache.set(e,t)}_scheduleQueueProcessing(){this.queueProcessing||(this.queueProcessing=!0,queueMicrotask(()=>this._processQueue()))}_processQueue(){const e=[x.CRITICAL,x.HIGH,x.NORMAL,x.LOW];for(;;){let t=null;for(const n of e)if(this.incomingQueue[n].length>0){t=this.incomingQueue[n].shift();break}if(!t)break;this._handleIncomingMessage(t)}this.queueProcessing=!1}_handleIncomingMessage(e){if(e&&typeof e.topic=="string"){if(e.type==="response"&&e.requestId){const t=this.pendingRequests.get(e.requestId);return void(t&&(clearTimeout(t.timeoutId),this.pendingRequests.delete(e.requestId),this._log("log",`Received response for request: ${e.requestId}`),t.resolve(e.payload)))}(e.topic==="worker.online"||e.topic.startsWith("service."))&&this._handleServiceDiscovery(e);for(const[t,n]of this.subscriptions.entries())e.topic.startsWith("system.")&&!(n.topicPattern==="system.*"||n.topicPattern==="**"||n.topicPattern.startsWith("system."))||this._matchTopic(n.topicPattern,e.topic)&&this._deliverMessageToSubscriber(e,n.handler)}}async _deliverMessageToSubscriber(e,t){try{const n=t(e);e.type==="request"&&e.replyTo&&(n instanceof Promise?n.then(i=>this.reply(e.replyTo,i)).catch(i=>{this._log("error",`Request handler promise failed: ${i.message}`,{requestId:e.replyTo}),this.reply(e.replyTo,{error:i.message})}):n!==void 0&&this.reply(e.replyTo,n))}catch(n){this._log("error",`Subscriber error on topic ${e.topic}: ${n.message}`,{topic:e.topic,stack:n.stack})}}_handleServiceDiscovery(e){if(e.topic==="worker.online"){const t=e.payload||{};t.serviceName&&(this.serviceRegistry.set(t.serviceName,{source:e.source,timestamp:e.timestamp,...t}),this._log("log",`Service registered: ${t.serviceName}`,{serviceName:t.serviceName}))}else if(e.topic==="worker.offline"){const t=e.payload||{};t.serviceName&&(this.serviceRegistry.delete(t.serviceName),this._log("log",`Service unregistered: ${t.serviceName}`,{serviceName:t.serviceName}))}else if(e.topic.startsWith("service.")&&e.topic.endsWith(".online")){const t=e.topic.replace(/^service\./,"").replace(/\.online$/,"");this.serviceRegistry.set(t,{source:e.source,timestamp:e.timestamp,...e.payload}),this._log("log",`Service discovered: ${t}`,{serviceName:t})}}_startHeartbeat(){setTimeout(()=>{this.publish("worker.online",{serviceName:this.sourceName.startsWith("worker-")?this.sourceName:null,type:typeof window>"u"?"worker":"main"})},100),this.heartbeatInterval=setInterval(()=>{this.publish("worker.heartbeat",{source:this.sourceName,timestamp:Date.now()})},3e4)}close(){this.heartbeatInterval&&clearInterval(this.heartbeatInterval),this.publish("worker.offline",{serviceName:this.sourceName.startsWith("worker-")?this.sourceName:null}),this.channel&&this.channel.close();for(const[e,t]of this.pendingRequests.entries())clearTimeout(t.timeoutId),t.reject(new Error("EventBus closed"));this.pendingRequests.clear()}}class be{constructor(e,t=null,n={}){this.pc=e,this.sessionId=t||`session_${Date.now()}_${Math.floor(1e3*Math.random())}`,this.timer=null,this.decisionEngineEnabled=n.decisionEngineEnabled!==!1,this.monitorInbound=n.monitorInbound!==!1,this.controlChannel=n.controlChannel||null,this.bitrate=15e5,this.framerate=30,this.resolutionScale=1,this._nextInterval=2e3,this.minBitrate=15e4,this.maxBitrate=4e6,this._lastMetrics=null,this._lastInbound=null,this._lastAction={type:"MAINTAIN"},this._lastLLMExplanation=null,this._lastLLMStatus={state:"idle",message:"Waiting for Local LLM activity..."},this._isApplyingAction=!1,this.broadcast=new BroadcastChannel(ye),this.workers=[],this._workerActive=!1,this._initWorkers(),this.eventBus=new fe({sourceName:"main-thread",allowedTopics:["*"]}),this._setupSubscriptions()}_initWorkers(){console.log("[QoS] Initializing workers…");try{const e=n=>{let i=new URL(n,import.meta.url).href;return i.includes("/.vite/deps/")&&(i=i.replace("/.vite/deps/","/@vcomm/xoip-qos/dist/")),new Worker(i,{type:"module"})};this.qosWorker=e("./workers/qos-worker.js"),this.aiWorker=e("./workers/ai-worker.js"),this.iceWorker=e("./workers/ice-worker.js"),this.historyWorker=e("./workers/history-worker.js");const t=["qos","ai","ice","history"];[this.qosWorker,this.aiWorker,this.iceWorker,this.historyWorker].forEach((n,i)=>{n.onerror=s=>console.error(`[QoS] ${t[i]}-worker error:`,s.message||s.filename||s)}),this.workers=[this.qosWorker,this.aiWorker,this.iceWorker,this.historyWorker],this._workerActive=!0}catch(e){console.error("[QoS] Failed to initialize workers:",e),this._workerActive=!1}}_setupSubscriptions(){this.eventBus.subscribe("telemetry.summary",t=>{const n=t.payload;n&&(this._lastMetrics=n,n.inbound&&(this._lastInbound=n.inbound),this._broadcastToDashboard(n,this._lastAction))});const e=t=>{const n=t.payload||{};this._lastLLMStatus={state:n.state||(n.loaded?"ready":"idle"),progress:n.progress,message:n.message},this._broadcastToDashboard(this._lastMetrics,this._lastAction)};this.eventBus.subscribe("llm.status",e),this.eventBus.subscribe("qos.llm.status",e),this.eventBus.subscribe("qos.llm.response",()=>{this._lastLLMStatus={state:"ready",message:"Local LLM response received."},this._broadcastToDashboard(this._lastMetrics,this._lastAction)}),this.eventBus.subscribe("qos.llm.error",t=>{const n=t.payload||{};this._lastLLMStatus={state:"error",message:n.message||"Local LLM error."},this._broadcastToDashboard(this._lastMetrics,this._lastAction)}),this.eventBus.subscribe("qos.llm.explanation",t=>{t.payload&&(this._lastLLMExplanation=t.payload,this._broadcastToDashboard(this._lastMetrics,this._lastAction))}),this.eventBus.subscribe("ai.policy.response",t=>{const n=t.payload;n!=null&&n.action&&(this._lastAction=n.action,this.decisionEngineEnabled&&this._applyAction(n.action),this._nextInterval=n.action.nextInterval||2e3)}),this.eventBus.subscribe("ai.congestion.override",t=>{const n=t.payload;n!=null&&n.action&&(this.decisionEngineEnabled&&this._applyAction(n.action),this._lastMetrics&&this._broadcastToDashboard(this._lastMetrics,n.action))}),this.eventBus.subscribe("ai.anomaly.detected",t=>{console.warn("[QoS] Anomaly detected:",t.payload)}),this.eventBus.subscribe("ai.remote.bitrate.request",t=>{const n=t.payload;if(n&&this.controlChannel){if(this.controlChannel.readyState==="open")try{this.controlChannel.send(JSON.stringify({type:"qos:remote-bitrate-request",action:n.action,targetKbps:n.targetKbps,reason:n.reason,timestamp:Date.now()})),console.log("[QoS] Remote bitrate request sent:",n)}catch(i){console.warn("[QoS] Failed to send remote bitrate request:",i)}this._broadcastToDashboard(this._lastMetrics,this._lastAction)}}),this.broadcast.onmessage=t=>{const{type:n,payload:i}=t.data||{};if(n==="TOGGLE_DECISION_ENGINE"&&i)this.setDecisionEngine(i.enabled);else if(n==="REQUEST_STATE"||n==="DASHBOARD_READY")try{this.broadcast.postMessage({type:"STATE_UPDATE",sessionId:this.sessionId,decisionEngineEnabled:this.decisionEngineEnabled,status:this._workerActive?"Connected":"Waiting for connection…"}),(this._lastMetrics||this._lastInbound)&&this._broadcastToDashboard(this._lastMetrics,this._lastAction)}catch{}}}_broadcastToDashboard(e,t){try{this.broadcast.postMessage({timestamp:Date.now(),metrics:e,inboundMetrics:this._lastInbound,action:t,llmExplanation:this._lastLLMExplanation,llmStatus:this._lastLLMStatus,sessionId:this.sessionId,decisionEngineEnabled:this.decisionEngineEnabled})}catch(n){console.error("[QoS] Failed to broadcast to dashboard:",n)}}start(){if(this.pc){console.log("[QoS] Optimization loop started 🧠");try{this.broadcast.postMessage({type:"STATE_UPDATE",sessionId:this.sessionId,decisionEngineEnabled:this.decisionEngineEnabled,status:"Session Connected — Collecting metrics…"})}catch{}this._tick()}else console.warn("[QoS] Cannot start without RTCPeerConnection")}stop(){this.timer&&clearTimeout(this.timer),this._workerActive=!1;try{this.broadcast.postMessage({type:"SESSION_ENDED",sessionId:this.sessionId})}catch{}this.workers.forEach(e=>{try{e.terminate()}catch{}}),this.workers=[],this.eventBus&&this.eventBus.close();try{this.broadcast.close()}catch{}}isActive(){return this._workerActive}setDecisionEngine(e){this.decisionEngineEnabled=e;try{this.broadcast.postMessage({type:"STATE_UPDATE",sessionId:this.sessionId,decisionEngineEnabled:this.decisionEngineEnabled})}catch{}}isDecisionEngineEnabled(){return this.decisionEngineEnabled}async exportData(e){try{return await this.eventBus.request("history.export.request",{sessionId:e})||[]}catch(t){return console.error("[QoS] Export request failed:",t),[]}}applyRemoteBitrateRequest(e){if(!(e!=null&&e.targetKbps))return;const t=1e3*e.targetKbps;this.bitrate=Math.max(this.minBitrate,Math.min(this.maxBitrate,t));const n={type:e.action==="PLEASE_INCREASE_BITRATE"?"INCREASE_BITRATE":"DECREASE_BITRATE",reason:`Remote request: ${e.reason}`,factor:1};this.decisionEngineEnabled&&this._applyAction(n),console.log(`[QoS] Applied remote bitrate request: ${e.targetKbps} kbps`)}async _tick(){if(this._workerActive&&this.pc&&this.pc.signalingState!=="closed"){try{const e=await this.pc.getStats(),t=this._serializeStats(e);t.length>0&&this.eventBus.publish("telemetry.raw",{report:t,sessionId:this.sessionId})}catch(e){console.warn("[QoS] Error getting WebRTC stats:",e)}this._scheduleNextTick(this._nextInterval)}}_scheduleNextTick(e){this.timer&&clearTimeout(this.timer),this.timer=setTimeout(()=>this._tick(),e||2e3)}_serializeStats(e){const t=[];for(const[n,i]of e.entries()){const s=i.type;(s==="outbound-rtp"&&(i.kind==="video"||i.kind==="audio")||s==="remote-inbound-rtp"&&(i.kind==="video"||i.kind==="audio")||s==="candidate-pair"&&(i.state==="succeeded"||i.selected||i.nominated)||this.monitorInbound&&s==="inbound-rtp"&&(i.kind==="video"||i.kind==="audio"))&&t.push([n,{...i}])}return t}async _applyAction(e){if(this.pc&&e&&e.type!=="MAINTAIN"&&!this._isApplyingAction){this._isApplyingAction=!0;try{const t=this.pc.getSenders().find(s=>{var a;return((a=s.track)==null?void 0:a.kind)==="video"});if(!t||typeof t.getParameters!="function")return;const n=t.getParameters();if(!n||!n.encodings||n.encodings.length===0)return;let i=!1;switch(e.type){case"DECREASE_BITRATE":this.bitrate=Math.max(this.minBitrate,this.bitrate*(e.factor||.8)),n.encodings[0].maxBitrate=Math.floor(this.bitrate),i=!0;break;case"INCREASE_BITRATE":this.bitrate=Math.min(this.maxBitrate,this.bitrate*(e.factor||1.1)),n.encodings[0].maxBitrate=Math.floor(this.bitrate),i=!0;break;case"LOWER_RESOLUTION":this.resolutionScale<4&&(this.resolutionScale*=e.scaleFactor||2,n.encodings[0].scaleResolutionDownBy=this.resolutionScale,i=!0);break;case"RAISE_RESOLUTION":this.resolutionScale>1&&(this.resolutionScale/=e.scaleFactor||2,n.encodings[0].scaleResolutionDownBy=this.resolutionScale,i=!0);break;case"DECREASE_FPS":this.framerate>10&&(this.framerate=this.framerate<=15?10:15,n.encodings[0].maxFramerate=this.framerate,i=!0);break;case"INCREASE_FPS":this.framerate<30&&(this.framerate=this.framerate>=15?30:15,n.encodings[0].maxFramerate=this.framerate,i=!0)}if(i){console.log(`[QoS] Action: ${e.type} → ${Math.floor(this.bitrate/1e3)}kbps | ${this.framerate}fps | 1/${this.resolutionScale}x`);try{await t.setParameters(n)}catch(s){console.warn("[QoS] setParameters deferred or skipped:",s.message||s)}}}finally{this._isApplyingAction=!1}}}}class _e extends EventTarget{constructor(e,t={}){if(super(),!e)throw new Error("[XoipQoSAdapter] xoipElement is required");this.element=e,this.options={decisionEngineEnabled:!0,monitorInbound:!0,autoStart:!0,...t},this.assistant=null,this._currentPc=null,this._watcherTimer=null,this._ensureElementGetters(),this._onDomStateChange=this._handleDomStateChange.bind(this),this._onPcStateChange=this._handlePcStateChange.bind(this),this._onCallEnded=this._handleCallEnded.bind(this),this._onStreamReady=this._handleStreamReady.bind(this),this._onRemoteMessage=this._handleRemoteMessage.bind(this),this.element.addEventListener("connectionstatechange",this._onDomStateChange),this.element.addEventListener("room-created",this._onStreamReady),this.element.addEventListener("room-joined",this._onStreamReady),this.element.addEventListener("remote-stream-ready",this._onStreamReady),this.element.addEventListener("call-ended",this._onCallEnded),this.options.autoStart&&this._startConnectionWatcher()}get peerConnection(){var e;const t=this.element;return t?((e=t._engine)==null?void 0:e.pc)??t._pc??null:null}get controlChannel(){var e;const t=this.element;return t?((e=t._engine)==null?void 0:e.dataChannel)??null:null}_ensureElementGetters(){const e=this.element;if(e)try{"peerConnection"in e||Object.defineProperty(e,"peerConnection",{get:()=>{var t;return((t=e._engine)==null?void 0:t.pc)??e._pc??null},configurable:!0}),"controlChannel"in e||Object.defineProperty(e,"controlChannel",{get:()=>{var t;return((t=e._engine)==null?void 0:t.dataChannel)??null},configurable:!0})}catch{}}_startConnectionWatcher(){this._checkAndHookPc(),this._watcherTimer||(this._watcherTimer=setInterval(()=>this._checkAndHookPc(),400))}_stopConnectionWatcher(){this._watcherTimer&&(clearInterval(this._watcherTimer),this._watcherTimer=null)}_checkAndHookPc(){const e=this.peerConnection;e&&e!==this._currentPc&&(this._currentPc&&this._unhookPc(this._currentPc),this._currentPc=e,this._hookPc(e)),e&&(e.connectionState==="connected"||e.iceConnectionState==="connected"||e.iceConnectionState==="completed")&&this.options.autoStart&&!this.assistant&&this.start()}_hookPc(e){e&&(e.addEventListener("connectionstatechange",this._onPcStateChange),e.addEventListener("iceconnectionstatechange",this._onPcStateChange))}_unhookPc(e){e&&(e.removeEventListener("connectionstatechange",this._onPcStateChange),e.removeEventListener("iceconnectionstatechange",this._onPcStateChange))}_handlePcStateChange(){const e=this.peerConnection;if(!e)return;const t=e.connectionState==="connected"||e.iceConnectionState==="connected"||e.iceConnectionState==="completed";console.log(`[XoipQoSAdapter] PC state: connectionState=${e.connectionState}, iceConnectionState=${e.iceConnectionState}`),t&&this.options.autoStart?this.start():e.connectionState!=="disconnected"&&e.connectionState!=="failed"&&e.connectionState!=="closed"||e.iceConnectionState!=="disconnected"&&e.iceConnectionState!=="failed"&&e.iceConnectionState!=="closed"||this.stop()}_handleDomStateChange(e){var t;const n=((t=e.detail)==null?void 0:t.state)??e.detail;n==="connected"&&this.options.autoStart?this.start():n!=="disconnected"&&n!=="failed"&&n!=="closed"||this.stop()}_handleStreamReady(){this._checkAndHookPc()}_handleCallEnded(){console.log("[XoipQoSAdapter] Call ended event received"),this.stop()}_handleRemoteMessage(e){try{const t=JSON.parse(e.data);t.type==="qos:remote-bitrate-request"&&this.assistant&&(this.assistant.applyRemoteBitrateRequest(t),this.element.dispatchEvent(new CustomEvent("xoip:peer-reduce-bitrate",{bubbles:!0,composed:!0,detail:{targetKbps:t.targetKbps,reason:t.reason}})))}catch{}}_attachControlChannelListener(){const e=this.controlChannel;e&&e.addEventListener("message",this._onMessage)}_detachControlChannelListener(){const e=this.controlChannel;e&&e.removeEventListener("message",this._onMessage)}start(){var e,t,n,i;if(this.assistant)return;const s=this.peerConnection;if(!s)return void console.warn("[XoipQoSAdapter] No active RTCPeerConnection available yet — waiting for call.");const a=((t=(e=this.element).getAttribute)==null?void 0:t.call(e,"call-id"))||((i=(n=this.element).getAttribute)==null?void 0:i.call(n,"room-id"))||this.element.id||`xoip_${Date.now()}`;this.assistant=new be(s,a,{decisionEngineEnabled:this.options.decisionEngineEnabled,monitorInbound:this.options.monitorInbound,controlChannel:this.controlChannel}),this.assistant.start(),this._attachControlChannelListener(),this.dispatchEvent(new CustomEvent("qos:started",{detail:{callId:a,monitorInbound:this.options.monitorInbound}})),console.log(`[XoipQoSAdapter] Started monitoring session: ${a}`)}stop(){this.assistant&&(this._detachControlChannelListener(),this.assistant.stop(),this.assistant=null,this.dispatchEvent(new CustomEvent("qos:stopped")),console.log("[XoipQoSAdapter] Stopped monitoring."))}setDecisionEngine(e){var t;(t=this.assistant)==null||t.setDecisionEngine(e)}isActive(){var e;return!!((e=this.assistant)!=null&&e.isActive())}openDashboard(e="/qos/dashboard/",t={}){let n="/qos/dashboard/",i=!!(t!=null&&t.newTab);if(e&&typeof e=="object"&&("ctrlKey"in e||"type"in e)){const s=e;(s.ctrlKey||s.metaKey)&&(i=!0)}else typeof e=="string"&&e&&(n=e);i?window.open(n,"_blank"):window.open(n,"QoSDashboard","width=1280,height=820,menubar=no,toolbar=no")}destroy(){this._stopConnectionWatcher(),this._currentPc&&(this._unhookPc(this._currentPc),this._currentPc=null),this.stop(),this.element.removeEventListener("connectionstatechange",this._onDomStateChange),this.element.removeEventListener("room-created",this._onStreamReady),this.element.removeEventListener("room-joined",this._onStreamReady),this.element.removeEventListener("remote-stream-ready",this._onStreamReady),this.element.removeEventListener("call-ended",this._onCallEnded)}}class we extends HTMLElement{static get observedAttributes(){return["for","monitor-inbound","decision-engine","auto-start"]}constructor(){super(),this._targetElement=null,this._adapter=null,this._pendingResolveTimer=null,this._onQoSStarted=e=>this._relayEvent("qos:started",e.detail),this._onQoSStopped=e=>this._relayEvent("qos:stopped",e.detail)}get for(){return this.getAttribute("for")||""}set for(e){e?this.setAttribute("for",e):this.removeAttribute("for")}get monitorInbound(){const e=this.getAttribute("monitor-inbound");return e===null||e!=="false"}set monitorInbound(e){e?this.setAttribute("monitor-inbound",""):this.setAttribute("monitor-inbound","false")}get decisionEngine(){const e=this.getAttribute("decision-engine");return e===null||e!=="false"}set decisionEngine(e){e?this.setAttribute("decision-engine",""):this.setAttribute("decision-engine","false"),this._adapter&&this._adapter.setDecisionEngine(this.decisionEngine)}get autoStart(){const e=this.getAttribute("auto-start");return e===null||e!=="false"}set autoStart(e){e?this.setAttribute("auto-start",""):this.setAttribute("auto-start","false")}get target(){return this._targetElement}set target(e){this._targetElement!==e&&this._attachTo(e)}get adapter(){return this._adapter}get isActive(){var e;return!!((e=this._adapter)!=null&&e.isActive())}connectedCallback(){this.style.display="none",this._resolveTarget()}disconnectedCallback(){this._cancelPendingResolve(),this._detach()}attributeChangedCallback(e,t,n){if(t!==n){if(e==="for")this.isConnected&&this._resolveTarget();else if(e==="decision-engine"&&this._adapter)this._adapter.setDecisionEngine(this.decisionEngine);else if((e==="monitor-inbound"||e==="auto-start")&&this._targetElement&&this.isConnected){const i=this.isActive;this._attachTo(this._targetElement),i&&this.start()}}}_resolveTarget(){this._cancelPendingResolve();const e=this.for;if(!e)return void this._detach();const t=this.getRootNode()||document,n=t.getElementById?t.getElementById(e):document.getElementById(e);n?this._attachTo(n):this._pendingResolveTimer=requestAnimationFrame(()=>{const i=this.getRootNode()||document,s=i.getElementById?i.getElementById(e):document.getElementById(e);s?this._attachTo(s):console.warn(`[xoip-qos] Target element with id="${e}" not found in DOM.`)})}_cancelPendingResolve(){this._pendingResolveTimer!==null&&(cancelAnimationFrame(this._pendingResolveTimer),this._pendingResolveTimer=null)}_attachTo(e){this._detach(),e&&(this._targetElement=e,this._adapter=new _e(this._targetElement,{monitorInbound:this.monitorInbound,decisionEngineEnabled:this.decisionEngine,autoStart:this.autoStart}),this._adapter.addEventListener("qos:started",this._onQoSStarted),this._adapter.addEventListener("qos:stopped",this._onQoSStopped),this._relayEvent("qos:attached",{target:this._targetElement}))}_detach(){this._adapter&&(this._adapter.removeEventListener("qos:started",this._onQoSStarted),this._adapter.removeEventListener("qos:stopped",this._onQoSStopped),this._adapter.destroy(),this._adapter=null),this._targetElement&&(this._relayEvent("qos:detached",{target:this._targetElement}),this._targetElement=null)}_relayEvent(e,t){this.dispatchEvent(new CustomEvent(e,{bubbles:!0,composed:!0,detail:t}))}start(){this._adapter?this._adapter.start():console.warn("[xoip-qos] Cannot start: no target attached.")}stop(){var e;(e=this._adapter)==null||e.stop()}openDashboard(e,t){var n;let i=this.getAttribute("dashboard-url")||"/qos/dashboard/",s={...t};if(e&&typeof e=="object"&&("ctrlKey"in e||"type"in e)){const a=e;(a.ctrlKey||a.metaKey)&&(s.newTab=!0)}else typeof e=="string"&&e&&(i=e);(n=this._adapter)==null||n.openDashboard(i,s)}}typeof customElements>"u"||customElements.get("xoip-qos")||customElements.define("xoip-qos",we);const xe=[{urls:["stun:stun1.l.google.com:19302","stun:stun2.l.google.com:19302"]}];class Ce{constructor(e={}){this.polite=e.polite??!0,this._iceServers=e.iceServers??xe,this._onSignal=e.onSignal??(()=>{}),this._onRemoteTrack=e.onRemoteTrack??(()=>{}),this._onDataMessage=e.onDataMessage??(()=>{}),this._onConnectionState=e.onConnectionState??(()=>{}),this._onError=e.onError??(t=>console.error("[WebRTCEngine]",t)),this.pc=null,this.dataChannel=null,this._makingOffer=!1,this._ignoreOffer=!1,this._isSettingRemoteAnswerPending=!1,this._pendingCandidates=[],this._iceRestartCount=0,this._iceRestartTimer=null}init(){return this.pc&&this.close(),this.pc=new RTCPeerConnection({iceServers:this._iceServers,iceCandidatePoolSize:10}),this._pendingCandidates=[],this._setupPerfectNegotiation(),this._setupConnectionMonitor(),this.pc}close(){var e,t;clearInterval(this._iceRestartTimer),(e=this.dataChannel)==null||e.close(),(t=this.pc)==null||t.close(),this.pc=null,this.dataChannel=null,this._makingOffer=!1,this._ignoreOffer=!1,this._isSettingRemoteAnswerPending=!1,this._pendingCandidates=[],this._iceRestartCount=0}addAudioTrack(e,t){return t?this.pc.addTrack(e,t):this.pc.addTrack(e)}addVideoTrack(e,t){return t?this.pc.addTrack(e,t):this.pc.addTrack(e)}async replaceTrack(e,t){var n;const i=(n=this.pc)==null?void 0:n.getSenders().find(s=>{var a;return((a=s.track)==null?void 0:a.kind)===e});i?await i.replaceTrack(t):console.warn(`[WebRTCEngine] No ${e} sender found.`)}setTransceiverDirection(e,t){var n;const i=(n=this.pc)==null?void 0:n.getTransceivers().find(s=>{var a,r;return((r=(a=s.sender)==null?void 0:a.track)==null?void 0:r.kind)===e});i&&(i.direction=t)}async handleSignal(e){try{e.type==="offer"||e.type==="answer"?await this._handleDescription(e.payload):e.type==="ice-candidate"&&await this._handleIceCandidate(e.payload)}catch(t){this._onError(t)}}setupDataChannel(){if(this.dataChannel||!this.pc)return;const e=this.pc;this.polite?e.ondatachannel=({channel:t})=>{this.dataChannel=t,this._bindDataChannel(t)}:(this.dataChannel=e.createDataChannel("p2p-control",{ordered:!0}),this._bindDataChannel(this.dataChannel))}sendData(e){var t;this.dataChannel||this.setupDataChannel();const n=typeof e=="string"?e:JSON.stringify(e);((t=this.dataChannel)==null?void 0:t.readyState)==="open"?this.dataChannel.send(n):console.warn("[WebRTCEngine] DataChannel not open. Message dropped.")}_setupPerfectNegotiation(){const e=this.pc;e.onnegotiationneeded=async()=>{if(!this.polite||e.remoteDescription)try{this._makingOffer=!0,await e.setLocalDescription(),this._onSignal({type:e.localDescription.type,payload:{type:e.localDescription.type,sdp:e.localDescription.sdp}})}catch(t){this._onError(t)}finally{this._makingOffer=!1}},e.onicecandidate=({candidate:t})=>{t&&this._onSignal({type:"ice-candidate",payload:t.toJSON()})},e.ontrack=t=>{this._onRemoteTrack(t)}}async _handleDescription(e){const t=this.pc;if(!t||!e||!e.type)return void console.warn("[WebRTCEngine] _handleDescription: invalid or missing description/type:",e);const n=!this._makingOffer&&(t.signalingState==="stable"||this._isSettingRemoteAnswerPending),i=e.type==="offer"&&!n;if(this._ignoreOffer=!this.polite&&i,!this._ignoreOffer)if(e.type!=="answer"||t.signalingState==="have-local-offer"){if(i){if(t.signalingState!=="have-local-offer")return void console.warn("[WebRTCEngine] Ignoring colliding offer in state:",t.signalingState);await t.setLocalDescription({type:"rollback"})}this._isSettingRemoteAnswerPending=e.type==="answer";try{await t.setRemoteDescription(new RTCSessionDescription(e))}catch(s){if(this._isSettingRemoteAnswerPending=!1,s instanceof DOMException&&s.name==="InvalidStateError")return void console.warn("[WebRTCEngine] setRemoteDescription ignored (stale):",s.message);throw s}this._isSettingRemoteAnswerPending=!1,await this._flushPendingCandidates(),e.type==="offer"&&(await t.setLocalDescription(),this._onSignal({type:"answer",payload:{type:t.localDescription.type,sdp:t.localDescription.sdp}}))}else console.warn("[WebRTCEngine] Ignoring stale answer in state:",t.signalingState)}async _handleIceCandidate(e){if(e&&e.candidate)if(this.pc&&this.pc.remoteDescription&&this.pc.remoteDescription.type)try{await this.pc.addIceCandidate(new RTCIceCandidate(e))}catch(t){this._ignoreOffer||console.warn("[WebRTCEngine] addIceCandidate warning:",t)}else this._pendingCandidates.push(e)}async _flushPendingCandidates(){if(!this.pc||!this.pc.remoteDescription||!this.pc.remoteDescription.type)return;const e=[...this._pendingCandidates];this._pendingCandidates=[];for(const t of e)try{await this.pc.addIceCandidate(new RTCIceCandidate(t))}catch(n){this._ignoreOffer||console.warn("[WebRTCEngine] Flush addIceCandidate warning:",n)}}_bindDataChannel(e){e.onopen=()=>console.log("[WebRTCEngine] DataChannel open."),e.onclose=()=>console.log("[WebRTCEngine] DataChannel closed."),e.onmessage=({data:t})=>{try{this._onDataMessage(JSON.parse(t))}catch{this._onDataMessage(t)}}}_setupConnectionMonitor(){const e=this.pc;e.onconnectionstatechange=()=>{const t=e.connectionState;if(console.log(`[WebRTCEngine] Connection state: ${t}`),this._onConnectionState(t),(t==="failed"||t==="disconnected")&&this._iceRestartCount<3){if(this._iceRestartTimer)return;this._iceRestartTimer=setTimeout(()=>{this._iceRestartTimer=null,e.connectionState!=="connected"&&(this._iceRestartCount++,console.warn(`[WebRTCEngine] ICE restart #${this._iceRestartCount}...`),e.restartIce())},2e3)}t==="connected"&&(this._iceRestartCount=0,this._iceRestartTimer&&(clearTimeout(this._iceRestartTimer),this._iceRestartTimer=null))}}}class Ie{constructor(e={}){this._multiCamera=e.multiCamera??!1,this._videoConstraints=e.videoConstraints??{width:{min:640,ideal:1280,max:1920},height:{min:360,ideal:720,max:1080},frameRate:{ideal:30}},this._audioConstraints=e.audioConstraints??{echoCancellation:!0,noiseSuppression:!0,autoGainControl:!0},this._onError=e.onError??(t=>console.error("[MediaManager]",t)),this.primaryStream=null,this.secondaryStreams=[],this.screenStream=null,this._screenSharing=!1}async start(){await navigator.mediaDevices.getUserMedia({audio:!0,video:!0});const e=(await navigator.mediaDevices.getUserMedia({audio:this._audioConstraints,video:!1})).getAudioTracks()[0];let t=[];return this._multiCamera?t=await this._captureAllCameras():t=(await navigator.mediaDevices.getUserMedia({video:this._videoConstraints,audio:!1})).getVideoTracks(),this.primaryStream=new MediaStream([e,...t.length?[t[0]]:[]]),{audioTrack:e,videoTracks:t}}async _captureAllCameras(){const e=(await navigator.mediaDevices.enumerateDevices()).filter(i=>i.kind==="videoinput"),t=await Promise.allSettled(e.map(i=>navigator.mediaDevices.getUserMedia({video:{deviceId:{exact:i.deviceId},...this._videoConstraints},audio:!1}))),n=[];return t.forEach((i,s)=>{var a;i.status==="fulfilled"?(n.push(...i.value.getVideoTracks()),s>0&&this.secondaryStreams.push(i.value)):console.warn(`[MediaManager] Camera ${s} not captured:`,((a=i.reason)==null?void 0:a.name)??i.reason)}),n}async startScreenShare(e){this.screenStream=await navigator.mediaDevices.getDisplayMedia({video:{cursor:"always",displaySurface:"monitor",logicalSurface:!0,frameRate:{ideal:30}},audio:!0});const t=this.screenStream.getVideoTracks()[0];return this._screenSharing=!0,t.onended=async()=>{await this.stopScreenShare(e)},t}async stopScreenShare(e){var t,n;if(!this._screenSharing)return null;(t=this.screenStream)==null||t.getTracks().forEach(s=>s.stop()),this.screenStream=null,this._screenSharing=!1;const i=((n=this.primaryStream)==null?void 0:n.getVideoTracks()[0])??null;return e==null||e(i),i}get isScreenSharing(){return this._screenSharing}async switchCamera(e){var t;const n=(await navigator.mediaDevices.getUserMedia({video:{deviceId:{exact:e}},audio:!1})).getVideoTracks()[0];if((t=this.primaryStream)==null||t.getVideoTracks().forEach(i=>i.stop()),this.primaryStream){const i=this.primaryStream.getAudioTracks();this.primaryStream=new MediaStream([...i,n])}return n}async switchMicrophone(e){var t;const n=(await navigator.mediaDevices.getUserMedia({audio:{deviceId:{exact:e},...this._audioConstraints},video:!1})).getAudioTracks()[0];if((t=this.primaryStream)==null||t.getAudioTracks().forEach(i=>i.stop()),this.primaryStream){const i=this.primaryStream.getVideoTracks();this.primaryStream=new MediaStream([n,...i])}return n}setAudioMute(e){var t;(t=this.primaryStream)==null||t.getAudioTracks().forEach(n=>{n.enabled=!e})}setVideoMute(e){var t;(t=this.primaryStream)==null||t.getVideoTracks().forEach(n=>{n.enabled=!e}),this.secondaryStreams.forEach(n=>n.getVideoTracks().forEach(i=>{i.enabled=!e}))}async getDevices(){const e=await navigator.mediaDevices.enumerateDevices();return{cameras:e.filter(t=>t.kind==="videoinput"),microphones:e.filter(t=>t.kind==="audioinput"),speakers:e.filter(t=>t.kind==="audiooutput")}}stopAll(){[this.primaryStream,this.screenStream,...this.secondaryStreams].filter(Boolean).forEach(e=>e.getTracks().forEach(t=>t.stop())),this.primaryStream=null,this.screenStream=null,this.secondaryStreams=[],this._screenSharing=!1,console.log("[MediaManager] All media tracks stopped.")}}class Se{constructor(e,t={}){this._pc=e,this._intervalMs=t.intervalMs??3e3,this._onQuality=t.onQuality??(()=>{}),this._timer=null,this._prev={timestamp:0,bytesSent:0,bytesReceived:0,packetsSent:0,packetsLost:0}}start(){this._timer||(this._timer=setInterval(()=>this._collect(),this._intervalMs),console.log("[StatsMonitor] Started."))}stop(){clearInterval(this._timer),this._timer=null,console.log("[StatsMonitor] Stopped.")}async getFullReport(){return this._pc.getStats()}async _collect(){if(this._pc&&this._pc.connectionState==="connected")try{const e=await this._pc.getStats(),t=this._parseStats(e);this._onQuality(t)}catch(e){console.warn("[StatsMonitor] getStats() error:",e)}}_parseStats(e){let t=null,n=null,i=0,s=0,a="unknown";const r=Date.now(),l=(r-this._prev.timestamp)/1e3||1;let h=0,u=0,g=0,v=0;if(e.forEach(m=>{switch(m.type){case"candidate-pair":m.state==="succeeded"&&m.currentRoundTripTime!=null&&(t=Math.round(1e3*m.currentRoundTripTime)),m.localCandidateId&&(a=this._resolveConnectionType(e,m.localCandidateId));break;case"outbound-rtp":m.kind==="video"&&(h+=m.bytesSent??0,g+=m.packetsSent??0);break;case"remote-inbound-rtp":m.kind==="video"&&(v+=m.packetsLost??0);break;case"inbound-rtp":m.kind==="video"&&(u+=m.bytesReceived??0)}}),this._prev.timestamp>0){i=Math.round(8*(h-this._prev.bytesSent)/l/1e3),s=Math.round(8*(u-this._prev.bytesReceived)/l/1e3);const m=g-this._prev.packetsSent,d=v-this._prev.packetsLost;m>0&&(n=Math.min(100,Math.max(0,Math.round(d/m*100))))}return this._prev={timestamp:r,bytesSent:h,bytesReceived:u,packetsSent:g,packetsLost:v},{rtt:t,packetLoss:n,bitrateOut:i,bitrateIn:s,connectionType:a,quality:this._qualityLabel(t,n)}}_resolveConnectionType(e,t){const n=e.get(t);return n?n.candidateType==="relay"?"TURN":n.candidateType==="srflx"?"STUN":"P2P":"unknown"}_qualityLabel(e,t){return e==null||t==null?"unknown":e<100&&t<2?"excellent":e<200&&t<5?"good":e<400&&t<15?"poor":"bad"}}class ke{constructor(e={}){this._onSendPublicKey=e.onSendPublicKey??(()=>{}),this._onError=e.onError??(t=>console.error("[E2EEManager]",t)),this._keyPair=null,this._sharedKey=null,this._worker=null,this._pendingRemoteKey=null}async initialize(){this._keyPair=await crypto.subtle.generateKey({name:"ECDH",namedCurve:"P-256"},!0,["deriveKey"]);const e=await this._exportPublicKey();if(this._onSendPublicKey(e),console.log("[E2EEManager] Public key published via DataChannel."),this._pendingRemoteKey){const t=this._pendingRemoteKey;this._pendingRemoteKey=null,await this.receiveRemotePublicKey(t)}}async receiveRemotePublicKey(e){if(!this._keyPair)return console.warn("[E2EEManager] Remote key received before initialization — buffering."),void(this._pendingRemoteKey=e);try{const t=await this._importPublicKey(e);if(this._sharedKey=await crypto.subtle.deriveKey({name:"ECDH",public:t},this._keyPair.privateKey,{name:"AES-GCM",length:256},!0,["encrypt","decrypt"]),this._worker){const n=await crypto.subtle.exportKey("raw",this._sharedKey);this._worker.postMessage({type:"set-key",keyData:n},[n])}console.log("[E2EEManager] Shared AES-GCM key derived from ECDH exchange.")}catch(t){this._onError(t)}}async attachToPeerConnection(e,t){if(typeof RTCRtpScriptTransform<"u"){if(this._worker=new Worker(t,{type:"module"}),e.getSenders().forEach(n=>{n.track&&(n.transform=new RTCRtpScriptTransform(this._worker,{operation:"encrypt",kind:n.track.kind}))}),e.getReceivers().forEach(n=>{n.track&&(n.transform=new RTCRtpScriptTransform(this._worker,{operation:"decrypt",kind:n.track.kind}))}),e.addEventListener("track",n=>{const i=n.receiver;i&&!i.transform&&this._worker&&(i.transform=new RTCRtpScriptTransform(this._worker,{operation:"decrypt",kind:n.track.kind}))}),this._sharedKey){const n=await crypto.subtle.exportKey("raw",this._sharedKey);this._worker.postMessage({type:"set-key",keyData:n},[n])}console.log("[E2EEManager] RTCRtpScriptTransform attached.")}else console.warn("[E2EEManager] RTCRtpScriptTransform not supported. E2EE disabled.")}terminate(){var e;(e=this._worker)==null||e.terminate(),this._worker=null,this._sharedKey=null,this._keyPair=null}async _exportPublicKey(){const e=await crypto.subtle.exportKey("raw",this._keyPair.publicKey);return btoa(String.fromCharCode(...new Uint8Array(e)))}async _importPublicKey(e){const t=Uint8Array.from(atob(e),n=>n.charCodeAt(0)).buffer;return crypto.subtle.importKey("raw",t,{name:"ECDH",namedCurve:"P-256"},!0,[])}}const ae=new Set(["firebase","nostr","custom"]);function Ee(o){if(!o||typeof o!="string")throw new Error("[URI] Invalid URI: must be a non-empty string");if(!o.startsWith("xoip://"))throw new Error(`[URI] Invalid URI scheme: expected "xoip://", got "${o.slice(0,10)}"`);let e;try{e=new URL(o.replace(/^xoip:\/\//,"https://xoip.local/"))}catch{throw new Error(`[URI] Malformed URI: "${o.slice(0,50)}"`)}const t=e.pathname.split("/").filter(Boolean);if(t.length<3||t[0]!=="call")throw new Error("[URI] Invalid URI path: expected /call/<signalingType>/<TOKEN>");const n=t[1],i=t.slice(2).join("/");if(!ae.has(n))throw new Error(`[URI] Unknown signalingType: "${n}". Expected: firebase | nostr | custom`);if(!i||!i.startsWith("XST1."))throw new Error('[URI] Invalid TOKEN: must start with "XST1."');const s=e.searchParams.get("room");if(!s)throw new Error("[URI] Missing required query parameter: room");const a=Re(e.hash);if(!a)throw new Error("[URI] Missing required fragment: #key=<ROOM_KEY>");return{signalingType:n,token:i,roomId:s,roomKey:a}}function Ae({signalingType:o,token:e,roomId:t,roomKey:n}){if(!ae.has(o))throw new Error(`[URI] Invalid signalingType: "${o}"`);if(!(e!=null&&e.startsWith("XST1.")))throw new Error('[URI] Invalid token: must start with "XST1."');if(!t)throw new Error("[URI] roomId is required");if(!n)throw new Error("[URI] roomKey is required");return`xoip://call/${o}/${e}?room=${encodeURIComponent(t)}#key=${encodeURIComponent(n)}`}function Re(o){if(!o)return null;const e=o.startsWith("#")?o.slice(1):o;try{return new URLSearchParams(e).get("key")||null}catch{return null}}const oe={token:"xoip-v1-token",signal:"xoip-v1-signal"};function Le(){const o=new Uint8Array(32);return crypto.getRandomValues(o),ce(o)}async function re(o){const e=Z(o);return de(await crypto.subtle.importKey("raw",e,{name:"HKDF"},!1,["deriveKey"]),oe.token)}async function le(o){const e=Z(o);return de(await crypto.subtle.importKey("raw",e,{name:"HKDF"},!1,["deriveKey"]),oe.signal)}async function De(o,e){const t=new Uint8Array(12);crypto.getRandomValues(t);const n=typeof e=="string"?new TextEncoder().encode(e):e,i=await crypto.subtle.encrypt({name:"AES-GCM",iv:t},o,n),s=new Uint8Array(t.length+i.byteLength);return s.set(t,0),s.set(new Uint8Array(i),t.length),s}async function Te(o,e){const t=e.slice(0,12),n=e.slice(12),i=await crypto.subtle.decrypt({name:"AES-GCM",iv:t},o,n);return new Uint8Array(i)}function ce(o){return btoa(String.fromCharCode(...o)).replace(/\+/g,"-").replace(/\//g,"_").replace(/=/g,"")}function Z(o){const e=o.replace(/-/g,"+").replace(/_/g,"/").padEnd(o.length+(4-o.length%4)%4,"=");return Uint8Array.from(atob(e),t=>t.charCodeAt(0))}async function de(o,e){return crypto.subtle.deriveKey({name:"HKDF",hash:"SHA-256",salt:new Uint8Array(32),info:new TextEncoder().encode(e)},o,{name:"AES-GCM",length:256},!1,["encrypt","decrypt"])}async function Me({roomKeyBase64Url:o,type:e,roomId:t,config:n={},ttlSeconds:i=3600}){const s=Math.floor(Date.now()/1e3),a={v:1,type:e,room:t,config:n,iat:s,exp:s+i,jti:Ue()},r=await re(o),l=JSON.stringify(a),h=await De(r,l);return`XST1.${ce(h)}`}async function Be({token:o,roomKeyBase64Url:e,expectedType:t,expectedRoomId:n}){if(!o||typeof o!="string")throw new Error("[Token] Invalid token format: must be a string");const i=o.split(".");if(i.length!==2||i[0]!=="XST1")throw new Error('[Token] Invalid token format: expected "XST1.<data>"');let s;try{s=Z(i[1])}catch{throw new Error("[Token] Invalid token: failed to decode Base64URL envelope")}const a=await re(e);let r,l;try{const h=await Te(a,s);r=new TextDecoder().decode(h)}catch{throw new Error("[Token] Decryption failed: invalid roomKey or tampered token")}try{l=JSON.parse(r)}catch{throw new Error("[Token] Invalid token: payload is not valid JSON")}if(l.v!==1)throw new Error(`[Token] Unsupported token version: ${l.v}`);if(l.type!==t)throw new Error(`[Token] Type mismatch: token.type="${l.type}" vs URI.signalingType="${t}"`);if(l.room!==n)throw new Error(`[Token] Room mismatch: token.room="${l.room}" vs URI.roomId="${n}"`);if(Math.floor(Date.now()/1e3)>=l.exp)throw new Error(`[Token] Token expired at ${new Date(1e3*l.exp).toISOString()}`);return l}function Ue(){const o=new Uint8Array(16);return crypto.getRandomValues(o),Array.from(o,e=>e.toString(16).padStart(2,"0")).join("")}const Ne="modulepreload",Qe=function(o,e){return new URL(o,e).href},te={},T=function(e,t,n){let i=Promise.resolve();if(t&&t.length>0){let a=function(u){return Promise.all(u.map(g=>Promise.resolve(g).then(v=>({status:"fulfilled",value:v}),v=>({status:"rejected",reason:v}))))};const r=document.getElementsByTagName("link"),l=document.querySelector("meta[property=csp-nonce]"),h=(l==null?void 0:l.nonce)||(l==null?void 0:l.getAttribute("nonce"));i=a(t.map(u=>{if(u=Qe(u,n),u in te)return;te[u]=!0;const g=u.endsWith(".css"),v=g?'[rel="stylesheet"]':"";if(!!n)for(let _=r.length-1;_>=0;_--){const I=r[_];if(I.href===u&&(!g||I.rel==="stylesheet"))return}else if(document.querySelector(`link[href="${u}"]${v}`))return;const d=document.createElement("link");if(d.rel=g?"stylesheet":Ne,g||(d.as="script"),d.crossOrigin="",d.href=u,h&&d.setAttribute("nonce",h),document.head.appendChild(d),g)return new Promise((_,I)=>{d.addEventListener("load",_),d.addEventListener("error",()=>I(new Error(`Unable to preload CSS for ${u}`)))})}))}function s(a){const r=new Event("vite:preloadError",{cancelable:!0});if(r.payload=a,window.dispatchEvent(r),!r.defaultPrevented)throw a}return i.then(a=>{for(const r of a||[])r.status==="rejected"&&s(r.reason);return e().catch(s)})};class ne{static async create(e,t={},n={}){switch(e){case"firebase":{const{FirebaseSignalingAdapter:i}=await T(()=>import("./firebase-adapter-By9Gq8uh.js"),__vite__mapDeps([0,1]),import.meta.url);let s=typeof window<"u"&&window.firebase?window.firebase:null;if(!s)try{const r=await T(()=>import("./xoip-call-yoD6TSFD.js"),[],import.meta.url);s=r.default??r,await T(()=>import("./xoip-call-DNqvg6tM.js"),[],import.meta.url)}catch{try{const l=await T(()=>import("./xoip-call-BPdA3TTP.js"),[],import.meta.url);s=l.default??l}catch{if(typeof window>"u"||!window.firebase)throw new Error("[SignalingFactory] Firebase is not installed or loaded. Add npm install firebase@8 or include Firebase scripts in HTML.");s=window.firebase}}s.apps&&s.apps.length||s.initializeApp(t);let a=n.cryptoKey??null;return!a&&n.roomKey&&(a=await le(n.roomKey)),new i(s,{collection:t.collection??"calls",cryptoKey:a})}case"nostr":{const{NostrSignalingAdapter:i}=await T(()=>import("./p2p-adapter-DTUzgtcg.js"),__vite__mapDeps([2,1]),import.meta.url);return new i({relays:t.relays,privateKeyHex:t.privateKeyHex})}case"websocket":{const{WebSocketSignalingAdapter:i}=await T(()=>import("./websocket-adapter-B2lcr0zo.js"),__vite__mapDeps([3,1]),import.meta.url);return new i(t.url??t.wsUrl??"wss://localhost:8080")}case"custom":{const i=n.customAdapter;if(!i)throw new Error('[SignalingFactory] type="custom" requires options.customAdapter');return i}default:throw new Error(`[SignalingFactory] Unknown signalingType: "${e}". Supported: firebase | nostr | websocket | custom`)}}static isSupported(e){return["firebase","nostr","websocket","custom"].includes(e)}}const f={microphone:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
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
  </svg>`},Oe=()=>`
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
`,Ke=()=>`
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
`,he=["apiKey","authDomain","projectId","storageBucket","messagingSenderId","appId","collection"];async function Pe(o){if(!o||typeof o!="object")return"";let e;if(o.apiKey||o.projectId){const n=he.map(i=>o[i]??"");e=JSON.stringify(n)}else e=JSON.stringify(o);const t=new TextEncoder().encode(e);if(typeof CompressionStream<"u"){const n=new CompressionStream("gzip"),i=n.writable.getWriter();i.write(t),i.close();const s=await new Response(n.readable).arrayBuffer();return btoa(String.fromCharCode(...new Uint8Array(s)))}return btoa(String.fromCharCode(...t))}async function j(o){if(!o||typeof o!="string")return{};try{const e=atob(o.trim()),t=Uint8Array.from(e,s=>s.charCodeAt(0));let n;if(typeof DecompressionStream<"u"){const s=new DecompressionStream("gzip"),a=s.writable.getWriter();a.write(t),a.close();const r=await new Response(s.readable).arrayBuffer();n=new TextDecoder().decode(r)}else n=new TextDecoder().decode(t);const i=JSON.parse(n);return Array.isArray(i)?Object.fromEntries(he.map((s,a)=>[s,i[a]]).filter(([,s])=>s!=null&&s!=="")):typeof i=="object"&&i!==null?i:{}}catch(e){return console.warn("[xoip-call] Failed to decompress signaling-token:",e),{}}}const Ve=typeof HTMLElement<"u"?HTMLElement:class{};class qe extends Ve{static compressConfig(e){return Pe(e)}static decompressConfig(e){return j(e)}static get observedAttributes(){return["src","signaling-type","signaling-config","signaling-token","ice-servers","multi-camera","headless","e2ee-enabled","custom-remote-video","room-id","audio-only","vad-threshold"]}constructor(){super(),this.attachShadow({mode:"open"}),this._engine=null,this._media=null,this._stats=null,this._e2ee=null,this._signaling=null,this._callState="idle",this._audioMuted=!1,this._videoMuted=!1,this._localCamerasVisible=!1,this._audioOnlyMode=!1,this._pipActive=!1,this._remoteStreams=new Map,this._cameraTrack=null,this._vadAudioCtx=null,this._vadAnalyserLocal=null,this._vadAnalyserRemote=null,this._vadLocalActive=!1,this._vadRemoteActive=!1,this._vadRafId=null,this._micLevelRafId=null,this._els={},this._tooltipTimer=null,this._iceFailoverTimer=null,this._turnRequested=!1,this._xoipSession=null}connectedCallback(){this._render(),this._bindElements(),this._setupUI(),this._checkUrlParams();const e=this.getAttribute("room-id");e&&(this._els.roomInput.value=e,this._els.joinBtn.disabled=!1)}disconnectedCallback(){this._cleanup(!0)}attributeChangedCallback(e,t,n){t!==n&&(e==="room-id"&&n&&this._callState==="idle"&&this._els.roomInput&&(this._els.roomInput.value=n,this._els.joinBtn.disabled=!1),e==="src"&&n&&this._callState==="idle"&&this.connect(n).catch(i=>this._handleError("CONNECT_FAILED",i)))}async connect(e){if(this._callState==="idle"){this._callState="calling";try{const{signalingType:t,token:n,roomId:i,roomKey:s}=Ee(e),a=await Be({token:n,roomKeyBase64Url:s,expectedType:t,expectedRoomId:i});this._xoipSession={signalingType:t,token:n,roomId:i,roomKey:s,tokenPayload:a,shareURI:e},this._signaling=await ne.create(t,a.config??{},{roomKey:s}),this._els.roomInput&&(this._els.roomInput.value=i),await this._initSignaling("polite"),await this._startMedia(),await this._signaling.joinRoom(i),this._emit("room-joined",{roomId:i,uri:e}),this._showCallScreen()}catch(t){this._callState="idle",this._xoipSession=null,this._handleError("CONNECT_FAILED",t)}}else console.warn("[xoip-call] connect() called while not idle. Current state:",this._callState)}addIceServers(e){var t,n;Array.isArray(e)&&e.length&&((n=(t=this._engine)==null?void 0:t.addIceServers)==null||n.call(t,e))}async restartIce(){var e,t;await((t=(e=this._engine)==null?void 0:e.restartIce)==null?void 0:t.call(e))}set signalingAdapter(e){this._signaling=e}get signalingAdapter(){return this._signaling}get localStream(){var e;return((e=this._media)==null?void 0:e.primaryStream)??null}get remoteStreams(){return this._remoteStreams}async createRoom(){var e,t;if(this._callState==="idle"){this._callState="calling";try{const n=Le(),i=await le(n);await this._initSignaling("impolite",{roomKey:n,cryptoKey:i});const s=await this._signaling.createRoom();this._els.roomInput.value=s;let a=null;try{const r=this.getAttribute("signaling-type")||"firebase";let l={};const h=this.getAttribute("signaling-token");if(h)l=await j(h);else{const g=this.getAttribute("signaling-config");try{l=g?JSON.parse(g):{}}catch{}}(t=(e=this._signaling)==null?void 0:e._relayUrls)!=null&&t.length&&(l.relays=[...this._signaling._relayUrls]);const u=await Me({roomKeyBase64Url:n,type:r,roomId:s,config:l});a=Ae({signalingType:r,token:u,roomId:s,roomKey:n}),this._xoipSession={signalingType:r,token:u,roomId:s,roomKey:n,shareURI:a,tokenPayload:{config:l}}}catch(r){console.warn("[xoip-call] Failed to generate xoip:// URI during createRoom:",r)}return await this._startMedia(),this._emit("room-created",{roomId:s,shareURI:a}),this._showCallScreen(),s}catch(n){this._handleError("CREATE_ROOM_FAILED",n),this._callState="idle"}}}async joinRoom(e){if(this._callState==="idle"){if(e&&typeof e=="string"&&e.trim().startsWith("xoip://"))return this.connect(e.trim());this._callState="calling";try{this._els.roomInput.value=e,await this._initSignaling("polite"),await this._startMedia(),await this._signaling.joinRoom(e),this._emit("room-joined",{roomId:e}),this._showCallScreen()}catch(t){this._handleError("JOIN_ROOM_FAILED",t),this._callState="idle"}}}async leaveRoom(){var e;this._callState!=="idle"&&(await((e=this._signaling)==null?void 0:e.endRoom()),this._cleanup(!1),this._emit("call-ended",{reason:"local_hangup"}),this._resetUI())}setAudioMute(e){var t;this._audioMuted=e,(t=this._media)==null||t.setAudioMute(e);const n=this._els.audioBtn;n&&(n.innerHTML=e?f.microphoneOff:f.microphone,n.classList.toggle("muted",e),n.title=e?"Unmute Audio":"Mute Audio")}setVideoMute(e){var t;this._videoMuted=e,(t=this._media)==null||t.setVideoMute(e);const n=this._els.videoBtn;n&&(n.innerHTML=e?f.videoOff:f.video,n.classList.toggle("muted",e),n.title=e?"Enable Video":"Disable Video")}async startScreenShare(){var e,t;if(this._media&&this._engine)try{const n=await this._media.startScreenShare(async i=>{await this._engine.replaceTrack("video",i),this._updateScreenBtn(!1),this._emit("screen-share-stopped",{})});this._cameraTrack=((t=(e=this._engine.pc)==null?void 0:e.getSenders().find(i=>{var s;return((s=i.track)==null?void 0:s.kind)==="video"}))==null?void 0:t.track)??null,await this._engine.replaceTrack("video",n),this._updateScreenBtn(!0),this._localCamerasVisible&&this._renderLocalCameras(),this._emit("screen-share-started",{})}catch(n){n.name!=="NotAllowedError"&&this._handleError("SCREEN_SHARE_FAILED",n)}}async stopScreenShare(){var e;(e=this._media)!=null&&e.isScreenSharing&&(await this._media.stopScreenShare(async t=>{await this._engine.replaceTrack("video",t),this._localCamerasVisible&&this._renderLocalCameras()}),this._updateScreenBtn(!1),this._localCamerasVisible&&this._renderLocalCameras(),this._emit("screen-share-stopped",{}))}async switchCamera(e){if(!this._media||!this._engine)return;const t=await this._media.switchCamera(e);await this._engine.replaceTrack("video",t),this._localCamerasVisible&&this._renderLocalCameras()}sendData(e){var t;(t=this._engine)==null||t.sendData(e)}getStats(){var e;return((e=this._stats)==null?void 0:e.getFullReport())??Promise.resolve(null)}_render(){this.shadowRoot.innerHTML=`<style>${Ke()}</style>${Oe()}`}_bindElements(){const e=t=>this.shadowRoot.getElementById(t);this._els={welcomeScreen:e("welcome-screen"),callContainer:e("call-container"),videoRoom:e("video-room"),roomInput:e("room-id-input"),createBtn:e("btn-create"),joinBtn:e("btn-join"),remoteVideo:e("remote-video"),remoteThumbs:e("remote-thumbnails"),localCameras:e("local-cameras"),audioBtn:e("btn-audio"),videoBtn:e("btn-video"),screenBtn:e("btn-screen"),camerasBtn:e("btn-cameras"),devicesBtn:e("btn-devices"),pipBtn:e("btn-pip"),audiomodeBtn:e("btn-audiomode"),shareBtn:e("btn-share"),qrBtn:e("btn-qr"),hangupBtn:e("btn-hangup"),qualityBar:e("quality-bar"),qualityLabel:e("quality-label"),tooltip:e("tooltip"),devicePanel:e("device-panel"),closePanelBtn:e("btn-close-devices"),selectCamera:e("select-camera"),selectMic:e("select-mic"),selectSpeaker:e("select-speaker"),micLevelFill:e("mic-level-fill"),applyDevicesBtn:e("btn-apply-devices"),qrModal:e("qr-modal"),closeQrBtn:e("btn-close-qr"),qrContainer:e("qr-container"),qrUrl:e("qr-url"),copyQrUrlBtn:e("btn-copy-qr-url"),mainVideoArea:e("main-video-area"),remoteLevelMeter:e("remote-level-meter"),remoteLevelFill:e("remote-level-fill"),audioAvatar:e("audio-avatar"),audioWaveRemote:e("audio-wave-remote"),speakingRingRemote:e("speaking-ring-remote"),pipSelfView:e("pip-self-view"),pipSelfVideo:e("pip-self-video"),pipCloseBtn:e("btn-pip-close")}}_setupUI(){var e;const t=this._els;t.createBtn.addEventListener("click",()=>this.createRoom()),t.joinBtn.addEventListener("click",async()=>{const n=t.roomInput.value.trim();n&&await this.joinRoom(n)}),t.roomInput.addEventListener("dblclick",()=>{t.roomInput.readOnly=!1,t.joinBtn.disabled=!1,t.roomInput.focus(),t.roomInput.select()}),t.audioBtn.addEventListener("click",()=>this.setAudioMute(!this._audioMuted)),t.videoBtn.addEventListener("click",()=>this.setVideoMute(!this._videoMuted)),t.hangupBtn.addEventListener("click",()=>this.leaveRoom()),t.shareBtn.addEventListener("click",()=>this._shareRoom()),t.camerasBtn.addEventListener("click",()=>this._toggleLocalCameras()),t.screenBtn.addEventListener("click",()=>{var n;(n=this._media)!=null&&n.isScreenSharing?this.stopScreenShare():this.startScreenShare()}),t.devicesBtn.addEventListener("click",()=>this._toggleDevicePanel()),t.closePanelBtn.addEventListener("click",()=>this._closeDevicePanel()),t.applyDevicesBtn.addEventListener("click",()=>this._applyDeviceSelection()),t.pipBtn.addEventListener("click",()=>this._togglePiP()),(e=t.pipCloseBtn)==null||e.addEventListener("click",n=>{n.stopPropagation(),this.exitPiP()}),this._setupPipSelfView(),t.audiomodeBtn.addEventListener("click",()=>this.setAudioOnlyMode(!this._audioOnlyMode)),t.qrBtn.addEventListener("click",()=>this._openQrModal()),t.closeQrBtn.addEventListener("click",()=>this._closeQrModal()),t.qrModal.addEventListener("click",n=>{n.target===t.qrModal&&this._closeQrModal()}),t.copyQrUrlBtn.addEventListener("click",async()=>{const n=t.qrUrl.textContent;if(n)try{await navigator.clipboard.writeText(n),this._showTooltip("Link copied!",t.copyQrUrlBtn)}catch{this._showTooltip("Copy failed",t.copyQrUrlBtn)}}),document.addEventListener("keydown",n=>{n.key==="Escape"&&(this._closeDevicePanel(),this._closeQrModal())})}_checkUrlParams(){const e=new URLSearchParams(window.location.search),t=e.get("uri")||e.get("src");if(t&&t.startsWith("xoip://"))return void setTimeout(()=>this.connect(t).catch(i=>this._handleError("CONNECT_FAILED",i)),0);if(window.location.hash){const i=window.location.hash.slice(1);if(i.startsWith("xoip://"))return void setTimeout(()=>this.connect(decodeURIComponent(i)).catch(s=>this._handleError("CONNECT_FAILED",s)),0);try{const s=new URLSearchParams(i),a=s.get("uri")||s.get("src");if(a&&a.startsWith("xoip://"))return void setTimeout(()=>this.connect(a).catch(r=>this._handleError("CONNECT_FAILED",r)),0)}catch{}}const n=e.get("room");if(n&&(this._els.roomInput.value=n,this._els.roomInput.readOnly=!1,this._els.joinBtn.disabled=!1),window.location.hash)try{const i=new URLSearchParams(window.location.hash.slice(1)),s=i.get("room");s&&!n&&(this._els.roomInput.value=s,this._els.roomInput.readOnly=!1,this._els.joinBtn.disabled=!1);const a=i.get("type");a&&this.setAttribute("signaling-type",a);const r=i.get("token");r&&this.setAttribute("signaling-token",r);const l=i.get("cfg");if(l)if(l.startsWith("H4sI"))this.setAttribute("signaling-token",l);else try{const h=atob(l);this.setAttribute("signaling-config",h)}catch{}}catch(i){console.warn("[xoip-call] Failed to parse URL hash config:",i)}}async _initSignaling(e,t={}){var n,i;let s;this._signaling?t.cryptoKey&&((i=(n=this._signaling).setCryptoKey)==null||i.call(n,t.cryptoKey)):await this._createDefaultSignaling(t),await this._signaling.connect();try{s=JSON.parse(this.getAttribute("ice-servers")??"[]")}catch{s=[]}this._engine=new Ce({polite:e==="polite",iceServers:s.length?s:void 0,onSignal:a=>this._signaling.sendSignal(a),onRemoteTrack:a=>this._handleRemoteTrack(a),onDataMessage:a=>this._handleDataMessage(a),onConnectionState:a=>this._handleConnectionState(a),onError:a=>this._handleError("ENGINE_ERROR",a)}),this._engine.init(),this._signaling.onSignal(a=>this._engine.handleSignal(a)),this._signaling.onRoomState(a=>{a==="ended"&&this._handleRemoteHangup()})}async _createDefaultSignaling(e={}){const t=this.getAttribute("signaling-type")??"firebase";let n={};const i=this.getAttribute("signaling-token");if(i)n=await j(i);else{const s=this.getAttribute("signaling-config");try{n=s?JSON.parse(s):{}}catch{n={}}}this._signaling=await ne.create(t,n,e)}async _startMedia(){const e=this.hasAttribute("multi-camera");this._media=new Ie({multiCamera:e,onError:s=>this._handleError("MEDIA_ERROR",s)});const{audioTrack:t,videoTracks:n}=await this._media.start();this._engine.addAudioTrack(t,this._media.primaryStream);const i=[this._media.primaryStream,...this._media.secondaryStreams];n.forEach((s,a)=>{this._engine.addVideoTrack(s,i[a]??new MediaStream([s]))}),this._engine.setupDataChannel(),this.hasAttribute("e2ee-enabled")&&this._initE2EE().catch(s=>this._handleError("E2EE_ERROR",s)),this._stats=new Se(this._engine.pc,{onQuality:s=>{this._emit("network-quality",s),this._updateQualityUI(s)}}),this._stats.start(),this._startVAD()}async _initE2EE(){this._e2ee=new ke({onSendPublicKey:t=>{this._engine.sendData({type:"e2ee-pubkey",key:t})},onError:t=>this._handleError("E2EE_ERROR",t)}),await this._waitForDataChannelOpen(),await this._e2ee.initialize();const e=new URL("data:text/javascript;base64,LyoqCiAqIEBmaWxlb3ZlcnZpZXcgZTJlZS13b3JrZXIuanMg4oCUIFdlYiBXb3JrZXIg0LTQu9GPIFJUQ1J0cFNjcmlwdFRyYW5zZm9ybS4KICoKICog0JLRi9C/0L7Qu9C90Y/QtdGCIEFFUy1HQ00g0YjQuNGE0YDQvtCy0LDQvdC40LUv0LTQtdGI0LjRhNGA0L7QstCw0L3QuNC1INC80LXQtNC40LAt0LrQsNC00YDQvtCyINCyINGE0L7QvdC+0LLQvtC8INC/0L7RgtC+0LrQtSwKICog0L3QtSDQsdC70L7QutC40YDRg9GPIFVJINC4INC90LUg0LLRi9C30YvQstCw0Y8g0L/RgNC+0YHQsNC00L7QuiBGUFMuCiAqCiAqINCk0L7RgNC80LDRgiDQt9Cw0YjQuNGE0YDQvtCy0LDQvdC90L7Qs9C+INC60LDQtNGA0LA6CiAqICAgWyA0IGJ5dGVzOiBJViBjb3VudGVyIChiaWctZW5kaWFuIHVpbnQzMikgfCA4IGJ5dGVzOiByYW5kb20gc2FsdCB8IGNpcGhlcnRleHQgXQogKgogKiDQn9GA0L7RgtC+0LrQvtC7INGB0L7QvtCx0YnQtdC90LjQuSDQvtGCINC+0YHQvdC+0LLQvdC+0LPQviDQv9C+0YLQvtC60LA6CiAqICAgeyB0eXBlOiAnc2V0LWtleScsIGtleURhdGE6IEFycmF5QnVmZmVyIH0gIC0g0YPRgdGC0LDQvdC+0LLQuNGC0YwgQUVTINC60LvRjtGHCiAqLwoKJ3VzZSBzdHJpY3QnOwoKLyoqIEB0eXBlIHtDcnlwdG9LZXl8bnVsbH0gKi8KbGV0IGFlc0tleSA9IG51bGw7CgovKiogSVYgY291bnRlciDQtNC70Y8g0L/RgNC10LTQvtGC0LLRgNCw0YnQtdC90LjRjyDQv9C+0LLRgtC+0YDQvdC+0LPQviDQuNGB0L/QvtC70YzQt9C+0LLQsNC90LjRjyDQvdC+0L3RgdCwICovCmxldCBpdkNvdW50ZXIgPSAwOwoKLy8g4pSA4pSA4pSAINCS0YXQvtC00Y/RidC40LUg0YHQvtC+0LHRidC10L3QuNGPINC+0YIgRTJFRU1hbmFnZXIg4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSACgpzZWxmLm9ucnRjdHJhbnNmb3JtID0gKGV2ZW50KSA9PiB7CiAgY29uc3QgdHJhbnNmb3JtZXIgPSBldmVudC50cmFuc2Zvcm1lcjsKICBjb25zdCB7IG9wZXJhdGlvbiwga2luZCB9ID0gdHJhbnNmb3JtZXIub3B0aW9uczsKCiAgdHJhbnNmb3JtZXIucmVhZGFibGUKICAgIC5waXBlVGhyb3VnaChuZXcgVHJhbnNmb3JtU3RyZWFtKHsKICAgICAgdHJhbnNmb3JtOiBvcGVyYXRpb24gPT09ICdlbmNyeXB0JwogICAgICAgID8gZW5jcnlwdEZyYW1lCiAgICAgICAgOiBkZWNyeXB0RnJhbWUsCiAgICB9KSkKICAgIC5waXBlVG8odHJhbnNmb3JtZXIud3JpdGFibGUpCiAgICAuY2F0Y2goZSA9PiBjb25zb2xlLmVycm9yKGBbRTJFRVdvcmtlcl0gVHJhbnNmb3JtIGVycm9yICgke29wZXJhdGlvbn0vJHtraW5kfSk6YCwgZSkpOwp9OwoKc2VsZi5vbm1lc3NhZ2UgPSBhc3luYyAoZXZlbnQpID0+IHsKICBjb25zdCBtc2cgPSBldmVudC5kYXRhOwogIGlmIChtc2cudHlwZSA9PT0gJ3NldC1rZXknKSB7CiAgICBhZXNLZXkgPSBhd2FpdCBjcnlwdG8uc3VidGxlLmltcG9ydEtleSgKICAgICAgJ3JhdycsCiAgICAgIG1zZy5rZXlEYXRhLAogICAgICB7IG5hbWU6ICdBRVMtR0NNJyB9LAogICAgICBmYWxzZSwKICAgICAgWydlbmNyeXB0JywgJ2RlY3J5cHQnXQogICAgKTsKICAgIGNvbnNvbGUubG9nKCdbRTJFRVdvcmtlcl0gQUVTLUdDTSBrZXkgbG9hZGVkLicpOwogIH0KfTsKCi8vIOKUgOKUgOKUgCBFbmNyeXB0IOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgAoKYXN5bmMgZnVuY3Rpb24gZW5jcnlwdEZyYW1lKGVuY29kZWRGcmFtZSwgY29udHJvbGxlcikgewogIGlmICghYWVzS2V5KSB7CiAgICAvLyDQmtC70Y7RhyDQtdGJ0ZEg0L3QtSDQv9C+0LvRg9GH0LXQvSDigJQg0L/RgNC+0L/Rg9GB0LrQsNC10Lwg0LrQsNC00YAg0LHQtdC3INC40LfQvNC10L3QtdC90LjQuQogICAgY29udHJvbGxlci5lbnF1ZXVlKGVuY29kZWRGcmFtZSk7CiAgICByZXR1cm47CiAgfQoKICB0cnkgewogICAgY29uc3QgaXYgPSBtYWtlSVYoKTsKICAgIGNvbnN0IGNpcGhlcnRleHQgPSBhd2FpdCBjcnlwdG8uc3VidGxlLmVuY3J5cHQoCiAgICAgIHsgbmFtZTogJ0FFUy1HQ00nLCBpdiB9LAogICAgICBhZXNLZXksCiAgICAgIGVuY29kZWRGcmFtZS5kYXRhCiAgICApOwoKICAgIC8vINCh0L7QsdC40YDQsNC10Lw6IFtJViAoMTIgYnl0ZXMpXSArIFtjaXBoZXJ0ZXh0XQogICAgY29uc3QgZW5jcnlwdGVkID0gbmV3IFVpbnQ4QXJyYXkoaXYuYnl0ZUxlbmd0aCArIGNpcGhlcnRleHQuYnl0ZUxlbmd0aCk7CiAgICBlbmNyeXB0ZWQuc2V0KGl2LCAwKTsKICAgIGVuY3J5cHRlZC5zZXQobmV3IFVpbnQ4QXJyYXkoY2lwaGVydGV4dCksIGl2LmJ5dGVMZW5ndGgpOwoKICAgIGVuY29kZWRGcmFtZS5kYXRhID0gZW5jcnlwdGVkLmJ1ZmZlcjsKICAgIGNvbnRyb2xsZXIuZW5xdWV1ZShlbmNvZGVkRnJhbWUpOwogIH0gY2F0Y2ggKGUpIHsKICAgIGNvbnNvbGUuZXJyb3IoJ1tFMkVFV29ya2VyXSBFbmNyeXB0IGVycm9yOicsIGUpOwogICAgLy8g0J/RgNC4INC+0YjQuNCx0LrQtSDRiNC40YTRgNC+0LLQsNC90LjRjyDigJQg0L/RgNC+0L/Rg9GB0LrQsNC10Lwg0LrQsNC00YAgKNC90LUg0LrRgNC40LzQuNC90LDQu9GM0L3QviwgUW9TINC/0YDQtdC00L/QvtGH0YLQuNGC0LXQu9GM0L3QtdC1KQogICAgY29udHJvbGxlci5lbnF1ZXVlKGVuY29kZWRGcmFtZSk7CiAgfQp9CgovLyDilIDilIDilIAgRGVjcnlwdCDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIAKCmFzeW5jIGZ1bmN0aW9uIGRlY3J5cHRGcmFtZShlbmNvZGVkRnJhbWUsIGNvbnRyb2xsZXIpIHsKICBpZiAoIWFlc0tleSkgewogICAgY29udHJvbGxlci5lbnF1ZXVlKGVuY29kZWRGcmFtZSk7CiAgICByZXR1cm47CiAgfQoKICB0cnkgewogICAgY29uc3QgZGF0YSA9IG5ldyBVaW50OEFycmF5KGVuY29kZWRGcmFtZS5kYXRhKTsKICAgIGNvbnN0IGl2ID0gZGF0YS5zbGljZSgwLCAxMik7CiAgICBjb25zdCBjaXBoZXJ0ZXh0ID0gZGF0YS5zbGljZSgxMik7CgogICAgY29uc3QgcGxhaW50ZXh0ID0gYXdhaXQgY3J5cHRvLnN1YnRsZS5kZWNyeXB0KAogICAgICB7IG5hbWU6ICdBRVMtR0NNJywgaXYgfSwKICAgICAgYWVzS2V5LAogICAgICBjaXBoZXJ0ZXh0CiAgICApOwoKICAgIGVuY29kZWRGcmFtZS5kYXRhID0gcGxhaW50ZXh0OwogICAgY29udHJvbGxlci5lbnF1ZXVlKGVuY29kZWRGcmFtZSk7CiAgfSBjYXRjaCAoZSkgewogICAgLy8g0JTQtdC60L7QtCDQvtGI0LjQsdC60LAg0YLQuNC/0LjRh9C90LAg0L/RgNC4INC60LDQtNGA0LDRhSDQv9C10YDQtdC00LDQvdC90YvRhSDQtNC+INC+0LHQvNC10L3QsCDQutC70Y7Rh9Cw0LzQuCDigJQg0L/RgNC+0YHRgtC+INC00YDQvtC/0LDQtdC8CiAgICBjb25zb2xlLndhcm4oJ1tFMkVFV29ya2VyXSBEZWNyeXB0IGZhaWxlZCDigJQgZnJhbWUgZHJvcHBlZCAoZXhwZWN0ZWQgZHVyaW5nIGtleSBleGNoYW5nZSkuJyk7CiAgfQp9CgovLyDilIDilIDilIAgSVYgR2VuZXJhdGlvbiDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIAKCi8qKgogKiDQpNC+0YDQvNC40YDRg9C10YIgMTIt0LHQsNC50YLQvdGL0Lkg0L3QvtC90YEg0LTQu9GPIEFFUy1HQ006CiAqICAgWzQgYnl0ZXMgY291bnRlcl1bOCBieXRlcyByYW5kb20gc2FsdF0KICog0KHQvtCy0LzQtdGJ0LXQvdC40LUgY291bnRlciArIHJhbmRvbSDQv9GA0LDQutGC0LjRh9C10YHQutC4INC40YHQutC70Y7Rh9Cw0LXRgiDQutC+0LvQu9C40LfQuNC4IElWLgogKi8KZnVuY3Rpb24gbWFrZUlWKCkgewogIGNvbnN0IGl2ID0gbmV3IFVpbnQ4QXJyYXkoMTIpOwogIC8vIDQg0LHQsNC50YLQsDog0YHRh9C10YLRh9C40LogKGJpZy1lbmRpYW4pCiAgbmV3IERhdGFWaWV3KGl2LmJ1ZmZlcikuc2V0VWludDMyKDAsIGl2Q291bnRlcisrLCBmYWxzZSk7CiAgLy8gOCDQsdCw0LnRgjog0YHQu9GD0YfQsNC50L3Ri9C5IHNhbHQg0LTQu9GPINC00L7Qv9C+0LvQvdC40YLQtdC70YzQvdC+0Lkg0Y3QvdGC0YDQvtC/0LjQuAogIGNyeXB0by5nZXRSYW5kb21WYWx1ZXMoaXYuc3ViYXJyYXkoNCkpOwogIHJldHVybiBpdjsKfQo=",import.meta.url).href;await this._e2ee.attachToPeerConnection(this._engine.pc,e)}_waitForDataChannelOpen(){return new Promise((e,t)=>{const n=setTimeout(()=>t(new Error("[E2EE] DataChannel open timeout")),6e4),i=()=>{var s;const a=(s=this._engine)==null?void 0:s.dataChannel;if(!a)return this._callState==="idle"?(clearTimeout(n),void t(new Error("[E2EE] Call ended before DataChannel opened"))):void setTimeout(i,200);(r=>{if(r.readyState==="open")return clearTimeout(n),void e();const l=()=>{clearTimeout(n),r.removeEventListener("open",l),e()};r.addEventListener("open",l),r.readyState==="open"&&l()})(a)};i()})}_handleRemoteTrack(e){var t;const n=e.track,i=((t=e.streams)==null?void 0:t[0])??new MediaStream([n]);if(this._remoteStreams.set(n.id,i),n.kind==="audio"&&(this._els.remoteVideo.srcObject||(this._els.remoteVideo.srcObject=i,this._els.remoteVideo.play().catch(s=>{console.warn("[xoip-call] Audio playback warning:",s)})),this._attachRemoteVAD(i)),n.kind==="video"){const s=this.getAttribute("custom-remote-video");let a=this._els.remoteVideo;if(s){const r=document.querySelector(s);if(r){const l=typeof r.getVideoElement=="function"?r.getVideoElement():r.tagName==="VIDEO"?r:null;l&&(a=l,this._els.remoteVideo.style.display="none",this._emit("use-custom-video",{element:r}))}}a&&!a.srcObject&&(a.srcObject=i,a.play().catch(r=>{console.warn("[xoip-call] targetVideo.play() warning:",r)})),this._addRemoteThumbnail(n.id,i),this._attachRemoteVAD(i)}this._emit("remote-stream-ready",{stream:i,track:n})}_addRemoteThumbnail(e,t){var n;const i=document.createElement("video");i.srcObject=t,i.autoplay=!0,i.playsInline=!0,i.muted=!0,i.dataset.trackId=e,i.play().catch(()=>{}),i.addEventListener("click",()=>{const s=this._els.remoteVideo;s&&s.style.display!=="none"&&(s.srcObject=t),this._emit("switch-remote-stream",{stream:t})}),(n=this._els.remoteThumbs)==null||n.appendChild(i)}_handleDataMessage(e){var t;(e==null?void 0:e.type)==="e2ee-pubkey"&&e.key?(t=this._e2ee)==null||t.receiveRemotePublicKey(e.key):this._emit("channel-message",{data:e})}_handleConnectionState(e){console.log(`[xoip-call] PeerConnection state: ${e}`),e==="connected"&&(this._callState="connected",this._clearIceFailoverTimer(),this._turnRequested=!1),e==="checking"&&this._startIceFailoverTimer(),e==="failed"&&(this._clearIceFailoverTimer(),this._turnRequested&&this._emitXoipError("ERR_TURN_REQUIRED","P2P connection failed even after TURN request"),this._handleError("CONNECTION_FAILED",new Error("PeerConnection failed"))),e==="disconnected"&&this._startIceFailoverTimer()}_startIceFailoverTimer(){this._iceFailoverTimer||this._callState==="connected"||(this._iceFailoverTimer=setTimeout(()=>{var e,t;this._iceFailoverTimer=null,this._callState!=="connected"&&(console.warn("[xoip-call] ICE Failover Timer fired: requesting TURN servers"),this._turnRequested=!0,this._emit("xoip-need-turn",{message:"Direct P2P connection failed. TURN servers are required.",roomId:((e=this._signaling)==null?void 0:e.roomId)??((t=this._xoipSession)==null?void 0:t.roomId)}))},6e3))}_clearIceFailoverTimer(){this._iceFailoverTimer&&(clearTimeout(this._iceFailoverTimer),this._iceFailoverTimer=null)}_emitXoipError(e,t){this.dispatchEvent(new CustomEvent("xoip-error",{bubbles:!0,composed:!0,detail:{code:e,message:t}}))}_showCallScreen(){this._els.welcomeScreen.style.display="none",this._els.callContainer.classList.add("active"),this.hasAttribute("audio-only")&&this.setAudioOnlyMode(!0)}_resetUI(){var e,t,n,i;this._els.callContainer.classList.remove("active"),this._els.welcomeScreen.style.display="",this._els.remoteVideo.srcObject=null,this._els.remoteVideo.style.display="",this._els.remoteThumbs.innerHTML="",this._els.localCameras.innerHTML="",this._els.roomInput.value="",this._els.roomInput.readOnly=!0,this._els.joinBtn.disabled=!0,this._updateQualityUI({quality:"unknown"}),this.setAudioMute(!1),this.setVideoMute(!1),this.setAudioOnlyMode(!1),this._closeDevicePanel(),this._closeQrModal(),this._updateCamerasBtn(!1),(e=this._els.mainVideoArea)==null||e.classList.remove("speaking"),(t=this._els.audioAvatar)==null||t.classList.remove("speaking"),(n=this._els.localCameras)==null||n.classList.remove("speaking"),this._els.remoteLevelFill&&(this._els.remoteLevelFill.style.height="0%",(i=this._els.remoteLevelMeter)==null||i.classList.remove("active")),this._pipActive&&this.exitPiP(),this._els.pipSelfVideo&&(this._els.pipSelfVideo.srcObject=null),this._callState="idle",this._remoteStreams.clear()}_renderLocalCameras(){var e,t,n;if(!this._els.localCameras)return;this._els.localCameras.querySelectorAll("video").forEach(s=>{s.srcObject=null,s.remove()});const i=[];(e=this._media)!=null&&e.primaryStream&&i.push(...this._media.primaryStream.getVideoTracks()),(n=(t=this._media)==null?void 0:t.secondaryStreams)!=null&&n.length&&this._media.secondaryStreams.forEach(s=>{i.push(...s.getVideoTracks())}),i.forEach(s=>{const a=document.createElement("video");a.srcObject=new MediaStream([s]),a.autoplay=!0,a.playsInline=!0,a.muted=!0,this._els.localCameras.appendChild(a),a.play().catch(()=>{})})}_toggleLocalCameras(){this._localCamerasVisible=!this._localCamerasVisible,this._els.localCameras.classList.toggle("hidden",!this._localCamerasVisible),this._updateCamerasBtn(this._localCamerasVisible),this._localCamerasVisible&&this._renderLocalCameras()}_updateCamerasBtn(e){const t=this._els.camerasBtn;t&&(t.classList.toggle("active",e),t.title=e?"Hide Local Cameras":"Show Local Cameras")}_updateScreenBtn(e){const t=this._els.screenBtn;t&&(t.innerHTML=e?f.screenShareStop:f.screenShare,t.classList.toggle("screen-active",e),t.title=e?"Stop Screen Share":"Share Screen")}_updateQualityUI({quality:e,rtt:t,packetLoss:n}){const i=this._els.qualityBar,s=this._els.qualityLabel;if(!i||!s)return;i.className=e!==void 0?e:"";const a=t!=null?`${t}ms`:"—",r=n!=null?`${n}%`:"";s.textContent=t!=null?`${a} ${r}`.trim():e??"—",i.title=`RTT: ${a}  Loss: ${r}  Type: ${e??"?"}`}_showTooltip(e,t){clearTimeout(this._tooltipTimer);const n=this._els.tooltip;if(n){if(n.textContent=e,t){const i=t.getBoundingClientRect(),s=this.getBoundingClientRect();n.style.left=i.left-s.left+"px",n.style.top=i.top-s.top-36+"px"}n.style.opacity="1",this._tooltipTimer=setTimeout(()=>{n.style.opacity="0"},2500)}}_buildShareUrl(e=!1){var t;if((t=this._xoipSession)!=null&&t.shareURI)return`${location.origin}${location.pathname}#uri=${encodeURIComponent(this._xoipSession.shareURI)}`;const n=this._els.roomInput.value;if(!n)return null;let i=`${location.origin}${location.pathname}?room=${encodeURIComponent(n)}`;const s=this.getAttribute("signaling-type")||"firebase",a=[];if(s!=="firebase"&&a.push(`type=${encodeURIComponent(s)}`),e||this.hasAttribute("embed-config-in-share")){const r=this.getAttribute("signaling-token");if(r)a.push(`token=${encodeURIComponent(r)}`);else{const l=this.getAttribute("signaling-config");if(l)try{a.push(`cfg=${btoa(l)}`)}catch{}}}return a.length>0&&(i+=`#${a.join("&")}`),i}async _shareRoom(){const e=this._buildShareUrl();if(e)try{await navigator.clipboard.writeText(e),this._showTooltip("Link copied!",this._els.shareBtn)}catch{this._showTooltip("Copy failed",this._els.shareBtn)}}_handleRemoteHangup(){this._cleanup(!1),this._emit("call-ended",{reason:"remote_hangup"}),this._resetUI()}_cleanup(e){var t,n,i,s,a;(t=this._stats)==null||t.stop(),(n=this._e2ee)==null||n.terminate(),(i=this._media)==null||i.stopAll(),(s=this._engine)==null||s.close(),this._stopVAD(),this._stopMicLevel(),e&&((a=this._signaling)==null||a.disconnect()),this._clearIceFailoverTimer(),this._turnRequested=!1,e&&(this._xoipSession=null),this._stats=null,this._e2ee=null,this._engine=null,e&&(this._signaling=null),this._media=null}async getDevices(){const e=await navigator.mediaDevices.enumerateDevices();return{cameras:e.filter(t=>t.kind==="videoinput"),microphones:e.filter(t=>t.kind==="audioinput"),speakers:e.filter(t=>t.kind==="audiooutput")}}async _toggleDevicePanel(){const e=this._els.devicePanel;e.classList.contains("hidden")?(await this._populateDevicePanel(),e.classList.remove("hidden"),this._startMicLevel(),this._els.devicesBtn.classList.add("active")):this._closeDevicePanel()}_closeDevicePanel(){var e,t;(e=this._els.devicePanel)==null||e.classList.add("hidden"),(t=this._els.devicesBtn)==null||t.classList.remove("active"),this._stopMicLevel()}async _populateDevicePanel(){var e,t,n,i,s,a,r,l,h,u;const{cameras:g,microphones:v,speakers:m}=await this.getDevices(),d=(s=(i=(n=(t=(e=this._media)==null?void 0:e.primaryStream)==null?void 0:t.getVideoTracks())==null?void 0:n[0])==null?void 0:i.getSettings())==null?void 0:s.deviceId,_=(u=(h=(l=(r=(a=this._media)==null?void 0:a.primaryStream)==null?void 0:r.getAudioTracks())==null?void 0:l[0])==null?void 0:h.getSettings())==null?void 0:u.deviceId,I=(B,O,U)=>{B.innerHTML="",O.forEach(E=>{const A=document.createElement("option");A.value=E.deviceId,A.textContent=E.label||`Device ${E.deviceId.slice(0,8)}`,E.deviceId===U&&(A.selected=!0),B.appendChild(A)})};I(this._els.selectCamera,g,d),I(this._els.selectMic,v,_);const k=this._els.selectSpeaker;m.length>0&&typeof this._els.remoteVideo.setSinkId=="function"?(I(k,m,null),k.disabled=!1):(k.innerHTML="<option>Not supported in this browser</option>",k.disabled=!0)}async _applyDeviceSelection(){const e=this._els.selectCamera.value,t=this._els.selectMic.value,n=this._els.selectSpeaker.value;try{if(e&&this._media&&this._engine){const i=await this._media.switchCamera(e);await this._engine.replaceTrack("video",i),this._localCamerasVisible&&this._renderLocalCameras()}}catch(i){this._handleError("DEVICE_SWITCH_FAILED",i)}try{if(t&&this._media&&this._engine){const i=await this._media.switchMicrophone(t);await this._engine.replaceTrack("audio",i),this._startVAD()}}catch(i){this._handleError("DEVICE_SWITCH_FAILED",i)}try{n&&typeof this._els.remoteVideo.setSinkId=="function"&&await this._els.remoteVideo.setSinkId(n)}catch(i){console.warn("[xoip-call] setSinkId failed:",i)}this._closeDevicePanel(),this._showTooltip("Devices applied",this._els.devicesBtn)}_startMicLevel(){var e;this._stopMicLevel();const t=(e=this._media)==null?void 0:e.primaryStream;if(t)try{const n=this._vadAudioCtx??new AudioContext;this._vadAudioCtx=n;const i=n.createMediaStreamSource(t),s=n.createAnalyser();s.fftSize=256,i.connect(s);const a=new Uint8Array(s.frequencyBinCount),r=()=>{s.getByteFrequencyData(a);const l=a.reduce((u,g)=>u+g,0)/a.length,h=Math.min(100,l/128*100);this._els.micLevelFill&&(this._els.micLevelFill.style.width=`${h}%`),this._micLevelRafId=requestAnimationFrame(r)};this._micLevelRafId=requestAnimationFrame(r)}catch(n){console.warn("[xoip-call] Mic level visualizer error:",n)}}_stopMicLevel(){this._micLevelRafId&&(cancelAnimationFrame(this._micLevelRafId),this._micLevelRafId=null),this._els.micLevelFill&&(this._els.micLevelFill.style.width="0%")}async _togglePiP(){this._pipActive?await this.exitPiP():await this.enterPiP()}async enterPiP(){var e;const t=this._els.pipSelfView,n=this._els.pipSelfVideo;if(!t||!n)return;const i=(e=this._media)==null?void 0:e.primaryStream;i&&i.getVideoTracks().length?(n.srcObject=i,n.play().catch(()=>{}),t.classList.remove("hidden"),this._pipActive=!0,this._els.pipBtn&&(this._els.pipBtn.classList.add("pip-active"),this._els.pipBtn.title="Hide Self View")):this._showTooltip("No local camera",this._els.pipBtn)}async exitPiP(){const e=this._els.pipSelfView,t=this._els.pipSelfVideo;e&&e.classList.add("hidden"),t&&(t.srcObject=null),this._pipActive=!1,this._els.pipBtn&&(this._els.pipBtn.classList.remove("pip-active"),this._els.pipBtn.title="Picture-in-Picture")}_setupPipSelfView(){const e=this._els.pipSelfView;if(!e)return;let t=!1,n=0,i=0,s=0,a=0;const r=()=>this._els.mainVideoArea,l=()=>{t=!1};e.addEventListener("pointerdown",h=>{if(h.target.closest(".pip-close-btn"))return;t=!0,n=h.clientX,i=h.clientY;const u=e.getBoundingClientRect(),g=r(),v=g==null?void 0:g.getBoundingClientRect();v&&(s=u.left-v.left,a=v.bottom-u.bottom,e.style.left=s+"px",e.style.bottom=a+"px",e.style.right="auto",e.style.top="auto",e.setPointerCapture(h.pointerId),h.preventDefault())}),e.addEventListener("pointermove",h=>{if(!t)return;const u=h.clientX-n,g=h.clientY-i,v=r(),m=v==null?void 0:v.getBoundingClientRect();if(!m)return;const d=e.offsetWidth,_=e.offsetHeight;let I=Math.max(0,Math.min(s+u,m.width-d)),k=Math.max(0,Math.min(a-g,m.height-_));e.style.left=I+"px",e.style.bottom=k+"px"}),e.addEventListener("pointerup",l),e.addEventListener("pointercancel",l)}_startVAD(){var e,t;this._stopVAD();const n=parseInt(this.getAttribute("vad-threshold")??"15",10);try{const i=this._vadAudioCtx??new(window.AudioContext||window.webkitAudioContext);this._vadAudioCtx=i;const s=(e=this._media)==null?void 0:e.primaryStream;if(s!=null&&s.getAudioTracks().length){const u=i.createMediaStreamSource(s),g=i.createAnalyser();g.fftSize=512,g.smoothingTimeConstant=.6,u.connect(g),this._vadAnalyserLocal=g}const a=(t=this._els.remoteVideo)==null?void 0:t.srcObject;a instanceof MediaStream&&a.getAudioTracks().length>0&&this._attachRemoteVAD(a);let r=null,l=null;const h=()=>{var u,g;if(this._vadAnalyserLocal){r&&r.length===this._vadAnalyserLocal.frequencyBinCount||(r=new Uint8Array(this._vadAnalyserLocal.frequencyBinCount)),this._vadAnalyserLocal.getByteFrequencyData(r);const v=r.reduce((m,d)=>m+d,0)/r.length;this._updateLocalSpeaking(v>n)}else this._updateLocalSpeaking(!1);if(this._vadAnalyserRemote){l&&l.length===this._vadAnalyserRemote.frequencyBinCount||(l=new Uint8Array(this._vadAnalyserRemote.frequencyBinCount)),this._vadAnalyserRemote.getByteFrequencyData(l);const v=l.reduce((d,_)=>d+_,0)/l.length,m=v>n;if(this._updateRemoteSpeaking(m),this._els.remoteLevelFill){const d=Math.min(100,Math.max(0,Math.round(v/90*100)));this._els.remoteLevelFill.style.height=`${d}%`,(u=this._els.remoteLevelMeter)==null||u.classList.toggle("active",v>Math.max(3,n/3))}}else this._updateRemoteSpeaking(!1),this._els.remoteLevelFill&&(this._els.remoteLevelFill.style.height="0%",(g=this._els.remoteLevelMeter)==null||g.classList.remove("active"));this._vadRafId=requestAnimationFrame(h)};this._vadRafId=requestAnimationFrame(h)}catch(i){console.warn("[xoip-call] VAD init error:",i)}}_attachRemoteVAD(e){if(e&&e instanceof MediaStream&&e.getAudioTracks().length)try{this._vadAudioCtx||(this._vadAudioCtx=new(window.AudioContext||window.webkitAudioContext));const t=this._vadAudioCtx,n=t.createMediaStreamSource(e),i=t.createAnalyser();i.fftSize=512,i.smoothingTimeConstant=.6,n.connect(i),this._vadAnalyserRemote=i}catch(t){console.warn("[xoip-call] Remote VAD attach error:",t)}}_stopVAD(){var e;this._vadRafId&&(cancelAnimationFrame(this._vadRafId),this._vadRafId=null),this._vadAnalyserLocal=null,this._vadAnalyserRemote=null,this._els.remoteLevelFill&&(this._els.remoteLevelFill.style.height="0%",(e=this._els.remoteLevelMeter)==null||e.classList.remove("active")),this._updateLocalSpeaking(!1),this._updateRemoteSpeaking(!1)}_updateLocalSpeaking(e){var t,n;e!==this._vadLocalActive&&(this._vadLocalActive=e,(t=this._els.localCameras)==null||t.classList.toggle("speaking",e),this._pipActive&&((n=this._els.pipSelfView)==null||n.classList.toggle("speaking",e)),this._emit(e?"speaking-start":"speaking-stop",{source:"local"}))}_updateRemoteSpeaking(e){var t,n,i,s;e!==this._vadRemoteActive&&(this._vadRemoteActive=e,(t=this._els.mainVideoArea)==null||t.classList.toggle("speaking",e),(n=this._els.audioAvatar)==null||n.classList.toggle("speaking",e),(i=this._els.speakingRingRemote)==null||i.classList.toggle("active",e),this._audioOnlyMode&&((s=this._els.audioWaveRemote)==null||s.classList.toggle("active",e)),this._emit(e?"speaking-start":"speaking-stop",{source:"remote"}))}setAudioOnlyMode(e){this._audioOnlyMode=e;const t=this._els.audiomodeBtn,n=this._els.audioAvatar,i=this._els.remoteVideo;e?(n==null||n.classList.remove("hidden"),i&&(i.style.opacity="0"),t==null||t.classList.add("audiomode-active"),t&&(t.title="Disable Audio-Only Mode"),this.setVideoMute(!0)):(n==null||n.classList.add("hidden"),i&&(i.style.opacity=""),t==null||t.classList.remove("audiomode-active"),t&&(t.title="Audio-Only Mode"))}_openQrModal(){const e=this._buildShareUrl();if(!e)return void this._showTooltip("No room to share",this._els.qrBtn);this._els.qrUrl.textContent=e,this._els.qrContainer.innerHTML="";const t=this._generateQrCanvas(e);this._els.qrContainer.appendChild(t),this._els.qrModal.classList.remove("hidden")}_closeQrModal(){var e;(e=this._els.qrModal)==null||e.classList.add("hidden")}_generateQrCanvas(e){const t=document.createElement("canvas");if(new TextEncoder().encode(e).length>270){t.style.display="none";const l=document.createElement("textarea");return l.readOnly=!0,l.value=e,l.style.cssText="width:100%;height:80px;font-size:11px;border:1px solid #334155;background:#0f172a;color:#f8fafc;resize:none;outline:none;font-family:monospace;padding:8px;border-radius:6px",this._els.qrContainer.appendChild(l),t}const n=this._buildQrMatrix(e);if(!n)return t.width=200,t.height=200,t;const i=n.length,s=Math.max(3,Math.floor(220/(i+4))),a=(i+4)*s;t.width=a,t.height=a,t.style.maxWidth="100%",t.style.height="auto";const r=t.getContext("2d");r.fillStyle="#ffffff",r.fillRect(0,0,a,a),r.fillStyle="#0f172a";for(let l=0;l<i;l++)for(let h=0;h<i;h++)n[l][h]&&r.fillRect((h+2)*s,(l+2)*s,s,s);return t}_buildQrMatrix(e){try{return this._qrGenerate(e,"L")}catch(t){return console.warn("[xoip-call] QR generation failed:",t),null}}_qrGenerate(e,t="L"){const n=new Uint8Array(256),i=new Uint8Array(256);for(let c=0,p=1;c<255;c++)n[c]=p,i[p]=c,p=p<<1^(p>=128?285:0);n[255]=n[0];const s=(c,p)=>c&&p?n[(i[c]+i[p])%255]:0,a=(c,p)=>{const w=((Q,F)=>{let S=[1];for(let Y=0;Y<F;Y++){const H=new Uint8Array(S.length+1);for(let D=0;D<S.length;D++)H[D]^=s(S[D],n[Y]),H[D+1]^=S[D];S=Array.from(H)}return S})(0,p),y=new Uint8Array(p);for(const Q of c){const F=Q^y[0];y.copyWithin(0,1),y[p-1]=0;for(let S=0;S<p;S++)y[S]^=s(w[S+1],F)}return y},r=[null,[1,19,7,1],[2,34,10,1],[3,55,15,1],[4,80,20,2],[5,108,26,2],[6,136,18,2],[7,156,20,4],[8,194,24,2],[9,232,30,3],[10,274,18,4]],l=Array.from(new TextEncoder().encode(e)),h=l.length;let u=r.findIndex((c,p)=>p>0&&c&&c[1]>=h+2);if(u<0)return null;const[,g,v,m]=r[u],d=17+4*u,_=new Uint8Array(g);_[0]=64,_[0]|=h>>4&15,_[1]=(15&h)<<4|l[0]>>4&15;for(let c=0;c<h-1;c++)_[2+c]=(15&l[c])<<4|l[c+1]>>4&15;_[2+h-1]=(15&l[h-1])<<4;let I=3+h-1;const k=[236,17];for(let c=0;I<g;I++,c++)_[I]=k[c%2];const B=v,O=Math.floor(g/m),U=[],E=[],A=[];for(let c=0;c<m;c++){const p=c*O,w=c===m-1?g:p+O,y=_.slice(p,w);E.push(y),A.push(a(y,B))}const me=Math.max(...E.map(c=>c.length));for(let c=0;c<me;c++)for(const p of E)c<p.length&&U.push(p[c]);for(let c=0;c<B;c++)for(const p of A)U.push(p[c]);const K=[];for(const c of U)for(let p=7;p>=0;p--)K.push(c>>p&1);const ve=[0,7,7,7,7,7,0,0,0,0];for(let c=0;c<ve[u];c++)K.push(0);const P=Array.from({length:d},()=>new Array(d).fill(null)),X=Array.from({length:d},()=>new Array(d).fill(!1)),R=(c,p,w,y=!1)=>{c<0||c>=d||p<0||p>=d||(P[c][p]=w,y&&(X[c][p]=!0))},G=(c,p)=>{for(let w=-1;w<=7;w++)for(let y=-1;y<=7;y++)R(c+w,p+y,w>=0&&w<=6&&y>=0&&y<=6&&(w===0||w===6||y===0||y===6||w>=2&&w<=4&&y>=2&&y<=4),!0)};G(0,0),G(0,d-7),G(d-7,0);for(let c=8;c<d-8;c++)R(6,c,c%2==0,!0),R(c,6,c%2==0,!0);R(d-8,8,!0,!0);const $=[1,1,1,0,1,1,1,1,1,0,0,0,1,0,0],J=[[8,0],[8,1],[8,2],[8,3],[8,4],[8,5],[8,7],[8,8],[7,8],[5,8],[4,8],[3,8],[2,8],[1,8],[0,8]],W=[[d-1,8],[d-2,8],[d-3,8],[d-4,8],[d-5,8],[d-6,8],[d-7,8],[8,d-8],[8,d-7],[8,d-6],[8,d-5],[8,d-4],[8,d-3],[8,d-2],[8,d-1]];for(let c=0;c<15;c++)R(J[c][0],J[c][1],$[c]===1,!0),W[c]&&R(W[c][0],W[c][1],$[c]===1,!0);let z=0,N=!0;for(let c=d-1;c>=1;c-=2){c===6&&(c=5);for(let p=N?d-1:0;N?p>=0:p<d;p+=N?-1:1)for(let w=0;w<2;w++){const y=c-w;if(!X[p][y]){const Q=z<K.length?K[z++]:0;R(p,y,((p+y)%2==0?1^Q:Q)===1)}}N=!N}for(let c=0;c<d;c++)for(let p=0;p<d;p++)P[c][p]===null&&(P[c][p]=!1);return P}_handleError(e,t){console.error(`[xoip-call] Error [${e}]:`,t),this._emit("error",{code:e,message:t==null?void 0:t.message,error:t})}_emit(e,t={}){this.dispatchEvent(new CustomEvent(e,{detail:t,bubbles:!0,composed:!0}))}}class Ge{async announce(e){throw new Error("[DiscoveryProvider] announce() must be implemented")}async resolve(e){throw new Error("[DiscoveryProvider] resolve() must be implemented")}async remove(e){throw new Error("[DiscoveryProvider] remove() must be implemented")}async connect(){}async close(){}static createAnnouncement({roomId:e,signalingType:t,token:n,endpoint:i,ttlSeconds:s=300}){return{v:1,room:e,signaling:{type:t,...i&&{endpoint:i},...n&&{token:n}},expires:Math.floor(Date.now()/1e3)+s}}static isExpired(e){return!(e!=null&&e.expires)||Math.floor(Date.now()/1e3)>=e.expires}}const We="https://api.nostr.watch/v1/online",Fe=["wss://greenart7c3.feeds.relay.tools/","wss://relay.primal.net","wss://relay.damus.io","wss://nos.lol","wss://nostr.mom","wss://relay.nostr.band"];class Ye extends Ge{constructor(e={}){super(),this._configuredRelays=e.configuredRelays??["wss://greenart7c3.feeds.relay.tools/","wss://relay.primal.net","wss://relay.damus.io","wss://nos.lol"],this._candidateRelays=e.candidateRelays??Fe,this._selectCount=e.selectCount??5,this._nostrWatchApiUrl=e.nostrWatchApiUrl??We,this._discoveryTimeoutMs=e.discoveryTimeoutMs??2e3,this._enableHttpFetch=e.enableHttpFetch??(typeof window>"u"||!!e.nostrWatchApiUrl),this._cachedRelays=null,this._cacheExpiresAt=0,this._cacheTtlMs=3e5}async announce(e){console.warn("[NostrRelayDiscovery] announce() is not implemented in relay discovery. Use NostrSignalingAdapter.")}async resolve(e){return null}async remove(e){}async discoverRelays(){if(this._cachedRelays&&Date.now()<this._cacheExpiresAt)return console.log("[NostrRelayDiscovery] Using cached relays."),this._cachedRelays.map(e=>e.url);try{const e=await Promise.race([this._runDiscoveryPipeline(),je(this._discoveryTimeoutMs,"Discovery timeout")]);return this._cachedRelays=e,this._cacheExpiresAt=Date.now()+this._cacheTtlMs,console.log(`[NostrRelayDiscovery] Selected ${e.length} relays.`),e.map(t=>t.url)}catch(e){return console.warn(`[NostrRelayDiscovery] Discovery failed (${e.message}). Falling back to configured relays.`),this._configuredRelays}}async _runDiscoveryPipeline(){let e=[];if(this._enableHttpFetch&&this._nostrWatchApiUrl)try{const[a]=await Promise.allSettled([this._fetchNostrWatchRelays()]);a.status==="fulfilled"&&(e=a.value)}catch{e=[]}const t=[...this._configuredRelays,...this._candidateRelays||[],...e].map(a=>He(a)).filter(Boolean),n=[...new Set(t)];console.log(`[NostrRelayDiscovery] Candidates: ${n.length} (configured: ${this._configuredRelays.length}, candidates: ${(this._candidateRelays||[]).length}, discovered: ${e.length})`);const i=(await Promise.allSettled(n.map(a=>this._checkRelayHealth(a)))).filter(a=>a.status==="fulfilled"&&a.value!==null).map(a=>a.value);console.log(`[NostrRelayDiscovery] Healthy relays: ${i.length}/${n.length}`),i.sort((a,r)=>a.latency-r.latency);const s=i.slice(0,this._selectCount);return s.length===0?this._configuredRelays.map(a=>({url:a,latency:1/0,readable:!0,writable:!0})):s}async _fetchNostrWatchRelays(){if(!this._nostrWatchApiUrl||!this._enableHttpFetch)return[];const e=new AbortController,t=setTimeout(()=>e.abort(),this._discoveryTimeoutMs);try{const n=await fetch(this._nostrWatchApiUrl,{signal:e.signal,headers:{Accept:"application/json"}});if(!n.ok)throw new Error(`nostr.watch HTTP ${n.status}`);const i=await n.json();return Array.isArray(i)?i.filter(s=>typeof s=="string"):Array.isArray(i.relays)?i.relays.filter(s=>typeof s=="string"):Array.isArray(i.online)?i.online.filter(s=>typeof s=="string"):[]}catch(n){throw n.name==="AbortError"?new Error("nostr.watch request timed out"):n}finally{clearTimeout(t)}}async _checkRelayHealth(e){return new Promise(t=>{const n=Date.now();let i=!1,s=null;const a=l=>{if(!i){if(i=!0,clearTimeout(r),s){s.onopen=null,s.onerror=null,s.onclose=null;try{s.close()}catch{}}t(l)}},r=setTimeout(()=>{a(null)},1200);try{s=new WebSocket(e)}catch{return void a(null)}s.onopen=()=>{const l=Date.now()-n;a({url:e,latency:l,readable:!0,writable:!0})},s.onerror=()=>{a(null)},s.onclose=()=>{a(null)}})}}function He(o){return o&&typeof o=="string"?(o=o.trim()).startsWith("ws://")?o.replace("ws://","wss://"):o.startsWith("wss://")?o:o.startsWith("http://")?o.replace("http://","wss://"):o.startsWith("https://")?o.replace("https://","wss://"):o.includes("://")?null:`wss://${o}`:null}function je(o,e="Timeout"){return new Promise((t,n)=>setTimeout(()=>n(new Error(e)),o))}typeof customElements>"u"||customElements.get("xoip-call")||customElements.define("xoip-call",qe);const C=document.getElementById("xoip"),pe=document.getElementById("event-log-list")||document.getElementById("event-log"),ue=document.getElementById("uri-input"),Ze=document.getElementById("uri-display"),Xe=document.getElementById("uri-text"),$e=document.getElementById("uri-timestamp"),M=document.getElementById("btn-copy-uri"),ie=document.getElementById("btn-clear-log");ie&&ie.addEventListener("click",()=>{pe.innerHTML=""});const Je=new Ye({configuredRelays:["wss://greenart7c3.feeds.relay.tools/","wss://relay.primal.net","wss://relay.damus.io","wss://nos.lol"],selectCount:3,discoveryTimeoutMs:2e3});let L="";function b(o,e){const t=document.createElement("div");t.className="entry";const n=new Date().toLocaleTimeString("en",{hour12:!1});t.innerHTML=`<span style="color:#64748b">[${n}]</span> <span class="ev-name">${o}</span> <span class="ev-detail">${JSON.stringify(e)}</span>`,pe.prepend(t)}function q(o){L=o,ue.value=o,Xe.textContent=o,$e.textContent=new Date().toLocaleTimeString(),Ze.style.display="flex",M.disabled=!1}async function ge(){const o=document.getElementById("relays-status-text"),e=document.getElementById("badge-relays");o&&(o.textContent="🔍 Checking relays (Health Check)..."),b("discovery-pipeline",{action:"start",timeoutMs:2e3});try{const t=await Je.discoverRelays();return(!C._callState||C._callState==="idle")&&C.setAttribute("signaling-config",JSON.stringify({relays:t})),o&&(o.innerHTML=`<span style="color:#34d399; font-weight:600;">✓ Active (${t.length}):</span> `+t.map(n=>`<span style="color:#e2e8f0; background:#1e293b; padding:2px 6px; border-radius:4px; font-family:monospace; font-size:11px;">${n.replace("wss://","")}</span>`).join(" ")),e&&(e.textContent=`⚡ Relays: ${t.length} active`,e.className="badge badge-green"),b("discovery-pipeline",{status:"healthy",relays:t}),t}catch(t){return console.warn("[Discovery] Failed, fallback to configured:",t),b("⚠️ discovery-fallback",{message:t.message}),o&&(o.textContent="Using default relays (fallback)"),null}}const ze=decodeURIComponent(window.location.hash||""),et=decodeURIComponent(window.location.search||""),tt=ze.includes("xoip://")||et.includes("xoip://");if(!tt)ge();else{const o=document.getElementById("relays-status-text"),e=document.getElementById("badge-relays");o&&(o.textContent="Using relays from incoming URI"),e&&(e.textContent="🔗 Peer Mode",e.className="badge badge-green")}document.getElementById("btn-discover-relays").addEventListener("click",async()=>{await ge()});document.getElementById("btn-create-uri").addEventListener("click",async()=>{try{b("uri-creating",{type:"nostr"}),await C.createRoom()}catch(o){b("❌ create-failed",{message:o.message})}});document.getElementById("btn-connect-uri").addEventListener("click",async()=>{const o=ue.value.trim();if(!o){alert("Please paste a xoip:// URI into the input field!");return}try{b("uri-connecting",{uri:o.slice(0,35)+"..."}),q(o),await C.connect(o)}catch(e){b("❌ connect-failed",{message:e.message}),alert("Connection error via URI: "+e.message)}});M.addEventListener("click",async()=>{if(!L)return;await navigator.clipboard.writeText(L),b("📋 copied-uri",{uri:L.slice(0,35)+"..."});const o=M.textContent;M.textContent="✅ Copied!",setTimeout(()=>{M.textContent=o},2e3)});document.getElementById("btn-open-peer").addEventListener("click",()=>{var t;const o=L||((t=C._xoipSession)==null?void 0:t.shareURI);let e=`${location.origin}${location.pathname}`;o&&(e+=`#uri=${encodeURIComponent(o)}`),window.open(e,"_blank"),b("👥 open-peer-tab",{targetUrl:e.slice(0,40)+"..."})});const se=document.getElementById("btn-open-dashboard");se&&se.addEventListener("click",o=>{const e=document.querySelector("xoip-qos");e&&e.openDashboard(o)});document.getElementById("btn-send-ping").addEventListener("click",()=>{const o={type:"ping",text:"Hello from Nostr peer via xoip:// URI!",timestamp:Date.now()};try{C.sendData(o),b("📤 sent-data",o)}catch(e){b("❌ send-failed",{message:e.message})}});window.addEventListener("DOMContentLoaded",async()=>{let o=null;if(window.location.hash){const e=window.location.hash.slice(1);if(e.startsWith("xoip://"))o=decodeURIComponent(e);else try{const t=new URLSearchParams(e),n=t.get("uri")||t.get("src");n&&n.startsWith("xoip://")&&(o=n)}catch{}}if(!o){const e=new URLSearchParams(window.location.search),t=e.get("uri")||e.get("src");t&&t.startsWith("xoip://")&&(o=t)}o&&(b("🔗 auto-detected-uri",{uri:o.slice(0,35)+"..."}),q(o),setTimeout(()=>{C.connect(o).catch(e=>{b("❌ auto-connect-failed",{message:e.message})})},100))});C.addEventListener("room-created",({detail:o})=>{var t;const e=o.shareURI||((t=C._xoipSession)==null?void 0:t.shareURI);e&&q(e),b("room-created",{roomId:`${o.roomId.slice(0,16)}...`,hasURI:!!e}),console.log("[xoip-demo] Nostr Room created. shareURI:",e)});C.addEventListener("room-joined",({detail:o})=>{const e=o.uri||L;e&&q(e),b("room-joined",{roomId:`${o.roomId.slice(0,16)}...`}),console.log("[xoip-demo] Joined Nostr room:",o.roomId)});C.addEventListener("remote-stream-ready",({detail:o})=>{var e,t,n;b("remote-stream-ready",{trackId:(e=o.track)==null?void 0:e.id,kind:(t=o.track)==null?void 0:t.kind}),console.log("[xoip-demo] Remote stream track ready:",(n=o.track)==null?void 0:n.kind)});C.addEventListener("channel-message",({detail:o})=>{b("channel-message",o.data),console.log("[xoip-demo] DataChannel message received:",o.data)});C.addEventListener("network-quality",({detail:o})=>{b("network-quality",{rtt:o.rtt,loss:`${o.packetLoss}%`,quality:o.quality})});C.addEventListener("call-ended",({detail:o})=>{b("call-ended",o),L="",M.disabled=!0,console.log("[xoip-demo] Call ended:",o.reason)});C.addEventListener("error",({detail:o})=>{b("❌ error",{code:o.code,msg:o.message}),console.error("[xoip-demo] Error:",o)});export{De as a,ce as b,Z as c,Te as d};
