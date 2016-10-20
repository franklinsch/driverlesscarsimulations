import sys
sys.path.append("..")
from client import SAVNConnectionAssistant
import json
import unittest
from unittest.mock import MagicMock

class TestFrameworkClientMethods(unittest.TestCase):
  def setUp(self):
    self.connection = SAVNConnectionAssistant(42)
    self.connection.protocol = self.connection.protocolFactory()()
    self.connection.protocol.sendMessage = MagicMock()

  def test_updateCarRoutes(self):
    obj = {"car": 1}
    self.connection.updateCarRoutes(obj)
    self.connection.protocol.sendMessage.assert_called_with(json.dumps(obj).encode('utf8'))

class TestimportoFrameworkClientProtocol(unittest.TestCase):
  def setUp(self):
    self.savn = SAVNConnectionAssistant(42)
    self.protocol= self.savn.protocolFactory()()
    self.savn.handleSimulationStop= MagicMock()
    self.savn.loop.run_in_executor = MagicMock()
    self.protocol.sendMessage = MagicMock()

  def test_onOpen(self):
    arg = json.dumps(42).encode('utf8')
    self.protocol.onOpen()
    self.protocol.sendMessage.assert_called_with(arg)

  def test_onClose(self):
    self.protocol.onClose(True, 0, "reason")
    self.savn.handleSimulationStop.assert_called_with()

  def test_onMessageInitialParameters(self):
    obj = {"timestamp": 0}
    json_str = json.dumps(obj).encode('utf8')
    self.protocol.onMessage(json_str, False)
    self.savn.loop.run_in_executor.assert_called_with(
        self.savn.p, self.savn.handleSimulationStart, obj)

  def test_onMessageDataUpdate(self):
    obj = {"timestamp": 1}
    json_str = json.dumps(obj).encode('utf8')
    self.protocol.onMessage(json_str, False)
    self.savn.loop.run_in_executor.assert_called_with(
        self.savn.p, self.savn.handleSimulationDataUpdate, obj)


if __name__ == "__main__":
  unittest.main()
