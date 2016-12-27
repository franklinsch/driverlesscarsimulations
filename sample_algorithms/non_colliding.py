import sys
import time
import math
import random
sys.path.append('../framework')

import client
import route as R
import json
import os.path

from copy import deepcopy

state = []
locked_nodes = []

SLEEP_TIME = 1
TIMESLICE = 1
MAX_SPEED_KM_H = 60
MAP_FILE = 'map.geojson'
CACHE_MAP_FILE = 'cache.geojson'
CACHE_INFO_FILE = 'cache.info'

class ConnectionAssistant(client.SAVNConnectionAssistant):
  def getAPIKeys(self):
    api_id = "a044925e-7ec9-4664-88b4-521b6b165f97"
    api_key = "edc52fbd-97c7-466b-b0de-91c42dc5806c"
    return api_id, api_key
  def handleSimulationStart(self, initialParameters):
    try: #TODO: Users should not need to try-except their code to get error messages
      runSimulation(self, initialParameters)
      #testInitialisation(initialParameters)
    except Exception as err:
      print(err)

  def handleSimulationDataUpdate(self, update):
    addToState(update['journeys'], state)

  def handleSimulationCommunication(self, data):
    analyseData(data)

  def handleSimulationStop(self, info):
    pass

def postParams(initialParameters):
  print(initialParameters)

def testInitialisation(initialParameters):
  n = 100
  ts = 0

  updateCache(initialParameters['city']['bounds'])
  global state
  for i in range(n):
    getFromCache()
    state = []
    t = time.time()
    addToState(initialParameters['journeys'], state)
    t = time.time() - t
    ts += t
    print('Iteration ' + str(i) + ': ' + str(t) + ' seconds')
  print('Average time: ' + str(ts / n))

def runSimulation(savn, initialParameters):
  print('Initialising geographical data')
  updateCache(initialParameters['city']['bounds'])
  getFromCache()
  print('\t\t\t... Done')

  print('Creating initial state')
  global state, timestamp
  timestamp = initialParameters['timestamp']
  #state = initialParameters['state']

  print('Preprocessing routes')
  addToState(initialParameters['journeys'], state)
  print('\t\t\t... Done')

  print('Starting simulation:')

  print('\tSending data every ' + str(SLEEP_TIME) + ' seconds')

  while savn.alive:
    print("Sending", timestamp)
    savn.updateState(timestamp, translate(state))
    print("Working on next: Sent", timestamp)
    state = executeGlobalAlgorithm(state)
    timestamp += TIMESLICE
  #useApiToEnd()

def getFromCache():
  os.system("cp " + CACHE_MAP_FILE + " " + MAP_FILE);

def updateCache(bounds):
  if (os.path.isfile(CACHE_INFO_FILE) and os.path.isfile(CACHE_MAP_FILE)):
    with open(CACHE_INFO_FILE) as cache_info:
      try:
        info = json.load(cache_info)
        if bounds == info:
          return
      except:
        pass

  south = bounds['southWest']['lat']
  west = bounds['southWest']['lng']
  north = bounds['northEast']['lat']
  east = bounds['northEast']['lng']

  info = open(CACHE_INFO_FILE, 'w')
  info.write(json.dumps(bounds))

  R.saveGeojson(south, west, north, east, CACHE_MAP_FILE)

def analyseData(data):
  for car in state:
    car['sensorData'] = translateDataToSensor(car, data)

def translateDataToSensor(car, data):
  return {'cameraData': translateDataToCameraData(car, data)}

def translateDataToCameraData(car, data):
  cameraSensorRadius = 30.0
  cameraSensorFOVAngle = 100.0
  cameraData = []
  for frameworkState in data:
    for obj in frameworkState['objects']:
      obj['position'] = [obj['position']['lng'], obj['position']['lat']]
      distance = get_distance(car['position'], obj['position'])
      direction = get_direction(car['position'], obj['position'])
      if 'position' in obj and distance <= cameraSensorRadius and abs(direction - car['direction']) <= cameraSensorFOVAngle / 2 :
        print(cameraData)
        cameraData.append(obj)
  return cameraData

def addToState(journeys, state):
  for journey in journeys:
    start = {"geometry": {"type": "Point", "coordinates": [journey['origin']['lng'], journey['origin']['lat']]}, "type": "Feature", "properties": {}}
    end = {"geometry": {"type": "Point", "coordinates": [journey['destination']['lng'], journey['destination']['lat']]}, "type": "Feature", "properties": {}}
    newRoute = R.getRoute(MAP_FILE, start, end)['path']
    preprocess(newRoute)
    state.append(createNewCar(len(state), journey['_id'], baseRoute=newRoute))
    print('.')

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

    props = R.getProperties(MAP_FILE, start, end)
    maxSpeed_km_h = MAX_SPEED_KM_H
    if 'maxspeed' in props:
      try:
        speeds = []
        for speed in props['maxspeed'].split(';'):
          text = speed.split('mph')
          maxspeed = int(text[0])
          if len(text) == 2:
            maxspeed *= 1.61
          speeds.append(maxspeed)
        minSpeed = min(speeds[0], speeds[-1])
        maxSpeed = max(speeds[0], speeds[-1])
        maxSpeed_km_h = random.uniform(minSpeed, maxSpeed)
      except Exception as err:
        maxSpeed_km_h = MAX_SPEED_KM_H
        print(err)

    dist = get_distance(start, end)
    time = dist/(maxSpeed_km_h*1000/3600)
    end.append({'timeLeft': time, 'totalTime': time, 'maxSpeed': maxSpeed_km_h})

def add(v1, v2):
  return [v1[0]+v2[0], v1[1]+v2[1]]

def sub(v1, v2):
  return [v1[0]-v2[0], v1[1]-v2[1]]

def scale(v, s):
  return [s*v[0], s*v[1]]

def scheduleNewRoute(car):
  start = car['baseRoute'][0]
  if (isNodeLocked(start)):
    return False
  car['journeyStart'] = timestamp
  car['route'] = deepcopy(car['baseRoute'])
  car['position'] = car['baseRoute'][0]
  car['direction'] = get_direction(car['route'][0], car['route'][1])
  car['lockedNode'] = start
  return True

def isEqualNodes(node1, node2):
  return node1[0] == node2[0] and node1[1] == node2[1]

def isNodeLocked(node):
  for car in state:
    if isEqualNodes(car['lockedNode'], node):
      return True
  return False

def switchNodeLock(car, start, end):
  if (isEqualNodes(car['lockedNode'], start)):
    if (isNodeLocked(end)):
      return False

    car['lockedNode'] = end
  return True

def executeLocalAlgorithm(car):
  moveCar(car)

def moveCar(car):
  timeLeft = TIMESLICE
  start = car['route'][0]
  end = car['route'][1]

  if (not switchNodeLock(car, start, end) or
      ('cameraData' in car['sensorData'] and len(car['sensorData']['cameraData']) > 0)):
    car['speed'] = 0
    return

  car['speed'] = end[2]['maxSpeed']
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
        car['speed'] = end[2]['maxSpeed']
        car['direction'] = get_direction(start, end)

        if (not switchNodeLock(car, start, end)):
          car['speed'] = 0
          break
    else:
      end[2]['timeLeft'] -= timeLeft
      timeLeft = 0
  if(car['route'] == None):
    car['position'] = end
    savn.completeObjectJourney(timestamp, car['journeyStart'], car['journeyID'])
    scheduleNewRoute(car)
  else:
    timeLeft = end[2]['timeLeft']
    totalTime = end[2]['totalTime']
    car['position'] = add(end, scale(sub(start, end), timeLeft/totalTime))

def executeGlobalAlgorithm(state):
  for car in state:
    executeLocalAlgorithm(car)
  return state

def createNewCar(i, journeyID, baseRoute):
  car = {'id': i, 'journeyID': journeyID, 'type': 'car', 'position': None, 'speed': 0, 'direction': 0,
      'route': None, 'sensorData': {}, 'baseRoute': baseRoute, 'lockedNode': None, 'journeyStart': None}
  scheduleNewRoute(car)
  return car

def translate(state):
  res = []
  for car in state:
    res += [{'id': str(car['id']), 'journeyID': car['journeyID'], 'objectType': car['type'], 'speed': car['speed'], 'direction': car['direction'], 'position': {'lat': car['position'][1], 'lng': car['position'][0]}, 'route': car['baseRoute']}]
  return res

if(len(sys.argv) != 2):
  sys.exit(1)

simulationID = sys.argv[1]
savn = ConnectionAssistant(simulationID)
savn.initSession(TIMESLICE)

sys.exit(0)
