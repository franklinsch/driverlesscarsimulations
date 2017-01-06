import os
import overpass
import geojson as gjson
import json
import subprocess

def saveGeojson(bottom, left, top, right, output):
  api = overpass.API()
  map_query = overpass.MapQuery(bottom, left, top, right)
  response = api.Get(map_query)

  f = open(output, 'w')
  f.write(gjson.dumps(response))

def getRoute(inp, start, end):
  os.system("node route.js " + str(gjson.dumps(start).encode('utf8')) + " " + str(gjson.dumps(end).encode('utf8')) + " " + inp + " > path.json");
  path = None
  with open("path.json") as data_file:
    path = json.load(data_file)
  return path
