import json
import asyncio
import websockets
import sys
import threading

import os

HOST_IP = 'localhost' if 'SAVN_ENV' in os.environ else '35.160.255.102'

HOST = 'ws://' + HOST_IP + ':9000'

loop = asyncio.get_event_loop()

class SAVNConnectionAssistant:
  def __init__(self, simulationId):
    self.simulationId = simulationId
    self.messageQueue = asyncio.Queue()

  def updateCarStates(self, timestamp, state):
    packet = {'type': 'simulation-state',
              'content':
                {'simulationId': self.simulationId,
                 'id': str(timestamp),
                 'timestamp': timestamp,
                 'formattedTimestamp': str(timestamp),
                 'objects': state }}
    asyncio.run_coroutine_threadsafe(self.messageQueue.put(json.dumps(packet)),
      loop)

  def handleSimulationStart(self, initialParameters):
    pass

  def handleSimulationDataUpdate(self, updates):
    pass

  def handleSimulationStop(self, packet):
    pass

  async def fetchMessage(self):
    message = await self.messageQueue.get()
    return message

  async def startConnection(self, timeslice):
    packet = {'type': 'simulation-start', 'content': {'simulationId': self.simulationId, 'timeslice': timeslice}}
    await self.ws.send(json.dumps(packet))

  async def handlerLoop(self):
    #We handle the connection whilst the simulation is alive
    while self.active:
      await self.handler()

  async def handler(self):
      listener_task = asyncio.ensure_future(self.ws.recv())
      producer_task = asyncio.ensure_future(self.fetchMessage())
      done, pending = await asyncio.wait([listener_task, producer_task],
                                         return_when=asyncio.FIRST_COMPLETED)

      if producer_task in done:
        packet = producer_task.result()
        await self.ws.send(packet)
      else:
        producer_task.cancel()

      #if the connection is dead we will reach this point
      if not self.alive:
        self.active = False
        for fut in pending:
          fut.cancel()
        return

      if listener_task in done:
        message = listener_task.result()
        packet = json.loads(message)
        loop.run_in_executor(None, self.onMessage, packet)
      else:
        listener_task.cancel()

  def onMessage(self, packet):
    def isError():
      return packet["type"] == "simulation-error"

    def isInitialParams():
      return packet["type"] == "simulation-start-parameters"

    def isClose():
      return packet["type"] == "simulation-close"

    def isUpdate():
      return packet["type"] == "simulation-update"

    if isError():
      print(packet["content"])
      #print(packet["content"]["reason"])
    elif isInitialParams():
      self.handleSimulationStart(packet["content"])
    elif isClose():
      self.handleSimulationStop(packet["content"])
      #At this point the actual algorithm must have made sure it will terminate
      self.alive = False
      #The connection is officialy dead we need to terminate the handling loop,
      #to achieve this we populate the message queue with a confirmation packet
      packet = {'type': 'simulation-close', 'content': {'simulationId': self.simulationId}}
      asyncio.run_coroutine_threadsafe(self.messageQueue.put(json.dumps(packet)),
      loop)
    elif isUpdate():
      self.handleSimulationDataUpdate(packet["content"])


  def initSession(self, timeslice):
    async def coro():
      async with websockets.connect(HOST) as websocket:
        self.ws = websocket
        await self.startConnection(timeslice)
        self.alive = True
        self.active = True
        await self.handlerLoop()

    loop.run_until_complete(coro())

