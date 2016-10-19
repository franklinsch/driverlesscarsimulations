TIMESLICE = 1
CONST_SPEED = 3
BASE_ROUTE = {'source': [4.78482, 50.68166], 'destination': [4.78482, 50.68166], 'path':
    [{'start': [4.78482, 50.68166], 'end': [4.78482, 50.68347], 'direction': 1, 'timeLeft': 5, 'totalTime': 5},
     {'start': [4.78482, 50.68347], 'end': [4.78780, 50.68347], 'direction': 2, 'timeLeft': 5, 'totalTime': 5},
     {'start': [4.78780, 50.68347], 'end': [4.78780, 50.68166], 'direction': 3, 'timeLeft': 5, 'totalTime': 5},
     {'start': [4.78780, 50.68166], 'end': [4.78482, 50.68166], 'direction': 4, 'timeLeft': 5, 'totalTime': 5}]}

def add(v1, v2):
  return [v1[0]+v2[0], v1[1]+v2[1]]

def sub(v1, v2):
  return [v1[0]-v2[0], v1[1]-v2[1]]

def scale(v, s):
  return [s*v[0], s*v[1]]

def scheduleNewRoute(car):
  car['route'] = BASE_ROUTE
  car['position'] = BASE_ROUTE['source']

def algo(state):
  for car in state:
    moveCar(car)
  return state

def setupCars(numCars):
  cars = []
  for i in range(numCars):
    car = {'identifier': i, 'position': None, 'speed': CONST_SPEED, 'direction': 0, 'route': None, 'sensorData': None}
    cars += [car]
    scheduleNewRoute(car)
  return cars

#useApiToStart()
#while true:
state = setupCars(1)
for i in range(20):
  #useApi()
  print(state[0]['position'])
  state = algo(state)
  #useApi()
#useApiToEnd()
