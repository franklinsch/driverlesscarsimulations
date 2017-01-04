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

  const a = Math.sin(dlat/2)**2 +
            Math.cos(lat1)*Math.cos(lat2)*Math.sin(dlng/2)**2;
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

  const delta12 = 2 * Math.asin(Math.sqrt(Math.sin(dlat/2)**2 + Math.cos(lat1)*Math.cos(lat2)*Math.sin(dlng/2)**2));
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
  console.log(ang);

  const mul = (comp >= min_ang && comp <= max_ang) ? 1 : -1;
  const theta = (max_ang + 90 * mul + 540) % 360 - 180;
  const res = getIntersectionPoint(v0, ang, p, theta);
  console.log(getBearing(p, res));
  return res;
}

let a = [ -0.1689102, 51.498379 ];
let b = [ -0.1685937, 51.4980849 ];
let s = [ -0.16835329122841358, 51.49825411834319 ];
//console.log(getNormalIntersection(a, b, s));
//
let o = [ -0.185773316770792, 51.499566545216325 ];
a = [-0.1858895,51.4998596];
b = [-0.1859493,51.4992718];
console.log(getNormalIntersection(a, b, o));
let p1 = [ -0.18546949425081038, 51.499609510126845 ];
let p2 = [ -0.18550942493458247, 51.499436580468185 ];
console.log(getDistance(o, p1));
console.log(getDistance(o, p2));
