import os
import overpass
import geojson as gjson
import math
import json
import subprocess

def saveGeojson(bottom, left, top, right, output):
  api = overpass.API()
  map_query = overpass.MapQuery(bottom, left, top, right)
  response = api.Get(map_query)

  f = open(output, 'w')
  f.write(gjson.dumps(response))

def isEqualNodes(point1, point2):
  return point1[0] == point2[0] and point1[1] == point2[1]

#def getProperties(inp, nstart, nend):
#  with open(inp) as data_file:
#    geojson = gjson.load(data_file)
#
#    for feature in geojson['features']:
#      if (feature['geometry']['type'] == 'LineString' and 'highway' in feature['properties']):
#        clength = len(feature['geometry']['coordinates'])
#        for (i, start) in enumerate(feature['geometry']['coordinates']):
#          if (isEqualNodes(start, nstart)):
#            if (i < clength - 1):
#              end = feature['geometry']['coordinates'][i+1]
#              if (isEqualNodes(end, nend)):
#                return feature['properties']
#            if (i > 0):
#              end = feature['geometry']['coordinates'][i-1]
#              if (isEqualNodes(end, nend)):
#                return feature['properties']
#  return {};

def getProperties(inp, start, end):
  os.system("node get_properties.js " + str(gjson.dumps([start, end]).encode('utf8')) + " " + inp + " > props.json");
  props = {}
  with open("props.json") as data_file:
    props = json.load(data_file)
  return props

def getRoute(inp, start, end):
  start = newPoint(getNearest(inp, start))
  end = newPoint(getNearest(inp, end))

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

#def getNearest(inp, point):
#  point = point['geometry']['coordinates']
#  with open(inp, "r+") as data_file:
#    geojson = gjson.load(data_file)
#
#    min2_angle = None
#    min2_point = None
#    min2_i     = None
#    min2_j     = None
#
#    min_distance    = -1
#    min_point       = None
#    min_i           = None
#    min_j           = None
#    min_point_angle = None
#
#    for (i, feature) in enumerate(geojson['features']):
#      last_point = None
#      if (feature['geometry']['type'] == 'LineString' and 'highway' in feature['properties']):
#        for (j, coordinate) in enumerate(feature['geometry']['coordinates']):
#          dist = distance(point, coordinate)
#          if (min_distance == -1 or dist < min_distance):
#            min_point_angle = angle(coordinate, point)
#            min_distance = dist
#            min_point = coordinate
#            min_i = i
#            min_j = j
#
#            if (j > 0):
#              min2_angle = abs(angle(coordinate, last_point)-min_point_angle)
#              min2_point = last_point
#              min2_i = i
#              min2_j = j-1
#            else:
#              min2_angle = None
#          elif (j-1 == min_j and i == min_i):
#            ang = abs(angle(min_point, coordinate)-min_point_angle)
#            if (min2_angle == None or ang < min2_angle):
#              min2_angle = ang
#              min2_point = coordinate
#              min2_j = j
#
#          last_point = coordinate
#
#    B = sub(min2_point, min_point)
#    A = sub(point, min_point)
#    sc = scale(B, dot(A, B)/dot(B, B))
#    proj = add(sc, min_point)
#    if (min2_i == min_i or abs(min2_j - min_j) == 1):
#      proj_distance = distance(proj, min_point)
#      if (proj_distance < 0.00001):
#        return min_point
#      else:
#        j = min_j
#        if (min2_j > min_j):
#          j = min2_j
#        geojson['features'][min_i]['geometry']['coordinates'].insert(j, proj)
#
#        data_file.seek(0)
#        data_file.write(gjson.dumps(geojson))
#        data_file.truncate()
#
#        return proj
#  return None

#saveGeojson(50.68166, 4.78482, 50.68347, 4.78780, 'map.geojson')
#start = {"geometry": {"type": "Point", "coordinates": [4.778602, 50.6840807]}, "type": "Feature", "properties": {}}
#start = {"geometry": {"type": "Point", "coordinates": [4.778602 + 0.1 * (4.7806405-4.778602) + 0.01, 50.6840807 + 0.1 * (50.6834349 - 50.6840807)]}, "type": "Feature", "properties": {}}
#end = {"geometry": {"type": "Point", "coordinates": [4.7942264, 50.6814472]}, "type": "Feature", "properties": {}}
#
#path = getRoute('map.geojson', gjson.dumps(start).encode('utf8'), gjson.dumps(end).encode('utf8'))
#print(path)
