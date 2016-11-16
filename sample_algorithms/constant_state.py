import sys
import time
import math
sys.path.append('../framework')

import client
import route
import geojson
import os.path

from copy import deepcopy

state = []

TIMESLICE = 1

class ConnectionAssistant(client.SAVNConnectionAssistant):

  def handleSimulationStart(self, initialParameters):
    print("Simulation started")
    timestamp = 0
    state = [{'speed': 40, 'direction': 26.564368396155714, 'route': [[4.778602, 50.6840807], [4.7806405, 50.6834349, {'totalTime': 14.451366704186839, 'timeLeft': 14.451366704186839}], [4.7825824, 50.6829387, {'totalTime': 13.276908479155743, 'timeLeft': 13.276908479155743}], [4.7874197, 50.6825434, {'totalTime': 30.92698313740777, 'timeLeft': 30.92698313740777}], [4.7892558, 50.6824288, {'totalTime': 11.698974671061931, 'timeLeft': 11.698974671061931}], [4.7905647, 50.6822793, {'totalTime': 8.433467550176449, 'timeLeft': 8.433467550176449}], [4.7918953, 50.6820401, {'totalTime': 8.770339829378404, 'timeLeft': 8.770339829378404}], [4.7920023, 50.6820209, {'totalTime': 0.7051712081936613, 'timeLeft': 0.7051712081936613}], [4.7929465, 50.681851, {'totalTime': 6.223945957408875, 'timeLeft': 6.223945957408875}], [4.7934554, 50.6817269, {'totalTime': 3.457697338029297, 'timeLeft': 3.457697338029297}], [4.7939013, 50.6815791, {'totalTime': 3.1909922872209573, 'timeLeft': 3.1909922872209573}], [4.7942264, 50.6814472, {'totalTime': 2.4478795400220217, 'timeLeft': 2.4478795400220217}]], 'objectType': 'car', 'id': '999', 'position': {'lng': 4.778602, 'lat': 50.6840807}}]
    while self.alive:
      savn.updateCarStates(timestamp, state)
      print("Sent simulation state")
      time.sleep(1)
      timestamp += TIMESLICE

  def handleSimulationStop(self, packet):
    pass

if(len(sys.argv) != 2):
  sys.exit(1)

simulationId = sys.argv[1]
savn = ConnectionAssistant(simulationId)
savn.initSession(TIMESLICE)
