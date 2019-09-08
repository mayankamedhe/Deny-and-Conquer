// JS script to set up Client entity for communication
// it spawns the Client object which will create a UDP socket to run

const { ipcRenderer, remote } = require('electron');
const ip = require('ip');
const response = remote.require("./udp/udpHelpers.js").response;
const ports = remote.require("./udp/udpHelpers.js").ports;
const Client = remote.require("./client/clientSocket.js");
const Connection = remote.require("./server/server.js").Connection;



const methods = {};
var mainPainter;
var players = {};
var client = null;
var options;


window.onload = function init() {
    setUpServerCommunication();
};

function setUpServerCommunication() {
    var result = ipcRenderer.sendSync('get-host', 'IPC/Socket');

    try {
        var j = JSON.parse(result);
        initializeClient(j.IP, j.PORT, addNewPlayer, updateNewState, setMouseUp, saveOptions, updateScores);
        players[`${client.connection.ip}:${client.connection.port}`] = new Player('red', `${client.connection.ip}:${client.connection.port}`);
        methods.send = client.sendUpdate;
        if(j.status == response.SOCKET) {
            client.getOptions();
        } else {
            client.send(JSON.stringify({status: 1}));
            options = JSON.parse(ipcRenderer.sendSync('get-options', 'Get options'));
            console.log(options);
            setUpMainPainter(methods.send);
        }
    }
    catch(err) {
        console.log(err.message);
    }
}


function updateScores(score, color) {
    document.getElementById(`${color}`).innerHTML = score;
}

function updateNewState(clientIp, clientPort, x, y, clickDrag) {
    var currentPlayer = players[`${clientIp}:${clientPort}`];
    mainPainter.addClick(x, y, clickDrag, currentPlayer, client.sendUpdate);
    mainPainter.draw(currentPlayer);
}

function addNewPlayer(ip, port, color) {
    players[`${ip}:${port}`] = new Player(color, `${ip}:${port}`);
}

function setMouseUp(clientIp, clientPort) {
    var currentPlayer;
    currentPlayer = players[`${clientIp}:${clientPort}`];
    mainPainter.reset_analysis(currentPlayer);
}

function initializeClient(hostIp, hostPort, addNewPlayer, updateNewState, setMouseUp, saveOptions) {
    client = new Client(hostIp, hostPort, ip.address());
    client.start(addNewPlayer, updateNewState, setMouseUp, saveOptions, updateScores);
    client.setPort();
}


function saveOptions(msg) {
    options = msg;
    setUpMainPainter();
}


function setUpMainPainter() {
    var canvas = document.getElementById('canvas');
    mainPainter = new Painter(canvas, options.fillingPercentage, options.boardsize, options.penThickness);
    mainPainter.initializeBoard();
    setUpCallBacks(mainPainter, players, `${client.connection.ip}:${client.connection.port}`, 
        methods.send);
}

