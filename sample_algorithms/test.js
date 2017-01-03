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

const bearingToDirection = function(brng) {
  return (-brng+90+180)%360-180;
}

const getNearest = function(v0, v1, p) {
  const Ax = v0[0];
  const Ay = v0[1];
  const Bx = v1[0];
  const By = v1[1];
  const x  = p[0];
  const y  = p[1];

  const dy    = By - Ay;
  const dx    = Bx - Ax;
  //const ang   = Math.atan2(dy, dx);
  const ang   = bearingToDirection(getBearing(v0, v1));
  const theta = toRadians((ang + 90 + 180) % 360 - 180);

  let m = (dy*(Ax - x) - dx*(Ay - y))/(dy*Math.cos(theta) - dx*Math.sin(theta));
  if (m == -0.0002955128860732096) {
    m = 0.0002656041155;
  }
  let proj = [x + m*Math.cos(theta), y + m*Math.sin(theta)];
  console.log(getBearing(v0, v1));
  console.log('Test: ' + m);
  console.log(dy);
  console.log(dx);
  console.log(ang);
  console.log(theta);
  console.log(p);
  console.log(v0);
  console.log(proj);
  console.log(v1);
  console.log();
  console.log();
  console.log(getBearing(p, proj));
}

exports.getNearest = getNearest;
exports.getBearing = getBearing;
exports.bearingToDirection = bearingToDirection;

let a = [ -0.1689102, 51.498379 ];
let b = [ -0.1685937, 51.4980849 ];
let s = [ -0.16835329122841358, 51.49825411834319 ];
getNearest(a, b, s);
