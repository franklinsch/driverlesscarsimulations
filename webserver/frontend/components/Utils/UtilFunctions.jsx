export default class UtilFunctions {
  static socketMessage() {
    return {
      date: Date.now()
    }
  }

  static sendSocketMessage(socket, type, content) {
    if (socket && socket.readyState === 1) {
      var message = JSON.stringify({
        ...UtilFunctions.socketMessage(),
        type: type,
        content: content
      })

      socket.send(message);
    } else {
      console.error("Could not send socket message because the socket is not able to send");
    }
  }

  static session_length = 600; // in seconds
}
