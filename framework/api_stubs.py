# Class:

def handleSimulationStart:

def handleSimulationDataUpdate:
# New car
# Car deleted
# Pot hole
# Pedestrian on zebra crossing
# Pedestrian free roaming
# Other external factors

def handleSimulationStop:

# Helper functions:

def initSession(simulationID):
def updateCarRoutes(routeData):


FRAMEWORK                                  US
          <---------- data --------------
callHandler
handlerReturns ---------- notify ---------->
                                          SEND OK
          <---------------- sendOK ------
callHandler
