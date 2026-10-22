const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./firebase-adapter-DTdSu7uZ.js","./signaling-interface-Bi08jIxW.js","./p2p-adapter-DTUzgtcg.js","./websocket-adapter-B2lcr0zo.js"])))=>i.map(i=>d[i]);
(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const n of document.querySelectorAll('link[rel="modulepreload"]'))i(n);new MutationObserver(n=>{for(const s of n)if(s.type==="childList")for(const r of s.addedNodes)r.tagName==="LINK"&&r.rel==="modulepreload"&&i(r)}).observe(document,{childList:!0,subtree:!0});function t(n){const s={};return n.integrity&&(s.integrity=n.integrity),n.referrerPolicy&&(s.referrerPolicy=n.referrerPolicy),n.crossOrigin==="use-credentials"?s.credentials="include":n.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function i(n){if(n.ep)return;n.ep=!0;const s=t(n);fetch(n.href,s)}})();const ve="webrtc_qos_channel",I={LOW:0,NORMAL:1,HIGH:2,CRITICAL:3},ee={"ice.failed":I.CRITICAL,"qos.congestion":I.CRITICAL,"candidate.changed":I.HIGH,"policy.updated":I.HIGH,"telemetry.summary":I.NORMAL,"statistics.persist":I.LOW};function W(){return typeof crypto<"u"&&typeof crypto.randomUUID=="function"?crypto.randomUUID():"uuid-"+Date.now()+"-"+Math.random().toString(36).substring(2,15)}class fe{constructor(e={}){this._logInProgress=!1,this.channelName=e.channelName||"worker-event-bus",this.allowedTopics=e.allowedTopics||null,this.maxPayloadSize=e.maxPayloadSize||65536,this.absoluteMaxPayloadSize=262144,this.maxCacheSize=e.maxCacheSize||1e3,this.sourceName=e.sourceName||(typeof window>"u"?"worker-"+W().substring(0,8):"main-thread"),typeof BroadcastChannel<"u"?(this.channel=new BroadcastChannel(this.channelName),this.channel.onmessage=t=>this._onChannelMessage(t.data)):(console.warn("[WorkerEventBus] BroadcastChannel is not supported in this environment."),this.channel=null),this.subscriptions=new Map,this.replayCache=new Map,this.pendingRequests=new Map,this.serviceRegistry=new Map,this.incomingQueue={[I.CRITICAL]:[],[I.HIGH]:[],[I.NORMAL]:[],[I.LOW]:[]},this.queueProcessing=!1,this.heartbeatInterval=null,e.enableHeartbeat!==!1&&this._startHeartbeat()}_matchTopic(e,t){if(e==="*"||e==="**")return!0;if(!e.includes("*"))return e===t;const i="^"+e.replace(/\./g,"\\.").replace(/\*\*/g,".*").replace(/\*/g,"[^.]+")+"$";try{return new RegExp(i).test(t)}catch{return!1}}_log(e,t,i={}){if(this._logInProgress)console.warn(`[WorkerEventBus] Re-entrant log prevented for level ${e}`);else{this._logInProgress=!0;try{const n=`system.${e}`,s={text:t,...i};this._publishRaw(n,s,{priority:I.LOW,skipAudit:!0})}finally{this._logInProgress=!1}}}_validateMessage(e){if(!e||typeof e!="object"||typeof e.id!="string"||typeof e.topic!="string"||e.topic.length>128||typeof e.timestamp!="number"||e.payload===void 0)return!1;if(!e.topic.startsWith("system.")){if(this.allowedTopics&&!this.allowedTopics.some(t=>this._matchTopic(t,e.topic)))return!1;try{if(new TextEncoder().encode(JSON.stringify(e.payload)).length>Math.min(this.maxPayloadSize,this.absoluteMaxPayloadSize))return!1}catch{return!1}}return!0}publish(e,t,i={}){return this._publishRaw(e,t,i)}_publishRaw(e,t,i={}){const n=i.priority!==void 0?i.priority:ee[e]!==void 0?ee[e]:I.NORMAL,s={id:W(),type:i.type||"event",topic:e,source:this.sourceName,timestamp:Date.now(),payload:t,priority:n};if(i.replyTo&&(s.replyTo=i.replyTo),i.requestId&&(s.requestId=i.requestId),!this._validateMessage(s))return this._log("error",`Message validation failed for topic: ${e}`),null;if(i.skipAudit||e.startsWith("system.")||this._log("log",`Published to topic: ${e}`,{msgId:s.id,priority:n}),this._enqueueMessage(s),this.channel)try{this.channel.postMessage(s)}catch(r){this._log("error",`Failed to broadcast message: ${r.message}`,{topic:e})}return s.id}subscribe(e,t,i={}){const n=W();this.subscriptions.set(n,{topicPattern:e,handler:t,options:i}),this._log("log",`Subscribed to topic pattern: ${e}`,{subscriptionId:n});for(const[s,r]of this.replayCache.entries())this._matchTopic(e,s)&&setTimeout(()=>{this._deliverMessageToSubscriber(r,t)},0);return n}unsubscribe(e){if(this.subscriptions.has(e)){const t=this.subscriptions.get(e);return this.subscriptions.delete(e),this._log("log",`Unsubscribed from topic pattern: ${t.topicPattern}`,{subscriptionId:e}),!0}return!1}async request(e,t,i={}){const n=W(),s=i.timeout||5e3;return new Promise((r,a)=>{const l=setTimeout(()=>{this.pendingRequests.delete(n),this._log("warn",`Request to topic ${e} timed out after ${s}ms`,{requestId:n}),a(new Error(`Request timed out after ${s}ms`))},s);this.pendingRequests.set(n,{resolve:r,reject:a,timeoutId:l}),this._log("log",`Sending request to topic: ${e}`,{requestId:n}),this._publishRaw(e,t,{...i,type:"request",replyTo:n})})}reply(e,t){this._log("log",`Replying to request: ${e}`),this._publishRaw(`reply.${e}`,t,{type:"response",requestId:e})}_onChannelMessage(e){e&&typeof e=="object"&&e.source!==this.sourceName&&typeof e.topic=="string"&&this._enqueueMessage(e)}_enqueueMessage(e){if(!e||typeof e.topic!="string")return;const t=e.priority!==void 0?e.priority:I.NORMAL;(this.incomingQueue[t]||this.incomingQueue[I.NORMAL]).push(e),e.type!=="event"||e.topic.startsWith("system.")||e.topic.startsWith("reply.")||this._updateReplayCache(e.topic,e),this._scheduleQueueProcessing()}_updateReplayCache(e,t){if(this.replayCache.has(e))this.replayCache.delete(e);else if(this.replayCache.size>=this.maxCacheSize){const i=this.replayCache.keys().next().value;this.replayCache.delete(i)}this.replayCache.set(e,t)}_scheduleQueueProcessing(){this.queueProcessing||(this.queueProcessing=!0,queueMicrotask(()=>this._processQueue()))}_processQueue(){const e=[I.CRITICAL,I.HIGH,I.NORMAL,I.LOW];for(;;){let t=null;for(const i of e)if(this.incomingQueue[i].length>0){t=this.incomingQueue[i].shift();break}if(!t)break;this._handleIncomingMessage(t)}this.queueProcessing=!1}_handleIncomingMessage(e){if(e&&typeof e.topic=="string"){if(e.type==="response"&&e.requestId){const t=this.pendingRequests.get(e.requestId);return void(t&&(clearTimeout(t.timeoutId),this.pendingRequests.delete(e.requestId),this._log("log",`Received response for request: ${e.requestId}`),t.resolve(e.payload)))}(e.topic==="worker.online"||e.topic.startsWith("service."))&&this._handleServiceDiscovery(e);for(const[t,i]of this.subscriptions.entries())e.topic.startsWith("system.")&&!(i.topicPattern==="system.*"||i.topicPattern==="**"||i.topicPattern.startsWith("system."))||this._matchTopic(i.topicPattern,e.topic)&&this._deliverMessageToSubscriber(e,i.handler)}}async _deliverMessageToSubscriber(e,t){try{const i=t(e);e.type==="request"&&e.replyTo&&(i instanceof Promise?i.then(n=>this.reply(e.replyTo,n)).catch(n=>{this._log("error",`Request handler promise failed: ${n.message}`,{requestId:e.replyTo}),this.reply(e.replyTo,{error:n.message})}):i!==void 0&&this.reply(e.replyTo,i))}catch(i){this._log("error",`Subscriber error on topic ${e.topic}: ${i.message}`,{topic:e.topic,stack:i.stack})}}_handleServiceDiscovery(e){if(e.topic==="worker.online"){const t=e.payload||{};t.serviceName&&(this.serviceRegistry.set(t.serviceName,{source:e.source,timestamp:e.timestamp,...t}),this._log("log",`Service registered: ${t.serviceName}`,{serviceName:t.serviceName}))}else if(e.topic==="worker.offline"){const t=e.payload||{};t.serviceName&&(this.serviceRegistry.delete(t.serviceName),this._log("log",`Service unregistered: ${t.serviceName}`,{serviceName:t.serviceName}))}else if(e.topic.startsWith("service.")&&e.topic.endsWith(".online")){const t=e.topic.replace(/^service\./,"").replace(/\.online$/,"");this.serviceRegistry.set(t,{source:e.source,timestamp:e.timestamp,...e.payload}),this._log("log",`Service discovered: ${t}`,{serviceName:t})}}_startHeartbeat(){setTimeout(()=>{this.publish("worker.online",{serviceName:this.sourceName.startsWith("worker-")?this.sourceName:null,type:typeof window>"u"?"worker":"main"})},100),this.heartbeatInterval=setInterval(()=>{this.publish("worker.heartbeat",{source:this.sourceName,timestamp:Date.now()})},3e4)}close(){this.heartbeatInterval&&clearInterval(this.heartbeatInterval),this.publish("worker.offline",{serviceName:this.sourceName.startsWith("worker-")?this.sourceName:null}),this.channel&&this.channel.close();for(const[e,t]of this.pendingRequests.entries())clearTimeout(t.timeoutId),t.reject(new Error("EventBus closed"));this.pendingRequests.clear()}}const be='(()=>{var u={LOW:0,NORMAL:1,HIGH:2,CRITICAL:3},_={"ice.failed":u.CRITICAL,"qos.congestion":u.CRITICAL,"candidate.changed":u.HIGH,"policy.updated":u.HIGH,"telemetry.summary":u.NORMAL,"statistics.persist":u.LOW};function R(){return typeof crypto<"u"&&typeof crypto.randomUUID=="function"?crypto.randomUUID():"uuid-"+Date.now()+"-"+Math.random().toString(36).substring(2,15)}var I=class{constructor(e={}){this._logInProgress=!1,this.channelName=e.channelName||"worker-event-bus",this.allowedTopics=e.allowedTopics||null,this.maxPayloadSize=e.maxPayloadSize||64*1024,this.absoluteMaxPayloadSize=256*1024,this.maxCacheSize=e.maxCacheSize||1e3,this.sourceName=e.sourceName||(typeof window>"u"?"worker-"+R().substring(0,8):"main-thread"),typeof BroadcastChannel<"u"?(this.channel=new BroadcastChannel(this.channelName),this.channel.onmessage=s=>this._onChannelMessage(s.data)):(console.warn("[WorkerEventBus] BroadcastChannel is not supported in this environment."),this.channel=null),this.subscriptions=new Map,this.replayCache=new Map,this.pendingRequests=new Map,this.serviceRegistry=new Map,this.incomingQueue={[u.CRITICAL]:[],[u.HIGH]:[],[u.NORMAL]:[],[u.LOW]:[]},this.queueProcessing=!1,this.heartbeatInterval=null,e.enableHeartbeat!==!1&&this._startHeartbeat()}_matchTopic(e,s){if(e==="*"||e==="**")return!0;if(!e.includes("*"))return e===s;let t="^"+e.replace(/\\./g,"\\\\.").replace(/\\*\\*/g,".*").replace(/\\*/g,"[^.]+")+"$";try{return new RegExp(t).test(s)}catch{return!1}}_log(e,s,t={}){if(this._logInProgress){console.warn(`[WorkerEventBus] Re-entrant log prevented for level ${e}`);return}this._logInProgress=!0;try{let i=`system.${e}`,r={text:s,...t};this._publishRaw(i,r,{priority:u.LOW,skipAudit:!0})}finally{this._logInProgress=!1}}_validateMessage(e){if(!e||typeof e!="object"||typeof e.id!="string"||typeof e.topic!="string"||e.topic.length>128||typeof e.timestamp!="number"||e.payload===void 0)return!1;if(!e.topic.startsWith("system.")){if(this.allowedTopics&&!this.allowedTopics.some(t=>this._matchTopic(t,e.topic)))return!1;try{if(new TextEncoder().encode(JSON.stringify(e.payload)).length>Math.min(this.maxPayloadSize,this.absoluteMaxPayloadSize))return!1}catch{return!1}}return!0}publish(e,s,t={}){return this._publishRaw(e,s,t)}_publishRaw(e,s,t={}){let i=t.priority!==void 0?t.priority:_[e]!==void 0?_[e]:u.NORMAL,r={id:R(),type:t.type||"event",topic:e,source:this.sourceName,timestamp:Date.now(),payload:s,priority:i};if(t.replyTo&&(r.replyTo=t.replyTo),t.requestId&&(r.requestId=t.requestId),!this._validateMessage(r))return this._log("error",`Message validation failed for topic: ${e}`),null;if(!t.skipAudit&&!e.startsWith("system.")&&this._log("log",`Published to topic: ${e}`,{msgId:r.id,priority:i}),this._enqueueMessage(r),this.channel)try{this.channel.postMessage(r)}catch(c){this._log("error",`Failed to broadcast message: ${c.message}`,{topic:e})}return r.id}subscribe(e,s,t={}){let i=R();this.subscriptions.set(i,{topicPattern:e,handler:s,options:t}),this._log("log",`Subscribed to topic pattern: ${e}`,{subscriptionId:i});for(let[r,c]of this.replayCache.entries())this._matchTopic(e,r)&&setTimeout(()=>{this._deliverMessageToSubscriber(c,s)},0);return i}unsubscribe(e){if(this.subscriptions.has(e)){let s=this.subscriptions.get(e);return this.subscriptions.delete(e),this._log("log",`Unsubscribed from topic pattern: ${s.topicPattern}`,{subscriptionId:e}),!0}return!1}async request(e,s,t={}){let i=R(),r=t.timeout||5e3;return new Promise((c,n)=>{let f=setTimeout(()=>{this.pendingRequests.delete(i),this._log("warn",`Request to topic ${e} timed out after ${r}ms`,{requestId:i}),n(new Error(`Request timed out after ${r}ms`))},r);this.pendingRequests.set(i,{resolve:c,reject:n,timeoutId:f}),this._log("log",`Sending request to topic: ${e}`,{requestId:i}),this._publishRaw(e,s,{...t,type:"request",replyTo:i})})}reply(e,s){this._log("log",`Replying to request: ${e}`),this._publishRaw(`reply.${e}`,s,{type:"response",requestId:e})}_onChannelMessage(e){!e||typeof e!="object"||e.source!==this.sourceName&&typeof e.topic=="string"&&this._enqueueMessage(e)}_enqueueMessage(e){if(!e||typeof e.topic!="string")return;let s=e.priority!==void 0?e.priority:u.NORMAL;(this.incomingQueue[s]||this.incomingQueue[u.NORMAL]).push(e),e.type==="event"&&!e.topic.startsWith("system.")&&!e.topic.startsWith("reply.")&&this._updateReplayCache(e.topic,e),this._scheduleQueueProcessing()}_updateReplayCache(e,s){if(this.replayCache.has(e))this.replayCache.delete(e);else if(this.replayCache.size>=this.maxCacheSize){let t=this.replayCache.keys().next().value;this.replayCache.delete(t)}this.replayCache.set(e,s)}_scheduleQueueProcessing(){this.queueProcessing||(this.queueProcessing=!0,queueMicrotask(()=>this._processQueue()))}_processQueue(){let e=[u.CRITICAL,u.HIGH,u.NORMAL,u.LOW];for(;;){let s=null;for(let t of e)if(this.incomingQueue[t].length>0){s=this.incomingQueue[t].shift();break}if(s)this._handleIncomingMessage(s);else break}this.queueProcessing=!1}_handleIncomingMessage(e){if(!(!e||typeof e.topic!="string")){if(e.type==="response"&&e.requestId){let s=this.pendingRequests.get(e.requestId);s&&(clearTimeout(s.timeoutId),this.pendingRequests.delete(e.requestId),this._log("log",`Received response for request: ${e.requestId}`),s.resolve(e.payload));return}(e.topic==="worker.online"||e.topic.startsWith("service."))&&this._handleServiceDiscovery(e);for(let[s,t]of this.subscriptions.entries())e.topic.startsWith("system.")&&!(t.topicPattern==="system.*"||t.topicPattern==="**"||t.topicPattern.startsWith("system."))||this._matchTopic(t.topicPattern,e.topic)&&this._deliverMessageToSubscriber(e,t.handler)}}async _deliverMessageToSubscriber(e,s){try{let t=s(e);e.type==="request"&&e.replyTo&&(t instanceof Promise?t.then(i=>this.reply(e.replyTo,i)).catch(i=>{this._log("error",`Request handler promise failed: ${i.message}`,{requestId:e.replyTo}),this.reply(e.replyTo,{error:i.message})}):t!==void 0&&this.reply(e.replyTo,t))}catch(t){this._log("error",`Subscriber error on topic ${e.topic}: ${t.message}`,{topic:e.topic,stack:t.stack})}}_handleServiceDiscovery(e){if(e.topic==="worker.online"){let s=e.payload||{};s.serviceName&&(this.serviceRegistry.set(s.serviceName,{source:e.source,timestamp:e.timestamp,...s}),this._log("log",`Service registered: ${s.serviceName}`,{serviceName:s.serviceName}))}else if(e.topic==="worker.offline"){let s=e.payload||{};s.serviceName&&(this.serviceRegistry.delete(s.serviceName),this._log("log",`Service unregistered: ${s.serviceName}`,{serviceName:s.serviceName}))}else if(e.topic.startsWith("service.")&&e.topic.endsWith(".online")){let s=e.topic.replace(/^service\\./,"").replace(/\\.online$/,"");this.serviceRegistry.set(s,{source:e.source,timestamp:e.timestamp,...e.payload}),this._log("log",`Service discovered: ${s}`,{serviceName:s})}}_startHeartbeat(){setTimeout(()=>{this.publish("worker.online",{serviceName:this.sourceName.startsWith("worker-")?this.sourceName:null,type:typeof window>"u"?"worker":"main"})},100),this.heartbeatInterval=setInterval(()=>{this.publish("worker.heartbeat",{source:this.sourceName,timestamp:Date.now()})},3e4)}close(){this.heartbeatInterval&&clearInterval(this.heartbeatInterval),this.publish("worker.offline",{serviceName:this.sourceName.startsWith("worker-")?this.sourceName:null}),this.channel&&this.channel.close();for(let[e,s]of this.pendingRequests.entries())clearTimeout(s.timeoutId),s.reject(new Error("EventBus closed"));this.pendingRequests.clear()}};var k=5e3,v=[],m=null,p=[],y=null,g=new I({sourceName:"qos-worker",allowedTopics:["telemetry.raw","telemetry.summary","qos.congestion","qos.recovery","qos.inbound.degraded","ice.candidate.changed","ice.route.updated","system.*"]});function L(a){if(!a||!Array.isArray(a))return null;let e=null,s=null,t=null,i=null;for(let[,o]of a)o.type==="outbound-rtp"&&(o.kind==="video"?e=o:o.kind==="audio"&&!s&&(s=o)),o.type==="remote-inbound-rtp"&&(o.kind==="video"||o.kind==="audio"&&!t)&&(t=o),o.type==="candidate-pair"&&(o.state==="succeeded"||o.selected===!0||o.nominated===!0)&&(i=o);let r=e||s;if(!r)return null;let c=Date.now(),n=t?.jitter||0,f=t?.packetsLost||0,l=r.framesEncoded||0,d={timestamp:c,rtt:t?.roundTripTime||i?.currentRoundTripTime||0,jitter:n,packetsLost:f,packetsSent:r.packetsSent||0,bytesSent:r.bytesSent||0,framesEncoded:l,totalEncodeTime:r.totalEncodeTime||0,framesDropped:r.totalPacketSendDelay?0:l},h={timestamp:c,rtt:d.rtt,jitter:d.jitter,lossFraction:0,bitrate:0,avgEncodeTime:0,droppedFramesRatio:0};if(m){let o=(c-m.timestamp)/1e3;if(o>0){let b=d.bytesSent-m.bytesSent;h.bitrate=b*8/o;let T=d.framesEncoded-m.framesEncoded,q=d.totalEncodeTime-m.totalEncodeTime;h.avgEncodeTime=T>0?q/T:0;let w=d.packetsLost-m.packetsLost,S=d.packetsSent-m.packetsSent+w;h.lossFraction=S>0?w/S:0}}return m=d,v.push(h),v=v.filter(o=>c-o.timestamp<k),h}function M(){if(v.length===0)return null;let a=0,e=0,s=0,t=0,i=0,r=0,c=0;for(let l of v)a+=l.rtt,l.rtt>r&&(r=l.rtt),e+=l.jitter,l.jitter>c&&(c=l.jitter),s+=l.lossFraction,t+=l.avgEncodeTime,i+=l.bitrate;let n=v.length,f=0;if(n>2){let l=Math.floor(n/2),d=v.slice(0,l).reduce((o,b)=>o+b.rtt,0)/l;f=v.slice(l).reduce((o,b)=>o+b.rtt,0)/(n-l)-d}return{avgRtt:a/n,avgJitter:e/n,maxRtt:r,maxJitter:c,avgLoss:s/n,avgEncodeTime:t/n,avgBitrate:i/n,rttTrend:f,droppedFramesRatio:0}}function C(a){if(!a||!Array.isArray(a))return null;let e=null,s=null;for(let[,n]of a)n.type==="inbound-rtp"&&n.kind==="video"&&(e=n),n.type==="inbound-rtp"&&n.kind==="audio"&&(s=n);let t=e||s;if(!t)return null;let i=Date.now(),r={timestamp:i,bytesReceived:t.bytesReceived||0,packetsReceived:t.packetsReceived||0,packetsLost:t.packetsLost||0,jitter:t.jitter||0,framesDecoded:t.framesDecoded||0,framesDropped:t.framesDropped||0,totalDecodeTime:t.totalDecodeTime||0,freezeCount:t.freezeCount||0,totalFreezesDuration:t.totalFreezesDuration||0,concealedSamples:s?.concealedSamples||0,totalSamplesReceived:s?.totalSamplesReceived||0},c={timestamp:i,inboundBitrate:0,inboundLoss:0,decodeTimeMs:0,freezeCount:r.freezeCount,totalFreezesDuration:r.totalFreezesDuration,concealmentRatio:0,jitter:r.jitter};if(y){let n=(i-y.timestamp)/1e3;if(n>0){let f=r.bytesReceived-y.bytesReceived;c.inboundBitrate=f*8/n;let l=r.packetsLost-y.packetsLost,h=r.packetsReceived-y.packetsReceived+l;c.inboundLoss=h>0?l/h:0;let o=r.framesDecoded-y.framesDecoded,b=r.totalDecodeTime-y.totalDecodeTime;c.decodeTimeMs=o>0?b/o*1e3:0,r.totalSamplesReceived>0&&(c.concealmentRatio=r.concealedSamples/r.totalSamplesReceived)}}return y=r,p.push(c),p=p.filter(n=>i-n.timestamp<k),c}function D(){if(p.length===0)return null;let a=p.length,e=p[a-1];return{avgInboundBitrate:p.reduce((s,t)=>s+t.inboundBitrate,0)/a,avgInboundLoss:p.reduce((s,t)=>s+t.inboundLoss,0)/a,avgDecodeTimeMs:p.reduce((s,t)=>s+t.decodeTimeMs,0)/a,avgJitterInbound:p.reduce((s,t)=>s+t.jitter,0)/a,concealmentRatio:p.reduce((s,t)=>s+t.concealmentRatio,0)/a,freezeCount:e.freezeCount,totalFreezesDuration:e.totalFreezesDuration}}g.subscribe("telemetry.raw",a=>{let e=Array.isArray(a.payload)?a.payload:a.payload?.report,s=a.payload?.sessionId||a.sessionId||"session_unknown";L(e);let t=M();C(e);let i=D();(t||i)&&(g.publish("telemetry.summary",{...t||{},inbound:i,sessionId:s}),t&&(t.avgLoss>.05||t.avgJitter>.05?g.publish("qos.congestion",{avgLoss:t.avgLoss,avgJitter:t.avgJitter,reason:`Loss: ${(t.avgLoss*100).toFixed(1)}%, Jitter: ${(t.avgJitter*1e3).toFixed(0)}ms`}):t.avgLoss<.01&&t.avgJitter<.02&&g.publish("qos.recovery",{reason:"Stable network conditions restored"}))),i&&(i.avgInboundLoss>.05||i.avgDecodeTimeMs>40)&&g.publish("qos.inbound.degraded",{avgInboundLoss:i.avgInboundLoss,avgDecodeTimeMs:i.avgDecodeTimeMs,avgInboundBitrate:i.avgInboundBitrate,concealmentRatio:i.concealmentRatio,freezeCount:i.freezeCount,reason:`Inbound degraded: Loss ${(i.avgInboundLoss*100).toFixed(1)}%, Decode ${i.avgDecodeTimeMs.toFixed(0)}ms`})});g.publish("service.qos.online",{version:"2.0.0"});console.log("[QoS Worker v2] Initialized \\u2014 inbound monitoring enabled.");})();',_e='(()=>{var o={LOW:0,NORMAL:1,HIGH:2,CRITICAL:3},d={"ice.failed":o.CRITICAL,"qos.congestion":o.CRITICAL,"candidate.changed":o.HIGH,"policy.updated":o.HIGH,"telemetry.summary":o.NORMAL,"statistics.persist":o.LOW};function u(){return typeof crypto<"u"&&typeof crypto.randomUUID=="function"?crypto.randomUUID():"uuid-"+Date.now()+"-"+Math.random().toString(36).substring(2,15)}var h=class{constructor(e={}){this._logInProgress=!1,this.channelName=e.channelName||"worker-event-bus",this.allowedTopics=e.allowedTopics||null,this.maxPayloadSize=e.maxPayloadSize||64*1024,this.absoluteMaxPayloadSize=256*1024,this.maxCacheSize=e.maxCacheSize||1e3,this.sourceName=e.sourceName||(typeof window>"u"?"worker-"+u().substring(0,8):"main-thread"),typeof BroadcastChannel<"u"?(this.channel=new BroadcastChannel(this.channelName),this.channel.onmessage=t=>this._onChannelMessage(t.data)):(console.warn("[WorkerEventBus] BroadcastChannel is not supported in this environment."),this.channel=null),this.subscriptions=new Map,this.replayCache=new Map,this.pendingRequests=new Map,this.serviceRegistry=new Map,this.incomingQueue={[o.CRITICAL]:[],[o.HIGH]:[],[o.NORMAL]:[],[o.LOW]:[]},this.queueProcessing=!1,this.heartbeatInterval=null,e.enableHeartbeat!==!1&&this._startHeartbeat()}_matchTopic(e,t){if(e==="*"||e==="**")return!0;if(!e.includes("*"))return e===t;let s="^"+e.replace(/\\./g,"\\\\.").replace(/\\*\\*/g,".*").replace(/\\*/g,"[^.]+")+"$";try{return new RegExp(s).test(t)}catch{return!1}}_log(e,t,s={}){if(this._logInProgress){console.warn(`[WorkerEventBus] Re-entrant log prevented for level ${e}`);return}this._logInProgress=!0;try{let r=`system.${e}`,a={text:t,...s};this._publishRaw(r,a,{priority:o.LOW,skipAudit:!0})}finally{this._logInProgress=!1}}_validateMessage(e){if(!e||typeof e!="object"||typeof e.id!="string"||typeof e.topic!="string"||e.topic.length>128||typeof e.timestamp!="number"||e.payload===void 0)return!1;if(!e.topic.startsWith("system.")){if(this.allowedTopics&&!this.allowedTopics.some(s=>this._matchTopic(s,e.topic)))return!1;try{if(new TextEncoder().encode(JSON.stringify(e.payload)).length>Math.min(this.maxPayloadSize,this.absoluteMaxPayloadSize))return!1}catch{return!1}}return!0}publish(e,t,s={}){return this._publishRaw(e,t,s)}_publishRaw(e,t,s={}){let r=s.priority!==void 0?s.priority:d[e]!==void 0?d[e]:o.NORMAL,a={id:u(),type:s.type||"event",topic:e,source:this.sourceName,timestamp:Date.now(),payload:t,priority:r};if(s.replyTo&&(a.replyTo=s.replyTo),s.requestId&&(a.requestId=s.requestId),!this._validateMessage(a))return this._log("error",`Message validation failed for topic: ${e}`),null;if(!s.skipAudit&&!e.startsWith("system.")&&this._log("log",`Published to topic: ${e}`,{msgId:a.id,priority:r}),this._enqueueMessage(a),this.channel)try{this.channel.postMessage(a)}catch(c){this._log("error",`Failed to broadcast message: ${c.message}`,{topic:e})}return a.id}subscribe(e,t,s={}){let r=u();this.subscriptions.set(r,{topicPattern:e,handler:t,options:s}),this._log("log",`Subscribed to topic pattern: ${e}`,{subscriptionId:r});for(let[a,c]of this.replayCache.entries())this._matchTopic(e,a)&&setTimeout(()=>{this._deliverMessageToSubscriber(c,t)},0);return r}unsubscribe(e){if(this.subscriptions.has(e)){let t=this.subscriptions.get(e);return this.subscriptions.delete(e),this._log("log",`Unsubscribed from topic pattern: ${t.topicPattern}`,{subscriptionId:e}),!0}return!1}async request(e,t,s={}){let r=u(),a=s.timeout||5e3;return new Promise((c,l)=>{let p=setTimeout(()=>{this.pendingRequests.delete(r),this._log("warn",`Request to topic ${e} timed out after ${a}ms`,{requestId:r}),l(new Error(`Request timed out after ${a}ms`))},a);this.pendingRequests.set(r,{resolve:c,reject:l,timeoutId:p}),this._log("log",`Sending request to topic: ${e}`,{requestId:r}),this._publishRaw(e,t,{...s,type:"request",replyTo:r})})}reply(e,t){this._log("log",`Replying to request: ${e}`),this._publishRaw(`reply.${e}`,t,{type:"response",requestId:e})}_onChannelMessage(e){!e||typeof e!="object"||e.source!==this.sourceName&&typeof e.topic=="string"&&this._enqueueMessage(e)}_enqueueMessage(e){if(!e||typeof e.topic!="string")return;let t=e.priority!==void 0?e.priority:o.NORMAL;(this.incomingQueue[t]||this.incomingQueue[o.NORMAL]).push(e),e.type==="event"&&!e.topic.startsWith("system.")&&!e.topic.startsWith("reply.")&&this._updateReplayCache(e.topic,e),this._scheduleQueueProcessing()}_updateReplayCache(e,t){if(this.replayCache.has(e))this.replayCache.delete(e);else if(this.replayCache.size>=this.maxCacheSize){let s=this.replayCache.keys().next().value;this.replayCache.delete(s)}this.replayCache.set(e,t)}_scheduleQueueProcessing(){this.queueProcessing||(this.queueProcessing=!0,queueMicrotask(()=>this._processQueue()))}_processQueue(){let e=[o.CRITICAL,o.HIGH,o.NORMAL,o.LOW];for(;;){let t=null;for(let s of e)if(this.incomingQueue[s].length>0){t=this.incomingQueue[s].shift();break}if(t)this._handleIncomingMessage(t);else break}this.queueProcessing=!1}_handleIncomingMessage(e){if(!(!e||typeof e.topic!="string")){if(e.type==="response"&&e.requestId){let t=this.pendingRequests.get(e.requestId);t&&(clearTimeout(t.timeoutId),this.pendingRequests.delete(e.requestId),this._log("log",`Received response for request: ${e.requestId}`),t.resolve(e.payload));return}(e.topic==="worker.online"||e.topic.startsWith("service."))&&this._handleServiceDiscovery(e);for(let[t,s]of this.subscriptions.entries())e.topic.startsWith("system.")&&!(s.topicPattern==="system.*"||s.topicPattern==="**"||s.topicPattern.startsWith("system."))||this._matchTopic(s.topicPattern,e.topic)&&this._deliverMessageToSubscriber(e,s.handler)}}async _deliverMessageToSubscriber(e,t){try{let s=t(e);e.type==="request"&&e.replyTo&&(s instanceof Promise?s.then(r=>this.reply(e.replyTo,r)).catch(r=>{this._log("error",`Request handler promise failed: ${r.message}`,{requestId:e.replyTo}),this.reply(e.replyTo,{error:r.message})}):s!==void 0&&this.reply(e.replyTo,s))}catch(s){this._log("error",`Subscriber error on topic ${e.topic}: ${s.message}`,{topic:e.topic,stack:s.stack})}}_handleServiceDiscovery(e){if(e.topic==="worker.online"){let t=e.payload||{};t.serviceName&&(this.serviceRegistry.set(t.serviceName,{source:e.source,timestamp:e.timestamp,...t}),this._log("log",`Service registered: ${t.serviceName}`,{serviceName:t.serviceName}))}else if(e.topic==="worker.offline"){let t=e.payload||{};t.serviceName&&(this.serviceRegistry.delete(t.serviceName),this._log("log",`Service unregistered: ${t.serviceName}`,{serviceName:t.serviceName}))}else if(e.topic.startsWith("service.")&&e.topic.endsWith(".online")){let t=e.topic.replace(/^service\\./,"").replace(/\\.online$/,"");this.serviceRegistry.set(t,{source:e.source,timestamp:e.timestamp,...e.payload}),this._log("log",`Service discovered: ${t}`,{serviceName:t})}}_startHeartbeat(){setTimeout(()=>{this.publish("worker.online",{serviceName:this.sourceName.startsWith("worker-")?this.sourceName:null,type:typeof window>"u"?"worker":"main"})},100),this.heartbeatInterval=setInterval(()=>{this.publish("worker.heartbeat",{source:this.sourceName,timestamp:Date.now()})},3e4)}close(){this.heartbeatInterval&&clearInterval(this.heartbeatInterval),this.publish("worker.offline",{serviceName:this.sourceName.startsWith("worker-")?this.sourceName:null}),this.channel&&this.channel.close();for(let[e,t]of this.pendingRequests.entries())clearTimeout(t.timeoutId),t.reject(new Error("EventBus closed"));this.pendingRequests.clear()}};var b=4e6,f=2e3,n=new h({sourceName:"ai-worker",allowedTopics:["telemetry.summary","qos.congestion","qos.inbound.degraded","ai.policy.request","ai.policy.response","ai.congestion.override","ai.anomaly.detected","ai.remote.bitrate.request","system.*"]});function y(i){if(!i)return 0;let e=i.avgRtt*1e3+i.avgJitter*1e3*2+10,t=93.2;t-=e*.024,t-=i.avgLoss*100*2.5,t<0&&(t=0);let s=1+.035*t+t*(t-60)*(100-t)*7e-6;s=Math.max(1,Math.min(5,s));let r=Math.max(0,(i.avgEncodeTime*1e3-15)/50),a=i.droppedFramesRatio||0,c=Math.min(1,i.avgBitrate/b),l=i.avgRtt*1e3,p=i.avgJitter*1e3,v=i.avgLoss*100,I=.4*(s/5)+.3*c+.2*(1/(1+l/200))-.15*(v/100)-.1*(p/50)-.05*a-.05*r;return parseFloat(I.toFixed(4))}function g(i){return i?i.avgLoss>.05||i.avgJitter>.05?{type:"DECREASE_BITRATE",reason:`Congestion (Loss: ${(i.avgLoss*100).toFixed(1)}%, Jitter: ${(i.avgJitter*1e3).toFixed(0)}ms)`,factor:.7,nextInterval:500}:i.avgEncodeTime>.025?{type:"LOWER_RESOLUTION",reason:"CPU Overload",scaleFactor:2,nextInterval:1e3}:i.rttTrend>.05&&i.avgJitter>.03?{type:"DECREASE_BITRATE",reason:"Rising Latency & Jitter",factor:.85,nextInterval:1e3}:i.avgLoss>.02?{type:"DECREASE_FPS",reason:"Moderate Packet Loss",nextInterval:1e3}:i.avgLoss<.01&&i.avgJitter<.02&&i.rttTrend<.01?{type:"INCREASE_BITRATE",reason:"Stable Network",factor:1.05,nextInterval:2e3}:{type:"MAINTAIN",nextInterval:f}:{type:"MAINTAIN",nextInterval:f}}function m(i){return i?i.avgInboundLoss>.1||i.avgDecodeTimeMs>60?{action:"PLEASE_REDUCE_BITRATE",targetKbps:400,reason:`Local inbound congested: Loss ${(i.avgInboundLoss*100).toFixed(1)}%`}:i.avgInboundLoss>.05?{action:"PLEASE_REDUCE_BITRATE",targetKbps:800,reason:`Inbound packet loss: ${(i.avgInboundLoss*100).toFixed(1)}%`}:i.avgInboundLoss<.01&&i.avgDecodeTimeMs<15?{action:"PLEASE_INCREASE_BITRATE",targetKbps:2e3,reason:"Inbound quality excellent"}:null:null}n.subscribe("telemetry.summary",i=>{let e=i.payload,t=y(e),s=g(e);n.publish("ai.policy.response",{action:s,sessionId:e.sessionId||i.sessionId,stats:{...e,reward:t}}),(e.avgLoss>.1||e.avgRtt>.5)&&n.publish("ai.anomaly.detected",{type:e.avgLoss>.1?"high-packet-loss":"high-rtt",value:e.avgLoss>.1?e.avgLoss:e.avgRtt,timestamp:Date.now()})});n.subscribe("qos.congestion",i=>{n.publish("ai.congestion.override",{action:{type:"DECREASE_BITRATE",reason:"Immediate congestion response: "+i.payload.reason,factor:.7,nextInterval:500},triggeredBy:"qos.congestion",timestamp:Date.now()},{priority:3})});n.subscribe("qos.inbound.degraded",i=>{let e=i.payload,t=m(e);t&&n.publish("ai.remote.bitrate.request",t)});n.subscribe("ai.policy.request",i=>{let e=i.payload,t=g(e),s=y(e);return{action:t,stats:{...e,reward:s}}});n.publish("service.ai.online",{version:"2.0.0"});console.log("[AI Worker v2] Initialized \\u2014 inbound remote control enabled.");})();',we='(()=>{var r={LOW:0,NORMAL:1,HIGH:2,CRITICAL:3},d={"ice.failed":r.CRITICAL,"qos.congestion":r.CRITICAL,"candidate.changed":r.HIGH,"policy.updated":r.HIGH,"telemetry.summary":r.NORMAL,"statistics.persist":r.LOW};function c(){return typeof crypto<"u"&&typeof crypto.randomUUID=="function"?crypto.randomUUID():"uuid-"+Date.now()+"-"+Math.random().toString(36).substring(2,15)}var l=class{constructor(e={}){this._logInProgress=!1,this.channelName=e.channelName||"worker-event-bus",this.allowedTopics=e.allowedTopics||null,this.maxPayloadSize=e.maxPayloadSize||64*1024,this.absoluteMaxPayloadSize=256*1024,this.maxCacheSize=e.maxCacheSize||1e3,this.sourceName=e.sourceName||(typeof window>"u"?"worker-"+c().substring(0,8):"main-thread"),typeof BroadcastChannel<"u"?(this.channel=new BroadcastChannel(this.channelName),this.channel.onmessage=t=>this._onChannelMessage(t.data)):(console.warn("[WorkerEventBus] BroadcastChannel is not supported in this environment."),this.channel=null),this.subscriptions=new Map,this.replayCache=new Map,this.pendingRequests=new Map,this.serviceRegistry=new Map,this.incomingQueue={[r.CRITICAL]:[],[r.HIGH]:[],[r.NORMAL]:[],[r.LOW]:[]},this.queueProcessing=!1,this.heartbeatInterval=null,e.enableHeartbeat!==!1&&this._startHeartbeat()}_matchTopic(e,t){if(e==="*"||e==="**")return!0;if(!e.includes("*"))return e===t;let i="^"+e.replace(/\\./g,"\\\\.").replace(/\\*\\*/g,".*").replace(/\\*/g,"[^.]+")+"$";try{return new RegExp(i).test(t)}catch{return!1}}_log(e,t,i={}){if(this._logInProgress){console.warn(`[WorkerEventBus] Re-entrant log prevented for level ${e}`);return}this._logInProgress=!0;try{let s=`system.${e}`,a={text:t,...i};this._publishRaw(s,a,{priority:r.LOW,skipAudit:!0})}finally{this._logInProgress=!1}}_validateMessage(e){if(!e||typeof e!="object"||typeof e.id!="string"||typeof e.topic!="string"||e.topic.length>128||typeof e.timestamp!="number"||e.payload===void 0)return!1;if(!e.topic.startsWith("system.")){if(this.allowedTopics&&!this.allowedTopics.some(i=>this._matchTopic(i,e.topic)))return!1;try{if(new TextEncoder().encode(JSON.stringify(e.payload)).length>Math.min(this.maxPayloadSize,this.absoluteMaxPayloadSize))return!1}catch{return!1}}return!0}publish(e,t,i={}){return this._publishRaw(e,t,i)}_publishRaw(e,t,i={}){let s=i.priority!==void 0?i.priority:d[e]!==void 0?d[e]:r.NORMAL,a={id:c(),type:i.type||"event",topic:e,source:this.sourceName,timestamp:Date.now(),payload:t,priority:s};if(i.replyTo&&(a.replyTo=i.replyTo),i.requestId&&(a.requestId=i.requestId),!this._validateMessage(a))return this._log("error",`Message validation failed for topic: ${e}`),null;if(!i.skipAudit&&!e.startsWith("system.")&&this._log("log",`Published to topic: ${e}`,{msgId:a.id,priority:s}),this._enqueueMessage(a),this.channel)try{this.channel.postMessage(a)}catch(o){this._log("error",`Failed to broadcast message: ${o.message}`,{topic:e})}return a.id}subscribe(e,t,i={}){let s=c();this.subscriptions.set(s,{topicPattern:e,handler:t,options:i}),this._log("log",`Subscribed to topic pattern: ${e}`,{subscriptionId:s});for(let[a,o]of this.replayCache.entries())this._matchTopic(e,a)&&setTimeout(()=>{this._deliverMessageToSubscriber(o,t)},0);return s}unsubscribe(e){if(this.subscriptions.has(e)){let t=this.subscriptions.get(e);return this.subscriptions.delete(e),this._log("log",`Unsubscribed from topic pattern: ${t.topicPattern}`,{subscriptionId:e}),!0}return!1}async request(e,t,i={}){let s=c(),a=i.timeout||5e3;return new Promise((o,p)=>{let f=setTimeout(()=>{this.pendingRequests.delete(s),this._log("warn",`Request to topic ${e} timed out after ${a}ms`,{requestId:s}),p(new Error(`Request timed out after ${a}ms`))},a);this.pendingRequests.set(s,{resolve:o,reject:p,timeoutId:f}),this._log("log",`Sending request to topic: ${e}`,{requestId:s}),this._publishRaw(e,t,{...i,type:"request",replyTo:s})})}reply(e,t){this._log("log",`Replying to request: ${e}`),this._publishRaw(`reply.${e}`,t,{type:"response",requestId:e})}_onChannelMessage(e){!e||typeof e!="object"||e.source!==this.sourceName&&typeof e.topic=="string"&&this._enqueueMessage(e)}_enqueueMessage(e){if(!e||typeof e.topic!="string")return;let t=e.priority!==void 0?e.priority:r.NORMAL;(this.incomingQueue[t]||this.incomingQueue[r.NORMAL]).push(e),e.type==="event"&&!e.topic.startsWith("system.")&&!e.topic.startsWith("reply.")&&this._updateReplayCache(e.topic,e),this._scheduleQueueProcessing()}_updateReplayCache(e,t){if(this.replayCache.has(e))this.replayCache.delete(e);else if(this.replayCache.size>=this.maxCacheSize){let i=this.replayCache.keys().next().value;this.replayCache.delete(i)}this.replayCache.set(e,t)}_scheduleQueueProcessing(){this.queueProcessing||(this.queueProcessing=!0,queueMicrotask(()=>this._processQueue()))}_processQueue(){let e=[r.CRITICAL,r.HIGH,r.NORMAL,r.LOW];for(;;){let t=null;for(let i of e)if(this.incomingQueue[i].length>0){t=this.incomingQueue[i].shift();break}if(t)this._handleIncomingMessage(t);else break}this.queueProcessing=!1}_handleIncomingMessage(e){if(!(!e||typeof e.topic!="string")){if(e.type==="response"&&e.requestId){let t=this.pendingRequests.get(e.requestId);t&&(clearTimeout(t.timeoutId),this.pendingRequests.delete(e.requestId),this._log("log",`Received response for request: ${e.requestId}`),t.resolve(e.payload));return}(e.topic==="worker.online"||e.topic.startsWith("service."))&&this._handleServiceDiscovery(e);for(let[t,i]of this.subscriptions.entries())e.topic.startsWith("system.")&&!(i.topicPattern==="system.*"||i.topicPattern==="**"||i.topicPattern.startsWith("system."))||this._matchTopic(i.topicPattern,e.topic)&&this._deliverMessageToSubscriber(e,i.handler)}}async _deliverMessageToSubscriber(e,t){try{let i=t(e);e.type==="request"&&e.replyTo&&(i instanceof Promise?i.then(s=>this.reply(e.replyTo,s)).catch(s=>{this._log("error",`Request handler promise failed: ${s.message}`,{requestId:e.replyTo}),this.reply(e.replyTo,{error:s.message})}):i!==void 0&&this.reply(e.replyTo,i))}catch(i){this._log("error",`Subscriber error on topic ${e.topic}: ${i.message}`,{topic:e.topic,stack:i.stack})}}_handleServiceDiscovery(e){if(e.topic==="worker.online"){let t=e.payload||{};t.serviceName&&(this.serviceRegistry.set(t.serviceName,{source:e.source,timestamp:e.timestamp,...t}),this._log("log",`Service registered: ${t.serviceName}`,{serviceName:t.serviceName}))}else if(e.topic==="worker.offline"){let t=e.payload||{};t.serviceName&&(this.serviceRegistry.delete(t.serviceName),this._log("log",`Service unregistered: ${t.serviceName}`,{serviceName:t.serviceName}))}else if(e.topic.startsWith("service.")&&e.topic.endsWith(".online")){let t=e.topic.replace(/^service\\./,"").replace(/\\.online$/,"");this.serviceRegistry.set(t,{source:e.source,timestamp:e.timestamp,...e.payload}),this._log("log",`Service discovered: ${t}`,{serviceName:t})}}_startHeartbeat(){setTimeout(()=>{this.publish("worker.online",{serviceName:this.sourceName.startsWith("worker-")?this.sourceName:null,type:typeof window>"u"?"worker":"main"})},100),this.heartbeatInterval=setInterval(()=>{this.publish("worker.heartbeat",{source:this.sourceName,timestamp:Date.now()})},3e4)}close(){this.heartbeatInterval&&clearInterval(this.heartbeatInterval),this.publish("worker.offline",{serviceName:this.sourceName.startsWith("worker-")?this.sourceName:null}),this.channel&&this.channel.close();for(let[e,t]of this.pendingRequests.entries())clearTimeout(t.timeoutId),t.reject(new Error("EventBus closed"));this.pendingRequests.clear()}};var n=new l({sourceName:"ice-worker",allowedTopics:["telemetry.summary","ice.candidate.changed","ice.route.updated","system.*"]}),u=null;n.subscribe("telemetry.summary",h=>{let e=h.payload;if(e.avgRtt>.15){let t="candidate-pair-backup";u!==t&&(u=t,n.publish("ice.candidate.changed",{activeCandidatePair:t,rtt:e.avgRtt,timestamp:Date.now()}),n.publish("ice.route.updated",{routeType:"cellular-backup",latencyEstimate:e.avgRtt,timestamp:Date.now()}))}else{let t="candidate-pair-primary";u!==t&&(u=t,n.publish("ice.candidate.changed",{activeCandidatePair:t,rtt:e.avgRtt,timestamp:Date.now()}),n.publish("ice.route.updated",{routeType:"wifi-primary",latencyEstimate:e.avgRtt,timestamp:Date.now()}))}});n.publish("service.ice.online",{version:"1.0.0"});console.log("[ICE Worker] Initialized and listening...");})();',Ie='(()=>{var o={LOW:0,NORMAL:1,HIGH:2,CRITICAL:3},b={"ice.failed":o.CRITICAL,"qos.congestion":o.CRITICAL,"candidate.changed":o.HIGH,"policy.updated":o.HIGH,"telemetry.summary":o.NORMAL,"statistics.persist":o.LOW};function d(){return typeof crypto<"u"&&typeof crypto.randomUUID=="function"?crypto.randomUUID():"uuid-"+Date.now()+"-"+Math.random().toString(36).substring(2,15)}var f=class{constructor(e={}){this._logInProgress=!1,this.channelName=e.channelName||"worker-event-bus",this.allowedTopics=e.allowedTopics||null,this.maxPayloadSize=e.maxPayloadSize||64*1024,this.absoluteMaxPayloadSize=256*1024,this.maxCacheSize=e.maxCacheSize||1e3,this.sourceName=e.sourceName||(typeof window>"u"?"worker-"+d().substring(0,8):"main-thread"),typeof BroadcastChannel<"u"?(this.channel=new BroadcastChannel(this.channelName),this.channel.onmessage=t=>this._onChannelMessage(t.data)):(console.warn("[WorkerEventBus] BroadcastChannel is not supported in this environment."),this.channel=null),this.subscriptions=new Map,this.replayCache=new Map,this.pendingRequests=new Map,this.serviceRegistry=new Map,this.incomingQueue={[o.CRITICAL]:[],[o.HIGH]:[],[o.NORMAL]:[],[o.LOW]:[]},this.queueProcessing=!1,this.heartbeatInterval=null,e.enableHeartbeat!==!1&&this._startHeartbeat()}_matchTopic(e,t){if(e==="*"||e==="**")return!0;if(!e.includes("*"))return e===t;let r="^"+e.replace(/\\./g,"\\\\.").replace(/\\*\\*/g,".*").replace(/\\*/g,"[^.]+")+"$";try{return new RegExp(r).test(t)}catch{return!1}}_log(e,t,r={}){if(this._logInProgress){console.warn(`[WorkerEventBus] Re-entrant log prevented for level ${e}`);return}this._logInProgress=!0;try{let s=`system.${e}`,i={text:t,...r};this._publishRaw(s,i,{priority:o.LOW,skipAudit:!0})}finally{this._logInProgress=!1}}_validateMessage(e){if(!e||typeof e!="object"||typeof e.id!="string"||typeof e.topic!="string"||e.topic.length>128||typeof e.timestamp!="number"||e.payload===void 0)return!1;if(!e.topic.startsWith("system.")){if(this.allowedTopics&&!this.allowedTopics.some(r=>this._matchTopic(r,e.topic)))return!1;try{if(new TextEncoder().encode(JSON.stringify(e.payload)).length>Math.min(this.maxPayloadSize,this.absoluteMaxPayloadSize))return!1}catch{return!1}}return!0}publish(e,t,r={}){return this._publishRaw(e,t,r)}_publishRaw(e,t,r={}){let s=r.priority!==void 0?r.priority:b[e]!==void 0?b[e]:o.NORMAL,i={id:d(),type:r.type||"event",topic:e,source:this.sourceName,timestamp:Date.now(),payload:t,priority:s};if(r.replyTo&&(i.replyTo=r.replyTo),r.requestId&&(i.requestId=r.requestId),!this._validateMessage(i))return this._log("error",`Message validation failed for topic: ${e}`),null;if(!r.skipAudit&&!e.startsWith("system.")&&this._log("log",`Published to topic: ${e}`,{msgId:i.id,priority:s}),this._enqueueMessage(i),this.channel)try{this.channel.postMessage(i)}catch(c){this._log("error",`Failed to broadcast message: ${c.message}`,{topic:e})}return i.id}subscribe(e,t,r={}){let s=d();this.subscriptions.set(s,{topicPattern:e,handler:t,options:r}),this._log("log",`Subscribed to topic pattern: ${e}`,{subscriptionId:s});for(let[i,c]of this.replayCache.entries())this._matchTopic(e,i)&&setTimeout(()=>{this._deliverMessageToSubscriber(c,t)},0);return s}unsubscribe(e){if(this.subscriptions.has(e)){let t=this.subscriptions.get(e);return this.subscriptions.delete(e),this._log("log",`Unsubscribed from topic pattern: ${t.topicPattern}`,{subscriptionId:e}),!0}return!1}async request(e,t,r={}){let s=d(),i=r.timeout||5e3;return new Promise((c,u)=>{let h=setTimeout(()=>{this.pendingRequests.delete(s),this._log("warn",`Request to topic ${e} timed out after ${i}ms`,{requestId:s}),u(new Error(`Request timed out after ${i}ms`))},i);this.pendingRequests.set(s,{resolve:c,reject:u,timeoutId:h}),this._log("log",`Sending request to topic: ${e}`,{requestId:s}),this._publishRaw(e,t,{...r,type:"request",replyTo:s})})}reply(e,t){this._log("log",`Replying to request: ${e}`),this._publishRaw(`reply.${e}`,t,{type:"response",requestId:e})}_onChannelMessage(e){!e||typeof e!="object"||e.source!==this.sourceName&&typeof e.topic=="string"&&this._enqueueMessage(e)}_enqueueMessage(e){if(!e||typeof e.topic!="string")return;let t=e.priority!==void 0?e.priority:o.NORMAL;(this.incomingQueue[t]||this.incomingQueue[o.NORMAL]).push(e),e.type==="event"&&!e.topic.startsWith("system.")&&!e.topic.startsWith("reply.")&&this._updateReplayCache(e.topic,e),this._scheduleQueueProcessing()}_updateReplayCache(e,t){if(this.replayCache.has(e))this.replayCache.delete(e);else if(this.replayCache.size>=this.maxCacheSize){let r=this.replayCache.keys().next().value;this.replayCache.delete(r)}this.replayCache.set(e,t)}_scheduleQueueProcessing(){this.queueProcessing||(this.queueProcessing=!0,queueMicrotask(()=>this._processQueue()))}_processQueue(){let e=[o.CRITICAL,o.HIGH,o.NORMAL,o.LOW];for(;;){let t=null;for(let r of e)if(this.incomingQueue[r].length>0){t=this.incomingQueue[r].shift();break}if(t)this._handleIncomingMessage(t);else break}this.queueProcessing=!1}_handleIncomingMessage(e){if(!(!e||typeof e.topic!="string")){if(e.type==="response"&&e.requestId){let t=this.pendingRequests.get(e.requestId);t&&(clearTimeout(t.timeoutId),this.pendingRequests.delete(e.requestId),this._log("log",`Received response for request: ${e.requestId}`),t.resolve(e.payload));return}(e.topic==="worker.online"||e.topic.startsWith("service."))&&this._handleServiceDiscovery(e);for(let[t,r]of this.subscriptions.entries())e.topic.startsWith("system.")&&!(r.topicPattern==="system.*"||r.topicPattern==="**"||r.topicPattern.startsWith("system."))||this._matchTopic(r.topicPattern,e.topic)&&this._deliverMessageToSubscriber(e,r.handler)}}async _deliverMessageToSubscriber(e,t){try{let r=t(e);e.type==="request"&&e.replyTo&&(r instanceof Promise?r.then(s=>this.reply(e.replyTo,s)).catch(s=>{this._log("error",`Request handler promise failed: ${s.message}`,{requestId:e.replyTo}),this.reply(e.replyTo,{error:s.message})}):r!==void 0&&this.reply(e.replyTo,r))}catch(r){this._log("error",`Subscriber error on topic ${e.topic}: ${r.message}`,{topic:e.topic,stack:r.stack})}}_handleServiceDiscovery(e){if(e.topic==="worker.online"){let t=e.payload||{};t.serviceName&&(this.serviceRegistry.set(t.serviceName,{source:e.source,timestamp:e.timestamp,...t}),this._log("log",`Service registered: ${t.serviceName}`,{serviceName:t.serviceName}))}else if(e.topic==="worker.offline"){let t=e.payload||{};t.serviceName&&(this.serviceRegistry.delete(t.serviceName),this._log("log",`Service unregistered: ${t.serviceName}`,{serviceName:t.serviceName}))}else if(e.topic.startsWith("service.")&&e.topic.endsWith(".online")){let t=e.topic.replace(/^service\\./,"").replace(/\\.online$/,"");this.serviceRegistry.set(t,{source:e.source,timestamp:e.timestamp,...e.payload}),this._log("log",`Service discovered: ${t}`,{serviceName:t})}}_startHeartbeat(){setTimeout(()=>{this.publish("worker.online",{serviceName:this.sourceName.startsWith("worker-")?this.sourceName:null,type:typeof window>"u"?"worker":"main"})},100),this.heartbeatInterval=setInterval(()=>{this.publish("worker.heartbeat",{source:this.sourceName,timestamp:Date.now()})},3e4)}close(){this.heartbeatInterval&&clearInterval(this.heartbeatInterval),this.publish("worker.offline",{serviceName:this.sourceName.startsWith("worker-")?this.sourceName:null}),this.channel&&this.channel.close();for(let[e,t]of this.pendingRequests.entries())clearTimeout(t.timeoutId),t.reject(new Error("EventBus closed"));this.pendingRequests.clear()}};var R="AssistQoS_KnowledgeBase",a="experience_replay";var I="sessionId",_="timestamp";function N(n,e,t){let r;if(!n.objectStoreNames.contains(a))r=n.createObjectStore(a,{keyPath:"id",autoIncrement:!0});else if(t<7)try{n.deleteObjectStore(a),r=n.createObjectStore(a,{keyPath:"id",autoIncrement:!0})}catch{r=e.objectStore(a)}else r=e.objectStore(a);r&&(r.indexNames.contains(I)||r.createIndex(I,"sessionId",{unique:!1}),r.indexNames.contains(_)||r.createIndex(_,"timestamp",{unique:!1}))}function S(){return new Promise((n,e)=>{let t=indexedDB.open(R,7);t.onupgradeneeded=r=>{N(r.target.result,r.target.transaction,r.oldVersion)},t.onsuccess=r=>{n(r.target.result)},t.onerror=()=>{e(t.error||new Error("Failed to open QoS experience DB"))}})}var y=null,p=new f({sourceName:"history-worker",allowedTopics:["*"]});async function x(){if(y)return y;try{return y=await S(),y}catch(n){return console.error("[History Worker] Failed to open IndexedDB:",n),null}}p.subscribe("*",async n=>{if(n.topic==="ai.policy.response"){let e=await x();if(!e)return;try{let t=e.transaction(a,"readwrite"),r=t.objectStore(a),s=n.payload||{},i=s.stats||{},c=s.action||{},u=i.reward||0,h=s.sessionId||i.sessionId||"session_unknown",v=n.timestamp||Date.now(),g={sessionId:h,timestamp:v,stats:i,action:c,reward:u},q=r.put?r.put(g):r.add(g);q.onerror=m=>{let l=m.target?.error;console.warn("[History Worker] Store put request error:",l?`${l.name}: ${l.message}`:"Unknown")},t.oncomplete=()=>{p.publish("history.route.updated",{status:"success",msg:`Saved experience for session: ${h}`})},t.onerror=m=>{let l=m.target?.error||t.error,w=l?`${l.name}: ${l.message}`:"Unknown DB transaction error";console.error("[History Worker] DB transaction error:",w),p.publish("history.route.updated",{status:"error",msg:`Failed to save experience for session: ${h} \\u2014 ${w}`})}}catch(t){console.error("[History Worker] DB Save Error:",t),p.publish("history.route.updated",{status:"error",msg:`Exception saving experience: ${t.message}`})}}});p.subscribe("history.export.request",async n=>{let{sessionId:e}=n.payload||{};if(!e)return console.warn("[History Worker] history.export.request received without sessionId"),[];let t=await x();return t?new Promise(r=>{try{let u=t.transaction(a,"readonly").objectStore(a).index("sessionId").getAll(IDBKeyRange.only(e));u.onsuccess=()=>{r(u.result||[])},u.onerror=()=>{r([])}}catch{r([])}}):[]});console.log("[History Worker] Initialized and listening...");})();';class xe{constructor(e,t=null,i={}){this.pc=e,this.sessionId=t||`session_${Date.now()}_${Math.floor(1e3*Math.random())}`,this.timer=null,this.decisionEngineEnabled=i.decisionEngineEnabled!==!1,this.monitorInbound=i.monitorInbound!==!1,this.controlChannel=i.controlChannel||null,this.bitrate=15e5,this.framerate=30,this.resolutionScale=1,this._nextInterval=2e3,this.minBitrate=15e4,this.maxBitrate=4e6,this._lastMetrics=null,this._lastInbound=null,this._lastAction={type:"MAINTAIN"},this._lastLLMExplanation=null,this._lastLLMStatus={state:"idle",message:"Waiting for Local LLM activity..."},this._isApplyingAction=!1,this.broadcast=new BroadcastChannel(ve),this.workers=[],this._workerActive=!1,this._initWorkers(),this.eventBus=new fe({sourceName:"main-thread",allowedTopics:["*"]}),this._setupSubscriptions()}_initWorkers(){console.log("[QoS] Initializing workers…");try{const e=(i,n)=>{try{const s=new Blob([i],{type:"application/javascript"}),r=URL.createObjectURL(s),a=new Worker(r);return URL.revokeObjectURL(r),a}catch{return new Worker(new URL(n,import.meta.url).href,{type:"module"})}};this.qosWorker=e(be,"./workers/qos-worker.js"),this.aiWorker=e(_e,"./workers/ai-worker.js"),this.iceWorker=e(we,"./workers/ice-worker.js"),this.historyWorker=e(Ie,"./workers/history-worker.js");const t=["qos","ai","ice","history"];[this.qosWorker,this.aiWorker,this.iceWorker,this.historyWorker].forEach((i,n)=>{i.onerror=s=>console.error(`[QoS] ${t[n]}-worker error:`,s.message||s.filename||s)}),this.workers=[this.qosWorker,this.aiWorker,this.iceWorker,this.historyWorker],this._workerActive=!0}catch(e){console.error("[QoS] Failed to initialize workers:",e),this._workerActive=!1}}_setupSubscriptions(){this.eventBus.subscribe("telemetry.summary",t=>{const i=t.payload;i&&(this._lastMetrics=i,i.inbound&&(this._lastInbound=i.inbound),this._broadcastToDashboard(i,this._lastAction))});const e=t=>{const i=t.payload||{};this._lastLLMStatus={state:i.state||(i.loaded?"ready":"idle"),progress:i.progress,message:i.message},this._broadcastToDashboard(this._lastMetrics,this._lastAction)};this.eventBus.subscribe("llm.status",e),this.eventBus.subscribe("qos.llm.status",e),this.eventBus.subscribe("qos.llm.response",()=>{this._lastLLMStatus={state:"ready",message:"Local LLM response received."},this._broadcastToDashboard(this._lastMetrics,this._lastAction)}),this.eventBus.subscribe("qos.llm.error",t=>{const i=t.payload||{};this._lastLLMStatus={state:"error",message:i.message||"Local LLM error."},this._broadcastToDashboard(this._lastMetrics,this._lastAction)}),this.eventBus.subscribe("qos.llm.explanation",t=>{t.payload&&(this._lastLLMExplanation=t.payload,this._broadcastToDashboard(this._lastMetrics,this._lastAction))}),this.eventBus.subscribe("ai.policy.response",t=>{const i=t.payload;i!=null&&i.action&&(this._lastAction=i.action,this.decisionEngineEnabled&&this._applyAction(i.action),this._nextInterval=i.action.nextInterval||2e3)}),this.eventBus.subscribe("ai.congestion.override",t=>{const i=t.payload;i!=null&&i.action&&(this.decisionEngineEnabled&&this._applyAction(i.action),this._lastMetrics&&this._broadcastToDashboard(this._lastMetrics,i.action))}),this.eventBus.subscribe("ai.anomaly.detected",t=>{console.warn("[QoS] Anomaly detected:",t.payload)}),this.eventBus.subscribe("ai.remote.bitrate.request",t=>{const i=t.payload;if(i&&this.controlChannel){if(this.controlChannel.readyState==="open")try{this.controlChannel.send(JSON.stringify({type:"qos:remote-bitrate-request",action:i.action,targetKbps:i.targetKbps,reason:i.reason,timestamp:Date.now()})),console.log("[QoS] Remote bitrate request sent:",i)}catch(n){console.warn("[QoS] Failed to send remote bitrate request:",n)}this._broadcastToDashboard(this._lastMetrics,this._lastAction)}}),this.broadcast.onmessage=t=>{const{type:i,payload:n}=t.data||{};if(i==="TOGGLE_DECISION_ENGINE"&&n)this.setDecisionEngine(n.enabled);else if(i==="REQUEST_STATE"||i==="DASHBOARD_READY")try{this.broadcast.postMessage({type:"STATE_UPDATE",sessionId:this.sessionId,decisionEngineEnabled:this.decisionEngineEnabled,status:this._workerActive?"Connected":"Waiting for connection…"}),(this._lastMetrics||this._lastInbound)&&this._broadcastToDashboard(this._lastMetrics,this._lastAction)}catch{}}}_broadcastToDashboard(e,t){try{this.broadcast.postMessage({timestamp:Date.now(),metrics:e,inboundMetrics:this._lastInbound,action:t,llmExplanation:this._lastLLMExplanation,llmStatus:this._lastLLMStatus,sessionId:this.sessionId,decisionEngineEnabled:this.decisionEngineEnabled})}catch(i){console.error("[QoS] Failed to broadcast to dashboard:",i)}}start(){if(this.pc){console.log("[QoS] Optimization loop started 🧠");try{this.broadcast.postMessage({type:"STATE_UPDATE",sessionId:this.sessionId,decisionEngineEnabled:this.decisionEngineEnabled,status:"Session Connected — Collecting metrics…"})}catch{}this._tick()}else console.warn("[QoS] Cannot start without RTCPeerConnection")}stop(){this.timer&&clearTimeout(this.timer),this._workerActive=!1;try{this.broadcast.postMessage({type:"SESSION_ENDED",sessionId:this.sessionId})}catch{}this.workers.forEach(e=>{try{e.terminate()}catch{}}),this.workers=[],this.eventBus&&this.eventBus.close();try{this.broadcast.close()}catch{}}isActive(){return this._workerActive}setDecisionEngine(e){this.decisionEngineEnabled=e;try{this.broadcast.postMessage({type:"STATE_UPDATE",sessionId:this.sessionId,decisionEngineEnabled:this.decisionEngineEnabled})}catch{}}isDecisionEngineEnabled(){return this.decisionEngineEnabled}async exportData(e){try{return await this.eventBus.request("history.export.request",{sessionId:e})||[]}catch(t){return console.error("[QoS] Export request failed:",t),[]}}applyRemoteBitrateRequest(e){if(!(e!=null&&e.targetKbps))return;const t=1e3*e.targetKbps;this.bitrate=Math.max(this.minBitrate,Math.min(this.maxBitrate,t));const i={type:e.action==="PLEASE_INCREASE_BITRATE"?"INCREASE_BITRATE":"DECREASE_BITRATE",reason:`Remote request: ${e.reason}`,factor:1};this.decisionEngineEnabled&&this._applyAction(i),console.log(`[QoS] Applied remote bitrate request: ${e.targetKbps} kbps`)}async _tick(){if(this._workerActive&&this.pc&&this.pc.signalingState!=="closed"){try{const e=await this.pc.getStats(),t=this._serializeStats(e);t.length>0&&this.eventBus.publish("telemetry.raw",{report:t,sessionId:this.sessionId})}catch(e){console.warn("[QoS] Error getting WebRTC stats:",e)}this._scheduleNextTick(this._nextInterval)}}_scheduleNextTick(e){this.timer&&clearTimeout(this.timer),this.timer=setTimeout(()=>this._tick(),e||2e3)}_serializeStats(e){const t=[];for(const[i,n]of e.entries()){const s=n.type;(s==="outbound-rtp"&&(n.kind==="video"||n.kind==="audio")||s==="remote-inbound-rtp"&&(n.kind==="video"||n.kind==="audio")||s==="candidate-pair"&&(n.state==="succeeded"||n.selected||n.nominated)||this.monitorInbound&&s==="inbound-rtp"&&(n.kind==="video"||n.kind==="audio"))&&t.push([i,{...n}])}return t}async _applyAction(e){if(this.pc&&e&&e.type!=="MAINTAIN"&&!this._isApplyingAction){this._isApplyingAction=!0;try{const t=this.pc.getSenders().find(s=>{var r;return((r=s.track)==null?void 0:r.kind)==="video"});if(!t||typeof t.getParameters!="function")return;const i=t.getParameters();if(!i||!i.encodings||i.encodings.length===0)return;let n=!1;switch(e.type){case"DECREASE_BITRATE":this.bitrate=Math.max(this.minBitrate,this.bitrate*(e.factor||.8)),i.encodings[0].maxBitrate=Math.floor(this.bitrate),n=!0;break;case"INCREASE_BITRATE":this.bitrate=Math.min(this.maxBitrate,this.bitrate*(e.factor||1.1)),i.encodings[0].maxBitrate=Math.floor(this.bitrate),n=!0;break;case"LOWER_RESOLUTION":this.resolutionScale<4&&(this.resolutionScale*=e.scaleFactor||2,i.encodings[0].scaleResolutionDownBy=this.resolutionScale,n=!0);break;case"RAISE_RESOLUTION":this.resolutionScale>1&&(this.resolutionScale/=e.scaleFactor||2,i.encodings[0].scaleResolutionDownBy=this.resolutionScale,n=!0);break;case"DECREASE_FPS":this.framerate>10&&(this.framerate=this.framerate<=15?10:15,i.encodings[0].maxFramerate=this.framerate,n=!0);break;case"INCREASE_FPS":this.framerate<30&&(this.framerate=this.framerate>=15?30:15,i.encodings[0].maxFramerate=this.framerate,n=!0)}if(n){console.log(`[QoS] Action: ${e.type} → ${Math.floor(this.bitrate/1e3)}kbps | ${this.framerate}fps | 1/${this.resolutionScale}x`);try{await t.setParameters(i)}catch(s){console.warn("[QoS] setParameters deferred or skipped:",s.message||s)}}}finally{this._isApplyingAction=!1}}}}class Ce extends EventTarget{constructor(e,t={}){if(super(),!e)throw new Error("[XoipQoSAdapter] xoipElement is required");this.element=e,this.options={decisionEngineEnabled:!0,monitorInbound:!0,autoStart:!0,...t},this.assistant=null,this._currentPc=null,this._watcherTimer=null,this._ensureElementGetters(),this._onDomStateChange=this._handleDomStateChange.bind(this),this._onPcStateChange=this._handlePcStateChange.bind(this),this._onCallEnded=this._handleCallEnded.bind(this),this._onStreamReady=this._handleStreamReady.bind(this),this._onRemoteMessage=this._handleRemoteMessage.bind(this),this.element.addEventListener("connectionstatechange",this._onDomStateChange),this.element.addEventListener("room-created",this._onStreamReady),this.element.addEventListener("room-joined",this._onStreamReady),this.element.addEventListener("remote-stream-ready",this._onStreamReady),this.element.addEventListener("call-ended",this._onCallEnded),this.options.autoStart&&this._startConnectionWatcher()}get peerConnection(){var e;const t=this.element;return t?((e=t._engine)==null?void 0:e.pc)??t._pc??null:null}get controlChannel(){var e;const t=this.element;return t?((e=t._engine)==null?void 0:e.dataChannel)??null:null}_ensureElementGetters(){const e=this.element;if(e)try{"peerConnection"in e||Object.defineProperty(e,"peerConnection",{get:()=>{var t;return((t=e._engine)==null?void 0:t.pc)??e._pc??null},configurable:!0}),"controlChannel"in e||Object.defineProperty(e,"controlChannel",{get:()=>{var t;return((t=e._engine)==null?void 0:t.dataChannel)??null},configurable:!0})}catch{}}_startConnectionWatcher(){this._checkAndHookPc(),this._watcherTimer||(this._watcherTimer=setInterval(()=>this._checkAndHookPc(),400))}_stopConnectionWatcher(){this._watcherTimer&&(clearInterval(this._watcherTimer),this._watcherTimer=null)}_checkAndHookPc(){const e=this.peerConnection;e&&e!==this._currentPc&&(this._currentPc&&this._unhookPc(this._currentPc),this._currentPc=e,this._hookPc(e)),e&&(e.connectionState==="connected"||e.iceConnectionState==="connected"||e.iceConnectionState==="completed")&&this.options.autoStart&&!this.assistant&&this.start()}_hookPc(e){e&&(e.addEventListener("connectionstatechange",this._onPcStateChange),e.addEventListener("iceconnectionstatechange",this._onPcStateChange))}_unhookPc(e){e&&(e.removeEventListener("connectionstatechange",this._onPcStateChange),e.removeEventListener("iceconnectionstatechange",this._onPcStateChange))}_handlePcStateChange(){const e=this.peerConnection;if(!e)return;const t=e.connectionState==="connected"||e.iceConnectionState==="connected"||e.iceConnectionState==="completed";console.log(`[XoipQoSAdapter] PC state: connectionState=${e.connectionState}, iceConnectionState=${e.iceConnectionState}`),t&&this.options.autoStart?this.start():e.connectionState!=="disconnected"&&e.connectionState!=="failed"&&e.connectionState!=="closed"||e.iceConnectionState!=="disconnected"&&e.iceConnectionState!=="failed"&&e.iceConnectionState!=="closed"||this.stop()}_handleDomStateChange(e){var t;const i=((t=e.detail)==null?void 0:t.state)??e.detail;i==="connected"&&this.options.autoStart?this.start():i!=="disconnected"&&i!=="failed"&&i!=="closed"||this.stop()}_handleStreamReady(){this._checkAndHookPc()}_handleCallEnded(){console.log("[XoipQoSAdapter] Call ended event received"),this.stop()}_handleRemoteMessage(e){try{const t=JSON.parse(e.data);t.type==="qos:remote-bitrate-request"&&this.assistant&&(this.assistant.applyRemoteBitrateRequest(t),this.element.dispatchEvent(new CustomEvent("xoip:peer-reduce-bitrate",{bubbles:!0,composed:!0,detail:{targetKbps:t.targetKbps,reason:t.reason}})))}catch{}}_attachControlChannelListener(){const e=this.controlChannel;e&&e.addEventListener("message",this._onMessage)}_detachControlChannelListener(){const e=this.controlChannel;e&&e.removeEventListener("message",this._onMessage)}start(){var e,t,i,n;if(this.assistant)return;const s=this.peerConnection;if(!s)return void console.warn("[XoipQoSAdapter] No active RTCPeerConnection available yet — waiting for call.");const r=((t=(e=this.element).getAttribute)==null?void 0:t.call(e,"call-id"))||((n=(i=this.element).getAttribute)==null?void 0:n.call(i,"room-id"))||this.element.id||`xoip_${Date.now()}`;this.assistant=new xe(s,r,{decisionEngineEnabled:this.options.decisionEngineEnabled,monitorInbound:this.options.monitorInbound,controlChannel:this.controlChannel}),this.assistant.start(),this._attachControlChannelListener(),this.dispatchEvent(new CustomEvent("qos:started",{detail:{callId:r,monitorInbound:this.options.monitorInbound}})),console.log(`[XoipQoSAdapter] Started monitoring session: ${r}`)}stop(){this.assistant&&(this._detachControlChannelListener(),this.assistant.stop(),this.assistant=null,this.dispatchEvent(new CustomEvent("qos:stopped")),console.log("[XoipQoSAdapter] Stopped monitoring."))}setDecisionEngine(e){var t;(t=this.assistant)==null||t.setDecisionEngine(e)}isActive(){var e;return!!((e=this.assistant)!=null&&e.isActive())}openDashboard(e="/qos/dashboard/",t={}){let i="/qos/dashboard/",n=!!(t!=null&&t.newTab);if(e&&typeof e=="object"&&("ctrlKey"in e||"type"in e)){const s=e;(s.ctrlKey||s.metaKey)&&(n=!0)}else typeof e=="string"&&e&&(i=e);n?window.open(i,"_blank"):window.open(i,"QoSDashboard","width=1280,height=820,menubar=no,toolbar=no")}destroy(){this._stopConnectionWatcher(),this._currentPc&&(this._unhookPc(this._currentPc),this._currentPc=null),this.stop(),this.element.removeEventListener("connectionstatechange",this._onDomStateChange),this.element.removeEventListener("room-created",this._onStreamReady),this.element.removeEventListener("room-joined",this._onStreamReady),this.element.removeEventListener("remote-stream-ready",this._onStreamReady),this.element.removeEventListener("call-ended",this._onCallEnded)}}class Se extends HTMLElement{static get observedAttributes(){return["for","monitor-inbound","decision-engine","auto-start"]}constructor(){super(),this._targetElement=null,this._adapter=null,this._pendingResolveTimer=null,this._onQoSStarted=e=>this._relayEvent("qos:started",e.detail),this._onQoSStopped=e=>this._relayEvent("qos:stopped",e.detail)}get for(){return this.getAttribute("for")||""}set for(e){e?this.setAttribute("for",e):this.removeAttribute("for")}get monitorInbound(){const e=this.getAttribute("monitor-inbound");return e===null||e!=="false"}set monitorInbound(e){e?this.setAttribute("monitor-inbound",""):this.setAttribute("monitor-inbound","false")}get decisionEngine(){const e=this.getAttribute("decision-engine");return e===null||e!=="false"}set decisionEngine(e){e?this.setAttribute("decision-engine",""):this.setAttribute("decision-engine","false"),this._adapter&&this._adapter.setDecisionEngine(this.decisionEngine)}get autoStart(){const e=this.getAttribute("auto-start");return e===null||e!=="false"}set autoStart(e){e?this.setAttribute("auto-start",""):this.setAttribute("auto-start","false")}get target(){return this._targetElement}set target(e){this._targetElement!==e&&this._attachTo(e)}get adapter(){return this._adapter}get isActive(){var e;return!!((e=this._adapter)!=null&&e.isActive())}connectedCallback(){this.style.display="none",this._resolveTarget()}disconnectedCallback(){this._cancelPendingResolve(),this._detach()}attributeChangedCallback(e,t,i){if(t!==i){if(e==="for")this.isConnected&&this._resolveTarget();else if(e==="decision-engine"&&this._adapter)this._adapter.setDecisionEngine(this.decisionEngine);else if((e==="monitor-inbound"||e==="auto-start")&&this._targetElement&&this.isConnected){const n=this.isActive;this._attachTo(this._targetElement),n&&this.start()}}}_resolveTarget(){this._cancelPendingResolve();const e=this.for;if(!e)return void this._detach();const t=this.getRootNode()||document,i=t.getElementById?t.getElementById(e):document.getElementById(e);i?this._attachTo(i):this._pendingResolveTimer=requestAnimationFrame(()=>{const n=this.getRootNode()||document,s=n.getElementById?n.getElementById(e):document.getElementById(e);s?this._attachTo(s):console.warn(`[xoip-qos] Target element with id="${e}" not found in DOM.`)})}_cancelPendingResolve(){this._pendingResolveTimer!==null&&(cancelAnimationFrame(this._pendingResolveTimer),this._pendingResolveTimer=null)}_attachTo(e){this._detach(),e&&(this._targetElement=e,this._adapter=new Ce(this._targetElement,{monitorInbound:this.monitorInbound,decisionEngineEnabled:this.decisionEngine,autoStart:this.autoStart}),this._adapter.addEventListener("qos:started",this._onQoSStarted),this._adapter.addEventListener("qos:stopped",this._onQoSStopped),this._relayEvent("qos:attached",{target:this._targetElement}))}_detach(){this._adapter&&(this._adapter.removeEventListener("qos:started",this._onQoSStarted),this._adapter.removeEventListener("qos:stopped",this._onQoSStopped),this._adapter.destroy(),this._adapter=null),this._targetElement&&(this._relayEvent("qos:detached",{target:this._targetElement}),this._targetElement=null)}_relayEvent(e,t){this.dispatchEvent(new CustomEvent(e,{bubbles:!0,composed:!0,detail:t}))}start(){this._adapter?this._adapter.start():console.warn("[xoip-qos] Cannot start: no target attached.")}stop(){var e;(e=this._adapter)==null||e.stop()}openDashboard(e,t){var i;let n=this.getAttribute("dashboard-url")||"/qos/dashboard/",s={...t};if(e&&typeof e=="object"&&("ctrlKey"in e||"type"in e)){const r=e;(r.ctrlKey||r.metaKey)&&(s.newTab=!0)}else typeof e=="string"&&e&&(n=e);(i=this._adapter)==null||i.openDashboard(n,s)}}typeof customElements>"u"||customElements.get("xoip-qos")||customElements.define("xoip-qos",Se);const ke=[{urls:["stun:stun1.l.google.com:19302","stun:stun2.l.google.com:19302"]}];class Re{constructor(e={}){this.polite=e.polite??!0,this._iceServers=e.iceServers??ke,this._onSignal=e.onSignal??(()=>{}),this._onRemoteTrack=e.onRemoteTrack??(()=>{}),this._onDataMessage=e.onDataMessage??(()=>{}),this._onConnectionState=e.onConnectionState??(()=>{}),this._onError=e.onError??(t=>console.error("[WebRTCEngine]",t)),this.pc=null,this.dataChannel=null,this._makingOffer=!1,this._ignoreOffer=!1,this._isSettingRemoteAnswerPending=!1,this._pendingCandidates=[],this._iceRestartCount=0,this._iceRestartTimer=null}init(){return this.pc&&this.close(),this.pc=new RTCPeerConnection({iceServers:this._iceServers,iceCandidatePoolSize:10}),this._pendingCandidates=[],this._setupPerfectNegotiation(),this._setupConnectionMonitor(),this.pc}close(){var e,t;clearInterval(this._iceRestartTimer),(e=this.dataChannel)==null||e.close(),(t=this.pc)==null||t.close(),this.pc=null,this.dataChannel=null,this._makingOffer=!1,this._ignoreOffer=!1,this._isSettingRemoteAnswerPending=!1,this._pendingCandidates=[],this._iceRestartCount=0}addAudioTrack(e,t){return t?this.pc.addTrack(e,t):this.pc.addTrack(e)}addVideoTrack(e,t){return t?this.pc.addTrack(e,t):this.pc.addTrack(e)}async replaceTrack(e,t){var i;const n=(i=this.pc)==null?void 0:i.getSenders().find(s=>{var r;return((r=s.track)==null?void 0:r.kind)===e});n?await n.replaceTrack(t):console.warn(`[WebRTCEngine] No ${e} sender found.`)}setTransceiverDirection(e,t){var i;const n=(i=this.pc)==null?void 0:i.getTransceivers().find(s=>{var r,a;return((a=(r=s.sender)==null?void 0:r.track)==null?void 0:a.kind)===e});n&&(n.direction=t)}async handleSignal(e){try{e.type==="offer"||e.type==="answer"?await this._handleDescription(e.payload):e.type==="ice-candidate"&&await this._handleIceCandidate(e.payload)}catch(t){this._onError(t)}}setupDataChannel(){if(this.dataChannel||!this.pc)return;const e=this.pc;this.polite?e.ondatachannel=({channel:t})=>{this.dataChannel=t,this._bindDataChannel(t)}:(this.dataChannel=e.createDataChannel("p2p-control",{ordered:!0}),this._bindDataChannel(this.dataChannel))}sendData(e){var t;this.dataChannel||this.setupDataChannel();const i=typeof e=="string"?e:JSON.stringify(e);((t=this.dataChannel)==null?void 0:t.readyState)==="open"?this.dataChannel.send(i):console.warn("[WebRTCEngine] DataChannel not open. Message dropped.")}_setupPerfectNegotiation(){const e=this.pc;e.onnegotiationneeded=async()=>{if(!this.polite||e.remoteDescription)try{this._makingOffer=!0,await e.setLocalDescription(),this._onSignal({type:e.localDescription.type,payload:{type:e.localDescription.type,sdp:e.localDescription.sdp}})}catch(t){this._onError(t)}finally{this._makingOffer=!1}},e.onicecandidate=({candidate:t})=>{t&&this._onSignal({type:"ice-candidate",payload:t.toJSON()})},e.ontrack=t=>{this._onRemoteTrack(t)}}async _handleDescription(e){const t=this.pc;if(!t||!e||!e.type)return void console.warn("[WebRTCEngine] _handleDescription: invalid or missing description/type:",e);const i=!this._makingOffer&&(t.signalingState==="stable"||this._isSettingRemoteAnswerPending),n=e.type==="offer"&&!i;if(this._ignoreOffer=!this.polite&&n,!this._ignoreOffer)if(e.type!=="answer"||t.signalingState==="have-local-offer"){if(n){if(t.signalingState!=="have-local-offer")return void console.warn("[WebRTCEngine] Ignoring colliding offer in state:",t.signalingState);await t.setLocalDescription({type:"rollback"})}this._isSettingRemoteAnswerPending=e.type==="answer";try{await t.setRemoteDescription(new RTCSessionDescription(e))}catch(s){if(this._isSettingRemoteAnswerPending=!1,s instanceof DOMException&&s.name==="InvalidStateError")return void console.warn("[WebRTCEngine] setRemoteDescription ignored (stale):",s.message);throw s}this._isSettingRemoteAnswerPending=!1,await this._flushPendingCandidates(),e.type==="offer"&&(await t.setLocalDescription(),this._onSignal({type:"answer",payload:{type:t.localDescription.type,sdp:t.localDescription.sdp}}))}else console.warn("[WebRTCEngine] Ignoring stale answer in state:",t.signalingState)}async _handleIceCandidate(e){if(e&&e.candidate)if(this.pc&&this.pc.remoteDescription&&this.pc.remoteDescription.type)try{await this.pc.addIceCandidate(new RTCIceCandidate(e))}catch(t){this._ignoreOffer||console.warn("[WebRTCEngine] addIceCandidate warning:",t)}else this._pendingCandidates.push(e)}async _flushPendingCandidates(){if(!this.pc||!this.pc.remoteDescription||!this.pc.remoteDescription.type)return;const e=[...this._pendingCandidates];this._pendingCandidates=[];for(const t of e)try{await this.pc.addIceCandidate(new RTCIceCandidate(t))}catch(i){this._ignoreOffer||console.warn("[WebRTCEngine] Flush addIceCandidate warning:",i)}}_bindDataChannel(e){e.onopen=()=>console.log("[WebRTCEngine] DataChannel open."),e.onclose=()=>console.log("[WebRTCEngine] DataChannel closed."),e.onmessage=({data:t})=>{try{this._onDataMessage(JSON.parse(t))}catch{this._onDataMessage(t)}}}_setupConnectionMonitor(){const e=this.pc;e.onconnectionstatechange=()=>{const t=e.connectionState;if(console.log(`[WebRTCEngine] Connection state: ${t}`),this._onConnectionState(t),(t==="failed"||t==="disconnected")&&this._iceRestartCount<3){if(this._iceRestartTimer)return;this._iceRestartTimer=setTimeout(()=>{this._iceRestartTimer=null,e.connectionState!=="connected"&&(this._iceRestartCount++,console.warn(`[WebRTCEngine] ICE restart #${this._iceRestartCount}...`),e.restartIce())},2e3)}t==="connected"&&(this._iceRestartCount=0,this._iceRestartTimer&&(clearTimeout(this._iceRestartTimer),this._iceRestartTimer=null))}}}class Ee{constructor(e={}){this._multiCamera=e.multiCamera??!1,this._videoConstraints=e.videoConstraints??{width:{min:640,ideal:1280,max:1920},height:{min:360,ideal:720,max:1080},frameRate:{ideal:30}},this._audioConstraints=e.audioConstraints??{echoCancellation:!0,noiseSuppression:!0,autoGainControl:!0},this._onError=e.onError??(t=>console.error("[MediaManager]",t)),this.primaryStream=null,this.secondaryStreams=[],this.screenStream=null,this._screenSharing=!1}async start(){await navigator.mediaDevices.getUserMedia({audio:!0,video:!0});const e=(await navigator.mediaDevices.getUserMedia({audio:this._audioConstraints,video:!1})).getAudioTracks()[0];let t=[];return this._multiCamera?t=await this._captureAllCameras():t=(await navigator.mediaDevices.getUserMedia({video:this._videoConstraints,audio:!1})).getVideoTracks(),this.primaryStream=new MediaStream([e,...t.length?[t[0]]:[]]),{audioTrack:e,videoTracks:t}}async _captureAllCameras(){const e=(await navigator.mediaDevices.enumerateDevices()).filter(n=>n.kind==="videoinput"),t=await Promise.allSettled(e.map(n=>navigator.mediaDevices.getUserMedia({video:{deviceId:{exact:n.deviceId},...this._videoConstraints},audio:!1}))),i=[];return t.forEach((n,s)=>{var r;n.status==="fulfilled"?(i.push(...n.value.getVideoTracks()),s>0&&this.secondaryStreams.push(n.value)):console.warn(`[MediaManager] Camera ${s} not captured:`,((r=n.reason)==null?void 0:r.name)??n.reason)}),i}async startScreenShare(e){this.screenStream=await navigator.mediaDevices.getDisplayMedia({video:{cursor:"always",displaySurface:"monitor",logicalSurface:!0,frameRate:{ideal:30}},audio:!0});const t=this.screenStream.getVideoTracks()[0];return this._screenSharing=!0,t.onended=async()=>{await this.stopScreenShare(e)},t}async stopScreenShare(e){var t,i;if(!this._screenSharing)return null;(t=this.screenStream)==null||t.getTracks().forEach(s=>s.stop()),this.screenStream=null,this._screenSharing=!1;const n=((i=this.primaryStream)==null?void 0:i.getVideoTracks()[0])??null;return e==null||e(n),n}get isScreenSharing(){return this._screenSharing}async switchCamera(e){var t;const i=(await navigator.mediaDevices.getUserMedia({video:{deviceId:{exact:e}},audio:!1})).getVideoTracks()[0];if((t=this.primaryStream)==null||t.getVideoTracks().forEach(n=>n.stop()),this.primaryStream){const n=this.primaryStream.getAudioTracks();this.primaryStream=new MediaStream([...n,i])}return i}async switchMicrophone(e){var t;const i=(await navigator.mediaDevices.getUserMedia({audio:{deviceId:{exact:e},...this._audioConstraints},video:!1})).getAudioTracks()[0];if((t=this.primaryStream)==null||t.getAudioTracks().forEach(n=>n.stop()),this.primaryStream){const n=this.primaryStream.getVideoTracks();this.primaryStream=new MediaStream([i,...n])}return i}setAudioMute(e){var t;(t=this.primaryStream)==null||t.getAudioTracks().forEach(i=>{i.enabled=!e})}setVideoMute(e){var t;(t=this.primaryStream)==null||t.getVideoTracks().forEach(i=>{i.enabled=!e}),this.secondaryStreams.forEach(i=>i.getVideoTracks().forEach(n=>{n.enabled=!e}))}async getDevices(){const e=await navigator.mediaDevices.enumerateDevices();return{cameras:e.filter(t=>t.kind==="videoinput"),microphones:e.filter(t=>t.kind==="audioinput"),speakers:e.filter(t=>t.kind==="audiooutput")}}stopAll(){[this.primaryStream,this.screenStream,...this.secondaryStreams].filter(Boolean).forEach(e=>e.getTracks().forEach(t=>t.stop())),this.primaryStream=null,this.screenStream=null,this.secondaryStreams=[],this._screenSharing=!1,console.log("[MediaManager] All media tracks stopped.")}}class Ae{constructor(e,t={}){this._pc=e,this._intervalMs=t.intervalMs??3e3,this._onQuality=t.onQuality??(()=>{}),this._timer=null,this._prev={timestamp:0,bytesSent:0,bytesReceived:0,packetsSent:0,packetsLost:0}}start(){this._timer||(this._timer=setInterval(()=>this._collect(),this._intervalMs),console.log("[StatsMonitor] Started."))}stop(){clearInterval(this._timer),this._timer=null,console.log("[StatsMonitor] Stopped.")}async getFullReport(){return this._pc.getStats()}async _collect(){if(this._pc&&this._pc.connectionState==="connected")try{const e=await this._pc.getStats(),t=this._parseStats(e);this._onQuality(t)}catch(e){console.warn("[StatsMonitor] getStats() error:",e)}}_parseStats(e){let t=null,i=null,n=0,s=0,r="unknown";const a=Date.now(),l=(a-this._prev.timestamp)/1e3||1;let h=0,u=0,g=0,y=0;if(e.forEach(m=>{switch(m.type){case"candidate-pair":m.state==="succeeded"&&m.currentRoundTripTime!=null&&(t=Math.round(1e3*m.currentRoundTripTime)),m.localCandidateId&&(r=this._resolveConnectionType(e,m.localCandidateId));break;case"outbound-rtp":m.kind==="video"&&(h+=m.bytesSent??0,g+=m.packetsSent??0);break;case"remote-inbound-rtp":m.kind==="video"&&(y+=m.packetsLost??0);break;case"inbound-rtp":m.kind==="video"&&(u+=m.bytesReceived??0)}}),this._prev.timestamp>0){n=Math.round(8*(h-this._prev.bytesSent)/l/1e3),s=Math.round(8*(u-this._prev.bytesReceived)/l/1e3);const m=g-this._prev.packetsSent,d=y-this._prev.packetsLost;m>0&&(i=Math.min(100,Math.max(0,Math.round(d/m*100))))}return this._prev={timestamp:a,bytesSent:h,bytesReceived:u,packetsSent:g,packetsLost:y},{rtt:t,packetLoss:i,bitrateOut:n,bitrateIn:s,connectionType:r,quality:this._qualityLabel(t,i)}}_resolveConnectionType(e,t){const i=e.get(t);return i?i.candidateType==="relay"?"TURN":i.candidateType==="srflx"?"STUN":"P2P":"unknown"}_qualityLabel(e,t){return e==null||t==null?"unknown":e<100&&t<2?"excellent":e<200&&t<5?"good":e<400&&t<15?"poor":"bad"}}class Le{constructor(e={}){this._onSendPublicKey=e.onSendPublicKey??(()=>{}),this._onError=e.onError??(t=>console.error("[E2EEManager]",t)),this._keyPair=null,this._sharedKey=null,this._worker=null,this._pendingRemoteKey=null}async initialize(){this._keyPair=await crypto.subtle.generateKey({name:"ECDH",namedCurve:"P-256"},!0,["deriveKey"]);const e=await this._exportPublicKey();if(this._onSendPublicKey(e),console.log("[E2EEManager] Public key published via DataChannel."),this._pendingRemoteKey){const t=this._pendingRemoteKey;this._pendingRemoteKey=null,await this.receiveRemotePublicKey(t)}}async receiveRemotePublicKey(e){if(!this._keyPair)return console.warn("[E2EEManager] Remote key received before initialization — buffering."),void(this._pendingRemoteKey=e);try{const t=await this._importPublicKey(e);if(this._sharedKey=await crypto.subtle.deriveKey({name:"ECDH",public:t},this._keyPair.privateKey,{name:"AES-GCM",length:256},!0,["encrypt","decrypt"]),this._worker){const i=await crypto.subtle.exportKey("raw",this._sharedKey);this._worker.postMessage({type:"set-key",keyData:i},[i])}console.log("[E2EEManager] Shared AES-GCM key derived from ECDH exchange.")}catch(t){this._onError(t)}}async attachToPeerConnection(e,t){if(typeof RTCRtpScriptTransform<"u"){if(this._worker=new Worker(t,{type:"module"}),e.getSenders().forEach(i=>{i.track&&(i.transform=new RTCRtpScriptTransform(this._worker,{operation:"encrypt",kind:i.track.kind}))}),e.getReceivers().forEach(i=>{i.track&&(i.transform=new RTCRtpScriptTransform(this._worker,{operation:"decrypt",kind:i.track.kind}))}),e.addEventListener("track",i=>{const n=i.receiver;n&&!n.transform&&this._worker&&(n.transform=new RTCRtpScriptTransform(this._worker,{operation:"decrypt",kind:i.track.kind}))}),this._sharedKey){const i=await crypto.subtle.exportKey("raw",this._sharedKey);this._worker.postMessage({type:"set-key",keyData:i},[i])}console.log("[E2EEManager] RTCRtpScriptTransform attached.")}else console.warn("[E2EEManager] RTCRtpScriptTransform not supported. E2EE disabled.")}terminate(){var e;(e=this._worker)==null||e.terminate(),this._worker=null,this._sharedKey=null,this._keyPair=null}async _exportPublicKey(){const e=await crypto.subtle.exportKey("raw",this._keyPair.publicKey);return btoa(String.fromCharCode(...new Uint8Array(e)))}async _importPublicKey(e){const t=Uint8Array.from(atob(e),i=>i.charCodeAt(0)).buffer;return crypto.subtle.importKey("raw",t,{name:"ECDH",namedCurve:"P-256"},!0,[])}}const re=new Set(["firebase","nostr","custom"]);function Te(o){if(!o||typeof o!="string")throw new Error("[URI] Invalid URI: must be a non-empty string");if(!o.startsWith("xoip://"))throw new Error(`[URI] Invalid URI scheme: expected "xoip://", got "${o.slice(0,10)}"`);let e;try{e=new URL(o.replace(/^xoip:\/\//,"https://xoip.local/"))}catch{throw new Error(`[URI] Malformed URI: "${o.slice(0,50)}"`)}const t=e.pathname.split("/").filter(Boolean);if(t.length<3||t[0]!=="call")throw new Error("[URI] Invalid URI path: expected /call/<signalingType>/<TOKEN>");const i=t[1],n=t.slice(2).join("/");if(!re.has(i))throw new Error(`[URI] Unknown signalingType: "${i}". Expected: firebase | nostr | custom`);if(!n||!n.startsWith("XST1."))throw new Error('[URI] Invalid TOKEN: must start with "XST1."');const s=e.searchParams.get("room");if(!s)throw new Error("[URI] Missing required query parameter: room");const r=Me(e.hash);if(!r)throw new Error("[URI] Missing required fragment: #key=<ROOM_KEY>");return{signalingType:i,token:n,roomId:s,roomKey:r}}function De({signalingType:o,token:e,roomId:t,roomKey:i}){if(!re.has(o))throw new Error(`[URI] Invalid signalingType: "${o}"`);if(!(e!=null&&e.startsWith("XST1.")))throw new Error('[URI] Invalid token: must start with "XST1."');if(!t)throw new Error("[URI] roomId is required");if(!i)throw new Error("[URI] roomKey is required");return`xoip://call/${o}/${e}?room=${encodeURIComponent(t)}#key=${encodeURIComponent(i)}`}function Me(o){if(!o)return null;const e=o.startsWith("#")?o.slice(1):o;try{return new URLSearchParams(e).get("key")||null}catch{return null}}const oe={token:"xoip-v1-token",signal:"xoip-v1-signal"};function Ne(){const o=new Uint8Array(32);return crypto.getRandomValues(o),ce(o)}async function ae(o){const e=Y(o);return de(await crypto.subtle.importKey("raw",e,{name:"HKDF"},!1,["deriveKey"]),oe.token)}async function le(o){const e=Y(o);return de(await crypto.subtle.importKey("raw",e,{name:"HKDF"},!1,["deriveKey"]),oe.signal)}async function qe(o,e){const t=new Uint8Array(12);crypto.getRandomValues(t);const i=typeof e=="string"?new TextEncoder().encode(e):e,n=await crypto.subtle.encrypt({name:"AES-GCM",iv:t},o,i),s=new Uint8Array(t.length+n.byteLength);return s.set(t,0),s.set(new Uint8Array(n),t.length),s}async function Pe(o,e){const t=e.slice(0,12),i=e.slice(12),n=await crypto.subtle.decrypt({name:"AES-GCM",iv:t},o,i);return new Uint8Array(n)}function ce(o){return btoa(String.fromCharCode(...o)).replace(/\+/g,"-").replace(/\//g,"_").replace(/=/g,"")}function Y(o){const e=o.replace(/-/g,"+").replace(/_/g,"/").padEnd(o.length+(4-o.length%4)%4,"=");return Uint8Array.from(atob(e),t=>t.charCodeAt(0))}async function de(o,e){return crypto.subtle.deriveKey({name:"HKDF",hash:"SHA-256",salt:new Uint8Array(32),info:new TextEncoder().encode(e)},o,{name:"AES-GCM",length:256},!1,["encrypt","decrypt"])}async function Be({roomKeyBase64Url:o,type:e,roomId:t,config:i={},ttlSeconds:n=3600}){const s=Math.floor(Date.now()/1e3),r={v:1,type:e,room:t,config:i,iat:s,exp:s+n,jti:Ue()},a=await ae(o),l=JSON.stringify(r),h=await qe(a,l);return`XST1.${ce(h)}`}async function Oe({token:o,roomKeyBase64Url:e,expectedType:t,expectedRoomId:i}){if(!o||typeof o!="string")throw new Error("[Token] Invalid token format: must be a string");const n=o.split(".");if(n.length!==2||n[0]!=="XST1")throw new Error('[Token] Invalid token format: expected "XST1.<data>"');let s;try{s=Y(n[1])}catch{throw new Error("[Token] Invalid token: failed to decode Base64URL envelope")}const r=await ae(e);let a,l;try{const h=await Pe(r,s);a=new TextDecoder().decode(h)}catch{throw new Error("[Token] Decryption failed: invalid roomKey or tampered token")}try{l=JSON.parse(a)}catch{throw new Error("[Token] Invalid token: payload is not valid JSON")}if(l.v!==1)throw new Error(`[Token] Unsupported token version: ${l.v}`);if(l.type!==t)throw new Error(`[Token] Type mismatch: token.type="${l.type}" vs URI.signalingType="${t}"`);if(l.room!==i)throw new Error(`[Token] Room mismatch: token.room="${l.room}" vs URI.roomId="${i}"`);if(Math.floor(Date.now()/1e3)>=l.exp)throw new Error(`[Token] Token expired at ${new Date(1e3*l.exp).toISOString()}`);return l}function Ue(){const o=new Uint8Array(16);return crypto.getRandomValues(o),Array.from(o,e=>e.toString(16).padStart(2,"0")).join("")}const Qe="modulepreload",We=function(o,e){return new URL(o,e).href},te={},D=function(e,t,i){let n=Promise.resolve();if(t&&t.length>0){let r=function(u){return Promise.all(u.map(g=>Promise.resolve(g).then(y=>({status:"fulfilled",value:y}),y=>({status:"rejected",reason:y}))))};const a=document.getElementsByTagName("link"),l=document.querySelector("meta[property=csp-nonce]"),h=(l==null?void 0:l.nonce)||(l==null?void 0:l.getAttribute("nonce"));n=r(t.map(u=>{if(u=We(u,i),u in te)return;te[u]=!0;const g=u.endsWith(".css"),y=g?'[rel="stylesheet"]':"";if(!!i)for(let _=a.length-1;_>=0;_--){const C=a[_];if(C.href===u&&(!g||C.rel==="stylesheet"))return}else if(document.querySelector(`link[href="${u}"]${y}`))return;const d=document.createElement("link");if(d.rel=g?"stylesheet":Qe,g||(d.as="script"),d.crossOrigin="",d.href=u,h&&d.setAttribute("nonce",h),document.head.appendChild(d),g)return new Promise((_,C)=>{d.addEventListener("load",_),d.addEventListener("error",()=>C(new Error(`Unable to preload CSS for ${u}`)))})}))}function s(r){const a=new Event("vite:preloadError",{cancelable:!0});if(a.payload=r,window.dispatchEvent(a),!a.defaultPrevented)throw r}return n.then(r=>{for(const a of r||[])a.status==="rejected"&&s(a.reason);return e().catch(s)})};class ie{static async create(e,t={},i={}){switch(e){case"firebase":{const{FirebaseSignalingAdapter:n}=await D(()=>import("./firebase-adapter-DTdSu7uZ.js"),__vite__mapDeps([0,1]),import.meta.url);let s=typeof window<"u"&&window.firebase?window.firebase:null;if(!s)try{const a=await D(()=>import("./xoip-call-yoD6TSFD.js"),[],import.meta.url);s=a.default??a,await D(()=>import("./xoip-call-DNqvg6tM.js"),[],import.meta.url)}catch{try{const l=await D(()=>import("./xoip-call-BPdA3TTP.js"),[],import.meta.url);s=l.default??l}catch{if(typeof window>"u"||!window.firebase)throw new Error("[SignalingFactory] Firebase is not installed or loaded. Add npm install firebase@8 or include Firebase scripts in HTML.");s=window.firebase}}s.apps&&s.apps.length||s.initializeApp(t);let r=i.cryptoKey??null;return!r&&i.roomKey&&(r=await le(i.roomKey)),new n(s,{collection:t.collection??"calls",cryptoKey:r})}case"nostr":{const{NostrSignalingAdapter:n}=await D(()=>import("./p2p-adapter-DTUzgtcg.js"),__vite__mapDeps([2,1]),import.meta.url);return new n({relays:t.relays,privateKeyHex:t.privateKeyHex})}case"websocket":{const{WebSocketSignalingAdapter:n}=await D(()=>import("./websocket-adapter-B2lcr0zo.js"),__vite__mapDeps([3,1]),import.meta.url);return new n(t.url??t.wsUrl??"wss://localhost:8080")}case"custom":{const n=i.customAdapter;if(!n)throw new Error('[SignalingFactory] type="custom" requires options.customAdapter');return n}default:throw new Error(`[SignalingFactory] Unknown signalingType: "${e}". Supported: firebase | nostr | websocket | custom`)}}static isSupported(e){return["firebase","nostr","websocket","custom"].includes(e)}}const f={microphone:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
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
  </svg>`},Ke=()=>`
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
`,$e=()=>`
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
`,he=["apiKey","authDomain","projectId","storageBucket","messagingSenderId","appId","collection"];async function Ve(o){if(!o||typeof o!="object")return"";let e;if(o.apiKey||o.projectId){const i=he.map(n=>o[n]??"");e=JSON.stringify(i)}else e=JSON.stringify(o);const t=new TextEncoder().encode(e);if(typeof CompressionStream<"u"){const i=new CompressionStream("gzip"),n=i.writable.getWriter();n.write(t),n.close();const s=await new Response(i.readable).arrayBuffer();return btoa(String.fromCharCode(...new Uint8Array(s)))}return btoa(String.fromCharCode(...t))}async function j(o){if(!o||typeof o!="string")return{};try{const e=atob(o.trim()),t=Uint8Array.from(e,s=>s.charCodeAt(0));let i;if(typeof DecompressionStream<"u"){const s=new DecompressionStream("gzip"),r=s.writable.getWriter();r.write(t),r.close();const a=await new Response(s.readable).arrayBuffer();i=new TextDecoder().decode(a)}else i=new TextDecoder().decode(t);const n=JSON.parse(i);return Array.isArray(n)?Object.fromEntries(he.map((s,r)=>[s,n[r]]).filter(([,s])=>s!=null&&s!=="")):typeof n=="object"&&n!==null?n:{}}catch(e){return console.warn("[xoip-call] Failed to decompress signaling-token:",e),{}}}const He=typeof HTMLElement<"u"?HTMLElement:class{};class Fe extends He{static compressConfig(e){return Ve(e)}static decompressConfig(e){return j(e)}static get observedAttributes(){return["src","signaling-type","signaling-config","signaling-token","ice-servers","multi-camera","headless","e2ee-enabled","custom-remote-video","room-id","audio-only","vad-threshold"]}constructor(){super(),this.attachShadow({mode:"open"}),this._engine=null,this._media=null,this._stats=null,this._e2ee=null,this._signaling=null,this._callState="idle",this._audioMuted=!1,this._videoMuted=!1,this._localCamerasVisible=!1,this._audioOnlyMode=!1,this._pipActive=!1,this._remoteStreams=new Map,this._cameraTrack=null,this._vadAudioCtx=null,this._vadAnalyserLocal=null,this._vadAnalyserRemote=null,this._vadLocalActive=!1,this._vadRemoteActive=!1,this._vadRafId=null,this._micLevelRafId=null,this._els={},this._tooltipTimer=null,this._iceFailoverTimer=null,this._turnRequested=!1,this._xoipSession=null}connectedCallback(){this._render(),this._bindElements(),this._setupUI(),this._checkUrlParams();const e=this.getAttribute("room-id");e&&(this._els.roomInput.value=e,this._els.joinBtn.disabled=!1)}disconnectedCallback(){this._cleanup(!0)}attributeChangedCallback(e,t,i){t!==i&&(e==="room-id"&&i&&this._callState==="idle"&&this._els.roomInput&&(this._els.roomInput.value=i,this._els.joinBtn.disabled=!1),e==="src"&&i&&this._callState==="idle"&&this.connect(i).catch(n=>this._handleError("CONNECT_FAILED",n)))}async connect(e){if(this._callState==="idle"){this._callState="calling";try{const{signalingType:t,token:i,roomId:n,roomKey:s}=Te(e),r=await Oe({token:i,roomKeyBase64Url:s,expectedType:t,expectedRoomId:n});this._xoipSession={signalingType:t,token:i,roomId:n,roomKey:s,tokenPayload:r,shareURI:e},this._signaling=await ie.create(t,r.config??{},{roomKey:s}),this._els.roomInput&&(this._els.roomInput.value=n),await this._initSignaling("polite"),await this._startMedia(),await this._signaling.joinRoom(n),this._emit("room-joined",{roomId:n,uri:e}),this._showCallScreen()}catch(t){this._callState="idle",this._xoipSession=null,this._handleError("CONNECT_FAILED",t)}}else console.warn("[xoip-call] connect() called while not idle. Current state:",this._callState)}addIceServers(e){var t,i;Array.isArray(e)&&e.length&&((i=(t=this._engine)==null?void 0:t.addIceServers)==null||i.call(t,e))}async restartIce(){var e,t;await((t=(e=this._engine)==null?void 0:e.restartIce)==null?void 0:t.call(e))}set signalingAdapter(e){this._signaling=e}get signalingAdapter(){return this._signaling}get localStream(){var e;return((e=this._media)==null?void 0:e.primaryStream)??null}get remoteStreams(){return this._remoteStreams}async createRoom(){var e,t;if(this._callState==="idle"){this._callState="calling";try{const i=Ne(),n=await le(i);await this._initSignaling("impolite",{roomKey:i,cryptoKey:n});const s=await this._signaling.createRoom();this._els.roomInput.value=s;let r=null;try{const a=this.getAttribute("signaling-type")||"firebase";let l={};const h=this.getAttribute("signaling-token");if(h)l=await j(h);else{const g=this.getAttribute("signaling-config");try{l=g?JSON.parse(g):{}}catch{}}(t=(e=this._signaling)==null?void 0:e._relayUrls)!=null&&t.length&&(l.relays=[...this._signaling._relayUrls]);const u=await Be({roomKeyBase64Url:i,type:a,roomId:s,config:l});r=De({signalingType:a,token:u,roomId:s,roomKey:i}),this._xoipSession={signalingType:a,token:u,roomId:s,roomKey:i,shareURI:r,tokenPayload:{config:l}}}catch(a){console.warn("[xoip-call] Failed to generate xoip:// URI during createRoom:",a)}return await this._startMedia(),this._emit("room-created",{roomId:s,shareURI:r}),this._showCallScreen(),s}catch(i){this._handleError("CREATE_ROOM_FAILED",i),this._callState="idle"}}}async joinRoom(e){if(this._callState==="idle"){if(e&&typeof e=="string"&&e.trim().startsWith("xoip://"))return this.connect(e.trim());this._callState="calling";try{this._els.roomInput.value=e,await this._initSignaling("polite"),await this._startMedia(),await this._signaling.joinRoom(e),this._emit("room-joined",{roomId:e}),this._showCallScreen()}catch(t){this._handleError("JOIN_ROOM_FAILED",t),this._callState="idle"}}}async leaveRoom(){var e;this._callState!=="idle"&&(await((e=this._signaling)==null?void 0:e.endRoom()),this._cleanup(!1),this._emit("call-ended",{reason:"local_hangup"}),this._resetUI())}setAudioMute(e){var t;this._audioMuted=e,(t=this._media)==null||t.setAudioMute(e);const i=this._els.audioBtn;i&&(i.innerHTML=e?f.microphoneOff:f.microphone,i.classList.toggle("muted",e),i.title=e?"Unmute Audio":"Mute Audio")}setVideoMute(e){var t;this._videoMuted=e,(t=this._media)==null||t.setVideoMute(e);const i=this._els.videoBtn;i&&(i.innerHTML=e?f.videoOff:f.video,i.classList.toggle("muted",e),i.title=e?"Enable Video":"Disable Video")}async startScreenShare(){var e,t;if(this._media&&this._engine)try{const i=await this._media.startScreenShare(async n=>{await this._engine.replaceTrack("video",n),this._updateScreenBtn(!1),this._emit("screen-share-stopped",{})});this._cameraTrack=((t=(e=this._engine.pc)==null?void 0:e.getSenders().find(n=>{var s;return((s=n.track)==null?void 0:s.kind)==="video"}))==null?void 0:t.track)??null,await this._engine.replaceTrack("video",i),this._updateScreenBtn(!0),this._localCamerasVisible&&this._renderLocalCameras(),this._emit("screen-share-started",{})}catch(i){i.name!=="NotAllowedError"&&this._handleError("SCREEN_SHARE_FAILED",i)}}async stopScreenShare(){var e;(e=this._media)!=null&&e.isScreenSharing&&(await this._media.stopScreenShare(async t=>{await this._engine.replaceTrack("video",t),this._localCamerasVisible&&this._renderLocalCameras()}),this._updateScreenBtn(!1),this._localCamerasVisible&&this._renderLocalCameras(),this._emit("screen-share-stopped",{}))}async switchCamera(e){if(!this._media||!this._engine)return;const t=await this._media.switchCamera(e);await this._engine.replaceTrack("video",t),this._localCamerasVisible&&this._renderLocalCameras()}sendData(e){var t;(t=this._engine)==null||t.sendData(e)}getStats(){var e;return((e=this._stats)==null?void 0:e.getFullReport())??Promise.resolve(null)}_render(){this.shadowRoot.innerHTML=`<style>${$e()}</style>${Ke()}`}_bindElements(){const e=t=>this.shadowRoot.getElementById(t);this._els={welcomeScreen:e("welcome-screen"),callContainer:e("call-container"),videoRoom:e("video-room"),roomInput:e("room-id-input"),createBtn:e("btn-create"),joinBtn:e("btn-join"),remoteVideo:e("remote-video"),remoteThumbs:e("remote-thumbnails"),localCameras:e("local-cameras"),audioBtn:e("btn-audio"),videoBtn:e("btn-video"),screenBtn:e("btn-screen"),camerasBtn:e("btn-cameras"),devicesBtn:e("btn-devices"),pipBtn:e("btn-pip"),audiomodeBtn:e("btn-audiomode"),shareBtn:e("btn-share"),qrBtn:e("btn-qr"),hangupBtn:e("btn-hangup"),qualityBar:e("quality-bar"),qualityLabel:e("quality-label"),tooltip:e("tooltip"),devicePanel:e("device-panel"),closePanelBtn:e("btn-close-devices"),selectCamera:e("select-camera"),selectMic:e("select-mic"),selectSpeaker:e("select-speaker"),micLevelFill:e("mic-level-fill"),applyDevicesBtn:e("btn-apply-devices"),qrModal:e("qr-modal"),closeQrBtn:e("btn-close-qr"),qrContainer:e("qr-container"),qrUrl:e("qr-url"),copyQrUrlBtn:e("btn-copy-qr-url"),mainVideoArea:e("main-video-area"),remoteLevelMeter:e("remote-level-meter"),remoteLevelFill:e("remote-level-fill"),audioAvatar:e("audio-avatar"),audioWaveRemote:e("audio-wave-remote"),speakingRingRemote:e("speaking-ring-remote"),pipSelfView:e("pip-self-view"),pipSelfVideo:e("pip-self-video"),pipCloseBtn:e("btn-pip-close")}}_setupUI(){var e;const t=this._els;t.createBtn.addEventListener("click",()=>this.createRoom()),t.joinBtn.addEventListener("click",async()=>{const i=t.roomInput.value.trim();i&&await this.joinRoom(i)}),t.roomInput.addEventListener("dblclick",()=>{t.roomInput.readOnly=!1,t.joinBtn.disabled=!1,t.roomInput.focus(),t.roomInput.select()}),t.audioBtn.addEventListener("click",()=>this.setAudioMute(!this._audioMuted)),t.videoBtn.addEventListener("click",()=>this.setVideoMute(!this._videoMuted)),t.hangupBtn.addEventListener("click",()=>this.leaveRoom()),t.shareBtn.addEventListener("click",()=>this._shareRoom()),t.camerasBtn.addEventListener("click",()=>this._toggleLocalCameras()),t.screenBtn.addEventListener("click",()=>{var i;(i=this._media)!=null&&i.isScreenSharing?this.stopScreenShare():this.startScreenShare()}),t.devicesBtn.addEventListener("click",()=>this._toggleDevicePanel()),t.closePanelBtn.addEventListener("click",()=>this._closeDevicePanel()),t.applyDevicesBtn.addEventListener("click",()=>this._applyDeviceSelection()),t.pipBtn.addEventListener("click",()=>this._togglePiP()),(e=t.pipCloseBtn)==null||e.addEventListener("click",i=>{i.stopPropagation(),this.exitPiP()}),this._setupPipSelfView(),t.audiomodeBtn.addEventListener("click",()=>this.setAudioOnlyMode(!this._audioOnlyMode)),t.qrBtn.addEventListener("click",()=>this._openQrModal()),t.closeQrBtn.addEventListener("click",()=>this._closeQrModal()),t.qrModal.addEventListener("click",i=>{i.target===t.qrModal&&this._closeQrModal()}),t.copyQrUrlBtn.addEventListener("click",async()=>{const i=t.qrUrl.textContent;if(i)try{await navigator.clipboard.writeText(i),this._showTooltip("Link copied!",t.copyQrUrlBtn)}catch{this._showTooltip("Copy failed",t.copyQrUrlBtn)}}),document.addEventListener("keydown",i=>{i.key==="Escape"&&(this._closeDevicePanel(),this._closeQrModal())})}_checkUrlParams(){const e=new URLSearchParams(window.location.search),t=e.get("uri")||e.get("src");if(t&&t.startsWith("xoip://"))return void setTimeout(()=>this.connect(t).catch(n=>this._handleError("CONNECT_FAILED",n)),0);if(window.location.hash){const n=window.location.hash.slice(1);if(n.startsWith("xoip://"))return void setTimeout(()=>this.connect(decodeURIComponent(n)).catch(s=>this._handleError("CONNECT_FAILED",s)),0);try{const s=new URLSearchParams(n),r=s.get("uri")||s.get("src");if(r&&r.startsWith("xoip://"))return void setTimeout(()=>this.connect(r).catch(a=>this._handleError("CONNECT_FAILED",a)),0)}catch{}}const i=e.get("room");if(i&&(this._els.roomInput.value=i,this._els.roomInput.readOnly=!1,this._els.joinBtn.disabled=!1),window.location.hash)try{const n=new URLSearchParams(window.location.hash.slice(1)),s=n.get("room");s&&!i&&(this._els.roomInput.value=s,this._els.roomInput.readOnly=!1,this._els.joinBtn.disabled=!1);const r=n.get("type");r&&this.setAttribute("signaling-type",r);const a=n.get("token");a&&this.setAttribute("signaling-token",a);const l=n.get("cfg");if(l)if(l.startsWith("H4sI"))this.setAttribute("signaling-token",l);else try{const h=atob(l);this.setAttribute("signaling-config",h)}catch{}}catch(n){console.warn("[xoip-call] Failed to parse URL hash config:",n)}}async _initSignaling(e,t={}){var i,n;let s;this._signaling?t.cryptoKey&&((n=(i=this._signaling).setCryptoKey)==null||n.call(i,t.cryptoKey)):await this._createDefaultSignaling(t),await this._signaling.connect();try{s=JSON.parse(this.getAttribute("ice-servers")??"[]")}catch{s=[]}this._engine=new Re({polite:e==="polite",iceServers:s.length?s:void 0,onSignal:r=>this._signaling.sendSignal(r),onRemoteTrack:r=>this._handleRemoteTrack(r),onDataMessage:r=>this._handleDataMessage(r),onConnectionState:r=>this._handleConnectionState(r),onError:r=>this._handleError("ENGINE_ERROR",r)}),this._engine.init(),this._signaling.onSignal(r=>this._engine.handleSignal(r)),this._signaling.onRoomState(r=>{r==="ended"&&this._handleRemoteHangup()})}async _createDefaultSignaling(e={}){const t=this.getAttribute("signaling-type")??"firebase";let i={};const n=this.getAttribute("signaling-token");if(n)i=await j(n);else{const s=this.getAttribute("signaling-config");try{i=s?JSON.parse(s):{}}catch{i={}}}this._signaling=await ie.create(t,i,e)}async _startMedia(){const e=this.hasAttribute("multi-camera");this._media=new Ee({multiCamera:e,onError:s=>this._handleError("MEDIA_ERROR",s)});const{audioTrack:t,videoTracks:i}=await this._media.start();this._engine.addAudioTrack(t,this._media.primaryStream);const n=[this._media.primaryStream,...this._media.secondaryStreams];i.forEach((s,r)=>{this._engine.addVideoTrack(s,n[r]??new MediaStream([s]))}),this._engine.setupDataChannel(),this.hasAttribute("e2ee-enabled")&&this._initE2EE().catch(s=>this._handleError("E2EE_ERROR",s)),this._stats=new Ae(this._engine.pc,{onQuality:s=>{this._emit("network-quality",s),this._updateQualityUI(s)}}),this._stats.start(),this._startVAD()}async _initE2EE(){this._e2ee=new Le({onSendPublicKey:t=>{this._engine.sendData({type:"e2ee-pubkey",key:t})},onError:t=>this._handleError("E2EE_ERROR",t)}),await this._waitForDataChannelOpen(),await this._e2ee.initialize();const e=new URL("data:text/javascript;base64,LyoqCiAqIEBmaWxlb3ZlcnZpZXcgZTJlZS13b3JrZXIuanMg4oCUIFdlYiBXb3JrZXIg0LTQu9GPIFJUQ1J0cFNjcmlwdFRyYW5zZm9ybS4KICoKICog0JLRi9C/0L7Qu9C90Y/QtdGCIEFFUy1HQ00g0YjQuNGE0YDQvtCy0LDQvdC40LUv0LTQtdGI0LjRhNGA0L7QstCw0L3QuNC1INC80LXQtNC40LAt0LrQsNC00YDQvtCyINCyINGE0L7QvdC+0LLQvtC8INC/0L7RgtC+0LrQtSwKICog0L3QtSDQsdC70L7QutC40YDRg9GPIFVJINC4INC90LUg0LLRi9C30YvQstCw0Y8g0L/RgNC+0YHQsNC00L7QuiBGUFMuCiAqCiAqINCk0L7RgNC80LDRgiDQt9Cw0YjQuNGE0YDQvtCy0LDQvdC90L7Qs9C+INC60LDQtNGA0LA6CiAqICAgWyA0IGJ5dGVzOiBJViBjb3VudGVyIChiaWctZW5kaWFuIHVpbnQzMikgfCA4IGJ5dGVzOiByYW5kb20gc2FsdCB8IGNpcGhlcnRleHQgXQogKgogKiDQn9GA0L7RgtC+0LrQvtC7INGB0L7QvtCx0YnQtdC90LjQuSDQvtGCINC+0YHQvdC+0LLQvdC+0LPQviDQv9C+0YLQvtC60LA6CiAqICAgeyB0eXBlOiAnc2V0LWtleScsIGtleURhdGE6IEFycmF5QnVmZmVyIH0gIC0g0YPRgdGC0LDQvdC+0LLQuNGC0YwgQUVTINC60LvRjtGHCiAqLwoKJ3VzZSBzdHJpY3QnOwoKLyoqIEB0eXBlIHtDcnlwdG9LZXl8bnVsbH0gKi8KbGV0IGFlc0tleSA9IG51bGw7CgovKiogSVYgY291bnRlciDQtNC70Y8g0L/RgNC10LTQvtGC0LLRgNCw0YnQtdC90LjRjyDQv9C+0LLRgtC+0YDQvdC+0LPQviDQuNGB0L/QvtC70YzQt9C+0LLQsNC90LjRjyDQvdC+0L3RgdCwICovCmxldCBpdkNvdW50ZXIgPSAwOwoKLy8g4pSA4pSA4pSAINCS0YXQvtC00Y/RidC40LUg0YHQvtC+0LHRidC10L3QuNGPINC+0YIgRTJFRU1hbmFnZXIg4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSACgpzZWxmLm9ucnRjdHJhbnNmb3JtID0gKGV2ZW50KSA9PiB7CiAgY29uc3QgdHJhbnNmb3JtZXIgPSBldmVudC50cmFuc2Zvcm1lcjsKICBjb25zdCB7IG9wZXJhdGlvbiwga2luZCB9ID0gdHJhbnNmb3JtZXIub3B0aW9uczsKCiAgdHJhbnNmb3JtZXIucmVhZGFibGUKICAgIC5waXBlVGhyb3VnaChuZXcgVHJhbnNmb3JtU3RyZWFtKHsKICAgICAgdHJhbnNmb3JtOiBvcGVyYXRpb24gPT09ICdlbmNyeXB0JwogICAgICAgID8gZW5jcnlwdEZyYW1lCiAgICAgICAgOiBkZWNyeXB0RnJhbWUsCiAgICB9KSkKICAgIC5waXBlVG8odHJhbnNmb3JtZXIud3JpdGFibGUpCiAgICAuY2F0Y2goZSA9PiBjb25zb2xlLmVycm9yKGBbRTJFRVdvcmtlcl0gVHJhbnNmb3JtIGVycm9yICgke29wZXJhdGlvbn0vJHtraW5kfSk6YCwgZSkpOwp9OwoKc2VsZi5vbm1lc3NhZ2UgPSBhc3luYyAoZXZlbnQpID0+IHsKICBjb25zdCBtc2cgPSBldmVudC5kYXRhOwogIGlmIChtc2cudHlwZSA9PT0gJ3NldC1rZXknKSB7CiAgICBhZXNLZXkgPSBhd2FpdCBjcnlwdG8uc3VidGxlLmltcG9ydEtleSgKICAgICAgJ3JhdycsCiAgICAgIG1zZy5rZXlEYXRhLAogICAgICB7IG5hbWU6ICdBRVMtR0NNJyB9LAogICAgICBmYWxzZSwKICAgICAgWydlbmNyeXB0JywgJ2RlY3J5cHQnXQogICAgKTsKICAgIGNvbnNvbGUubG9nKCdbRTJFRVdvcmtlcl0gQUVTLUdDTSBrZXkgbG9hZGVkLicpOwogIH0KfTsKCi8vIOKUgOKUgOKUgCBFbmNyeXB0IOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgAoKYXN5bmMgZnVuY3Rpb24gZW5jcnlwdEZyYW1lKGVuY29kZWRGcmFtZSwgY29udHJvbGxlcikgewogIGlmICghYWVzS2V5KSB7CiAgICAvLyDQmtC70Y7RhyDQtdGJ0ZEg0L3QtSDQv9C+0LvRg9GH0LXQvSDigJQg0L/RgNC+0L/Rg9GB0LrQsNC10Lwg0LrQsNC00YAg0LHQtdC3INC40LfQvNC10L3QtdC90LjQuQogICAgY29udHJvbGxlci5lbnF1ZXVlKGVuY29kZWRGcmFtZSk7CiAgICByZXR1cm47CiAgfQoKICB0cnkgewogICAgY29uc3QgaXYgPSBtYWtlSVYoKTsKICAgIGNvbnN0IGNpcGhlcnRleHQgPSBhd2FpdCBjcnlwdG8uc3VidGxlLmVuY3J5cHQoCiAgICAgIHsgbmFtZTogJ0FFUy1HQ00nLCBpdiB9LAogICAgICBhZXNLZXksCiAgICAgIGVuY29kZWRGcmFtZS5kYXRhCiAgICApOwoKICAgIC8vINCh0L7QsdC40YDQsNC10Lw6IFtJViAoMTIgYnl0ZXMpXSArIFtjaXBoZXJ0ZXh0XQogICAgY29uc3QgZW5jcnlwdGVkID0gbmV3IFVpbnQ4QXJyYXkoaXYuYnl0ZUxlbmd0aCArIGNpcGhlcnRleHQuYnl0ZUxlbmd0aCk7CiAgICBlbmNyeXB0ZWQuc2V0KGl2LCAwKTsKICAgIGVuY3J5cHRlZC5zZXQobmV3IFVpbnQ4QXJyYXkoY2lwaGVydGV4dCksIGl2LmJ5dGVMZW5ndGgpOwoKICAgIGVuY29kZWRGcmFtZS5kYXRhID0gZW5jcnlwdGVkLmJ1ZmZlcjsKICAgIGNvbnRyb2xsZXIuZW5xdWV1ZShlbmNvZGVkRnJhbWUpOwogIH0gY2F0Y2ggKGUpIHsKICAgIGNvbnNvbGUuZXJyb3IoJ1tFMkVFV29ya2VyXSBFbmNyeXB0IGVycm9yOicsIGUpOwogICAgLy8g0J/RgNC4INC+0YjQuNCx0LrQtSDRiNC40YTRgNC+0LLQsNC90LjRjyDigJQg0L/RgNC+0L/Rg9GB0LrQsNC10Lwg0LrQsNC00YAgKNC90LUg0LrRgNC40LzQuNC90LDQu9GM0L3QviwgUW9TINC/0YDQtdC00L/QvtGH0YLQuNGC0LXQu9GM0L3QtdC1KQogICAgY29udHJvbGxlci5lbnF1ZXVlKGVuY29kZWRGcmFtZSk7CiAgfQp9CgovLyDilIDilIDilIAgRGVjcnlwdCDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIAKCmFzeW5jIGZ1bmN0aW9uIGRlY3J5cHRGcmFtZShlbmNvZGVkRnJhbWUsIGNvbnRyb2xsZXIpIHsKICBpZiAoIWFlc0tleSkgewogICAgY29udHJvbGxlci5lbnF1ZXVlKGVuY29kZWRGcmFtZSk7CiAgICByZXR1cm47CiAgfQoKICB0cnkgewogICAgY29uc3QgZGF0YSA9IG5ldyBVaW50OEFycmF5KGVuY29kZWRGcmFtZS5kYXRhKTsKICAgIGNvbnN0IGl2ID0gZGF0YS5zbGljZSgwLCAxMik7CiAgICBjb25zdCBjaXBoZXJ0ZXh0ID0gZGF0YS5zbGljZSgxMik7CgogICAgY29uc3QgcGxhaW50ZXh0ID0gYXdhaXQgY3J5cHRvLnN1YnRsZS5kZWNyeXB0KAogICAgICB7IG5hbWU6ICdBRVMtR0NNJywgaXYgfSwKICAgICAgYWVzS2V5LAogICAgICBjaXBoZXJ0ZXh0CiAgICApOwoKICAgIGVuY29kZWRGcmFtZS5kYXRhID0gcGxhaW50ZXh0OwogICAgY29udHJvbGxlci5lbnF1ZXVlKGVuY29kZWRGcmFtZSk7CiAgfSBjYXRjaCAoZSkgewogICAgLy8g0JTQtdC60L7QtCDQvtGI0LjQsdC60LAg0YLQuNC/0LjRh9C90LAg0L/RgNC4INC60LDQtNGA0LDRhSDQv9C10YDQtdC00LDQvdC90YvRhSDQtNC+INC+0LHQvNC10L3QsCDQutC70Y7Rh9Cw0LzQuCDigJQg0L/RgNC+0YHRgtC+INC00YDQvtC/0LDQtdC8CiAgICBjb25zb2xlLndhcm4oJ1tFMkVFV29ya2VyXSBEZWNyeXB0IGZhaWxlZCDigJQgZnJhbWUgZHJvcHBlZCAoZXhwZWN0ZWQgZHVyaW5nIGtleSBleGNoYW5nZSkuJyk7CiAgfQp9CgovLyDilIDilIDilIAgSVYgR2VuZXJhdGlvbiDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIAKCi8qKgogKiDQpNC+0YDQvNC40YDRg9C10YIgMTIt0LHQsNC50YLQvdGL0Lkg0L3QvtC90YEg0LTQu9GPIEFFUy1HQ006CiAqICAgWzQgYnl0ZXMgY291bnRlcl1bOCBieXRlcyByYW5kb20gc2FsdF0KICog0KHQvtCy0LzQtdGJ0LXQvdC40LUgY291bnRlciArIHJhbmRvbSDQv9GA0LDQutGC0LjRh9C10YHQutC4INC40YHQutC70Y7Rh9Cw0LXRgiDQutC+0LvQu9C40LfQuNC4IElWLgogKi8KZnVuY3Rpb24gbWFrZUlWKCkgewogIGNvbnN0IGl2ID0gbmV3IFVpbnQ4QXJyYXkoMTIpOwogIC8vIDQg0LHQsNC50YLQsDog0YHRh9C10YLRh9C40LogKGJpZy1lbmRpYW4pCiAgbmV3IERhdGFWaWV3KGl2LmJ1ZmZlcikuc2V0VWludDMyKDAsIGl2Q291bnRlcisrLCBmYWxzZSk7CiAgLy8gOCDQsdCw0LnRgjog0YHQu9GD0YfQsNC50L3Ri9C5IHNhbHQg0LTQu9GPINC00L7Qv9C+0LvQvdC40YLQtdC70YzQvdC+0Lkg0Y3QvdGC0YDQvtC/0LjQuAogIGNyeXB0by5nZXRSYW5kb21WYWx1ZXMoaXYuc3ViYXJyYXkoNCkpOwogIHJldHVybiBpdjsKfQo=",import.meta.url).href;await this._e2ee.attachToPeerConnection(this._engine.pc,e)}_waitForDataChannelOpen(){return new Promise((e,t)=>{const i=setTimeout(()=>t(new Error("[E2EE] DataChannel open timeout")),6e4),n=()=>{var s;const r=(s=this._engine)==null?void 0:s.dataChannel;if(!r)return this._callState==="idle"?(clearTimeout(i),void t(new Error("[E2EE] Call ended before DataChannel opened"))):void setTimeout(n,200);(a=>{if(a.readyState==="open")return clearTimeout(i),void e();const l=()=>{clearTimeout(i),a.removeEventListener("open",l),e()};a.addEventListener("open",l),a.readyState==="open"&&l()})(r)};n()})}_handleRemoteTrack(e){var t;const i=e.track,n=((t=e.streams)==null?void 0:t[0])??new MediaStream([i]);if(this._remoteStreams.set(i.id,n),i.kind==="audio"&&(this._els.remoteVideo.srcObject||(this._els.remoteVideo.srcObject=n,this._els.remoteVideo.play().catch(s=>{console.warn("[xoip-call] Audio playback warning:",s)})),this._attachRemoteVAD(n)),i.kind==="video"){const s=this.getAttribute("custom-remote-video");let r=this._els.remoteVideo;if(s){const a=document.querySelector(s);if(a){const l=typeof a.getVideoElement=="function"?a.getVideoElement():a.tagName==="VIDEO"?a:null;l&&(r=l,this._els.remoteVideo.style.display="none",this._emit("use-custom-video",{element:a}))}}r&&!r.srcObject&&(r.srcObject=n,r.play().catch(a=>{console.warn("[xoip-call] targetVideo.play() warning:",a)})),this._addRemoteThumbnail(i.id,n),this._attachRemoteVAD(n)}this._emit("remote-stream-ready",{stream:n,track:i})}_addRemoteThumbnail(e,t){var i;const n=document.createElement("video");n.srcObject=t,n.autoplay=!0,n.playsInline=!0,n.muted=!0,n.dataset.trackId=e,n.play().catch(()=>{}),n.addEventListener("click",()=>{const s=this._els.remoteVideo;s&&s.style.display!=="none"&&(s.srcObject=t),this._emit("switch-remote-stream",{stream:t})}),(i=this._els.remoteThumbs)==null||i.appendChild(n)}_handleDataMessage(e){var t;(e==null?void 0:e.type)==="e2ee-pubkey"&&e.key?(t=this._e2ee)==null||t.receiveRemotePublicKey(e.key):this._emit("channel-message",{data:e})}_handleConnectionState(e){console.log(`[xoip-call] PeerConnection state: ${e}`),e==="connected"&&(this._callState="connected",this._clearIceFailoverTimer(),this._turnRequested=!1),e==="checking"&&this._startIceFailoverTimer(),e==="failed"&&(this._clearIceFailoverTimer(),this._turnRequested&&this._emitXoipError("ERR_TURN_REQUIRED","P2P connection failed even after TURN request"),this._handleError("CONNECTION_FAILED",new Error("PeerConnection failed"))),e==="disconnected"&&this._startIceFailoverTimer()}_startIceFailoverTimer(){this._iceFailoverTimer||this._callState==="connected"||(this._iceFailoverTimer=setTimeout(()=>{var e,t;this._iceFailoverTimer=null,this._callState!=="connected"&&(console.warn("[xoip-call] ICE Failover Timer fired: requesting TURN servers"),this._turnRequested=!0,this._emit("xoip-need-turn",{message:"Direct P2P connection failed. TURN servers are required.",roomId:((e=this._signaling)==null?void 0:e.roomId)??((t=this._xoipSession)==null?void 0:t.roomId)}))},6e3))}_clearIceFailoverTimer(){this._iceFailoverTimer&&(clearTimeout(this._iceFailoverTimer),this._iceFailoverTimer=null)}_emitXoipError(e,t){this.dispatchEvent(new CustomEvent("xoip-error",{bubbles:!0,composed:!0,detail:{code:e,message:t}}))}_showCallScreen(){this._els.welcomeScreen.style.display="none",this._els.callContainer.classList.add("active"),this.hasAttribute("audio-only")&&this.setAudioOnlyMode(!0)}_resetUI(){var e,t,i,n;this._els.callContainer.classList.remove("active"),this._els.welcomeScreen.style.display="",this._els.remoteVideo.srcObject=null,this._els.remoteVideo.style.display="",this._els.remoteThumbs.innerHTML="",this._els.localCameras.innerHTML="",this._els.roomInput.value="",this._els.roomInput.readOnly=!0,this._els.joinBtn.disabled=!0,this._updateQualityUI({quality:"unknown"}),this.setAudioMute(!1),this.setVideoMute(!1),this.setAudioOnlyMode(!1),this._closeDevicePanel(),this._closeQrModal(),this._updateCamerasBtn(!1),(e=this._els.mainVideoArea)==null||e.classList.remove("speaking"),(t=this._els.audioAvatar)==null||t.classList.remove("speaking"),(i=this._els.localCameras)==null||i.classList.remove("speaking"),this._els.remoteLevelFill&&(this._els.remoteLevelFill.style.height="0%",(n=this._els.remoteLevelMeter)==null||n.classList.remove("active")),this._pipActive&&this.exitPiP(),this._els.pipSelfVideo&&(this._els.pipSelfVideo.srcObject=null),this._callState="idle",this._remoteStreams.clear()}_renderLocalCameras(){var e,t,i;if(!this._els.localCameras)return;this._els.localCameras.querySelectorAll("video").forEach(s=>{s.srcObject=null,s.remove()});const n=[];(e=this._media)!=null&&e.primaryStream&&n.push(...this._media.primaryStream.getVideoTracks()),(i=(t=this._media)==null?void 0:t.secondaryStreams)!=null&&i.length&&this._media.secondaryStreams.forEach(s=>{n.push(...s.getVideoTracks())}),n.forEach(s=>{const r=document.createElement("video");r.srcObject=new MediaStream([s]),r.autoplay=!0,r.playsInline=!0,r.muted=!0,this._els.localCameras.appendChild(r),r.play().catch(()=>{})})}_toggleLocalCameras(){this._localCamerasVisible=!this._localCamerasVisible,this._els.localCameras.classList.toggle("hidden",!this._localCamerasVisible),this._updateCamerasBtn(this._localCamerasVisible),this._localCamerasVisible&&this._renderLocalCameras()}_updateCamerasBtn(e){const t=this._els.camerasBtn;t&&(t.classList.toggle("active",e),t.title=e?"Hide Local Cameras":"Show Local Cameras")}_updateScreenBtn(e){const t=this._els.screenBtn;t&&(t.innerHTML=e?f.screenShareStop:f.screenShare,t.classList.toggle("screen-active",e),t.title=e?"Stop Screen Share":"Share Screen")}_updateQualityUI({quality:e,rtt:t,packetLoss:i}){const n=this._els.qualityBar,s=this._els.qualityLabel;if(!n||!s)return;n.className=e!==void 0?e:"";const r=t!=null?`${t}ms`:"—",a=i!=null?`${i}%`:"";s.textContent=t!=null?`${r} ${a}`.trim():e??"—",n.title=`RTT: ${r}  Loss: ${a}  Type: ${e??"?"}`}_showTooltip(e,t){clearTimeout(this._tooltipTimer);const i=this._els.tooltip;if(i){if(i.textContent=e,t){const n=t.getBoundingClientRect(),s=this.getBoundingClientRect();i.style.left=n.left-s.left+"px",i.style.top=n.top-s.top-36+"px"}i.style.opacity="1",this._tooltipTimer=setTimeout(()=>{i.style.opacity="0"},2500)}}_buildShareUrl(e=!1){var t;if((t=this._xoipSession)!=null&&t.shareURI)return`${location.origin}${location.pathname}#uri=${encodeURIComponent(this._xoipSession.shareURI)}`;const i=this._els.roomInput.value;if(!i)return null;let n=`${location.origin}${location.pathname}?room=${encodeURIComponent(i)}`;const s=this.getAttribute("signaling-type")||"firebase",r=[];if(s!=="firebase"&&r.push(`type=${encodeURIComponent(s)}`),e||this.hasAttribute("embed-config-in-share")){const a=this.getAttribute("signaling-token");if(a)r.push(`token=${encodeURIComponent(a)}`);else{const l=this.getAttribute("signaling-config");if(l)try{r.push(`cfg=${btoa(l)}`)}catch{}}}return r.length>0&&(n+=`#${r.join("&")}`),n}async _shareRoom(){const e=this._buildShareUrl();if(e)try{await navigator.clipboard.writeText(e),this._showTooltip("Link copied!",this._els.shareBtn)}catch{this._showTooltip("Copy failed",this._els.shareBtn)}}_handleRemoteHangup(){this._cleanup(!1),this._emit("call-ended",{reason:"remote_hangup"}),this._resetUI()}_cleanup(e){var t,i,n,s,r;(t=this._stats)==null||t.stop(),(i=this._e2ee)==null||i.terminate(),(n=this._media)==null||n.stopAll(),(s=this._engine)==null||s.close(),this._stopVAD(),this._stopMicLevel(),e&&((r=this._signaling)==null||r.disconnect()),this._clearIceFailoverTimer(),this._turnRequested=!1,e&&(this._xoipSession=null),this._stats=null,this._e2ee=null,this._engine=null,e&&(this._signaling=null),this._media=null}async getDevices(){const e=await navigator.mediaDevices.enumerateDevices();return{cameras:e.filter(t=>t.kind==="videoinput"),microphones:e.filter(t=>t.kind==="audioinput"),speakers:e.filter(t=>t.kind==="audiooutput")}}async _toggleDevicePanel(){const e=this._els.devicePanel;e.classList.contains("hidden")?(await this._populateDevicePanel(),e.classList.remove("hidden"),this._startMicLevel(),this._els.devicesBtn.classList.add("active")):this._closeDevicePanel()}_closeDevicePanel(){var e,t;(e=this._els.devicePanel)==null||e.classList.add("hidden"),(t=this._els.devicesBtn)==null||t.classList.remove("active"),this._stopMicLevel()}async _populateDevicePanel(){var e,t,i,n,s,r,a,l,h,u;const{cameras:g,microphones:y,speakers:m}=await this.getDevices(),d=(s=(n=(i=(t=(e=this._media)==null?void 0:e.primaryStream)==null?void 0:t.getVideoTracks())==null?void 0:i[0])==null?void 0:n.getSettings())==null?void 0:s.deviceId,_=(u=(h=(l=(a=(r=this._media)==null?void 0:r.primaryStream)==null?void 0:a.getAudioTracks())==null?void 0:l[0])==null?void 0:h.getSettings())==null?void 0:u.deviceId,C=(N,O,q)=>{N.innerHTML="",O.forEach(R=>{const E=document.createElement("option");E.value=R.deviceId,E.textContent=R.label||`Device ${R.deviceId.slice(0,8)}`,R.deviceId===q&&(E.selected=!0),N.appendChild(E)})};C(this._els.selectCamera,g,d),C(this._els.selectMic,y,_);const k=this._els.selectSpeaker;m.length>0&&typeof this._els.remoteVideo.setSinkId=="function"?(C(k,m,null),k.disabled=!1):(k.innerHTML="<option>Not supported in this browser</option>",k.disabled=!0)}async _applyDeviceSelection(){const e=this._els.selectCamera.value,t=this._els.selectMic.value,i=this._els.selectSpeaker.value;try{if(e&&this._media&&this._engine){const n=await this._media.switchCamera(e);await this._engine.replaceTrack("video",n),this._localCamerasVisible&&this._renderLocalCameras()}}catch(n){this._handleError("DEVICE_SWITCH_FAILED",n)}try{if(t&&this._media&&this._engine){const n=await this._media.switchMicrophone(t);await this._engine.replaceTrack("audio",n),this._startVAD()}}catch(n){this._handleError("DEVICE_SWITCH_FAILED",n)}try{i&&typeof this._els.remoteVideo.setSinkId=="function"&&await this._els.remoteVideo.setSinkId(i)}catch(n){console.warn("[xoip-call] setSinkId failed:",n)}this._closeDevicePanel(),this._showTooltip("Devices applied",this._els.devicesBtn)}_startMicLevel(){var e;this._stopMicLevel();const t=(e=this._media)==null?void 0:e.primaryStream;if(t)try{const i=this._vadAudioCtx??new AudioContext;this._vadAudioCtx=i;const n=i.createMediaStreamSource(t),s=i.createAnalyser();s.fftSize=256,n.connect(s);const r=new Uint8Array(s.frequencyBinCount),a=()=>{s.getByteFrequencyData(r);const l=r.reduce((u,g)=>u+g,0)/r.length,h=Math.min(100,l/128*100);this._els.micLevelFill&&(this._els.micLevelFill.style.width=`${h}%`),this._micLevelRafId=requestAnimationFrame(a)};this._micLevelRafId=requestAnimationFrame(a)}catch(i){console.warn("[xoip-call] Mic level visualizer error:",i)}}_stopMicLevel(){this._micLevelRafId&&(cancelAnimationFrame(this._micLevelRafId),this._micLevelRafId=null),this._els.micLevelFill&&(this._els.micLevelFill.style.width="0%")}async _togglePiP(){this._pipActive?await this.exitPiP():await this.enterPiP()}async enterPiP(){var e;const t=this._els.pipSelfView,i=this._els.pipSelfVideo;if(!t||!i)return;const n=(e=this._media)==null?void 0:e.primaryStream;n&&n.getVideoTracks().length?(i.srcObject=n,i.play().catch(()=>{}),t.classList.remove("hidden"),this._pipActive=!0,this._els.pipBtn&&(this._els.pipBtn.classList.add("pip-active"),this._els.pipBtn.title="Hide Self View")):this._showTooltip("No local camera",this._els.pipBtn)}async exitPiP(){const e=this._els.pipSelfView,t=this._els.pipSelfVideo;e&&e.classList.add("hidden"),t&&(t.srcObject=null),this._pipActive=!1,this._els.pipBtn&&(this._els.pipBtn.classList.remove("pip-active"),this._els.pipBtn.title="Picture-in-Picture")}_setupPipSelfView(){const e=this._els.pipSelfView;if(!e)return;let t=!1,i=0,n=0,s=0,r=0;const a=()=>this._els.mainVideoArea,l=()=>{t=!1};e.addEventListener("pointerdown",h=>{if(h.target.closest(".pip-close-btn"))return;t=!0,i=h.clientX,n=h.clientY;const u=e.getBoundingClientRect(),g=a(),y=g==null?void 0:g.getBoundingClientRect();y&&(s=u.left-y.left,r=y.bottom-u.bottom,e.style.left=s+"px",e.style.bottom=r+"px",e.style.right="auto",e.style.top="auto",e.setPointerCapture(h.pointerId),h.preventDefault())}),e.addEventListener("pointermove",h=>{if(!t)return;const u=h.clientX-i,g=h.clientY-n,y=a(),m=y==null?void 0:y.getBoundingClientRect();if(!m)return;const d=e.offsetWidth,_=e.offsetHeight;let C=Math.max(0,Math.min(s+u,m.width-d)),k=Math.max(0,Math.min(r-g,m.height-_));e.style.left=C+"px",e.style.bottom=k+"px"}),e.addEventListener("pointerup",l),e.addEventListener("pointercancel",l)}_startVAD(){var e,t;this._stopVAD();const i=parseInt(this.getAttribute("vad-threshold")??"15",10);try{const n=this._vadAudioCtx??new(window.AudioContext||window.webkitAudioContext);this._vadAudioCtx=n;const s=(e=this._media)==null?void 0:e.primaryStream;if(s!=null&&s.getAudioTracks().length){const u=n.createMediaStreamSource(s),g=n.createAnalyser();g.fftSize=512,g.smoothingTimeConstant=.6,u.connect(g),this._vadAnalyserLocal=g}const r=(t=this._els.remoteVideo)==null?void 0:t.srcObject;r instanceof MediaStream&&r.getAudioTracks().length>0&&this._attachRemoteVAD(r);let a=null,l=null;const h=()=>{var u,g;if(this._vadAnalyserLocal){a&&a.length===this._vadAnalyserLocal.frequencyBinCount||(a=new Uint8Array(this._vadAnalyserLocal.frequencyBinCount)),this._vadAnalyserLocal.getByteFrequencyData(a);const y=a.reduce((m,d)=>m+d,0)/a.length;this._updateLocalSpeaking(y>i)}else this._updateLocalSpeaking(!1);if(this._vadAnalyserRemote){l&&l.length===this._vadAnalyserRemote.frequencyBinCount||(l=new Uint8Array(this._vadAnalyserRemote.frequencyBinCount)),this._vadAnalyserRemote.getByteFrequencyData(l);const y=l.reduce((d,_)=>d+_,0)/l.length,m=y>i;if(this._updateRemoteSpeaking(m),this._els.remoteLevelFill){const d=Math.min(100,Math.max(0,Math.round(y/90*100)));this._els.remoteLevelFill.style.height=`${d}%`,(u=this._els.remoteLevelMeter)==null||u.classList.toggle("active",y>Math.max(3,i/3))}}else this._updateRemoteSpeaking(!1),this._els.remoteLevelFill&&(this._els.remoteLevelFill.style.height="0%",(g=this._els.remoteLevelMeter)==null||g.classList.remove("active"));this._vadRafId=requestAnimationFrame(h)};this._vadRafId=requestAnimationFrame(h)}catch(n){console.warn("[xoip-call] VAD init error:",n)}}_attachRemoteVAD(e){if(e&&e instanceof MediaStream&&e.getAudioTracks().length)try{this._vadAudioCtx||(this._vadAudioCtx=new(window.AudioContext||window.webkitAudioContext));const t=this._vadAudioCtx,i=t.createMediaStreamSource(e),n=t.createAnalyser();n.fftSize=512,n.smoothingTimeConstant=.6,i.connect(n),this._vadAnalyserRemote=n}catch(t){console.warn("[xoip-call] Remote VAD attach error:",t)}}_stopVAD(){var e;this._vadRafId&&(cancelAnimationFrame(this._vadRafId),this._vadRafId=null),this._vadAnalyserLocal=null,this._vadAnalyserRemote=null,this._els.remoteLevelFill&&(this._els.remoteLevelFill.style.height="0%",(e=this._els.remoteLevelMeter)==null||e.classList.remove("active")),this._updateLocalSpeaking(!1),this._updateRemoteSpeaking(!1)}_updateLocalSpeaking(e){var t,i;e!==this._vadLocalActive&&(this._vadLocalActive=e,(t=this._els.localCameras)==null||t.classList.toggle("speaking",e),this._pipActive&&((i=this._els.pipSelfView)==null||i.classList.toggle("speaking",e)),this._emit(e?"speaking-start":"speaking-stop",{source:"local"}))}_updateRemoteSpeaking(e){var t,i,n,s;e!==this._vadRemoteActive&&(this._vadRemoteActive=e,(t=this._els.mainVideoArea)==null||t.classList.toggle("speaking",e),(i=this._els.audioAvatar)==null||i.classList.toggle("speaking",e),(n=this._els.speakingRingRemote)==null||n.classList.toggle("active",e),this._audioOnlyMode&&((s=this._els.audioWaveRemote)==null||s.classList.toggle("active",e)),this._emit(e?"speaking-start":"speaking-stop",{source:"remote"}))}setAudioOnlyMode(e){this._audioOnlyMode=e;const t=this._els.audiomodeBtn,i=this._els.audioAvatar,n=this._els.remoteVideo;e?(i==null||i.classList.remove("hidden"),n&&(n.style.opacity="0"),t==null||t.classList.add("audiomode-active"),t&&(t.title="Disable Audio-Only Mode"),this.setVideoMute(!0)):(i==null||i.classList.add("hidden"),n&&(n.style.opacity=""),t==null||t.classList.remove("audiomode-active"),t&&(t.title="Audio-Only Mode"))}_openQrModal(){const e=this._buildShareUrl();if(!e)return void this._showTooltip("No room to share",this._els.qrBtn);this._els.qrUrl.textContent=e,this._els.qrContainer.innerHTML="";const t=this._generateQrCanvas(e);this._els.qrContainer.appendChild(t),this._els.qrModal.classList.remove("hidden")}_closeQrModal(){var e;(e=this._els.qrModal)==null||e.classList.add("hidden")}_generateQrCanvas(e){const t=document.createElement("canvas");if(new TextEncoder().encode(e).length>270){t.style.display="none";const l=document.createElement("textarea");return l.readOnly=!0,l.value=e,l.style.cssText="width:100%;height:80px;font-size:11px;border:1px solid #334155;background:#0f172a;color:#f8fafc;resize:none;outline:none;font-family:monospace;padding:8px;border-radius:6px",this._els.qrContainer.appendChild(l),t}const i=this._buildQrMatrix(e);if(!i)return t.width=200,t.height=200,t;const n=i.length,s=Math.max(3,Math.floor(220/(n+4))),r=(n+4)*s;t.width=r,t.height=r,t.style.maxWidth="100%",t.style.height="auto";const a=t.getContext("2d");a.fillStyle="#ffffff",a.fillRect(0,0,r,r),a.fillStyle="#0f172a";for(let l=0;l<n;l++)for(let h=0;h<n;h++)i[l][h]&&a.fillRect((h+2)*s,(l+2)*s,s,s);return t}_buildQrMatrix(e){try{return this._qrGenerate(e,"L")}catch(t){return console.warn("[xoip-call] QR generation failed:",t),null}}_qrGenerate(e,t="L"){const i=new Uint8Array(256),n=new Uint8Array(256);for(let c=0,p=1;c<255;c++)i[c]=p,n[p]=c,p=p<<1^(p>=128?285:0);i[255]=i[0];const s=(c,p)=>c&&p?i[(n[c]+n[p])%255]:0,r=(c,p)=>{const w=((B,H)=>{let S=[1];for(let F=0;F<H;F++){const G=new Uint8Array(S.length+1);for(let T=0;T<S.length;T++)G[T]^=s(S[T],i[F]),G[T+1]^=S[T];S=Array.from(G)}return S})(0,p),v=new Uint8Array(p);for(const B of c){const H=B^v[0];v.copyWithin(0,1),v[p-1]=0;for(let S=0;S<p;S++)v[S]^=s(w[S+1],H)}return v},a=[null,[1,19,7,1],[2,34,10,1],[3,55,15,1],[4,80,20,2],[5,108,26,2],[6,136,18,2],[7,156,20,4],[8,194,24,2],[9,232,30,3],[10,274,18,4]],l=Array.from(new TextEncoder().encode(e)),h=l.length;let u=a.findIndex((c,p)=>p>0&&c&&c[1]>=h+2);if(u<0)return null;const[,g,y,m]=a[u],d=17+4*u,_=new Uint8Array(g);_[0]=64,_[0]|=h>>4&15,_[1]=(15&h)<<4|l[0]>>4&15;for(let c=0;c<h-1;c++)_[2+c]=(15&l[c])<<4|l[c+1]>>4&15;_[2+h-1]=(15&l[h-1])<<4;let C=3+h-1;const k=[236,17];for(let c=0;C<g;C++,c++)_[C]=k[c%2];const N=y,O=Math.floor(g/m),q=[],R=[],E=[];for(let c=0;c<m;c++){const p=c*O,w=c===m-1?g:p+O,v=_.slice(p,w);R.push(v),E.push(r(v,N))}const me=Math.max(...R.map(c=>c.length));for(let c=0;c<me;c++)for(const p of R)c<p.length&&q.push(p[c]);for(let c=0;c<N;c++)for(const p of E)q.push(p[c]);const U=[];for(const c of q)for(let p=7;p>=0;p--)U.push(c>>p&1);const ye=[0,7,7,7,7,7,0,0,0,0];for(let c=0;c<ye[u];c++)U.push(0);const Q=Array.from({length:d},()=>new Array(d).fill(null)),z=Array.from({length:d},()=>new Array(d).fill(!1)),A=(c,p,w,v=!1)=>{c<0||c>=d||p<0||p>=d||(Q[c][p]=w,v&&(z[c][p]=!0))},$=(c,p)=>{for(let w=-1;w<=7;w++)for(let v=-1;v<=7;v++)A(c+w,p+v,w>=0&&w<=6&&v>=0&&v<=6&&(w===0||w===6||v===0||v===6||w>=2&&w<=4&&v>=2&&v<=4),!0)};$(0,0),$(0,d-7),$(d-7,0);for(let c=8;c<d-8;c++)A(6,c,c%2==0,!0),A(c,6,c%2==0,!0);A(d-8,8,!0,!0);const Z=[1,1,1,0,1,1,1,1,1,0,0,0,1,0,0],J=[[8,0],[8,1],[8,2],[8,3],[8,4],[8,5],[8,7],[8,8],[7,8],[5,8],[4,8],[3,8],[2,8],[1,8],[0,8]],V=[[d-1,8],[d-2,8],[d-3,8],[d-4,8],[d-5,8],[d-6,8],[d-7,8],[8,d-8],[8,d-7],[8,d-6],[8,d-5],[8,d-4],[8,d-3],[8,d-2],[8,d-1]];for(let c=0;c<15;c++)A(J[c][0],J[c][1],Z[c]===1,!0),V[c]&&A(V[c][0],V[c][1],Z[c]===1,!0);let X=0,P=!0;for(let c=d-1;c>=1;c-=2){c===6&&(c=5);for(let p=P?d-1:0;P?p>=0:p<d;p+=P?-1:1)for(let w=0;w<2;w++){const v=c-w;if(!z[p][v]){const B=X<U.length?U[X++]:0;A(p,v,((p+v)%2==0?1^B:B)===1)}}P=!P}for(let c=0;c<d;c++)for(let p=0;p<d;p++)Q[c][p]===null&&(Q[c][p]=!1);return Q}_handleError(e,t){console.error(`[xoip-call] Error [${e}]:`,t),this._emit("error",{code:e,message:t==null?void 0:t.message,error:t})}_emit(e,t={}){this.dispatchEvent(new CustomEvent(e,{detail:t,bubbles:!0,composed:!0}))}}class Ge{async announce(e){throw new Error("[DiscoveryProvider] announce() must be implemented")}async resolve(e){throw new Error("[DiscoveryProvider] resolve() must be implemented")}async remove(e){throw new Error("[DiscoveryProvider] remove() must be implemented")}async connect(){}async close(){}static createAnnouncement({roomId:e,signalingType:t,token:i,endpoint:n,ttlSeconds:s=300}){return{v:1,room:e,signaling:{type:t,...n&&{endpoint:n},...i&&{token:i}},expires:Math.floor(Date.now()/1e3)+s}}static isExpired(e){return!(e!=null&&e.expires)||Math.floor(Date.now()/1e3)>=e.expires}}const je="https://api.nostr.watch/v1/online",Ye=["wss://greenart7c3.feeds.relay.tools/","wss://relay.primal.net","wss://relay.damus.io","wss://nos.lol","wss://nostr.mom","wss://relay.nostr.band"];class ze extends Ge{constructor(e={}){super(),this._configuredRelays=e.configuredRelays??["wss://greenart7c3.feeds.relay.tools/","wss://relay.primal.net","wss://relay.damus.io","wss://nos.lol"],this._candidateRelays=e.candidateRelays??Ye,this._selectCount=e.selectCount??5,this._nostrWatchApiUrl=e.nostrWatchApiUrl??je,this._discoveryTimeoutMs=e.discoveryTimeoutMs??2e3,this._enableHttpFetch=e.enableHttpFetch??(typeof window>"u"||!!e.nostrWatchApiUrl),this._cachedRelays=null,this._cacheExpiresAt=0,this._cacheTtlMs=3e5}async announce(e){console.warn("[NostrRelayDiscovery] announce() is not implemented in relay discovery. Use NostrSignalingAdapter.")}async resolve(e){return null}async remove(e){}async discoverRelays(){if(this._cachedRelays&&Date.now()<this._cacheExpiresAt)return console.log("[NostrRelayDiscovery] Using cached relays."),this._cachedRelays.map(e=>e.url);try{const e=await Promise.race([this._runDiscoveryPipeline(),Je(this._discoveryTimeoutMs,"Discovery timeout")]);return this._cachedRelays=e,this._cacheExpiresAt=Date.now()+this._cacheTtlMs,console.log(`[NostrRelayDiscovery] Selected ${e.length} relays.`),e.map(t=>t.url)}catch(e){return console.warn(`[NostrRelayDiscovery] Discovery failed (${e.message}). Falling back to configured relays.`),this._configuredRelays}}async _runDiscoveryPipeline(){let e=[];if(this._enableHttpFetch&&this._nostrWatchApiUrl)try{const[r]=await Promise.allSettled([this._fetchNostrWatchRelays()]);r.status==="fulfilled"&&(e=r.value)}catch{e=[]}const t=[...this._configuredRelays,...this._candidateRelays||[],...e].map(r=>Ze(r)).filter(Boolean),i=[...new Set(t)];console.log(`[NostrRelayDiscovery] Candidates: ${i.length} (configured: ${this._configuredRelays.length}, candidates: ${(this._candidateRelays||[]).length}, discovered: ${e.length})`);const n=(await Promise.allSettled(i.map(r=>this._checkRelayHealth(r)))).filter(r=>r.status==="fulfilled"&&r.value!==null).map(r=>r.value);console.log(`[NostrRelayDiscovery] Healthy relays: ${n.length}/${i.length}`),n.sort((r,a)=>r.latency-a.latency);const s=n.slice(0,this._selectCount);return s.length===0?this._configuredRelays.map(r=>({url:r,latency:1/0,readable:!0,writable:!0})):s}async _fetchNostrWatchRelays(){if(!this._nostrWatchApiUrl||!this._enableHttpFetch)return[];const e=new AbortController,t=setTimeout(()=>e.abort(),this._discoveryTimeoutMs);try{const i=await fetch(this._nostrWatchApiUrl,{signal:e.signal,headers:{Accept:"application/json"}});if(!i.ok)throw new Error(`nostr.watch HTTP ${i.status}`);const n=await i.json();return Array.isArray(n)?n.filter(s=>typeof s=="string"):Array.isArray(n.relays)?n.relays.filter(s=>typeof s=="string"):Array.isArray(n.online)?n.online.filter(s=>typeof s=="string"):[]}catch(i){throw i.name==="AbortError"?new Error("nostr.watch request timed out"):i}finally{clearTimeout(t)}}async _checkRelayHealth(e){return new Promise(t=>{const i=Date.now();let n=!1,s=null;const r=l=>{if(!n){if(n=!0,clearTimeout(a),s){s.onopen=null,s.onerror=null,s.onclose=null;try{s.close()}catch{}}t(l)}},a=setTimeout(()=>{r(null)},1200);try{s=new WebSocket(e)}catch{return void r(null)}s.onopen=()=>{const l=Date.now()-i;r({url:e,latency:l,readable:!0,writable:!0})},s.onerror=()=>{r(null)},s.onclose=()=>{r(null)}})}}function Ze(o){return o&&typeof o=="string"?(o=o.trim()).startsWith("ws://")?o.replace("ws://","wss://"):o.startsWith("wss://")?o:o.startsWith("http://")?o.replace("http://","wss://"):o.startsWith("https://")?o.replace("https://","wss://"):o.includes("://")?null:`wss://${o}`:null}function Je(o,e="Timeout"){return new Promise((t,i)=>setTimeout(()=>i(new Error(e)),o))}typeof customElements>"u"||customElements.get("xoip-call")||customElements.define("xoip-call",Fe);const x=document.getElementById("xoip"),pe=document.getElementById("event-log-list")||document.getElementById("event-log"),ue=document.getElementById("uri-input"),Xe=document.getElementById("uri-display"),et=document.getElementById("uri-text"),tt=document.getElementById("uri-timestamp"),M=document.getElementById("btn-copy-uri"),ne=document.getElementById("btn-clear-log");ne&&ne.addEventListener("click",()=>{pe.innerHTML=""});const it=new ze({configuredRelays:["wss://greenart7c3.feeds.relay.tools/","wss://relay.primal.net","wss://relay.damus.io","wss://nos.lol"],selectCount:3,discoveryTimeoutMs:2e3});let L="";function b(o,e){const t=document.createElement("div");t.className="entry";const i=new Date().toLocaleTimeString("en",{hour12:!1});t.innerHTML=`<span style="color:#64748b">[${i}]</span> <span class="ev-name">${o}</span> <span class="ev-detail">${JSON.stringify(e)}</span>`,pe.prepend(t)}function K(o){L=o,ue.value=o,et.textContent=o,tt.textContent=new Date().toLocaleTimeString(),Xe.style.display="flex",M.disabled=!1}async function ge(){const o=document.getElementById("relays-status-text"),e=document.getElementById("badge-relays");o&&(o.textContent="🔍 Checking relays (Health Check)..."),b("discovery-pipeline",{action:"start",timeoutMs:2e3});try{const t=await it.discoverRelays();return(!x._callState||x._callState==="idle")&&x.setAttribute("signaling-config",JSON.stringify({relays:t})),o&&(o.innerHTML=`<span style="color:#34d399; font-weight:600;">✓ Active (${t.length}):</span> `+t.map(i=>`<span style="color:#e2e8f0; background:#1e293b; padding:2px 6px; border-radius:4px; font-family:monospace; font-size:11px;">${i.replace("wss://","")}</span>`).join(" ")),e&&(e.textContent=`⚡ Relays: ${t.length} active`,e.className="badge badge-green"),b("discovery-pipeline",{status:"healthy",relays:t}),t}catch(t){return console.warn("[Discovery] Failed, fallback to configured:",t),b("⚠️ discovery-fallback",{message:t.message}),o&&(o.textContent="Using default relays (fallback)"),null}}const nt=decodeURIComponent(window.location.hash||""),st=decodeURIComponent(window.location.search||""),rt=nt.includes("xoip://")||st.includes("xoip://");if(!rt)ge();else{const o=document.getElementById("relays-status-text"),e=document.getElementById("badge-relays");o&&(o.textContent="Using relays from incoming URI"),e&&(e.textContent="🔗 Peer Mode",e.className="badge badge-green")}document.getElementById("btn-discover-relays").addEventListener("click",async()=>{await ge()});document.getElementById("btn-create-uri").addEventListener("click",async()=>{try{b("uri-creating",{type:"nostr"}),await x.createRoom()}catch(o){b("❌ create-failed",{message:o.message})}});document.getElementById("btn-connect-uri").addEventListener("click",async()=>{const o=ue.value.trim();if(!o){alert("Please paste a xoip:// URI into the input field!");return}try{b("uri-connecting",{uri:o.slice(0,35)+"..."}),K(o),await x.connect(o)}catch(e){b("❌ connect-failed",{message:e.message}),alert("Connection error via URI: "+e.message)}});M.addEventListener("click",async()=>{if(!L)return;await navigator.clipboard.writeText(L),b("📋 copied-uri",{uri:L.slice(0,35)+"..."});const o=M.textContent;M.textContent="✅ Copied!",setTimeout(()=>{M.textContent=o},2e3)});document.getElementById("btn-open-peer").addEventListener("click",()=>{var t;const o=L||((t=x._xoipSession)==null?void 0:t.shareURI);let e=`${location.origin}${location.pathname}`;o&&(e+=`#uri=${encodeURIComponent(o)}`),window.open(e,"_blank"),b("👥 open-peer-tab",{targetUrl:e.slice(0,40)+"..."})});const se=document.getElementById("btn-open-dashboard");se&&se.addEventListener("click",o=>{const e=document.querySelector("xoip-qos");e&&e.openDashboard(o)});document.getElementById("btn-send-ping").addEventListener("click",()=>{const o={type:"ping",text:"Hello from Nostr peer via xoip:// URI!",timestamp:Date.now()};try{x.sendData(o),b("📤 sent-data",o)}catch(e){b("❌ send-failed",{message:e.message})}});window.addEventListener("DOMContentLoaded",async()=>{let o=null;if(window.location.hash){const e=window.location.hash.slice(1);if(e.startsWith("xoip://"))o=decodeURIComponent(e);else try{const t=new URLSearchParams(e),i=t.get("uri")||t.get("src");i&&i.startsWith("xoip://")&&(o=i)}catch{}}if(!o){const e=new URLSearchParams(window.location.search),t=e.get("uri")||e.get("src");t&&t.startsWith("xoip://")&&(o=t)}o&&(b("🔗 auto-detected-uri",{uri:o.slice(0,35)+"..."}),K(o),setTimeout(()=>{x.connect(o).catch(e=>{b("❌ auto-connect-failed",{message:e.message})})},100))});x.addEventListener("room-created",({detail:o})=>{var t;const e=o.shareURI||((t=x._xoipSession)==null?void 0:t.shareURI);e&&K(e),b("room-created",{roomId:`${o.roomId.slice(0,16)}...`,hasURI:!!e}),console.log("[xoip-demo] Nostr Room created. shareURI:",e)});x.addEventListener("room-joined",({detail:o})=>{const e=o.uri||L;e&&K(e),b("room-joined",{roomId:`${o.roomId.slice(0,16)}...`}),console.log("[xoip-demo] Joined Nostr room:",o.roomId)});x.addEventListener("remote-stream-ready",({detail:o})=>{var e,t,i;b("remote-stream-ready",{trackId:(e=o.track)==null?void 0:e.id,kind:(t=o.track)==null?void 0:t.kind}),console.log("[xoip-demo] Remote stream track ready:",(i=o.track)==null?void 0:i.kind)});x.addEventListener("channel-message",({detail:o})=>{b("channel-message",o.data),console.log("[xoip-demo] DataChannel message received:",o.data)});x.addEventListener("network-quality",({detail:o})=>{b("network-quality",{rtt:o.rtt,loss:`${o.packetLoss}%`,quality:o.quality})});x.addEventListener("call-ended",({detail:o})=>{b("call-ended",o),L="",M.disabled=!0,console.log("[xoip-demo] Call ended:",o.reason)});x.addEventListener("error",({detail:o})=>{b("❌ error",{code:o.code,msg:o.message}),console.error("[xoip-demo] Error:",o)});export{qe as a,ce as b,Y as c,Pe as d};
