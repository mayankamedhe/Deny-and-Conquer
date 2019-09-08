// Player class is a simple container for a player related variables

// Painter class function is to perform drawing on a gives canvas.

class Player {
    constructor(color_of_player, player_id){
        this.clickX = new Array();
        this.clickY = new Array();
        this.clickDrag = new Array();
        this.currentCubeX = null;
        this.currentCubeY = null;
        this.paint = false;
        this.color = color_of_player ;
        this.id = player_id;
        this.points = 0;
    }
};


class Painter {
    constructor(canvas, percentage=0.2,boardsize=6,penthickness=3, updateMethod) {
        this.canvas = canvas;
        this.context = canvas.getContext('2d');
        this.percentage = percentage;
        this.occupied_matrix = [];

        this.percentage = percentage;
        this.boardsize = boardsize;
        this.penthickness = penthickness;
        if(this.boardsize == 4){
            this.boxsize = 100;
        }else{
            this.boxsize = 50;
        }
        canvas.width = this.boardsize*this.boxsize;
        canvas.height = this.boardsize*this.boxsize;

        this.initializeBoard();
    }

    initializeBoard() {
        this.draw_grid();
        this.setUpOccupiedMatrix();
    }

    setUpOccupiedMatrix() {
        for(var i=0; i<this.boardsize; i++) {
            this.occupied_matrix[i] = [];
            for(var j=0; j<this.boardsize; j++) {
                this.occupied_matrix[i][j] = null;
            }
        }
    }

    draw_grid()
    {
        this.context.strokeStyle = "black";
        this.context.lineJoin = "miter";
        this.context.lineWidth = 1;
        for(var i=0;i<this.boardsize;i++){
        for(var j=0;j<this.boardsize;j++){
            this.context.moveTo(0,this.boxsize*j);
            this.context.lineTo(this.boardsize*this.boxsize,this.boxsize*j);
            this.context.stroke();

            this.context.moveTo(this.boxsize*i,0);
            this.context.lineTo(this.boxsize*i,this.boardsize*this.boxsize);
            this.context.stroke();
        }
        }
    }

    addClick(x, y, dragging,player, updateMethod)
    {

        var currentCube = this.getCube(x, y);
         if (dragging == 'false') {
            player.paint = true;
            if (this.occupied_matrix[currentCube[0]][currentCube[1]] == null) {
                player.currentCubeX = currentCube[0];
                player.currentCubeY = currentCube[1];
                this.occupied_matrix[player.currentCubeX][player.currentCubeY] = player.id; // painter.addClick(e.pageX - this.offsetLeft, e.pageY - this.offsetTop, false, player);
            }
         }
         if(player.paint){
            if([player.currentCubeX,player.currentCubeY].equals(currentCube)){
            }
            else{
                var points = player.points;
                this.reset_analysis(player);
                if(player.points > points) {
                    console.log(player.points); 
                   updateMethod(player.points, player.color, 'true', response.UPDATESCORES);
                }                
            }
        }

        player.clickX.push(x);
        player.clickY.push(y);
        player.clickDrag.push(dragging);

    }

    draw(player){
        console.log("before draw");
        if(player.paint){
            var mouseX = player.currentCubeX[0];
            var mouseY = player.currentCubeY[0];
            if(player.clickDrag[player.clickDrag.length - 1] == 'true') {
                var length = player.clickX.length;
                console.log("COLOR: ", player.color);
                console.log("ID: ", player.id);
                this.context.strokeStyle = player.color;
                this.context.lineJoin = "round";
                this.context.lineWidth = this.penthickness;

                this.context.beginPath();
                this.context.moveTo(player.clickX[length-2],player.clickY[length-2]);
                this.context.lineTo(player.clickX[length-1],player.clickY[length-1]);
                this.context.stroke();
            }
        }
    }

    getCube(x,y){
        return [Math.floor(x/this.boxsize),Math.floor(y/this.boxsize)];
    }

    resetCube(x,y){
        this.context.clearRect(x*this.boxsize,y*this.boxsize,this.boxsize,this.boxsize);

        this.context.strokeStyle = "black";
        this.context.lineJoin = "miter";
        this.context.lineWidth = 1;

        this.context.beginPath();
        this.context.moveTo(x*this.boxsize,y*this.boxsize);
        this.context.lineTo((x+1)*this.boxsize,y*this.boxsize);
        this.context.lineTo((x+1)*this.boxsize,(y+1)*this.boxsize);
        this.context.lineTo(x*this.boxsize,(y+1)*this.boxsize);
        this.context.lineTo(x*this.boxsize,y*this.boxsize);
        this.context.closePath();
        this.context.stroke();

    }

    paintCube(x,y,player){
        this.context.fillStyle = player.color;
        this.context.fillRect(x*this.boxsize,y*this.boxsize,this.boxsize,this.boxsize);
    }

    resetInfo(player){
        player.paint = false;
        player.clickX.length = 0;
        player.clickY.length = 0;
        player.clickDrag.length = 0;
        player.currentCubeX = null;
        player.currentCubeY = null;
    }

    getArea(x,y){
        var occupied = 0;
        var sum = 0;
        var image = this.context.getImageData(x*this.boxsize, y*this.boxsize, this.boxsize, this.boxsize);

        for (let i = 0; i < image.data.length; i += 4) {
            sum = image.data[i] + image.data[i+1] + image.data[i+2];
            if(sum != 0 && sum != 255*3){
                occupied = occupied +1;
            }
        }
        return occupied;
    }

    reset_analysis(player) {
        if(player.currentCubeX != null && player.currentCubeY != null) {
            var occupied_area = this.getArea(player.currentCubeX,player.currentCubeY);
            console.log(occupied_area);
            if(occupied_area/(this.boxsize*this.boxsize) > this.percentage){
                this.paintCube(player.currentCubeX,player.currentCubeY,player);
                player.points += 1;
            }

            else{
                console.log(player.currentCubeX, player.currentCubeY);
                if(player.currentCubeX != null && player.currentCubeY != null){
                    this.occupied_matrix[player.currentCubeX][player.currentCubeY] = null;
                }
                this.resetCube(player.currentCubeX,player.currentCubeY);

            }
        }
        this.resetInfo(player);
    }
}

function setUpCallBacks(painter, players, id ,sendUpdate) {
    painter.canvas.addEventListener('mousedown', function(e){

        var mouseX = e.pageX - this.offsetLeft;
        var mouseY = e.pageY - this.offsetTop;
        var currentCube = painter.getCube(mouseX,mouseY);

        if(painter.occupied_matrix[currentCube[0]][currentCube[1]] == null){
            players[id].currentCubeX = currentCube[0];
            players[id].currentCubeY = currentCube[1];
            painter.occupied_matrix[players[id].currentCubeX][players[id].currentCubeY] = players[id].id;
        }
        sendUpdate(mouseX, mouseY, 'false', response.UPDATESTATE);
    });

    painter.canvas.addEventListener('mousemove', function(e){
        var mouseX = e.pageX - this.offsetLeft;
        var mouseY = e.pageY - this.offsetTop;
        sendUpdate(mouseX, mouseY, 'true', response.UPDATESTATE);
    });

    painter.canvas.addEventListener('mouseup',function(e){
        if(players[id].paint == true){
            var pointsBefore = players[id].points;
            painter.reset_analysis(players[id]);
            if(players[id].points > pointsBefore) {
                sendUpdate(players[id].points, players[id].color, 'true', response.UPDATESCORES);
            }

        }
        sendUpdate(0, 0, 'true', response.MOUSEUP);

    });

    painter.canvas.addEventListener('mouseleave',function(e){
        if(players[id].paint == true){
            var pointsBefore = players[id].points;
            painter.reset_analysis(players[id]);
            if(players[id].points > pointsBefore) {
                sendUpdate(players[id].points, players[id].color, 'true', response.UPDATESCORES);
            }

        }
        sendUpdate(0, 0, 'true', response.MOUSEUP);
    });
}

Array.prototype.equals = function (array) {
    // if the other array is a falsy value, return
    if (!array)
        return false;

    // compare lengths - can save a lot of time
    if (this.length != array.length)
        return false;

    for (var i = 0, l=this.length; i < l; i++) {
        // Check if we have nested arrays
        if (this[i] instanceof Array && array[i] instanceof Array) {
            // recurse into the nested arrays
            if (!this[i].equals(array[i]))
                return false;
        }
        else if (this[i] != array[i]) {
            // Warning - two different object instances will never be equal: {x:20} != {x:20}
            return false;
        }
    }
    return true;
}

module.exports = {
    Player:Player,
    Painter:Painter,
    setUpCallBacks: setUpCallBacks
};