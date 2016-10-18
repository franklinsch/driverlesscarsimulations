import sys
sys.path.append('../framework')

import client

class ConnectionAssistant(client.SAVNConnectionAssistant):
  def handleSimulationStart(self, initialParameters):
    pass

  def handleSimulationDataUpdate(self, update):
    pass

  def handleSimulationStop(self):
    pass

def main(argv):
  if len(argv) != 2:
    return 1
  savn = ConnectionAssistant()
  savn.initSession(argv[1])
  return 0

if __name__ == '__main__':
  main(sys.argv)
