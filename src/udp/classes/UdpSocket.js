const events = require("events");
const dgram = require("dgram");
const remote = require("electron").remote;

const udpHelper = remote.require("./udp/udpHelpers.js");
const p = udpHelper.port;
const h = udpHelper.header;

// Events:
// - message: when a message is received by the socket
// - socket-error: when there is an error by the underlying socket
// - heartbeat: when the heartbeat signal is received
// - heartbeat-error: when the heartbeat fails

// message event callback:
// function (header, content, remoteInfo)
// - <header> holds the header info in an object { timestamp, id }
// - <content> is a buffer containing the sent message
// - <remoteInfo> is an object { address, port } holding the sender's address and port

// socket-error event callback:
// function (error)
// - <error> is the error reported by the underlying dgram socket

// heartbeat event callback:
// function ()

// heartbeat-error event callback:
// function ()

class UdpSocket extends events.EventEmitter
{
    #socket;

    #address;
    #port;

    #parseHeader(message)
    {
        // Read header information from the bytes
        var timestamp = message.readUIntLE(0, h.TIMESTAMP_SIZE);
        var id = message.readUInt8(h.TIMESTAMP_SIZE, h.ID_SIZE);

        console.log("[parseHeader] Timestamp:   " + timestamp);
        console.log("[parseHeader] ID:          " + id);

        return { timestamp, id };
    }

    #createHeader(id)
    {
        // TODO: Replace with usage of global clock
        var timestamp = (new Date).getTime();
        
        // Allocate buffer for header then write header information to it
        var output = Buffer.alloc(h.SIZE);
        output.writeUIntLE(timestamp, 0, h.TIMESTAMP_SIZE);
        output.writeUInt8(id, h.TIMESTAMP_SIZE, h.ID_SIZE);

        console.log("[createHeader] Timestamp:  " + timestamp);
        console.log("[createHeader] ID:         " + id);

        return output;
    }

    #messageHandler(message, remoteInfo)
    {
        if (message.length < h.SIZE)
        {
            console.log(`[UdpSocket:${this.#port}] Received packet too small for header! Ignoring packet`);
            return;
        }

        // Slice out the header from the buffer then parse it
        var headerBuffer = message.slice(0, h.SIZE);
        var header = this.#parseHeader(headerBuffer);
        
        // Slice out the contents of the message
        var content = message.slice(h.SIZE, message.length);

        this.emit("message", header, content, { address: remoteInfo.address, port: remoteInfo.port });
    }

    #socketErrorHandler(error)
    {
        this.emit("socket-error", error);
    }

    constructor()
    {
        // Call super or otherwise "this" is undefined. Because of a nodejs bug
        super();

        this.#socket = dgram.createSocket("udp4");

        this.#socket.on("message", this.#messageHandler);
        this.#socket.on("error", this.#socketErrorHandler);
    }

    // Port is optional
    setTarget(address, port)
    {
        // Set the port to the default if it's not supplied
        this.#port = (port === undefined ? p.MAIN : port);

        this.#address = address;
    }

    getTarget()
    {
        return { address: this.#address, port: this.#port };
    }

    // destinationPort is optional
    send(id, message, destinationPort)
    {
        var header = this.#createHeader(id);
        var messageBuffer = Buffer.from(message, "utf8");
        
        // Copy the message buffer into the end of the header buffer
        messageBuffer.copy(header, h.SIZE);

        // Use the default port if there's no port supplied
        if (destinationPort === undefined)
        {
            this.#socket.send(header, this.#port)
        }
        else
        {
            this.#socket.send(header, destinationPort)
        }
    }

    bindSocket(port)
    {
        this.#port = port;
        this.#socket.bind(port);
    }   

    closeSocket()
    {
        this.#socket.close();
    }
}

module.exports = UdpSocket;