class CircularAnimation extends Animation {


  /**
   *Creates an instance of CircularAnimation.
   * @param {*} graph
   * @param {*} span
   * @param {*} id
   * @param {Point} center
   * @param {*} radius
   * @param {*} startAngle
   * @param {*} rotationAngle
   * @memberof CircularAnimation
   */
  constructor(graph, span, id, center, radius, startAngle, rotationAngle) {
    super(graph, id, span);

    this.interpolateTransformations(center, radius, startAngle, rotationAngle);

    this.transformations.sort((a, b) => {
      let x = a.type.toLowerCase();
      var y = b.type.toLowerCase();
      if (x > y) {
        return -1;
      }
      if (x < y) {
        return 1;
      }
      return 0;

    });
  }

  interpolateTransformations(center, radius, startAngle, rotationAngle) {

    let centerTrans = {
      type: "translate",
      origX: center.x,
      origY: center.y,
      origZ: center.z,
      endTime: 0
    };

    let radiusTrans = {
      type: "translate",
      origX: Math.cos(startAngle) * radius,
      origY: Math.sin(startAngle) * radius,
      origZ: center.z,
      endTime: 0
    };

    let placeRot = {//rotation to startAngle
      type: "rotate",
      origAngle: startAngle,
      axis: "y",
      endTime: 0,
      instant: true,
    };

    let mainRot = {
      type: "rotate",
      startAngle: 0,
      origAngle: rotationAngle,
      axis: "y",
      startTime: 0,
      endTime: this.span,
    };

    //this.transformations.push(centerTrans);
    //this.transformations.push(mainRot);
    this.transformations.push(radiusTrans);
    this.transformations.push(placeRot);
  }

}