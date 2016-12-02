import json

with open('LondonUndergroundInfo.json') as data_file:
  data = json.load(data_file)

hotspots = []


for i in range(len(data)):
  hotspot = {
      'name': data[i]['stationName'],
      'coordinates': {
        'lat': data[i]['lat'],
        'lng': data[i]['lng']
        },
      'popularityLevels': [{
        'startTime': '00:00:00',
        'endTime'  : '23:59:59',
        'level': data[i]['entryPlusExitInMillions']
        }]
      }
  hotspots.append(hotspot)

with open('LondonHotspots.json', 'w') as out_data:
	json.dump(hotspots, out_data)
