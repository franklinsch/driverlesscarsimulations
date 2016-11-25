import sys
import math
import random
import time

sys.path.append('../framework')

import client
import route as R

worldState = []
state = []
nextEventTime = None

WALKING_SPEED_KM_H = 6
WALKING_SPEED = WALKING_SPEED_KM_H * 1000 / 3600
SLEEP_TIME = 1
TIMESLICE = 1

class ConnectionAssistant(client.SAVNConnectionAssistant):
  def handleSimulationStart(self, initialParameters):
    try:
      runSimulation(self, initialParameters)
    except Exception as err:
      print(err)

  def handleSimulationDataUpdate(self, update):
    pass

  def handleSimulationCommunication(self, data):
    analyseData(data)

  def handleSimulationStop(self, info):
    pass

def runSimulation(savn, initialParameters):
  print('Starting simulation:')
  global state, nextEventTime
  timestamp = initialParameters['timestamp']
  print('The time is', timestamp)

  print('\tSending data every ' + str(SLEEP_TIME) + ' seconds')
  nextEventTime = timestamp
  nextEventTime += generateEventTime()

  while savn.alive:
    print("Sending", timestamp)
    savn.updateState(timestamp, translate(state))
    print("Working on next: Sent", timestamp)
    state = executePedestrianAlgorithm(state, timestamp)
    timestamp += TIMESLICE
  #useApiToEnd()

def analyseData(data):
  global worldState
  worldState = []
  for frameworkState in data:
    worldState += frameworkState['objects']
  for car in worldState:
    car['position'] = [car['position']['lng'], car['position']['lat']]

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
  start = route[0]
  end = route[1]

  dist = get_distance(start, end)
  time = dist/WALKING_SPEED
  end.append({'timeLeft': time, 'totalTime': time, 'maxSpeed': WALKING_SPEED_KM_H})

def add_distance(v, a, d):
  LNG_SCL = 111.319e3
  LAT_SCL = 110.574e3
  a = math.radians(a)
  lngDeg = d * math.cos(a)/LNG_SCL
  latDeg = d * math.sin(a)/(LAT_SCL) #*math.cos(math.radians(v[1])))
  return [v[0] + lngDeg, v[1] + latDeg]

def add(v1, v2):
  return [v1[0]+v2[0], v1[1]+v2[1]]

def sub(v1, v2):
  return [v1[0]-v2[0], v1[1]-v2[1]]

def scale(v, s):
  return [s*v[0], s*v[1]]

def within_box(p, v1, v2):
  min_x = min(v1[0], v2[0])
  max_x = max(v1[0], v2[0])
  min_y = min(v1[1], v2[1])
  max_y = max(v1[1], v2[1])
  px = p[0]
  py = p[1]

  return px >= min_x and px <= max_x and py >= min_y and py <= max_y

def interpolate(s, e, sc):
  return add(s, scale(sub(e, s), sc))

def to_unit_circle(angle):
  return [math.cos(math.radians(angle)), math.sin(math.radians(angle))]

def pickCar(cars):
  car = None

  num = len(cars)
  while (num >= 0):
    index = int(random.random() * num)

    if (index == 0):
      MIN_DISTANCE = 60 #TODO: Extract generalisable data

      car = cars[num-1]
      if (get_distance(car['position'], car['route'][-1]) >= MIN_DISTANCE):
        break
    num -= 1
  return car

def scheduleNewPedestrian():
  if (len(worldState) > 0):
    car = pickCar(worldState)
    if (car != None):
      newPedestrian = createNewPedestrianForCar(len(state), car)
      newPedestrian['route'] = newPedestrian['baseRoute']
      state.append(newPedestrian)

def createNewPedestrianForCar(carID, car):
  MU_DISTANCE = 100
  SIGMA_DISTANCE = 15

  intersectionPoint = car['position']
  print('Going to intersect at', intersectionPoint)
  numPaths = len(car['route'])
  for i in range(numPaths - 1): #TODO: Binary search
    start = car['route'][i]
    end = car['route'][i+1] #TODO: Doesn't work for cars going the other way
    if (within_box(intersectionPoint, start, end)):
      break

  intersectionDistance = random.gauss(MU_DISTANCE, SIGMA_DISTANCE)
  while intersectionDistance != 0 and i < numPaths:
    end = car['route'][i]
    dist_node = get_distance(intersectionPoint, end)
    if (dist_node > intersectionDistance or i == numPaths - 1):
      intersectionPoint = interpolate(intersectionPoint, end, intersectionDistance/dist_node)
    else:
      intersectionDistance -= dist_node
      intersectionPoint = end
    i += 1

  carDirection = car['direction']

  MU_THETA = 0
  SIGMA_THETA = 15

  carSpeed = 60
  if (car['speed'] != 0):
    carSpeed = car['speed']

  speedRatio = WALKING_SPEED_KM_H / carSpeed
  startDistance = random.gauss(MU_DISTANCE, SIGMA_DISTANCE) * speedRatio
  startAngle = carDirection + 90 + random.gauss(MU_THETA, SIGMA_THETA)

  start = add_distance(intersectionPoint, startAngle, startDistance)
  end = interpolate(start, intersectionPoint, 2)
  if (random.random() < 0.5):
    start, end = end, start
  baseRoute = [start, end]
  direction = get_direction(start, end)
  preprocess(baseRoute)

  pedestrian = {'id': carID, 'type': 'pedestrian', 'position': start, 'speed': 0, 'direction': direction, 'route': None, 'sensorData': {}, 'baseRoute': baseRoute}
  return pedestrian

def generateEventTime():
  LAMBDA = 1/5
  return random.expovariate(LAMBDA)

def executePedestrianAlgorithm(state, timestamp):
  global nextEventTime
  print("Next event at", nextEventTime)
  while (timestamp >= nextEventTime):
    time_d = timestamp - nextEventTime
    scheduleNewPedestrian()
    movePedestrian(state[-1], timeLeft=time_d)
    nextEventTime += generateEventTime()

  print(state)
  for i, pedestrian in enumerate(state):
    if movePedestrian(pedestrian):
      print('deleting')
      del state[i]
  return state

def movePedestrian(pedestrian, timeLeft=TIMESLICE):
  start = pedestrian['route'][0]
  end = pedestrian['route'][1]

  print(start)
  print(end)
  if (end[2]['timeLeft'] <= timeLeft):
    end[2]['timeLeft'] = 0
    pedestrian['position'] = end
    return True

  end[2]['timeLeft'] -= timeLeft
  pedestrian['position'] = interpolate(end, start, end[2]['timeLeft']/end[2]['totalTime'])
  return False

def translate(state):
  res = []
  for pedestrian in state:
    res.append({'id': str(pedestrian['id']), 'objectType': pedestrian['type'], 'speed': pedestrian['speed'], 'direction': pedestrian['direction'], 'position': {'lat': pedestrian['position'][1], 'lng': pedestrian['position'][0]}, 'route': pedestrian['baseRoute']})
  return res

if(len(sys.argv) != 2):
  sys.exit(1)

simulationID = sys.argv[1]
savn = ConnectionAssistant(simulationID)
savn.initSession(TIMESLICE)

sys.exit(0)
