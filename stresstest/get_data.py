import sys
import json

timestamp = {'key': 'timestamp', 'descriptor': 'Timestamp'};
hAxes = [timestamp];

accessTime = {'key': 'accessTime', 'descriptor': 'Access Time'};
saveTime = {'key': 'saveTime', 'descriptor': 'Save Time'};
networkTime = {'key': 'networkTime', 'descriptor': 'Network Time'};
processTime = {'key': 'processTime', 'descriptor': 'Process Time'};
vAxes = [accessTime, saveTime, networkTime, processTime];

with open(sys.argv[1]) as data:
  data = json.load(data)
  n = 25
  for hAxis in hAxes:
    for vAxis in vAxes:
      rowData = []
      row = []
      row.append(hAxis['key'])
      for i in range(len(data)):
        if i % n == 0:
          row.append(str(i) + ' cars')
      rowData.append(','.join(row))

      for j in range(len(data[0])):
        row = []
        row.append(str(data[0][j][hAxis['key']]))
        for i in range(len(data)):
          if i % n == 0:
            row.append(str(data[i][j][vAxis['key']]))
        rowData.append(','.join(row))
      rowData = '\n'.join(rowData)
      name = vAxis['key']
      f = open(name + '.csv', 'w')
      f.write(rowData)
      f.close()
