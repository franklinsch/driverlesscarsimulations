import requests

def get_osm_for_bounding_box(left, bottom, top, right):
  API_URL = "http://www.overpass-api.de/api/xapi?*%5Bbbox="\
            +str(left)+","+str(bottom)+","+str(top)+","+str(right)+"%5D"
  r = requests.get(API_URL)
  return r.text
