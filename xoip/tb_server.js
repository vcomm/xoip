'use strict'

const API_KEY='46150312'
const API_SECRET='48dbd438683429f880029b6f1a30ae2fc6215618'
/*
*   Server Logic context and library for TokBox
*/

let context = {
    data: {},
    lib: {
        fn_initialize: function(cntx) {

            cntx.OpenTok = require('./lib/opentok')
            cntx.apiKey = process.env.API_KEY || API_KEY,
            cntx.apiSecret = process.env.API_SECRET || API_SECRET;
            console.log('fn_initialize(): ');
        },
        ev_outOfService: function(cntx) {
            if (!cntx.apiKey || !cntx.apiSecret) {
                console.log('ev_outOfService(): API_KEY/API_SECRET LOST: ',cntx.apiKey,'=>',cntx.apiSecret);
                return true
            } else {
                console.log('ev_outOfService(): API_KEY/API_SECRET OK: ',cntx.apiKey,'=>',cntx.apiSecret);
                return false
            }
        },
        fn_outOfServiceMsg: function(cntx) {
            console.log('fn_outOfServiceMsg(): You must specify API_KEY and API_SECRET environment variables');
        },
        ev_checkEnvComplete: function(cntx) {
            if (cntx.apiKey && cntx.apiSecret && cntx.OpenTok) {
                console.log('ev_checkEnvComplete(): Complete');
                return true
            } else {
                console.log('ev_checkEnvComplete(): Problems');
                return false
            }
        },
        fn_inServiceMsg: function(cntx) {
            cntx.opentok = new OpenTok(cntx.apiKey, cntx.apiSecret);
            console.log('fn_inServiceMsg(): ');
        },
        fn_updateActiveMembersList: function(cntx) {
            console.log('fn_updateActiveMembersList(): ', Date.now());
        },
        fn_sendInviteRoom: function(cntx) {
            console.log('fn_sendInviteRoom(): ', Date.now());
        },
        ev_callerRequest: function(cntx) {
            console.log('ev_callerRequest(): ', Date.now());
            return false;
        },
        fn_createSession: function(cntx) {
            cntx.opentok.createSession(function(err, session) {
                if (err) throw err;
                cntx.sessionId = session.sessionId
            })
            console.log('fn_createSession(): ');
        },
        fn_tokenGeneration: function(cntx) {
            cntx.token = cntx.opentok.generateToken(cntx.sessionId);
            console.log('fn_tokenGeneration(): ');
        },
        fn_storeSession: function(cntx) {
            console.log('fn_storeSession(): ', Date.now());
        },
        ev_hangUp: function(cntx) {
            console.log('ev_hangUp(): ', Date.now());
            return true;
        },
        fn_keepSessionArchive: function(cntx) {
            console.log('fn_keepSessionArchive(): ', Date.now());
        },
        ev_calledRoomJoin: function(cntx) {
            console.log('ev_calledRoomJoin(): ', Date.now());
            return true;
        },
        fn_respRoomDetails: function(cntx) {
            console.log('fn_respRoomDetails(): ', Date.now());
        },
        fn_updateSession: function(cntx) {
            console.log('fn_updateSession(): ', Date.now());
        },
        fn_disconnectSession: function(cntx) {
            console.log('fn_disconnectSession(): ', Date.now());
        },
        ev_networkProblem: function(cntx) {
            console.log('ev_networkProblem(): ', Date.now());
            return false;
        },
        fn_reportProblem:  function(cntx) {
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

let slogic = (function (slogicname) {
    let logicsStore = {};
    const dasm = require('dafsm').DAFSM

    logicsStore[slogicname] = require('./logic/server.json')

    function handleError(error) {
        if (error) {
            console.error(error);
        }
    }
    return {
        loadLogic: function(name) {
            logicsStore[name] = require('./logic/'+name+'.json')
        },
        attachLogic: function(name,cblk,cntx) {
            new Promise(function(resolve, reject) {
                if(logicsStore[name]) {
                    resolve(logicsStore[name]);
                } else {
                    reject(new Error("Logic not exist!"));
                }
            })
                .then(fsm => {
                    return dasm.link(fsm,cntx?cntx:context);
                })
                .then(fsm => {
                    logicsStore[name] = dasm.init(fsm)
                    if (cblk) {
                        cblk(logicsStore[name])
                    }
                })
                .catch(function catchErr(error) {
                    handleError(error);
                });
        },
        runStep: function (name) {
            if (!logicsStore[name]) {
                return false
            } else {
                dasm.event(logicsStore[name])
                return true
            }
        },
        startFsm: function (name) {
            if (!logicsStore[name])
                return null
            let fsm = logicsStore[name]
            let cntx = {}
            //fsm.context.lib.fn_initialize(fsm.context.data)
            fsm.start.func(cntx)
            return cntx
        }
    }
})('tbserver')

module.exports = slogic;