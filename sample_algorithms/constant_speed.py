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

SLEEP_TIME = 1
TIMESLICE = 1
CONST_SPEED_KM_H = 40
CONST_SPEED = CONST_SPEED_KM_H * (1000 / 3600)

class ConnectionAssistant(client.SAVNConnectionAssistant):

  def handleSimulationStart(self, initialParameters):
    south = initialParameters['simulationStartParameters']['city']['bounds']['southWest']['lat']
    west = initialParameters['simulationStartParameters']['city']['bounds']['southWest']['lng']
    north = initialParameters['simulationStartParameters']['city']['bounds']['northEast']['lat']
    east = initialParameters['simulationStartParameters']['city']['bounds']['northEast']['lng']
    route.saveGeojson(south, west, north, east, 'map.geojson')

    start = {"geometry": {"type": "Point", "coordinates": [4.778602, 50.6840807]}, "type": "Feature", "properties": {}}
    end = {"geometry": {"type": "Point", "coordinates": [4.7942264, 50.6814472]}, "type": "Feature", "properties": {}}

    BASE_ROUTE = route.getRoute('map.geojson', start, end)['path']
    preprocess(BASE_ROUTE)

    print('Starting simulation:')
    print('\tSending data every ' + str(SLEEP_TIME) + ' seconds')
    global state
    state = setupCars(1, BASE_ROUTE)
    addToState(initialParameters['simulationStartParameters']['journeys'], state)
    timestamp = 0
    #for i in range(50):
    while True:
      #useApi()
      savn.updateCarStates(timestamp, translate(state))
      state = algo(state)
      timestamp += TIMESLICE
      time.sleep(SLEEP_TIME)
    #useApiToEnd()

  def handleSimulationDataUpdate(self, update):
    addToState(update['journeys'], state)

  def handleSimulationStop(self):
    pass

def addToState(journeys, state):
  for journey in journeys:
    start = {"geometry": {"type": "Point", "coordinates": [journey['origin']['lng'], journey['origin']['lat']]}, "type": "Feature", "properties": {}}
    end = {"geometry": {"type": "Point", "coordinates": [journey['destination']['lng'], journey['destination']['lat']]}, "type": "Feature", "properties": {}}
    newRoute = route.getRoute('map.geojson', start, end)['path']
    preprocess(newRoute)
    state.append(newCar(len(state), baseRoute=newRoute))

def get_distance(start, end):
  lat1 = math.radians(start[1])
  lng1 = math.radians(start[0])
  lat2 = math.radians(end[1])
  lng2 = math.radians(end[0])
  d_lat = lat2-lat1
  d_lng = lng2-lng1
  a = math.sin(d_lat/2)**2 + math.cos(lat1)*math.cos(lat2)*math.sin(d_lng/2)**2
  c = 2*math.atan2(math.sqrt(a), math.sqrt(1-a))
  R = 6371e3

  return R*c

def get_direction(start, end):
  lat1 = math.radians(start[1])
  lng1 = math.radians(start[0])
  lat2 = math.radians(end[1])
  lng2 = math.radians(end[0])
  d_lng = lng2-lng1
  y = math.sin(d_lng)*math.cos(lat2)
  x = math.cos(lat1)*math.sin(lat2)-math.sin(lat1)*math.cos(lat2)*math.cos(d_lng)
  return (math.degrees(math.atan2(y, x))+270)%360

def preprocess(route):
  for i in range(len(route)-1):
    start = route[i]
    end = route[i+1]
    dist = get_distance(start, end)
    time = dist/CONST_SPEED
    end.append({'timeLeft': time, 'totalTime': time})

def add(v1, v2):
  return [v1[0]+v2[0], v1[1]+v2[1]]

def sub(v1, v2):
  return [v1[0]-v2[0], v1[1]-v2[1]]

def scale(v, s):
  return [s*v[0], s*v[1]]

def scheduleNewRoute(car):
  car['route'] = deepcopy(car['baseRoute'])
  car['position'] = car['baseRoute'][0]
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

#def moveCar(car):
#  car['timeOnPath'] += TIMESLICE
#  start = car['route'][0]
#  end = car['route'][1]
#  car['position'] = add(start, scale(sub(end, start), car['timeOnPath']/CONST_SPEED))
#
#  if(car['timeOnPath'] == CONST_SPEED):
#    del car['route'][0]
#    car['timeOnPath'] = 0
#    if(len(car['route']) == 1):
#      scheduleNewRoute(car)
#    else:
#      car['direction'] = get_direction(start, end)

def moveCar(car):
  timeLeft = TIMESLICE
  start = car['route'][0]
  end = car['route'][1]
  while(timeLeft > 0):
    if(end[2]['timeLeft'] <= timeLeft):
      timeLeft -= end[2]['timeLeft']
      end[2]['timeLeft'] = 0
      del car['route'][0]
      if(len(car['route']) == 1):
        timeLeft = 0
        car['route'] = None
      else:
        start = end
        end = car['route'][1]
        car['direction'] = get_direction(start, end)
    else:
      end[2]['timeLeft'] -= timeLeft
      timeLeft = 0
  if(car['route'] == None):
    car['position'] = end
    scheduleNewRoute(car)
  else:
    timeLeft = end[2]['timeLeft']
    totalTime = end[2]['totalTime']
    car['position'] = add(end, scale(sub(start, end), timeLeft/totalTime))

def algo(state):
  for car in state:
    moveCar(car)
  return state

def newCar(i, baseRoute):
  car = {'id': i, 'type': 'car', 'position': None, 'speed': CONST_SPEED_KM_H, 'direction': 0, 'route': None, 'sensorData': None, 'timeOnPath': 0, 'baseRoute': baseRoute}
  scheduleNewRoute(car)
  return car

def setupCars(numCars, baseRoute):
  cars = []
  for i in range(numCars):
    cars.append(newCar(i, baseRoute))
  return cars

def translate(state):
  res = []
  for car in state:
    res += [{'id': str(car['id']), 'objectType': car['type'], 'speed': car['speed'], 'direction': car['direction'], 'position': {'lat': car['position'][1], 'lng': car['position'][0]}, 'route': car['baseRoute']}]
  return res

if(len(sys.argv) != 2):
  sys.exit(1)

simulationId = sys.argv[1]
savn = ConnectionAssistant(simulationId)
savn.initSession(TIMESLICE)

sys.exit(0)
