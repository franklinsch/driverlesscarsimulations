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

  var numCars = {key: 'numCars', descriptor: 'Number of Cars'};
  var timestamp = {key: 'timestamp', descriptor: 'Timestamp'};
  var hAxes = [numCars, timestamp];

  var accessTime = {key: 'accessTime', descriptor: 'Access Time'};
  var saveTime = {key: 'saveTime', descriptor: 'Save Time'};
  var networkTime = {key: 'networkTime', descriptor: 'Network Time'};
  var processTime = {key: 'processTime', descriptor: 'Process Time'};
  var vAxes = [accessTime, saveTime, networkTime, processTime];

  var html = '';
  for (var hAxis of hAxes) {
    for (var vAxis of vAxes) {
      var div_id = hAxis.key + '_' + vAxis.key + '_chart_div';
      html += '<div id="' + div_id + '"></div></br></br></br>';
    }
  }
  $('#charts').html(html);
  for (var hAxis of hAxes) {
    for (var vAxis of vAxes) {
      drawHAxisAgainstVAxis(experimentData, hAxis, vAxis);
    }
  }
}

function drawHAxisAgainstVAxis(experimentData, hAxis, vAxis) {
  var data = new google.visualization.DataTable();
  data.addColumn('number', hAxis.descriptor);
  for (i = 0; i < experimentData.length; i++) {
    data.addColumn('number', vAxis.descriptor + i);
  }
  var rowData = [];
  for (var i = 0; i < experimentData.length; i++) {
    for (var j = 0; j < experimentData[i].length; j++) {
      var row = []
      row.push(experimentData[i][j][hAxis.key]);
      for (var a = 0; a < i; a++) {
        row.push(null);
      }
      row.push(experimentData[i][j][vAxis.key]);
      for (var a = i + 1; a < experimentData.length; a++) {
        row.push(null);
      }
      rowData.push(row);
    }
  }
  data.addRows(rowData);

  var options = {
    hAxis: {
      title: hAxis.descriptor
    },
    width: 1000,
    height: 500
  };

  var div_name = hAxis.key + '_' + vAxis.key + '_chart_div';
  var chart = new google.charts.Line(document.getElementById(div_name));
  chart.draw(data, options);
}
