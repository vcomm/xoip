if ('WebSocket' in window){
    function socketModule(cblk) {
        var bstatus = false;
        var HOST = location.origin.replace(/^http/, 'ws');
        console.log(HOST);
        //var host = window.document.location.host.replace(/:.*/, '');
        var ws = new WebSocket(HOST);

        ws.onmessage = function (event) {
            cblk(JSON.parse(event.data));
        };
        ws.onopen = function() {
            bstatus = true;
            console.log("Session Connected");
            //ws.send(JSON.stringify({say:"Hello"}));
        };
        ws.onclose = function(event) {
            bstatus = false;
            if (event.wasClean) {
                console.log("Session Closed");
            }  else {
                console.log("Disconnected by server");
            }
            console.log("Code" + event.code + "=>" + event.reason);
        };
        ws.onerror = function(error){
            console.log('Error detected: ' + error);
        };

        window.addEventListener('beforeunload', function () {
            ws.close();
        });

        this.send = function(message) {
            if(bstatus)
                ws.send(message);
            else
                setTimeout(function(){ if(bstatus) ws.send(message); }, 1000);
        };

    };

} else {
    console.log('WebSockets are not supported. Try a fallback method like long-polling etc');
}

