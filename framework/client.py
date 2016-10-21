import json
import asyncio
import websockets
import sys
from concurrent.futures import ProcessPoolExecutor




HOST = 'ws://localhost:9000'
p = ProcessPoolExecutor(2)
loop = asyncio.get_event_loop()

class SAVNConnectionAssistant:
  def __init__(self, simulationId):
    self.simulationId = simulationId
    self.messageQueue = asyncio.Queue()

  async def updateCarStates(self, timestamp, state):
    packet = {'type': 'simulation-state',
              'content': 
                {'simulationId': self.simulationId,
                 'id': str(timestamp),
                 'timestamp': timestamp,
                 'objects': state }}
    await self.messageQueue.put(json.dumps(packet))

  async def handleSimulationStart(self, initialParameters):
    ip = initialParameters["content"]
    await self.updateCarStates(ip["timestamp"], ip["objects"])  

  async def handleSimulationDataUpdate(self, updates):
    pass

  def handleSimulationStop(self, packet):
    pass

  async def fetchMessage(self):
    return await self.messageQueue.get()

  async def handler(self):
    async with websockets.connect(HOST) as websocket:
      packet = {'type': 
                  'simulation-start',
                'content': 
                    {'simulationId':
                        self.simulationId}}
      await websocket.send(json.dumps(packet))

      while True:
        listener_task = asyncio.ensure_future(websocket.recv())
        producer_task = asyncio.ensure_future(self.fetchMessage())
        done, pending = await asyncio.wait([listener_task, producer_task],
                                           return_when=asyncio.FIRST_COMPLETED)
        if listener_task in done:
          message = listener_task.result()
          await self.onMessage(json.loads(message))
        else:
          listener_task.cancel()

        if producer_task in done:
          packet = producer_task.result()
          await websocket.send(packet)
        else:
          producer_task.cancel()

  async def onMessage(self, packet):
    def isError(packet):
      return packet["type"] == "simulation-error"

    def isInitialParams(packet):
      return packet["type"] == "simulation-info"

    def isClose(packet):
      return packet["type"] == "close"

    if isError(packet):
      print(packet["content"]["reason"])
      sys.exit()
    elif isInitialParams(packet):
      await self.handleSimulationStart(packet)
    elif:
      await self.handleSimulationStop(packet)
    else:
    await self.handleSimulationDataUpdate(packet)


  def initSession(self):
    loop.run_until_complete(savn.handler())
    #loop.run_forever() 


savn = SAVNConnectionAssistant(42)
savn.initSession()
