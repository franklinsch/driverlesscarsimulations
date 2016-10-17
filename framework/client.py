import json
import asyncio
from autobahn.asyncio.websocket import WebSocketClientProtocol
from autobahn.asyncio.websocket import WebSocketClientFactory
from concurrent.futures import ProcessPoolExecutor

class SAVNConnectionAssistant:
  def updateCarRoute(self, routeData):
    pass

  def handleSimulationStart(self, initialParameters):
    print("YAY") 
    # new thread
    while True:
      pass

  def handleSimulationDataUpdate(self, updates):
   print("YO") 

  def handleSimulationStop(self):
    pass

  def initSession(self, simulationId):
    connectionAssistant = self
    class FrameworkClientProtocol(WebSocketClientProtocol):
      def onOpen(self):
        print(simulationId)
        # validate the simulationId/APIKey
    
      async def onMessage(self, payload, isBinary):
        print(payload.decode('utf8')) 
        def isInitialParams(obj):
          return obj["timestamp"] == 0
        
        obj = json.loads(payload.decode('utf8'))
        p = ProcessPoolExecutor(2)
        if isInitialParams(obj):
          loop.run_in_executor(p, 
                  connectionAssistant.handleSimulationStart, obj)
        else:
          loop.run_in_executor(p,
                  connectionAssistant.handleSimulationDataUpdate, obj)
    
      def onClose(self, wasClean, code, reason):
        connectionAssistant.handleSimulationStop()

    factory = WebSocketClientFactory()
    factory.protocol = FrameworkClientProtocol 
    
    loop = asyncio.get_event_loop()

    coro = loop.create_connection(factory, '127.0.0.1', 9000)
  
    loop.run_until_complete(coro)
    loop.run_forever();

connectionAssistant = SAVNConnectionAssistant()
connectionAssistant.initSession(42)
