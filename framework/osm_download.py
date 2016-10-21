import overpass
import geojson
import os
#from pyroutelib2.routeGeojson import route_geojson
api = overpass.API()
way_query = overpass.WayQuery('[name="Queen\'s Gate"]')
response = api.Get(way_query)

f = open("response.geojson", 'w')
f.write(geojson.dumps(response))

#route_geojson("response.geojson", "paths.geojson", mode="car")