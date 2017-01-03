const toDegrees = function(v) {
  return v * 180 / Math.PI;
}

const toRadians = function(v) {
  return v * Math.PI / 180;
}

const getBearing = function(start, end) {
  const lat1 = toRadians(start[1]);
  const lng1 = toRadians(start[0]);
  const lat2 = toRadians(end[1]);
  const lng2 = toRadians(end[0]);
  const d_lng = lng2-lng1;
  const y = Math.sin(d_lng)*Math.cos(lat2);
  const x = Math.cos(lat1)*Math.sin(lat2)-Math.sin(lat1)*Math.cos(lat2)*Math.cos(d_lng);
  return toDegrees(Math.atan2(y, x));
}

const getNearest = function(p, pathFinder) {
  let min_dist = undefined, min_point, min_edge;
  for (const edge of pathFinder._topo.edges) {
    const props = edge[2];
    if (props['highway']) {
      const v0 = pathFinder._topo.vertices[edge[0]];
      const v1 = pathFinder._topo.vertices[edge[1]];
      let test = false;
      if (v0[1] == 51.4983735 || v1[1] == 51.4983735 ||
          v0[1] == 51.4980849 || v1[1] == 51.4980849) {
        test = true;
      }
      const Ax = v0[0];
      const Ay = v0[1];
      const Bx = v1[0];
      const By = v1[1];
      const x  = p[0];
      const y  = p[1];

      const dy    = By - Ay;
      const dx    = Bx - Ax;
      //const ang   = Math.atan2(dy, dx);
      const ang   = getBearing(v0, v1);
      const theta = (ang + 90 + 180) % 360 - 180;

      let m = (dy*(Ax - x) - dx*(Ay - y))/(dy*Math.cos(theta) - dx*Math.sin(theta));
      let proj = [x + m*Math.cos(theta), y + m*Math.sin(theta)];
      m = Math.abs(m);
      if (test) {
        console.error('Test: ' + m);
        console.error(dy);
        console.error(dx);
        console.error(ang);
        console.error(theta);
        console.error(p);
        console.error(v0);
        console.error(proj);
        console.error(v1);
        console.error();
      }

      const eps = pathFinder._precision;

      let minx = -eps, maxx = eps, left_edge, right_edge;
      if (Ax < Bx) {
        minx += Ax;
        maxx += Bx;
        left_edge = v0;
        right_edge = v1;
      } else {
        minx += Bx;
        maxx += Ax;
        right_edge = v0;
        left_edge = v1;
      }
      const midx = (minx + maxx) / 2;
      if (proj[0] <= midx) {
        if (proj[0] < minx) {
          proj = left_edge;
          m = (x - proj[0])**2 + (y - proj[1])**2;
        }
      } else if (proj[0] > midx) {
        if (proj[0] > maxx) {
          proj = right_edge;
          m = (x - proj[0])**2 + (y - proj[1])**2;
        }
      }

      if (min_dist == undefined || m < min_dist) {
        min_dist = m;
        min_point = proj;
        min_edge = edge;
      }
    }
  }

  min_dist = Math.sqrt(min_dist);
  return [min_dist, min_point];
}

point1 = JSON.parse(process.argv[5].substring(1));
point2 = JSON.parse(process.argv[6].substring(1));
console.error(point1);
console.error(point2);

start = JSON.parse(process.argv[2].substring(1));
end = JSON.parse(process.argv[3].substring(1));
var fs = require('fs');
const geojson = JSON.parse(fs.readFileSync(process.argv[4], 'utf8'));

var PathFinder = require('geojson-path-finder');

var pathFinder = new PathFinder(geojson);
console.error(getNearest(point1.geometry.coordinates, pathFinder));
console.error(getNearest(point2.geometry.coordinates, pathFinder));
//fs.writeFile('pathfinder.dump', JSON.stringify(pathFinder), function (err) {
  //if (err) throw err;
//});
var path = pathFinder.findPath(start, end);
console.log(JSON.stringify(path));
