import json
import asyncio
import websockets
import sys
import threading
import time
import requests
import os

HOST_IP = 'localhost' if 'SAVN_ENV' in os.environ else '35.160.255.102'

HOST = 'ws://' + HOST_IP + ':9000'

AUTHENTICATION_ROUTE = 'http://' + HOST_IP + ':3000' + '/framework_api'

loop = asyncio.get_event_loop()

class SAVNConnectionAssistant:
  def __init__(self, simulationID=None):
    self.simulationID = simulationID
    self.messageQueue = asyncio.Queue()
    self.frameworkID = 0
    self.shouldAwait = False

  def updateState(self, timestamp, state, sync=True):
    packet = {'type': 'simulation-state',
              'content':
                {'simulationID': self.simulationID,
                 'timestamp': timestamp,
                 'objects': state,
                 'frameworkID': self.frameworkID}}
    asyncio.run_coroutine_threadsafe(self.messageQueue.put(packet),
      loop)
    if (sync):
      self.synchronize()

  def completeObjectJourney(self, timestamp, journeyStart, journeyID):
    packet = {'type': 'simulation-journey-complete',
              'content':
                {'simulationID': self.simulationID,
                 'timestamp': timestamp,
                 'journeyStart': journeyStart,
                 'journeyID': journeyID,
                 'frameworkID': self.frameworkID}}
    asyncio.run_coroutine_threadsafe(self.messageQueue.put(packet),
      loop)

  #returns a tuple of api_id, and api_key  
  def getAPIKeys():
    pass

  def handleSimulationStart(self, initialParameters):
    pass

  def handleSimulationDataUpdate(self, updates):
    pass

  def handleSimulationCommunication(self, data):
    pass

  def handleSimulationStop(self, packet):
    pass

  async def fetchMessage(self):
    message = await self.messageQueue.get()
    return message

  async def startConnection(self, timeslice):
    packet = {'type': 'simulation-start', 'content': {'simulationID': self.simulationID, 'timeslice': timeslice}}
    await self.send_packet(packet)

  async def send_packet(packet):
    packet['token'] = self.token
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
        await self.send_packet(packet)
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

    def isCommunication():
      return packet["type"] == "simulation-communicate"

    if isError():
      print(packet["content"])
      #print(packet["content"]["reason"])
    elif isInitialParams():
      self.frameworkID = packet["content"]["frameworkID"]
      self.handleSimulationStart(packet["content"])
    elif isClose():
      self.handleSimulationStop(packet["content"])
      #At this point the actual algorithm must have made sure it will terminate
      self.alive = False
      #The connection is officialy dead we need to terminate the handling loop,
      #to achieve this we populate the message queue with a confirmation packet
      packet = {'type': 'simulation-close', 'content': {'simulationID': self.simulationID}}
      asyncio.run_coroutine_threadsafe(self.messageQueue.put(packet),
      loop)
    elif isUpdate():
      self.handleSimulationDataUpdate(packet["content"])
    elif isCommunication():
      print("\n\nReceived go-ahead at ", time.time())
      self.handleSimulationCommunication(packet["content"])
      self.shouldAwait = False

  def synchronize(self, sleepTime=1):
    self.shouldAwait = True
    while (self.shouldAwait):
      time.sleep(sleepTime)

  def authenticate():
    api_id, api_key = getAPIKeys()
    payload = {
      'api_id': api_id, 
      'api_key': api_key, 
      'simulationID': self.simulationID
    }
    r = requests.post(AUTHENTICATION_ROUTE, data=payload)
    if r.status_code == 200:
      data = r.json()
      if not self.simulationID:
        self.simulationID = data.activeSimulationID
      self.token = data.token
    else:
      r.raise_for_status()

  def initSession(self, timeslice):
    async def coro():
      authenticate()
      if not self.simulationID:
      async with websockets.connect(HOST) as websocket:
        self.ws = websocket
        await self.startConnection(timeslice)
        self.alive = True
        self.active = True
        await self.handlerLoop()

    loop.run_until_complete(coro())

