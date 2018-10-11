'use strict'
/*
*   Client Logic context and library for TokBox
*/

let context = {
/*
    data: {
        bInitiator: false
    },
*/
    signal: {
        recv: function (msg) {
            console.log('Receive: ',msg)
            if (msg.rooms) {
                updateRooms(msg.rooms)
            }
            if (msg.users) {
                logicFsm.context.users = msg.users
                updateUsers(logicFsm.context.users)
            }
            if (msg.tbroom) {
                logicFsm.context.tbroom = msg.tbroom
                clogic.runStep(logicFsm)
            }
            if (msg.invite) {
                logicFsm.context.bInitiator = false
                logicFsm.context.invite = msg.invite
                logicFsm.context.caller = msg.invite.caller
                logicFsm.context.roomid = msg.invite.roomid
                logicFsm.context.socket.send(JSON.stringify({
                    service: 'tokbox',
                    roomid: msg.invite.roomid,
                    iface: 'joinroom'
                }));
                addRoom(logicFsm.context.roomid)
                if (user.member) {
                    moveUser2Room(user.name, logicFsm.context.roomid)
                } else {
                    addContact2Room(logicFsm.context.roomid, user.name, user.sex)
                    //addUser2Room(logicFsm.context.roomid, user.name, user.sex)
                }
                user.member = logicFsm.context.roomid
                // Add Caller to room
                addContact2Room(logicFsm.context.roomid, logicFsm.context.caller, true)
                openRoom(null,user.member)
            }
            if (msg.hangup/* && !logicFsm.context.hangUp*/) {
                logicFsm.context.hangUp = true
                clogic.runStep(logicFsm)
            }
        },
        send: function (msg) {
            logicFsm.context.socket.send(msg)
        }
    },
    lib: {
        fn_initialize: function(cntx) {
            console.log('fn_initialize(): ', Date.now());
        },
        ev_outOfService: function(cntx) {
            console.log('ev_outOfService(): ', Date.now());
            return false;
        },
        fn_outOfServiceMsg: function(cntx) {
            console.log('fn_outOfServiceMsg(): ', Date.now());
        },
        ev_checkEnvComplete: function(cntx) {
            console.log('ev_checkEnvComplete(): ', Date.now());
            return true;
        },
        fn_signIn: function(cntx) {
            console.log('fn_signIn(): ', Date.now());
            cntx.socket.send(JSON.stringify({
                service: 'chat',
                user: cntx.usrname,
                iface: 'signin'
            }));
        },
        fn_updateActiveMembersList: function(cntx) {
            console.log('fn_updateActiveMembersList(): ', Date.now());
        },
        fn_startPacketStatistics: function(cntx) {
            console.log('fn_startPacketStatistics(): ', Date.now());
        },
        ev_inviteCall_acceptCall: function(cntx) {
            //return cntx.bInitiator ? this.ev_inviteCall(cntx) : this.ev_acceptCall(cntx);
            if (cntx.tbroom) {
                return true
            } else {
                return false
            }
        },
        ev_inviteCall: function(cntx) {
            console.log('ev_inviteCall(): ', Date.now());
            if (cntx.tbroom) {
                return true
            } else {
                return false
            }
        },
        ev_acceptCall: function(cntx) {
            console.log('ev_acceptCall(): ', Date.now());
            if (cntx.tbroom) {
                return true
            } else {
                return false
            }
        },
        fn_reqCreateSession_reqTokenSession: function(cntx) {
            //cntx.bInitiator ? this.fn_reqCreateSession(cntx) : this.fn_reqTokenSession(cntx);
            if (cntx.bInitiator ) {
                console.log('fn_reqCreateSession(): ', Date.now());
                cntx.socket.send(JSON.stringify({
                    service: 'chat',
                    caller: cntx.usrname,
                    called: cntx.called,
                    roomid: cntx.roomid,
                    iface: 'invite'
                }));
                addContact2Room(cntx.roomid, cntx.called, true)
                //addUser2Room(logicFsm.context.roomid, user.name, user.sex)
            } else {
                console.log('fn_reqTokenSession(): ', Date.now());
            }
        },
/*
        fn_reqCreateSession: function(cntx) {
            console.log('fn_reqCreateSession(): ', Date.now());
            cntx.socket.send(JSON.stringify({
                service: 'chat',
                caller: cntx.usrname,
                called: cntx.called,
                roomid: cntx.roomid,
                iface: 'invite'
            }));
        },
        fn_reqTokenSession: function(cntx) {
            console.log('fn_reqTokenSession(): ', Date.now());
        },
*/
        fn_initSession: function(cntx) {
            console.log('fn_initSession(): ', Date.now());
            // Initialize an OpenTok Session object
            cntx.session = OT.initSession(cntx.tbroom.apiKey, cntx.tbroom.sessionId);
            // Connect to the Session using the 'apiKey' of the application and a 'token' for permission
            cntx.session.connect(cntx.tbroom.token);
        },
        fn_publishStreams: function(cntx) {
            console.log('fn_publishStreams(): ', Date.now());

            var publisherOptions = {
                insertMode: 'append',
                usePreviousDeviceSelection: true,
                facingMode: 'environment',
                mirror: false
            };
            // Initialize a Publisher, and place it into the element with id="publisher"
            cntx.publisher = OT.initPublisher('publisher',publisherOptions);
            // Attach event handlers
            cntx.session.on({
                // This function runs when session.connect() asynchronously completes
                sessionConnected: function(event) {
                    // Publish the publisher we initialzed earlier (this will trigger 'streamCreated' on other
                    // clients)
                    cntx.session.publish(cntx.publisher);
                },
                // This function runs when another client publishes a stream (eg. session.publish())
                streamCreated: function(event) {
/*
                    // Create a container for a new Subscriber, assign it an id using the streamId, put it inside
                    // the element with id="subscribers"
                    var subContainer = document.createElement('div');
                    subContainer.id = 'stream-' + event.stream.streamId;
                    document.getElementById('subscribers').appendChild(subContainer);

                    // Subscribe to the stream that caused this event, put it inside the container we just made
                    cntx.session.subscribe(event.stream, subContainer);
*/
                    // Subscribe to the stream that caused this event, put it inside the container we just made
                    cntx.session.subscribe(event.stream, addSubscriber(event.stream.streamId));
                },
                sessionDisconnected: function(event) {
                    console.log('receive sessionDisconnected event: ', Date.now());
                    //cntx.session.disconnect();
                }
            });
        },
        fn_showVideos: function(cntx) {
            console.log('fn_showVideos() in room:',cntx.roomid, Date.now());
            moveVideos2Room(cntx.roomid)
        },
        fn_stopPacketStatistics: function(cntx) {
            console.log('fn_stopPacketStatistics(): ', Date.now());
        },
        fn_storeStatistics: function(cntx) {
            console.log('fn_storeStatistics(): ', Date.now());
        },
        ev_hangUp: function(cntx) {
            console.log('ev_hangUp(): ', Date.now());
            if (cntx.hangUp)
                return true;
            else
                return false
        },
        fn_disconnectSession: function(cntx) {
            console.log('fn_disconnectSession(): ', Date.now());
            cntx.session.disconnect();
            updateUsers()
            if (!cntx.bInitiator ) {
                moveVideos2Lobby()
                removeRoom(cntx.roomid)
                user.member = null
            }
        },
        ev_networkProblem: function(cntx) {
            console.log('ev_networkProblem(): ', Date.now());
            return false;
        },
        fn_reportProblem: function(cntx) {
            console.log('fn_reportProblem(): ', Date.now());
        },
        fn_finallyReport: function(cntx) {
            console.log('fn_finallyReport(): ', Date.now())
        },
        fn_finishing: function(cntx) {
            console.log('fn_finishing(): ', Date.now())
        }
    }
}