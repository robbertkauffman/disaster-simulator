module.exports = {
  addEvent: addEvent,
  generateInsertDoc: generateInsertDoc,
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

function generateInsertDoc(student_id) {
  return {
    student_id: student_id || Math.floor(Math.random() * 9999) + 1,
    scores: [
      {
        type: "exam",
        score: Math.random() * 100
      },
      {
        type: "quiz",
        score: Math.random() * 100
      },
      {
        type: "homework",
        score: Math.random() * 100
      },
      {
        type: "home",
        score: Math.random() * 100
      }
    ],
    class_id: Math.floor(Math.random() * 500) + 1
  };
}

function printWithTimestamp(msg) {
  console.log(`${new Date().toISOString()}: ${msg}`);
}