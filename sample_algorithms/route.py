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

def getRoutes(inp, pairs):
  os.system("node route.js " + str(gjson.dumps(pairs).encode('utf8')) + " " + inp + " > path.json");
  paths = None
  with open("path.json") as data_file:
    paths = json.load(data_file)
  return paths
