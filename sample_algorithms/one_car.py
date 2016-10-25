import sys
import time
import math
sys.path.append('../framework')

import client
import route
import geojson

from copy import deepcopy

class ConnectionAssistant(client.SAVNConnectionAssistant):

  def handleSimulationStart(self, initialParameters):
    #getGeojson(, 'map.geojson')
    print('Starting simulation:')
    print('\tSending data every ' + str(SLEEP_TIME) + ' seconds')
    state = setupCars(1)
    timestamp = 0
    #for i in range(50):
    while True:
      #useApi()
      state = algo(state)
      timestamp += TIMESLICE
      savn.updateCarStates(timestamp, translate(state))
      time.sleep(SLEEP_TIME)
    #useApiToEnd()

  def handleSimulationDataUpdate(self, update):
    pass

  def handleSimulationStop(self):
    pass

SLEEP_TIME = 0.1
TIMESLICE = 1
CONST_SPEED = 50

start = {"geometry": {"type": "Point", "coordinates": [4.778602, 50.6840807]}, "type": "Feature", "properties": {}}
end = {"geometry": {"type": "Point", "coordinates": [4.7942264, 50.6814472]}, "type": "Feature", "properties": {}}

BASE_ROUTE = route.getRoute('map.geojson', geojson.dumps(start).encode('utf8'), geojson.dumps(end).encode('utf8'))['path']
#BASE_ROUTE = {'source': [50.68166, 4.78482], 'destination': [50.68166, 4.78482], 'path':
#    [{'start': [50.68166, 4.78482], 'end': [50.68347, 4.78482], 'direction': 1, 'timeLeft': 2, 'totalTime': 2},
#     {'start': [50.68347, 4.78482], 'end': [50.68347, 4.78780], 'direction': 2, 'timeLeft': 2, 'totalTime': 2},
#     {'start': [50.68347, 4.78780], 'end': [50.68166, 4.78780], 'direction': 3, 'timeLeft': 2, 'totalTime': 2},
#     {'start': [50.68166, 4.78780], 'end': [50.68166, 4.78482], 'direction': 4, 'timeLeft': 2, 'totalTime': 2}]}

def get_direction(start, end):
  lat1 = math.radians(start[0])
  lng1 = math.radians(start[1])
  lat2 = math.radians(end[0])
  lng2 = math.radians(end[1])
  d_long = lng2-lng1
  y = math.sin(d_long)*math.cos(lat2)
  x = math.cos(lat1)*math.sin(lat2)-math.sin(lat1)*math.cos(lat2)*math.cos(d_long)
  return math.degrees(math.atan2(y, x))

def add(v1, v2):
  return [v1[0]+v2[0], v1[1]+v2[1]]

def sub(v1, v2):
  return [v1[0]-v2[0], v1[1]-v2[1]]

def scale(v, s):
  return [s*v[0], s*v[1]]

def scheduleNewRoute(car):
  car['route'] = deepcopy(BASE_ROUTE)
  car['position'] = BASE_ROUTE[0]
  car['direction'] = get_direction(car['route'][0], car['route'][1])

#def moveCar(car):
#  timeLeft = TIMESLICE
#  while(timeLeft > 0):
#    if(car['route']['path'][0]['timeLeft'] <= timeLeft):
#      timeLeft -= car['route']['path'][0]['timeLeft']
#      del car['route']['path'][0]
#      if(len(car['route']['path']) == 0):
#        timeLeft = 0
#        car['route']['path'] = None
#      else:
#        car['direction'] = car['route']['path'][0]['direction']
#    else:
#      car['route']['path'][0]['timeLeft'] -= timeLeft
#      timeLeft = 0
#  if(car['route']['path'] == None):
#    car['position'] = car['route']['destination']
#    scheduleNewRoute(car)
#  else:
#    end = car['route']['path'][0]['end']
#    start = car['route']['path'][0]['start']
#    timeLeft = car['route']['path'][0]['timeLeft']
#    totalTime = car['route']['path'][0]['totalTime']
#    car['position'] = add(end, scale(sub(start, end), timeLeft/totalTime))

def moveCar(car):
  car['timeOnPath'] += TIMESLICE
  start = car['route'][0]
  end = car['route'][1]
  car['position'] = add(start, scale(sub(end, start), car['timeOnPath']/CONST_SPEED))

  if(car['timeOnPath'] == CONST_SPEED):
    del car['route'][0]
    car['timeOnPath'] = 0
    if(len(car['route']) == 1):
      scheduleNewRoute(car)
    else:
      car['direction'] = get_direction(start, end)

def algo(state):
  for car in state:
    moveCar(car)
  return state

def setupCars(numCars):
  cars = []
  for i in range(numCars):
    car = {'id': i, 'type': 'car', 'position': None, 'speed': CONST_SPEED, 'direction': 0, 'route': None, 'sensorData': None, 'timeOnPath': 0}
    cars += [car]
    scheduleNewRoute(car)
  return cars

def translate(state):
  res = []
  for car in state:
    res += [{'id': car['id'], 'type': car['type'], 'position': {'lat': car['position'][1], 'lng': car['position'][0]}}]
  return res

if len(sys.argv) != 2:
  sys.exit(1)

simulationId = sys.argv[1]
savn = ConnectionAssistant(simulationId)
savn.initSession()

sys.exit(0)
