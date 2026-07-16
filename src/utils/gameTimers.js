const timers = new Map();

function setRoomTimer(roomCode, timer) {
    timers.set(roomCode, timer);
}

function getRoomTimer(roomCode) {
    return timers.get(roomCode);
}

function clearRoomTimer(roomCode) {

    if (timers.has(roomCode)) {

        clearTimeout(timers.get(roomCode));

        timers.delete(roomCode);

    }

}

module.exports = {
    setRoomTimer,
    getRoomTimer,
    clearRoomTimer
};