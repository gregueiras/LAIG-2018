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
    console.log(totD);
    let speed = this.time/totD;

    let distSoFar = 0;

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
      
      let rotation = {
        type:"rotate",
        axis: "y",
        origAngle: 90, //TODO: Check if +90 or -90
        endTime: translation.startTime,
        instant: true
      };
      

      this.transformations.push(rotation);
      this.transformations.push(translation);
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