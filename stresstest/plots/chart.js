google.charts.load('current', {packages: ['corechart', 'line']});
google.charts.setOnLoadCallback(drawGraphs);

function drawGraphs() {
  var experimentData;

  $.ajax({
    url:'data.json',
    dataType: 'json',
    async: false,
    success: function(data) {
      experimentData = data;
    }
  });

  drawDbTimeAgainstCarNumbers(experimentData);
  drawDbTimeAgainstTimestamp(experimentData);
  drawNetworkTimeAgainstCarNumbers(experimentData);
  drawNetworkTimeAgainstTimestamp(experimentData);
}

function drawDbTimeAgainstCarNumbers(experimentData) {
  var data = new google.visualization.DataTable();
  data.addColumn('number', 'Car Numbers');
  for (i = 0; i < experimentData.length; i++) {
    data.addColumn('number', 'dbTime' + i);
  }
  var rowData = [];
  for (i = 0; i < experimentData.length; i++) {
    for (j = 0; j < experimentData[i].length; j++) {
      var row = []
      row.push(experimentData[i][j].numCars);
      for (a = 0; a < i; a++) {
        row.push(null);
      }
      row.push(experimentData[i][j].dbTime)
      for (a = i + 1; a < experimentData.length; a++) {
        row.push(null)
      }
      rowData.push(row)
    }
  }
  data.addRows(rowData);

  var options = {
    hAxis: {
      title: 'CarNumbers'
    },
    width: 1000,
    height: 500
  };

  var chart = new google.charts.Line(document.getElementById('dbtime_car_chart_div'));
  chart.draw(data, options);
}

function drawDbTimeAgainstTimestamp(experimentData) {
  var data = new google.visualization.DataTable();
  data.addColumn('number', 'timestamp');
  for (i = 0; i < experimentData.length; i++) {
    data.addColumn('number', 'dbTime' + i);
  }
  var rowData = [];
  for (i = 0; i < experimentData.length; i++) {
    for (j = 0; j < experimentData[i].length; j++) {
      var row = []
      row.push(experimentData[i][j].timestamp);
      for (a = 0; a < i; a++) {
        row.push(null);
      }
      row.push(experimentData[i][j].dbTime)
      for (a = i + 1; a < experimentData.length; a++) {
        row.push(null)
      }
      rowData.push(row)
    }
  }
  data.addRows(rowData);

  var options = {
    hAxis: {
      title: 'Timestamp'
    },
    width: 1000,
    height: 500
  };

  var chart = new google.charts.Line(document.getElementById('dbtime_timestamp_chart_div'));
  chart.draw(data, options);
}

function drawNetworkTimeAgainstCarNumbers(experimentData) {
  var data = new google.visualization.DataTable();
  data.addColumn('number', 'Car Numbers');
  for (i = 0; i < experimentData.length; i++) {
    data.addColumn('number', 'networkTime' + i);
  }
  var rowData = [];
  for (i = 0; i < experimentData.length; i++) {
    for (j = 0; j < experimentData[i].length; j++) {
      var row = []
      row.push(experimentData[i][j].numCars);
      for (a = 0; a < i; a++) {
        row.push(null);
      }
      row.push(experimentData[i][j].networkTime)
      for (a = i + 1; a < experimentData.length; a++) {
        row.push(null)
      }
      rowData.push(row)
    }
  }
  data.addRows(rowData);

  var options = {
    hAxis: {
      title: 'CarNumbers'
    },
    width: 1000,
    height: 500
  };

  var chart = new google.charts.Line(document.getElementById('network-time_car_chart_div'));
  chart.draw(data, options);
}

function drawNetworkTimeAgainstTimestamp(experimentData) {
  var data = new google.visualization.DataTable();
  data.addColumn('number', 'Timestamp');
  for (i = 0; i < experimentData.length; i++) {
    data.addColumn('number', 'networkTime' + i);
  }
  var rowData = [];
  for (i = 0; i < experimentData.length; i++) {
    for (j = 0; j < experimentData[i].length; j++) {
      var row = []
      row.push(experimentData[i][j].timestamp);
      for (a = 0; a < i; a++) {
        row.push(null);
      }
      row.push(experimentData[i][j].networkTime)
      for (a = i + 1; a < experimentData.length; a++) {
        row.push(null)
      }
      rowData.push(row)
    }
  }
  data.addRows(rowData);

  var options = {
    hAxis: {
      title: 'Timestamp'
    },
    width: 1000,
    height: 500
  };

  var chart = new google.charts.Line(document.getElementById('network-time_timestamp_chart_div'));
  chart.draw(data, options);
}
