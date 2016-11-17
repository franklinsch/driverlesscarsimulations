import sys
import math
sys.path.append('../framework')

import client
import route as R
import geojson
import os.path

from copy import deepcopy

state = []
locked_nodes = []

SLEEP_TIME = 1
TIMESLICE = 1
INP_FILE = 'map.geojson'

class ConnectionAssistant(client.SAVNConnectionAssistant):
  def handleSimulationStart(self, initialParameters):
    try: #TODO: Users should not need to try-except their code to get error messages
      runSimulation(self, initialParameters)
      #testInitialisation(initialParameters)
    except Exception as err:
      print(err)

  def handleSimulationDataUpdate(self, update):
    addToState(update['journeys'], state)

  def handleSimulationCommunication(self, data):
    translateDataToSensors(data)

  def handleSimulationStop(self, info):
    pass

def runSimulation(savn, initialParameters):
  south = initialParameters['city']['bounds']['southWest']['lat']
  west = initialParameters['city']['bounds']['southWest']['lng']
  north = initialParameters['city']['bounds']['northEast']['lat']
  east = initialParameters['city']['bounds']['northEast']['lng']
  print('Initialising geographical data')
  R.saveGeojson(south, west, north, east, INP_FILE)
  print('\t\t\t... Done')

  print('Starting simulation:')
  timestamp = 0

  print('\tSending data every ' + str(SLEEP_TIME) + ' seconds')

  while savn.alive:
    #useApi()
    savn.updateState(timestamp, translate(state))
    state = executePedestrianAlgorithm(state)
    timestamp += TIMESLICE
    time.sleep(SLEEP_TIME)
  #useApiToEnd()

def analyseData(data):
  #for car in state:
  #  car['sensorData'] = translateDataToSensor(car, data)

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

    props = R.getProperties(INP_FILE, start, end)
    maxSpeed_km_h = MAX_SPEED_KM_H
    if 'maxspeed' in props:
      maxSpeed_km_h = int(props['maxspeed']) #TODO: Will break with mph or any suffix

    dist = get_distance(start, end)
    time = dist/(maxSpeed_km_h*1000/3600)
    end.append({'timeLeft': time, 'totalTime': time, 'maxSpeed': maxSpeed_km_h})

def add(v1, v2):
  return [v1[0]+v2[0], v1[1]+v2[1]]

def sub(v1, v2):
  return [v1[0]-v2[0], v1[1]-v2[1]]

def scale(v, s):
  return [s*v[0], s*v[1]]

def scheduleNewPedestrian():
  return

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

def movePedestrian(pedestrian):
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
    scheduleNewRoute(car)
  else:
    timeLeft = end[2]['timeLeft']
    totalTime = end[2]['totalTime']
    car['position'] = add(end, scale(sub(start, end), timeLeft/totalTime))

def executePedestrianAlgorithm(state):
  for pedestrian in state:
    movePedestrian(pedestrian)
  return state

def createNewPedestrianForCar(i, car):
  car = {'id': i, 'type': 'car', 'position': None, 'speed': 0, 'direction': 0,
      'route': None, 'sensorData': {}, 'timeOnPath': 0, 'baseRoute': baseRoute, 'lockedNode': None}
  return car

def translate(state):
  res = []
  for car in state:
    res += [{'id': str(car['id']), 'objectType': car['type'], 'speed': car['speed'], 'direction': car['direction'], 'position': {'lat': car['position'][1], 'lng': car['position'][0]}, 'route': car['baseRoute']}]
  return res

if(len(sys.argv) != 2):
  sys.exit(1)

simulationID = sys.argv[1]
savn = ConnectionAssistant(simulationID)
savn.initSession(TIMESLICE)

sys.exit(0)
