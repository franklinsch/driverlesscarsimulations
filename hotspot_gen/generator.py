import sys
import json

def main(argv):
  undergound_data = readJson('./data/LondonUndergroundInfo.json')
  with open('./data/LondonUndergroundInfo.json') as json_data:
    d = json.load(json_data)
    print (d[0])

if __name__ == "__main__":
  main(sys.argv)
