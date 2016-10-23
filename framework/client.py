import json
import asyncio
import sys
from autobahn.asyncio.websocket import WebSocketClientProtocol
from autobahn.asyncio.websocket import WebSocketClientFactory
from concurrent.futures import ProcessPoolExecutor

class SAVNConnectionAssistant:
  def __init__(self, simulationId):
    self.simulationId = simulationId

  def updateCarStates(self, simulationId, timestamp, state):
    factory.__proto__.sendMessage(json.dumps({'type': 'simulation-state', 'content': {'simulationId': simulationId, 'id': str(timestamp), 'timestamp': timestamp, 'objects': state}}).encode('utf8'))

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
        self.factory.__proto__ = self
        self.sendMessage(json.dumps({'type': 'simulation-start', 'content': {'simulationId': connectionAssistant.simulationId}}).encode('utf8'))
        # validate the simulationId/APIKey

      def onMessage(self, payload, isBinary):
        def isError(obj):
          return obj["type"] == "simulation-error"

        def isInitialParams(obj):
          return obj["type"] == "simulation-info"

        obj = json.loads(payload.decode('utf8'))
        print(obj)
        if isError(obj):
          sys.exit()
        elif isInitialParams(obj):
          loop.run_in_executor(p,
                  connectionAssistant.handleSimulationStart, obj)
        else:
          loop.run_in_executor(p,
                  connectionAssistant.handleSimulationDataUpdate, obj)

      def onClose(self, wasClean, code, reason):
        self.factory.__proto__ = None
        connectionAssistant.handleSimulationStop()

    return FrameworkClientProtocol

  def initSession(self):
    factory.protocol = self.protocolFactory()

    coro = loop.create_connection(factory, '127.0.0.1', 9000)
    loop.run_until_complete(coro)
    loop.run_forever()
    loop.close()

factory = WebSocketClientFactory()
p = ProcessPoolExecutor(2)
loop = asyncio.get_event_loop()
