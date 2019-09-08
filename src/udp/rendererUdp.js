const $ = require("jquery");
const { ipcRenderer, remote } = require('electron');

const dgram = require("dgram");
const socket = dgram.createSocket("udp4");


const ports = require("./udpHelpers.js").ports;



var HOSTIP = "localhost";
var HOSTPORT = ports.MAIN;
var CLIENTIP = "localhost";
var CLIENTPORT = ports.LOCAL_1;


function createClient(hostIP, hostPort, onMessage) {
    HOSTIP = hostIP;
    HOSTPORT = hostPort;
    console.log(socket);

    socket.on("listening", function () {
        const address = socket.address();
        console.log("renderer lol");
        console.log(`socket listening ${address.address}:${address.port}`);
    });
    
    
    socket.on("error", function (err)
    {
        console.log(`socket error:\n${err.stack}`);
        socket.close();
    });
    
    socket.on("message", function (msg, rinfo)
    {   
        onMessage(msg, rinfo);
        console.log(`socket got: ${msg} from ${rinfo.address}:${rinfo.port}`);
    });
    
    socket.bind(CLIENTPORT, CLIENTIP);
}

function sendMessage(msg) {
    console.log("Trying to connect to: " + HOSTIP + ":" + ports.MAIN);
    socket.send(msg, HOSTPORT, HOSTIP);
}


module.exports = {
    sendMessage,
    createClient
};