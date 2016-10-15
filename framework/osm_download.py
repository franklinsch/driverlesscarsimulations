import requests

def get_osm_for_bounding_box(left, bottom, top, right):
  API_URL = "http://www.overpass-api.de/api/xapi?*%5Bbbox="\
            +str(left)+","+str(bottom)+","+str(top)+","+str(right)+"%5D"
  r = requests.get(API_URL)
  print(r.status_code)
  #print(r.headers['content-type'])
  #print(r.encoding)
  #print(r.text)
  #print(r.json())

get_osm_for_bounding_box(-0.17204,51.49905,-0.16912,51.50025)
