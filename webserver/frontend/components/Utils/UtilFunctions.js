export default class UtilFunctions {
  static socketMessage() {
    return {
      date: Date.now()
    }
  }

  static sendSocketMessage(socket, content, message) {
    if (socket && socket.readyState === 1) {
      socket.send(JSON.stringify({
        ...UtilFunctions.socketMessage(),
        type: type,
        content: simulationSettings
      }))
    } else {
      console.error("Could not send socket message because the socket is not able to send");
    }
  }
}
