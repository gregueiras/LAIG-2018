/**
 * Makes the object of appliance move arround given center
 * for a set angle during a define period of time.
 * @extends {Animation}
 */
class CircularAnimation extends Animation {


  /**
   * Creates an instance of CircularAnimation.
   * 
   * @param {MySceneGraph} graph the scene graph
   * @param {number} span the time duration
   * @param {number} id the id
   * @param {Point} center the center of rotation
   * @param {number} radius the rotation radius
   * @param {number} startAngle the rotation initial angle
   * @param {number} rotationAngle the rotation total angle variation
   * @memberof CircularAnimation
   */
  constructor(graph, span, id, center, radius, startAngle, rotationAngle) {
    super(graph, id, span);

    this.interpolateTransformations(center, radius, startAngle, rotationAngle);
  }

  /**
   * Stores all necessary transformations preparing them for appliance.
   * 
   * @param {number} center the center of rotation
   * @param {number} radius the rotation radius
   * @param {number} startAngle the rotation initial angle
   * @param {number} rotationAngle the rotation total angle variation
   */
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
      origX: Math.sin(startAngle * DEGREE_TO_RAD) * radius,
      origY: 0,
      origZ: Math.cos(startAngle * DEGREE_TO_RAD) * radius,
      endTime: 0
    };

    let placeRot = { //rotation to startAngle
      type: "rotate",
      origAngle: 90 + startAngle,
      axis: "y",
      endTime: 0,
      instant: true,
    };
    
    let mainRot = {
      type: "rotate",
      startAngle: 90,
      origAngle: rotationAngle,
      axis: "y",
      startTime: 0,
      endTime: this.span,
    };

    let counterRotation1 = { //rotation to startAngle
      type: "rotate",
      origAngle: -placeRot.origAngle,
      axis: "y",
      endTime: this.span,
      instant: true,
      lastRot: true
    };
    
    let counterRotation2 = {
      type: "rotate",
      startAngle: mainRot.startAngle,
      origAngle: -mainRot.origAngle,
      axis: "y",
      endTime: this.span,
      instant: true,
      lastRot: true
    };

    this.transformations.push(centerTrans);
    this.transformations.push(mainRot);
    this.transformations.push(radiusTrans);
    this.transformations.push(placeRot);
    this.transformations.push(counterRotation2);
    this.transformations.push(counterRotation1);
  }

  /**
   * Updates animation current position.
   * @param {number} currTime the scene time counter
   * @param {number} rotate the flag indicating if it should update rotation and not translation
   * @param {boolean} lastAnimation the flag indicating if this animation is the last one to be made
   */
  update(currTime, rotate, lastAnimation) {
    super.update(currTime, rotate, true, lastAnimation);
  }
  
}