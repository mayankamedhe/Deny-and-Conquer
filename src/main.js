const electron = require('electron');
const url = require('url');
const path = require('path');
const ip = require('ip')
const response = require("./udp/udpHelpers.js").response;
const ports = require("./udp/udpHelpers.js").ports;
const Server = require("./server/server.js").Server;
const Connection = require("./server/server.js").Connection;

var hostIP = '127.0.0.1';

const {ipcMain, app, BrowserWindow} = electron;

var win;
var win2;
var win3;
var hostInfo;
var server = null;
var options;

function createWindow()
{
    win = new BrowserWindow({ width: 800, height: 600, title:"Host" });
    win.loadFile("html/mainMenu.html");
    win.webContents.openDevTools();

    win2 = new BrowserWindow({ width: 800, height: 600, title:"16541" });
    win2.loadFile("html/mainMenu.html");
    win2.webContents.openDevTools();

    // win3 = new BrowserWindow({ width: 800, height: 600, title:"16542" });
    // win3.loadFile("html/mainMenu.html");
    // win3.webContents.openDevTools();


   

    win.on("closed", () => win = null);
   win2.on("closed", () => win = null);
    // swin3.on("closed", () => win = null);
}

function sendIPC(message) {
    win.webContents.send('update-state', message);
}
function initialize() {
    createWindow();
    ipcMain.on('start-server', (event, arg) => {
        try {
            var myIp = ip.address();
            server = new Server(`${myIp}`, ports.MAIN);
            hostInfo = new Connection(myIp, ports.MAIN);
            server.start(options);
            event.returnValue = response.STARTED;
        } catch(err){
            console.log(err.message);
            event.returnValue = err.message;
        }
    });
    ipcMain.on('save-host', (event, arg) => {
        var j = JSON.parse(arg);
        hostInfo = new Connection(j.IP, j.PORT);
        server = null;
        event.returnValue = response.SAVED;
    });
    ipcMain.on('get-host', (event, arg) => {
        var info = JSON.parse(hostInfo.toJSON());
        if(server == null) {
            info.status = response.SOCKET;
        } else {
            info.status = response.STARTED;
        }
        console.log("info is", info);
        event.returnValue = JSON.stringify(info);
    });
    
    ipcMain.on('update-state', (event, arg) => {
        server.sendToAllClients(arg);
        event.sender.send('update-state', arg);
    });

    ipcMain.on('save-options', (event, arg) => {
       options = arg;
       event.returnValue = 'saved';
    });
    ipcMain.on('get-options', (event, arg) => {
        event.returnValue = options;
    });
}




app.on('ready', initialize);  

app.on("window-all-closed", function () 
{
    // From electron guide:
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin')
    {
        app.quit();
    }
})

app.on("activate", function ()
{
    // From electron guide:
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (win === null)
    {
        createWindow();
    }
})