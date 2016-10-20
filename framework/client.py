import json
import asyncio
from autobahn.asyncio.websocket import WebSocketClientProtocol
from autobahn.asyncio.websocket import WebSocketClientFactory
from concurrent.futures import ProcessPoolExecutor

class SAVNConnectionAssistant:
  def __init__(self, simulationId):
    self.simulationId = simulationId
    self.loop = asyncio.get_event_loop()
    self.p = ProcessPoolExecutor(2)

  def updateCarRoutes(self, routeData):
    self.protocol.sendMessage(json.dumps(routeData).encode('utf8')) 

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
        self.sendMessage(json.dumps(
                            connectionAssistant.simulationId).encode('utf8'))
        # validate the simulationId/APIKey

      def onMessage(self, payload, isBinary):
        def isInitialParams(obj):
          return obj["timestamp"] == 0

        obj = json.loads(payload.decode('utf8'))
        if isInitialParams(obj):
          connectionAssistant.loop.run_in_executor(connectionAssistant.p,
                  connectionAssistant.handleSimulationStart, obj)
        else:
          connectionAssistant.loop.run_in_executor(connectionAssistant.p,
                  connectionAssistant.handleSimulationDataUpdate, obj)

      def onClose(self, wasClean, code, reason):
        connectionAssistant.handleSimulationStop()
    
    return FrameworkClientProtocol


  def initSession(self):

    factory = WebSocketClientFactory()
    factory.protocol = self.protocolFactory() 

    coro = self.loop.create_connection(factory, '127.0.0.1', 9000)
    (_, protocol) = self.loop.run_until_complete(coro)
    self.protocol = protocol
    self.loop.run_forever()
    self.loop.close()

