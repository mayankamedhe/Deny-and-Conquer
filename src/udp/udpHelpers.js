const dgram = require("dgram");

const MAIN = 16540;
const ports = {
    MAIN: 16540,
    LOCAL_1: MAIN + 1,
    LOCAL_2: MAIN + 2,
    LOCAL_3: MAIN + 3,
    LOCAL_4: MAIN + 4,
};

const response = {
    STARTED: 1,
    FAIL: 2,
    SOCKET: 3,
    SAVED: 4,
    UPDATESTATE: 5,
    NEWPLAYER: 6,
    MOUSEUP: 7,
    OPTIONS: 8,
    UPDATESCORES: 9,
    GAMEEND: 10

};

const header = {
    SIZE: 7,
    TIMESTAMP_SIZE: 6,
    ID_SIZE: 1
};

const colors = {
    RED: 'red',
    BLUE: 'blue',
    GREEN: 'green',
    PINK: 'pink'
};

const colorIndexes = {
    1: colors.RED,
    2: colors.BLUE,
    3: colors.GREEN,
    4: colors.PINK
};

var helpers = {
    ports,
    header,
    response,
    colors,
    colorIndexes

}

module.exports = helpers;