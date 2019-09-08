// Main client class that maintains a UDP socket active at all times
// to provide communication with the chosen host
const remote = require('electron').remote
const Connection = require("../server/server.js").Connection;
const dgram = require("dgram");
const ports = require("../udp/udpHelpers.js").ports;
const socket = dgram.createSocket('udp4');
const response = require("../udp/udpHelpers.js").response;
const ip = require('ip');

var message;

class Client {
    constructor(hostIP, hostPort, ip = '127.0.0.1', port) {
        this.clients = [];
        this.connection = new Connection(ip, port);
        this.host = new Connection(hostIP, hostPort);
    }

    getClientInfo() {
        j = {IP: this.connection.ip, PORT: this.connection.port};
        return JSON.stringify(j);
    }


    addClient(ip, port) {
        this.clients.push(new Connection(ip, port));
        console.log(`Registered new client: ${ip}:${port}`)
    }


    getClients() {
        var j = {};
        this.clients.forEach((client) => {
            j[`${client.ip}:${client.port}`] = client.port;
        });
        return JSON.stringify(j);
    }

    hasClient(ip, port) {
        return `${ip}:${port}` in JSON.parse(this.getClients());
    }
    send(msg) {
        socket.send(msg, this.host.port, this.host.ip);
    }

    setPort() {
        this.connection.port = socket.address().port;
    }

    getOptions() {
        socket.send(JSON.stringify({status: response.OPTIONS}), this.host.port, this.host.ip);
    }

    start(addNewPlayer, updateState, setMouseUp, setOptions, updateScores) {
        var obj = this;
        this.socket = dgram.createSocket('udp4');
        socket.on('error', function (err)
        {
            console.log(`socket error:\n${err.stack}`);
            socket.close();
        });

        socket.on('message', function (msg, rinfo)
        {
            var j = JSON.parse(msg);

            message = j.msg;
            if (j.status == response.GAMEEND) {
                updateScores(`Game ended - ${message.x} player won with ${message.y} points`, 'pink');
            }
            else if (j.status == response.OPTIONS) {
                setOptions(message);
            } 
            else if (!obj.hasClient(message.ip, message.port)) {
              obj.addClient(message.ip, message.port);
              addNewPlayer(message.ip, message.port, message.color);
            } else if (j.status == response.UPDATESTATE) {
              updateState(message.ip, message.port, message.x, message.y, message.clickDrag);
            } else if (j.status == response.MOUSEUP) {
                
              setMouseUp(message.ip, message.port);
            } else if (j.status == response.UPDATESCORES) {
                updateScores(message.x, message.y);
            } 
        
        });

        socket.on('listening', function ()
        {
            const address = socket.address();
            console.log(`socket listening ${address.address}:${address.port}`);
        });
        
        socket.bind(`${this.connection.port}`, `${this.connection.ip}`);
    }

    sendUpdate(x, y, clickDrag, state) {
        var msg = {
            status: state,
            msg : {
                ip: this.connection.ip,
                port: this.connection.port,
                x: x,
                y: y,
                clickDrag: clickDrag
            }
        };
        this.send(JSON.stringify(msg));
    }

}
module.exports = Client;