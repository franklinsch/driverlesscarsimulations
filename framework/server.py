import json
import asyncio
from autobahn.asyncio.websocket import WebSocketClientProtocol
from autobahn.asyncio.websocket import WebSocketClientFactory

def initSession(simulationId):
  class FrameworkClientProtocol(WebSocketClientProtocol):
    def onOpen(self):
      print(simulationId)
      # validate the simulationId/APIKey
  
    def onMessage(self, payload, isBinary):
      print(payload.decode('utf8'))
      #obj = json.loads(payload.decode('utf8'))
      #if isInitialParams(obj):
      #  handleSimulationStart(obj)
      #else:
      #  handleSimulationDataUpdate(obj);
      ### figure out what api stub wrapper to call and await for the result
      ### probably handleSimulationDataUpdate
      ### send back the results to the backend
  
    def onClose(self, wasClean, code, reason):
      if reason:
        print(reason)
      print(42)

  factory = WebSocketClientFactory()
  factory.protocol = FrameworkClientProtocol 
  
  coro = loop.create_connection(factory, '127.0.0.1', 9000)

  loop.run_until_complete(coro)

loop = asyncio.get_event_loop()
initSession(42)
loop.run_forever()


