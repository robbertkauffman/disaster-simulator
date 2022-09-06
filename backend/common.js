module.exports = {
  addEvent: addEvent,
  printWithTimestamp: printWithTimestamp
};

function addEvent(msg, io, date = new Date()) {
  try {
    io.emit('logEvent', {
      message: msg,
      date: date
    });
  } catch (e) {
    printWithTimestamp(`Error while emitting event '${msg}': ${e}`);
  }
}

function printWithTimestamp(msg) {
  console.log(`${new Date().toISOString()}: ${msg}`);
}