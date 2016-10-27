point = JSON.parse(process.argv[2].substring(1))['geometry']['coordinates'];
geojson = JSON.parse(process.argv[3].substring(1));

distance = function(point1, point2) {
  return Math.sqrt(Math.pow(point1[0]-point2[0], 2) + Math.pow(point1[1]-point2[1], 2));
};

angle = function(origin, point) {
  return Math.atan2(point[1]-origin[1], point[0]-origin[0]);
}

dot = function(point1, point2) {
  return point1[0]*point2[0] + point1[1]*point2[1];
};

sub = function(point1, point2) {
  return [point1[0]-point2[0], point1[1]-point2[1]];
};

add = function(point1, point2) {
  return [point1[0]+point2[0], point1[1]+point2[1]];
};

scale = function(point, scale) {
  return [scale * point[0], scale * point[1]];
};

var min2_angle = undefined, min2_point, min2_i, min2_j;
var min_distance = -1, min_point, min_i, min_j, min_point_angle;
for (let i in geojson['features']) {
  const feature = geojson['features'][i]
  var last_point = null;
  if (feature['geometry']['type'] == 'LineString' && feature['properties']['highway']) {
    for (let j in feature['geometry']['coordinates']) {
      const coordinate = feature['geometry']['coordinates'][j];
      dist = distance(point, coordinate);
      if (min_distance == -1 || dist < min_distance) {
        min_point_angle = angle(coordinate, point);
        min_distance = dist;
        min_point = coordinate;
        min_i = i;
        min_j = j;

        if (j > 0) {
          min2_angle = Math.abs(angle(coordinate, last_point)-min_point_angle);
          min2_point = last_point;
          min2_i = i;
          min2_j = j-1;
        } else {
          min2_angle = undefined;
        }
      } 
      else if (j-1 == min_j && i == min_i) {
        ang = Math.abs(angle(min_point, coordinate)-min_point_angle);
        if (min2_angle == undefined || ang < min2_angle) {
          min2_angle = ang;
          min2_point = coordinate;
          min2_j = j;
        }
      }

      last_point = coordinate;
    }
  }
}

B = sub(min2_point, min_point);
A = sub(point, min_point);
proj = scale(B, dot(A, B)/dot(B, B));
proj = add(proj, min_point);
if (min2_i == min_i && Math.abs(min2_j - min_j) == 1) {
  console.log(proj);

  if (min_distance != 0) {
    j = min_j;
    if (min2_j > min_j) {
      j = min2_j;
    }
    geojson['features'][min_i]['geometry']['coordinates'].splice(j, 0, proj);

    var fs = require("fs");
    fs.writeFile("map.geojson", JSON.stringify(geojson), function (err) {
       if (err) throw err;
    });
  }
}
