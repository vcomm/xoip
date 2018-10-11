'use strict';

const API_KEY='46150312'
const API_SECRET='48dbd438683429f880029b6f1a30ae2fc6215618'

const WebSocket = require('ws')
const OpenTok = require('../lib/opentok')

// Verify that the API Key and API Secret are defined
var apiKey = process.env.API_KEY || API_KEY,
    apiSecret = process.env.API_SECRET || API_SECRET;
if (!apiKey || !apiSecret) {
    console.log('You must specify API_KEY and API_SECRET environment variables');
    process.exit(1);
}

let opentok = new OpenTok(apiKey, apiSecret);

const services = {
    numClients: 0,
    clients: {},
    rooms: {},
    updateRoomsMembers: function() {
        let roomsmap = {}
        for (const room in this.rooms) {
            roomsmap[room] = this.rooms.members
        }
        for (const usr in services.clients) {
            services.clients[usr].send(JSON.stringify({
                rooms: roomsmap
            }));
        }
    },
    chat: {
        signin: function (msg,sock) {
            services.clients[msg.user] = sock
            sock.username = msg.user
            services.numClients++
            console.info(msg.user,' -> enter')
            this.updateulst()
        },
        signout: function(user) {
            if (services.clients[user]) {
                delete services.clients[user]
                services.numClients--
                console.info(user,' -> exit')
                this.updateulst()
            }
        },
        usrlst: function (obj) {
            let list = []
            for (const usr in obj) {
                list.push(usr)
            }
            return list
        },
        updateulst: function () {
            for (const usr in services.clients) {
                services.clients[usr].send(JSON.stringify({
                    users: this.usrlst(services.clients)
                }));
            }
        },
        invite: function (msg,sock) {
            if (services.clients[msg.called]) {
                services.clients[msg.called].send(JSON.stringify({
                    invite: {
                        caller: msg.caller,
                        roomid: msg.roomid,
                    }
                }));
            }
        }
    },
    tokbox: {
        createroom: function (msg,sock) {
            let self = this
            opentok.createSession({mediaMode: 'routed'},
            function(err, session) {
                if (err) throw err;
                let roomId = msg.roomid
                services.rooms[roomId] = {
                    apiKey: API_KEY,
                    sessionId: session.sessionId,
                    token: opentok.generateToken(session.sessionId),
                    members: []
                }
                services.rooms[roomId].members.push(sock.username)
                sock.send(JSON.stringify({tbroom:services.rooms[roomId]}))
                services.updateRoomsMembers()
            })
        },
        joinroom: function (msg,sock) {
            let roomId = msg.roomid
            services.rooms[roomId].token = opentok.generateToken(services.rooms[roomId].sessionId)
            services.rooms[roomId].members.push(sock.username)
            sock.send(JSON.stringify({tbroom:services.rooms[roomId]}))
            services.updateRoomsMembers()
        },
        delroom: function (msg,sock) {
            let roomId = msg.roomid
            if (services.rooms[roomId] && services.rooms[roomId].members) {
                services.rooms[roomId].members.forEach(usr => {
                    services.clients[usr].send(JSON.stringify({hangup: {room: roomId, user: sock.username}}));
                })
                delete services.rooms[roomId]
                services.updateRoomsMembers()
            }
        }
    }
}


let ServWS = (function () {

    return {
        init: function (server,cblk) {
            let self = this
            const wss = new WebSocket.Server({ server })

            wss.on('connection', function connection(ws, req) {

                ws.on('message', function incoming(message) {
                    console.log('received: %s', message)
                    let msg = JSON.parse(message)
                    if (services[msg.service])
                        services[msg.service][msg.iface](msg,ws)
                })

                console.log('Client connected')

                ws.on('close', function(){
                    console.log('Client Disconnected: ', ws.username)
                    services.chat.signout(ws.username)
                })

                ws.on('error', () => console.log('errored'))
            })
        }
    }
})()

module.exports = ServWS;