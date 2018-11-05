class LinearAnimation extends Animation {

  /**
   *Creates an instance of LinearAnimation.
   * @param {number} time
   * @param {Point[]} pointList
   * @memberof LinearAnimation
   */
  constructor(graph, time, pointList) {
    super(graph);
    this.time = time;
  
    this.interpolateTransformations(pointList);

  }

  interpolateTransformations(pointList) {
    let totD = totalDistance(pointList);
    let speed = this.time/totD;

    let distSoFar = 0;
    let oldDir = {x: 0, y: 0, z: 1};

    for (let index = 0; index < pointList.length - 1; index++) {
      const currPoint = pointList[index];
      const nextPoint = pointList[index + 1];

      let dir = vector(currPoint, nextPoint);
      let translation = {
        type: "translate",
        origX: dir.x,
        origY: dir.y,
        origZ: dir.z,
        startTime: distSoFar * speed,
        distance: linearDistance(currPoint, nextPoint),
        endTime: null
      };

      distSoFar += translation.distance;
      translation.endTime = distSoFar * speed;
      
      dir = normalize(dir);

      let rotAngle = angleBetweenVectors(oldDir, dir) / DEGREE_TO_RAD;
      let rotAxis = cross(oldDir, dir);
      
      let rotation = {
        type:"rotate",
        origAngle: rotAngle,
        axis: rotAxis,
        endTime: translation.startTime,
        instant: true,
        customAxis: true
      };
      
      this.transformations.push(rotation);
      this.transformations.push(translation);

      oldDir = dir;
    }
  }

}

function linearDistance(pA, pB) {
  return Math.sqrt(
      Math.pow((pA.x - pB.x), 2) + 
      Math.pow((pA.y - pB.y), 2) + 
      Math.pow((pA.z - pB.z), 2)
    );   
}

function vector(pA, pB) {
  let vec = {
    x: 0,
    y: 0,
    z: 0
  };
  
  vec.x = pB.x - pA.x;
  vec.y = pB.y - pA.y;
  vec.z = pB.z - pA.z;

  return vec;
}

function totalDistance(pointList) {
  let distance = 0;

  for (let index = 0; index < pointList.length - 1; index++) {
    const currPoint = pointList[index];
    const nextPoint = pointList[index + 1];

    distance += linearDistance(currPoint, nextPoint);
  }

  return distance;
}

function dotProduct(vA, vB) {
  return vA.x * vB.x + vA.y * vB.y + vA.z * vB.z;
}

function mag(v) {
  return Math.sqrt(Math.pow(v.x, 2) + Math.pow(v.y, 2) + Math.pow(v.z, 2));
}

function normalize(v) {
  let m = mag(v);
  return {
    x: v.x / m,
    y: v.y / m,
    z: v.z / m,
  };
}

function angleBetweenVectors(vA, vB) {
  return Math.acos(dotProduct(vA, vB)/ (mag(vA) * mag(vB)));
}

function cross(vA, vB) {
  return {
    x: vA.y * vB.z - vA.z * vB.y,
    y: vA.z * vB.x - vA.x * vB.z,
    z: vA.x * vB.y - vA.y * vB.x
  };
}