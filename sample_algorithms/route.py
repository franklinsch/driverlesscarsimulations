import os
import overpass
import geojson as gjson
import math
import json
import subprocess

import time

def saveGeojson(bottom, left, top, right, output):
  api = overpass.API()
  map_query = overpass.MapQuery(bottom, left, top, right)
  response = api.Get(map_query)

  f = open(output, 'w')
  f.write(gjson.dumps(response))

def isEqualNodes(point1, point2):
  return point1[0] == point2[0] and point1[1] == point2[1]

def getRoute(inp, start, end):
  os.system("node route.js " + str(gjson.dumps(start).encode('utf8')) + " " + str(gjson.dumps(end).encode('utf8')) + " " + inp + " > path.json");
  path = None
  with open("path.json") as data_file:
    path = json.load(data_file)
  return path

def newPoint(coordinates):
  return {"geometry": {"type": "Point", "coordinates": coordinates}, "type": "Feature", "properties": {}}

def distance(point1, point2):
  return math.sqrt(math.pow(point1[0]-point2[0], 2) + math.pow(point1[1]-point2[1], 2))

def angle(origin, point):
  return math.atan2(point[1]-origin[1], point[0]-origin[0])

def dot(point1, point2):
  return point1[0]*point2[0] + point1[1]*point2[1]

def sub(point1, point2):
  return [point1[0]-point2[0], point1[1]-point2[1]]

def add(point1, point2):
  return [point1[0]+point2[0], point1[1]+point2[1]]

def scale(point, scale):
  return [scale * point[0], scale * point[1]]

def equal(point1, point2):
  return point1[0] == point2[0] and point1[1] == point2[1]

def getNearest(inp, point):
  os.system("node find_node.js " + str(gjson.dumps(point).encode('utf8')) + " " + inp + " > find.json")
  proj = None
  with open("find.json") as data_file:
    proj = json.load(data_file)
  return proj
