// Connection class is a simple container to hold ip and port of the connection

// Server class is the main server that keeps track of the client connection 
// and retransmits the messages for all the clients once received
// to make it possible for all the client to maintain the state of the board intact

const dgram = require("dgram");
const ports = require("../udp/udpHelpers.js").ports;
const colorIndexes = require("../udp/udpHelpers.js").colorIndexes;
const response = require("../udp/udpHelpers.js").response;
const socket = dgram.createSocket('udp4');
var message;
var lastTimestamp = null;
var lastIP = null;

class Connection {
    constructor(ip, port) {
        this.ip = ip;
        this.port = port;
    }
    toJSON() {
        return JSON.stringify({IP: this.ip, PORT: this.port});
    }
}

function buildNewUserMessage(ip, port, color) {
    var msg = {
        status: response.NEWPLAYER,
        msg: {
            ip: ip,
            port: port,
            color: color
        }
    };
    return JSON.stringify(msg);
}

function buildOptionsMessage(options) {
    var temp = JSON.parse(options);
    var msg = {
        status: response.OPTIONS,
        msg: {
            boardsize: temp.boardsize, 
            penThickness: temp.penThickness, 
            fillingPercentage: temp.fillingPercentage
        }
    };
    
    return JSON.stringify(msg);
}

function makeWinnerMessage(color, points) {
    var msg = {
        status: response.GAMEEND,
        msg: {
            x: color,
            y: points
        }
    };
    return JSON.stringify(msg);

}


class Server {
    constructor(ip = '127.0.0.1', port = ports.MAIN) {
        this.clients = []
        this.connection = new Connection(ip, port);
        this.colors = {};
        this.reverseColors = {};
        this.colorIndex = 1;
        this.points = {};
        this.total = 0;
    }

    getHostInfo() {
        j = {IP: this.connection.ip, PORT: this.connection.port};
        return JSON.stringify(j);
    }


    addClient(ip, port) {
        this.clients.push(new Connection(ip, port));
        this.points[`${ip}:${port}`] = 0;
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

    send(msg, ip, port) {
        socket.send(msg, port, ip);
    }

    sendToAllClients(msg) {
        this.clients.forEach(function(client) {
            socket.send(msg, client.port, client.ip);
        });
    }

    sendListToNewClient(ip, port) {
        var colors = this.colors;
        this.clients.forEach(function(client) {
            var msg = buildNewUserMessage(client.ip, client.port,
                colors[`${client.ip}:${client.port}`]);
            socket.send(msg, port, ip);
        });

    }



    start(options) {
        var obj = this;
        socket.on('error', function (err)
        {
            console.log(`socket error:\n${err.stack}`);
            socket.close();
        });

        socket.on('message', function (msg, rinfo)
        {
            var j = JSON.parse(msg);
            if(!obj.hasClient(rinfo.address, rinfo.port)) {
                obj.reverseColors[obj.colorIndex] = `${rinfo.address}:${rinfo.port}`;
                obj.colors[`${rinfo.address}:${rinfo.port}`] = colorIndexes[obj.colorIndex++];
                
                message = buildNewUserMessage(rinfo.address, rinfo.port, obj.colors[`${rinfo.address}:${rinfo.port}`]);
                obj.addClient(rinfo.address, rinfo.port);
                obj.sendToAllClients(message);
                obj.sendListToNewClient(rinfo.address, rinfo.port);
                if(j.status == response.OPTIONS) {
                    obj.send(buildOptionsMessage(options), rinfo.address, rinfo.port);
                }
            } else {
                if(j.status == response.UPDATESCORES) {
                    if(lastIP != null && lastTimestamp != null) {

                        var newTime = Date.now();
                        var newIp = rinfo.address;
                        if(lastIP != newIp) {
                            var diff = newTime - lastTimestamp;
                            console.log(diff);
                            if(diff > 200) {
                                obj.points[`${rinfo.address}:${rinfo.port}`] += 1;
                                obj.total += 1;
                                var boardsize = JSON.parse(options).boardsize;
                                console.log("Total is: ", obj.total);
            
                                if(obj.total >= (boardsize * boardsize)) {
                                    var max = 0;
                                    var who = null;
                                    for (var key in obj.points) { 
                                        if(obj.points[key] > max) {
                                            who = key;
                                            max = obj.points[key];
                                        }
                                    }
                                    console.log(obj.colors[who], max);
                                    console.log(obj.colors[who], max);
                                    obj.sendToAllClients(makeWinnerMessage(obj.colors[who], max));
                            } 
                            lastTimestamp = newTime;

                        }
                    } else {
                        lastIP = rinfo.address;
                        lastTimestamp = Date.now();
                        obj.points[`${rinfo.address}:${rinfo.port}`] += 1;
                                obj.total += 1;
                                var boardsize = JSON.parse(options).boardsize;
            
                                if(obj.total >= (boardsize * boardsize)) {
                                    var max = 0;
                                    var who = null;
                                    for (var key in obj.points) { 
                                        console.log(key, obj[key]);
                                        if(obj[key] > max) {
                                            who = key;
                                            max = obj[key];
                                        }
                                    }
                                    console.log(obj.colors[who], max);
        
                                    obj.sendToAllClients(makeWinnerMessage(obj.colors[who], max));
                        
                    }
                    
                                        
                   
                    }
                    
                } else {
                    lastIP = rinfo.address;
                    lastTimestamp = Date.now();
                    obj.points[`${rinfo.address}:${rinfo.port}`] += 1;
                    obj.total += 1;
                    var boardsize = JSON.parse(options).boardsize;
                    console.log("Total is: ", obj.total);

                    if(obj.total >= (boardsize * boardsize)) {
                        var max = 0;
                                    var who = null;
                                    for (var key in obj.points) { 
                                        console.log(key, obj[key]);
                                        if(obj[key] > max) {
                                            who = key;
                                            max = obj[key];
                                        }
                                    }
                                    console.log(obj.colors[who], max);

                        obj.sendToAllClients(makeWinnerMessage(obj.colors[who], max));
                    
                }
            }
                
            }
            obj.sendToAllClients(msg);
        }});

        socket.on('listening', function ()
        {
            const address = socket.address();
            console.log(`socket listening ${address.address}:${address.port}`);
        });

        socket.bind(`${this.connection.port}`, `${this.connection.ip}`);
    }

}
module.exports = {
    Server,
    Connection
};
