import os
import overpass
import geojson
import json
import subprocess

def saveGeojson(bottom, left, top, right, output):
  api = overpass.API()
  map_query = overpass.MapQuery(bottom, left, top, right)
  response = api.Get(map_query)

  f = open(output, 'w')
  f.write(geojson.dumps(response))

def getRoute(inp, start, end):
  gjson = None
  with open(inp) as data_file:
    gjson = geojson.load(data_file)
  os.system("node route.js " + inp + " " + str(start) + " " + str(end) + " " + str(geojson.dumps(gjson).encode('utf8')) + " > path.json");
  path = None
  with open("path.json") as data_file:
    path = json.load(data_file)
  return path

#saveGeojson(50.68166, 4.78482, 50.68347, 4.78780, 'map.geojson')
#start = {"geometry": {"type": "Point", "coordinates": [4.778602, 50.6840807]}, "type": "Feature", "properties": {}}
#end = {"geometry": {"type": "Point", "coordinates": [4.7942264, 50.6814472]}, "type": "Feature", "properties": {}}
#
#path = getRoute('map.geojson', geojson.dumps(start).encode('utf8'), geojson.dumps(end).encode('utf8'))
#print(path)
