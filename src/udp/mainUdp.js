const dgram = require("dgram");
const socket = dgram.createSocket("udp4");
const remote = require("electron").remote;
const ports = require("./udpHelpers.js").ports;

var hostIP = '127.0.0.1';
var hostPort = `${ports.MAIN}`;


function createServer(ip) {
    //console.log(document.getElementById("inputIpToConnect").value);
    socket.on('error', function (err)
    {
        console.log(`socket error:\n${err.stack}`);
        socket.close();
    });

    socket.on('message', function (msg, rinfo)
    {
        console.log(`socket got: ${msg} from ${rinfo.address}:${rinfo.port}`);
    });

    socket.on('listening', function ()
    {
        const address = socket.address();
        console.log(`socket listening ${address.address}:${address.port}`);
    });
    
    socket.bind(hostPort, hostIP);
    
    return JSON.stringify({HOSTIP: hostIP, HOSTPORT: hostPort});
}

function send() {

}
module.exports = socket;

