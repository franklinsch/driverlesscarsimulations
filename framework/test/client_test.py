import sys
sys.path.append("..")
from client import SAVNConnectionAssistant
import json
import unittest
import asyncio
from unittest.mock import Mock

class AsyncMock(Mock):
  def __call__(self, *args, **kwargs):
    parent = super(AsyncMock, self)
    async def coro():
      return parent.__call__(*args, **kwargs)
    return coro()

  def __await__(self):
    return self().__await__()

class TestFrameworkClientMethods(unittest.TestCase):
  def setUp(self):
    self.connection = SAVNConnectionAssistant(42)
    self.connection.alive = True
    self.connection.ws = Mock()
    self.loop = asyncio.get_event_loop()

  def test_updateState(self):
    state = {"car": 1}
    timestamp = 0
    packet = {'type': 'simulation-state',
              'content':
                {'simulationID': self.connection.simulationID,
                 'timestamp': timestamp,
                 'objects': state,
                 'frameworkID': 0}}
    self.connection.updateState(timestamp, state, sync=False)
    message = self.loop.run_until_complete(self.connection.fetchMessage())
    self.assertEqual(packet, message)

  def test_message_reception(self):
    self.loop.run_in_executor = Mock()
    msg = {'content': 'fish'}
    async def op():
       return json.dumps(msg)
    self.connection.ws.recv = op
    self.loop.run_until_complete(self.connection.handler())
    self.loop.run_in_executor.assert_called_with(None,
        self.connection.onMessage,{'content': 'fish'})

  def test_messageQueue_drainage(self):
    self.loop.run_in_executor = Mock()
    packet = {'content': 'fish'}
    async def op():
      await asyncio.sleep(100)
    self.connection.ws.recv = op
    self.connection.send_packet = AsyncMock()
    msg = json.dumps(packet)
    self.connection.messageQueue.put_nowait(msg)
    self.loop.run_until_complete(self.connection.handler())
    self.connection.send_packet.assert_called_with(msg)

  def test_simulationStart(self):
    self.connection.handleSimulationStart = Mock()
    packet = {'type': 'simulation-start-parameters', 'content': {'frameworkID': 0}}
    self.connection.onMessage(packet)
    self.connection.handleSimulationStart.assert_called_with(packet['content'])

  def test_simulationStop(self):
    self.connection.handleSimulationStop = Mock()
    packet = {'type': 'simulation-close', 'content': {}}
    self.connection.onMessage(packet)
    self.connection.handleSimulationStop.assert_called_with(packet['content'])

  def test_simulationDataUpdate(self):
    self.connection.handleSimulationDataUpdate = Mock()
    packet = {'type': 'simulation-update', 'content': {}}
    self.connection.onMessage(packet)
    self.connection.handleSimulationDataUpdate.assert_called_with(packet['content'])
