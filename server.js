'use strict'

const PORT = process.env.PORT || 3000

const express = require('express');
const app = express();

// Set public folder as root
app.use(express.static(__dirname + '/public'));

// Provide access to node_modules folder
app.use('/scripts', express.static(`${__dirname}/node_modules/`));

// Provide dynamic load clients logic
app.get('/blogic', function(req, res) {
    var lname = req.query.lname ? req.query.lname : 'client'
    console.log('Request Logic: ',lname)
    res.json(require('./logic/'+lname+'.json'))
})


app.get('/', function(req, res) {
    res.render('index.ejs', {
        apiKey: null,
        sessionId: null,
        token: null
    });
});
/*
const slogic = require('./xoip/tb_server')

slogic.attachLogic('tbserver',
    function (fsm) {
        console.info('Server Logic attachment complete')

})
*/

const srvws = require('./xoip/ws_server')

srvws.init(
    app.listen(PORT, () => console.log(`Listening on ${ PORT }`)),
    function (json) {
        console.log(`Receive JSON msg : ${ json }`)
    }
)