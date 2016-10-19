import json
import asyncio
from autobahn.asyncio.websocket import WebSocketClientProtocol
from autobahn.asyncio.websocket import WebSocketClientFactory
from concurrent.futures import ProcessPoolExecutor

class SAVNConnectionAssistant:
  def __init__(self, simulationId):
    self.simulationId = simulationId

  def updateCarStates(self, simulationId, timestamp, state):
    self.protocol.sendMessage(json.dumps({'type': 'simulation-state', 'content': {'id': simulationId+timestamp, 'timestamp': timestamp, 'objects': state}}).encode('utf8'))

  def handleSimulationStart(self, initialParameters):
    pass

  def handleSimulationDataUpdate(self, updates):
    pass

  def handleSimulationStop(self):
    pass

  def protocolFactory(self):
    connectionAssistant = self
    class FrameworkClientProtocol(WebSocketClientProtocol):
      def onOpen(self):
        self.sendMessage(json.dumps({{'type': 'simulation-start', content: {'simulationId': connectionAssistant.simulationId}}).encode('utf8'))
        # validate the simulationId/APIKey

      def onMessage(self, payload, isBinary):
        def isInitialParams(obj):
          return obj["timestamp"] == 0

        obj = json.loads(payload.decode('utf8'))
        if isInitialParams(obj):
          loop.run_in_executor(p,
                  connectionAssistant.handleSimulationStart, obj)
        else:
          loop.run_in_executor(p,
                  connectionAssistant.handleSimulationDataUpdate, obj)

      def onClose(self, wasClean, code, reason):
        connectionAssistant.handleSimulationStop()

    return FrameworkClientProtocol

  def initSession(self):
    factory = WebSocketClientFactory()
    factory.protocol = self.protocolFactory()
    self.send = factory.protocol.sendMessage

    coro = loop.create_connection(factory, '127.0.0.1', 9000)
    loop.run_until_complete(coro)
    loop.run_forever()
    loop.close()

p = ProcessPoolExecutor(2)
loop = asyncio.get_event_loop()
