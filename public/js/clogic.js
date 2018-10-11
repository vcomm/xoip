'use strict'

let clogic = (function (engine_url,logic_name) {
    let logicsStore = {}
       ,myUserName = makeid(5)
       ,socket = null

    function handleError(error) {
        if (error) {
            console.error(error);
        }
    }
    function dataRequest(param) {
        fetch(param.url + param.route, {
            method: param.method,
            headers: param.header,
            body: param.body ? JSON.stringify(param.body) : null
        })
            .then(res => { return res.json(); })
            .then(data => param.func(data))
            .catch(function catchErr(error) {
                handleError(error);
                alert('Failed to: ', param.route);
            });
    }
/*    function dynamicallyLoadScript(url) {
        var script = document.createElement("script"); //Make a script DOM node
        script.src = url; //Set it's src to the provided URL
        document.head.appendChild(script); //Add it to the end of the head section of the page (could change 'head' to 'body' to add it to the end of the body section instead)
    }*/

    dynamicallyLoadScript(engine_url)

    function logicLoad(name,cblk) {
        dataRequest({
            url: '',
            route: '/blogic'+'?lname='+name,
            method: 'get',
            header: {
                'Content-Type': 'application/json'
            },
            body: null,
            func: function (data) {
                console.log('Loaded Logic: ', data);
                cblk ? cblk(data) : null;
            }
        });
    }

    logicLoad(logic_name,function (fsm) {
        let name = fsm.prj+fsm.id;
        dynamicallyLoadScript('/build/'+name+'.js');
        logicsStore[name] = fsm;
    })

    return {
        setUserName: function(name) {
            myUserName = name
        },
        loadLogic: function (name) {
            return new Promise(function(resolve, reject) {
                logicLoad(name,function (fsm) {
                    resolve(data);
                })
            });
        },
        attachLogic: function(name,cblk) {
            new Promise(function(resolve, reject) {
                if(logicsStore[name]) {
                   resolve(logicsStore[name]);
                } else {
                   reject(new Error("Logic not exist!"));
                }
            })
                .then(fsm => {
                    return DAFSM.link(fsm,context);
                })
                .then(fsm => {
                    socket = new socketModule(context.signal.recv)
                    logicsStore[name] = DAFSM.init(fsm)
                    fsm.context = {
                        usrname: myUserName,
                        socket: socket
                    }
                    fsm.start.func(fsm.context)
                    if (cblk) {
                        cblk(fsm)
                    }
                })
                .catch(function catchErr(error) {
                    handleError(error);
                });
        },
        runStep: function (fsm) {
            DAFSM.event(fsm)
        },
        startFsm: function (fsm,cntx) {
            //fsm.context.lib.fn_initialize(fsm.context.data)
            fsm.context = cntx
            fsm.start.func(fsm.context)
        },
        makeCall: function(dst,roomid) {
            if (!logicFsm) return
            logicFsm.context = {}
            logicFsm.context.usrname = myUserName
            logicFsm.context.socket = socket
            logicFsm.context.called = dst //dst.options[dst.selectedIndex].value
            logicFsm.context.bInitiator = true
            logicFsm.context.roomid = roomid //logicFsm.context.usrname+'-'+logicFsm.context.called
            socket.send(JSON.stringify({
                service: 'tokbox',
                roomid: logicFsm.context.roomid,
                iface: 'createroom'
            }));
        },
        hangUp: function()  {
            socket.send(JSON.stringify({
                service: 'tokbox',
                roomid: logicFsm.context.roomid,
                iface: 'delroom'
            }));
        },
        invite3rd: function (called) {
            if (typeof logicFsm.context.called === 'array') {
                logicFsm.context.called.push(called)
            } else if(typeof logicFsm.context.called === 'string') {
                let prevcalled = logicFsm.context.called
                logicFsm.context.called = [prevcalled,called]
            }
            socket.send(JSON.stringify({
                service: 'chat',
                caller: logicFsm.context.usrname,
                called: called,
                roomid: logicFsm.context.roomid,
                iface: 'invite'
            }));
        }
    }
})('/scripts/dafsm/lib/dafsm.js','client')
