// JS script to control the initial loginControl window
// makes it possible for a person to either become a client and connect to a chose IP
// or become host

const { ipcRenderer } = require('electron');
const remote = require("electron").remote;
const response = remote.require("./udp/udpHelpers.js").response;
const gameBoardUrl = "html/gameBoard.html";


function setUpClient() {
    saveChosenOptions();
    var data = document.getElementById('inputIpToConnect').value.split(':');
    var j = {IP: data[0], PORT: data[1]};
    ipcRenderer.sendSync('save-host', JSON.stringify(j));
    loadTheBoard();
}



function createServer() {
    saveChosenOptions();
    var result = ipcRenderer.sendSync('start-server', 'Start server');
    if(result == response.STARTED) {
        console.log("Server started");
        loadTheBoard();
    } else {
        alert(`${result}. Cannot start the server.`);
    }
}

function saveChosenOptions() {
    var boardsize = document.querySelector('input[name="boardsize"]:checked').value;
    var penThickness = document.querySelector('input[name="penThickness"]:checked').value;
    var fillingPercentage = document.querySelector('input[name="fillingPercentage"]:checked').value;
    var j = {boardsize: boardsize, penThickness: penThickness, fillingPercentage: fillingPercentage};
    ipcRenderer.sendSync('save-options', JSON.stringify(j));
}

function loadTheBoard() {
    remote.getCurrentWindow().loadFile(gameBoardUrl);
}
