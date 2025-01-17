/**
 * Serves as parent class for linear and circular animations
 * updating their moves accordingly and applying the corresponding
 * transformation.
 * 
 */
class Animation {

  /**
   * Creates an instance of Animation.
   * 
   * @param {MySceneGraph} graph the scene graph
   * @param {number} id the id
   * @param {number} span the time duration
   */
  constructor(graph, id, span) {
    this.graph = graph;
    this.currTime = 0;
    this.id = id;
    this.span = span;

    /** 
     * @type {Transformation[]}
     */
    this.transformations = [];
  }

  /**
   * Updates animation current position.
   * @param {number} currTime the scene time counter
   * @param {number} rotate the flag indicating if it should update rotation and not translation
   * @param {number} ignoreFlag the flag indicating if rotate param should be ignored
   * @param {boolean} lastAnimation the flag indicating if this animation is the last one to be made
   */
  update(currTime, rotate, ignoreFlag, lastAnimation) {
    this.currTime = currTime;
    if (this.currTime === null)
      return;

    this.transformations.forEach(transformation => {
      let completion = 0;


      if (this.currTime >= transformation.endTime) {
        completion = 1;
      } else if (this.currTime <= transformation.startTime || transformation.instant) {
        completion = 0;
      } else {
        completion = (this.currTime - transformation.startTime) / (transformation.endTime - transformation.startTime);
      }

      switch (transformation.type) {
        case "translate":
        case "scale":
          if (rotate && !ignoreFlag)
            completion = 0;

          transformation.x = transformation.origX * completion;
          transformation.y = transformation.origY * completion;
          transformation.z = transformation.origZ * completion;
          break;
        case "rotate":

          transformation.angle = transformation.origAngle * completion;

          if ( (!rotate && !ignoreFlag) || (transformation.lastRot && lastAnimation) )
            transformation.angle = 0;
          else if (transformation.startAngle && !transformation.instant)
            transformation.angle += transformation.startAngle;
          break;
        default:
          console.error(`Invalid value for transformation type`);
          console.dir(transformation)
          break;
      }
    });
  }

  /**
   * Transforms this graph in accordance to this animation state.
   */
  apply() {
    if (this.currTime === null)
      return;
    this.graph.transform(this.transformations);
  }
}