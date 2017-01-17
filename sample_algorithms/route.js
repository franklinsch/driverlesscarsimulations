point = require('turf-point');

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

const getDistance = function(p1, p2) {
  const R = 6371e3;
  const lat1 = toRadians(p1[1]);
  const lng1 = toRadians(p1[0]);
  const lat2 = toRadians(p2[1]);
  const lng2 = toRadians(p2[0]);
  const dlat = lat2-lat1;
  const dlng = lng2-lng1;

  const a = Math.pow(Math.sin(dlat/2), 2) +
            Math.cos(lat1)*Math.cos(lat2)*Math.pow(Math.sin(dlng/2), 2);
  const c = 2*Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R*c;
}

const bearingToDirection = function(brng) {
  return (-brng+90+180)%360-180;
}

const getIntersectionPoint = function(p1, b1, p2, b2) {
  const lat1 = toRadians(p1[1]);
  const lng1 = toRadians(p1[0]);
  const lat2 = toRadians(p2[1]);
  const lng2 = toRadians(p2[0]);
  const theta13 = toRadians(b1);
  const theta23 = toRadians(b2);

  const dlat = lat2 - lat1;
  const dlng = lng2 - lng1;

  const delta12 = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(dlat/2), 2) + Math.cos(lat1)*Math.cos(lat2)*Math.pow(Math.sin(dlng/2), 2)));
  const theta_a = Math.acos((Math.sin(lat2) - Math.sin(lat1)*Math.cos(delta12)) /
                            (Math.sin(delta12)*Math.cos(lat1)));
  const theta_b = Math.acos((Math.sin(lat1) - Math.sin(lat2)*Math.cos(delta12)) /
                            (Math.sin(delta12)*Math.cos(lat2)));

  let theta12, theta21;
  if (Math.sin(dlng) > 0) {
    theta12 = theta_a;
    theta21 = 2 * Math.PI - theta_b;
  } else {
    theta12 = 2 * Math.PI - theta_a;
    theta21 = theta_b;
  }

  const alpha1 = (theta13 - theta12 + Math.PI) % (2 * Math.PI) - Math.PI;
  const alpha2 = (theta21 - theta23 + Math.PI) % (2 * Math.PI) - Math.PI;

  const alpha3 = Math.acos(-Math.cos(alpha1)*Math.cos(alpha2) +
                            Math.sin(alpha1)*Math.sin(alpha2)*Math.cos(delta12));
  const delta13 = Math.atan2(Math.sin(delta12)*Math.sin(alpha1)*Math.sin(alpha2),
                             Math.cos(alpha2) + Math.cos(alpha1)*Math.cos(alpha3));
  const lat3 = Math.asin(Math.sin(lat1)*Math.cos(delta13) +
                         Math.cos(lat1)*Math.sin(delta13)*Math.cos(theta13));
  const dlng13 = Math.atan2(Math.sin(theta13)*Math.sin(delta13)*Math.cos(lat1),
                            Math.cos(delta13) - Math.sin(lat1)*Math.sin(lat3));
  const lng3 = lng1 + dlng13;
  return [(toDegrees(lng3)+540)%360-180, toDegrees(lat3)];
}

const getNormalIntersection = function(v0, v1, p) {
  const ang = getBearing(v0, v1);
  const r_ang = (ang + 180 + 180) % 360 - 180;
  const min_ang = Math.min(ang, r_ang);
  const max_ang = Math.max(ang, r_ang);
  const comp = getBearing(v0, p);

  const mul = (comp >= min_ang && comp <= max_ang) ? 1 : -1;
  const theta = (max_ang + 90 * mul + 540) % 360 - 180;
  return getIntersectionPoint(v0, ang, p, theta);
}

const ignore_values = ["bus_stop","crossing","elevator","emergency_access_point","give_way","phone","mini_roundabout","motorway_junction","passing_place","rest_area","speed_camera","street_lamp","services","stop","traffic_signals","turning_circle","proposed","construction","cycleway","path","steps","bridleway","footway","road","raceway","escape","bus_guideway","track","pedestrian","service"];
const getNearest = function(p, pathFinder) {
  let min_dist = undefined, min_point, min_edge;
  for (let i in pathFinder._topo.edges) {
    const edge = pathFinder._topo.edges[i];
    const props = edge[2];


    if (props['highway'] && ignore_values.indexOf(props['highway']) == -1) {
      const v0 = pathFinder._topo.vertices[edge[0]];
      const v1 = pathFinder._topo.vertices[edge[1]];

      let proj = getNormalIntersection(v0, v1, p);
      const Ax = v0[0];
      const Ay = v0[1];
      const Bx = v1[0];
      const By = v1[1];
      const x  = p[0];
      const y  = p[1];

      const eps = pathFinder._precision;

      let min = -eps, max = eps, left_edge, right_edge;
      if (Ax == Bx) {
        if (Ay < By) {
          min += Ay;
          max += By;
          left_edge = v0;
          right_edge = v1;
        } else {
          min += By;
          max += Ay;
          right_edge = v0;
          left_edge = v1;
        }
      } else if (Ax < Bx) {
        min += Ax;
        max += Bx;
        left_edge = v0;
        right_edge = v1;
      } else {
        min += Bx;
        max += Ax;
        right_edge = v0;
        left_edge = v1;
      }
      const mid = (min + max) / 2;

      i = Number(i)
      if (proj[0] <= mid) {
        if (proj[0] < min) {
          proj = left_edge;
          i = undefined;
        }
      } else if (proj[0] > mid) {
        if (proj[0] > max) {
          proj = right_edge;
          i = undefined;
        }
      }

      const m = getDistance(proj, p);
      if (min_dist == undefined || m < min_dist) {
        min_dist = m;
        min_point = proj;
        min_edge_index = i;
      }
    }
  }

  let vs = [];
  if (min_edge_index != undefined) {
    vs = pathFinder._addVertex(min_point, min_edge_index, getDistance);
  }
  return [min_point, min_edge_index, vs];
}

const fs = require('fs');
const PathFinder = require('geojson-path-finder');

const pairs = JSON.parse(process.argv[2].substring(1));
const geojson = JSON.parse(fs.readFileSync(process.argv[3], 'utf8'));

const pathFinder = new PathFinder(geojson);

const paths = pairs.map(function(pair, index) {
  console.error('.' + index)
  const nearests = [
    getNearest(pair[0], pathFinder),
    getNearest(pair[1], pathFinder)
  ];
  const start = nearests[0][0];
  const end = nearests[1][0];
  const path = pathFinder.findPath(point(start), point(end))['path'];

  let ev = path[path.length - 1];
  if (nearests[1][1] != undefined) {
    const evs = pathFinder._removeVertex(nearests[1][1], nearests[1][2][0], nearests[1][2][1]);
    if (path[path.length - 2] == evs[1]) {
      ev = evs[0];
    } else {
      ev = evs[1];
    }
  }
  let sv = path[1];
  if (nearests[0][1] != undefined) {
    const svs = pathFinder._removeVertex(nearests[0][1], nearests[0][2][0], nearests[0][2][1]);
    if (path[2] == svs[1]) {
      sv = svs[0];
    } else {
      sv = svs[1];
    }
  }
  return [path, sv, ev];
});
console.log(JSON.stringify(paths));
