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
  data.addColumn('number', 'dbTime');

  var rowData = [];
  for (i = 0; i < experimentData.length; i++) {
    rowData.push([experimentData[i].numCars, experimentData[i].dbTime]);
  }
  data.addRows(rowData);

  var options = {
    hAxis: {
      title: 'CarNumbers'
    },
    colors: ['#a52714'],
    width: 1000,
    height: 500
  };

  var chart = new google.charts.Line(document.getElementById('dbtime_car_chart_div'));
  chart.draw(data, options);
}

function drawDbTimeAgainstTimestamp(experimentData) {
  var data = new google.visualization.DataTable();
  data.addColumn('number', 'timestamp');
  data.addColumn('number', 'dbTime');

  var rowData = [];
  for (i = 0; i < experimentData.length; i++) {
    rowData.push([experimentData[i].timestamp, experimentData[i].dbTime]);
  }
  data.addRows(rowData);

  var options = {
    hAxis: {
      title: 'Timestamp'
    },
    colors: ['#a52714'],
    width: 1000,
    height: 500
  };

  var chart = new google.charts.Line(document.getElementById('dbtime_timestamp_chart_div'));
  chart.draw(data, options);
}

function drawNetworkTimeAgainstCarNumbers(experimentData) {
  var data = new google.visualization.DataTable();
  data.addColumn('number', 'Car Numbers');
  data.addColumn('number', 'networkTime');

  var rowData = [];
  for (i = 0; i < experimentData.length; i++) {
    rowData.push([experimentData[i].numCars, experimentData[i].networkTime]);
  }
  data.addRows(rowData);

  var options = {
    hAxis: {
      title: 'CarNumbers'
    },
    colors: ['#a52714'],
    width: 1000,
    height: 500
  };

  var chart = new google.charts.Line(document.getElementById('network-time_car_chart_div'));
  chart.draw(data, options);
}

function drawNetworkTimeAgainstTimestamp(experimentData) {
  var data = new google.visualization.DataTable();
  data.addColumn('number', 'Timestamp');
  data.addColumn('number', 'networkTime');

  var rowData = [];
  for (i = 0; i < experimentData.length; i++) {
    rowData.push([experimentData[i].timestamp, experimentData[i].networkTime]);
  }
  data.addRows(rowData);

  var options = {
    hAxis: {
      title: 'Timestamp'
    },
    colors: ['#a52714'],
    width: 1000,
    height: 500
  };

  var chart = new google.charts.Line(document.getElementById('network-time_timestamp_chart_div'));
  chart.draw(data, options);
}
