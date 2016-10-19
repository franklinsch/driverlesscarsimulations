import sys
import time
sys.path.append('../framework')

import client

class ConnectionAssistant(client.SAVNConnectionAssistant):
  def handleSimulationStart(self, initialParameters):
    pass

  def handleSimulationDataUpdate(self, update):
    pass

  def handleSimulationStop(self):
    pass

TIMESLICE = 1
CONST_SPEED = 3
BASE_ROUTE = {'source': [50.68166, 4.78482], 'destination': [50.68166, 4.78482], 'path':
    [{'start': [50.68166, 4.78482], 'end': [50.68347, 4.78482], 'direction': 1, 'timeLeft': 5, 'totalTime': 5},
     {'start': [50.68347, 4.78482], 'end': [50.68347, 4.78780], 'direction': 2, 'timeLeft': 5, 'totalTime': 5},
     {'start': [50.68347, 4.78780], 'end': [50.68166, 4.78780], 'direction': 3, 'timeLeft': 5, 'totalTime': 5},
     {'start': [50.68166, 4.78780], 'end': [50.68166, 4.78482], 'direction': 4, 'timeLeft': 5, 'totalTime': 5}]}

def add(v1, v2):
  return [v1[0]+v2[0], v1[1]+v2[1]]

def sub(v1, v2):
  return [v1[0]-v2[0], v1[1]-v2[1]]

def scale(v, s):
  return [s*v[0], s*v[1]]

def scheduleNewRoute(car):
  car['route'] = BASE_ROUTE
  car['position'] = BASE_ROUTE['source']

def moveCar(car):
  timeLeft = TIMESLICE
  while(timeLeft > 0):
    print(len(car['route']['path']))
    print(car['route']['path'][0]['timeLeft'])
    if(car['route']['path'][0]['timeLeft'] <= timeLeft):
      timeLeft -= car['route']['path'][0]['timeLeft']
      del car['route']['path'][0]
      if(len(car['route']['path']) == 0):
        timeLeft = 0
        car['route']['path'] = None
      else:
        car['direction'] = car['route']['path'][0]['direction']
    else:
      car['route']['path'][0]['timeLeft'] -= timeLeft
      timeLeft = 0
  if(car['route']['path'] == None):
    car['position'] = car['route']['destination']
    scheduleNewRoute(car)
  else:
    end = car['route']['path'][0]['end']
    start = car['route']['path'][0]['start']
    timeLeft = car['route']['path'][0]['timeLeft']
    totalTime = car['route']['path'][0]['totalTime']
    car['position'] = add(end, scale(sub(start, end), timeLeft/totalTime))

def algo(state):
  for car in state:
    moveCar(car)
  return state

def setupCars(numCars):
  cars = []
  for i in range(numCars):
    car = {'id': i, 'type': 'car', 'position': None, 'speed': CONST_SPEED, 'direction': 0, 'route': None, 'sensorData': None}
    cars += [car]
    scheduleNewRoute(car)
  return cars

def translate(state):
  res = []
  for car in cars:
    res += [{'id': car['id'], 'type': car['type'], 'position': {'lat': car['position'][0], 'lng': car['position'][1]}}]
  return res

def main(argv):
  if len(argv) != 2:
    return 1

  savn = ConnectionAssistant(int(argv[1]))
  savn.initSession()

  #while True:
  state = setupCars(1)
  timestamp = 0
  for i in range(50):
    #useApi()
    state = algo(state)
    timestamp += TIMESLICE
    savn.updateCarStates(simulationId, timestamp, translate(state))
    time.sleep(2)
  #useApiToEnd()

  return 0

if __name__ == '__main__':
  main(sys.argv) #What about sys_exit?
