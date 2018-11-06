/**
 *
 * @class MyAnimation
 */
class Animation {

  constructor(graph) {
    this.graph = graph;
    this.currTime = 0;

    /** 
     * @type {Transformation[]}
     */
    this.transformations = [];
    console.dir(this);
  }

  update(elapsedTime) {
    this.currTime += elapsedTime;

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
          transformation.x = transformation.origX * completion;
          transformation.y = transformation.origY * completion;
          transformation.z = transformation.origZ * completion;
          break;

        case "rotate":
          transformation.angle = transformation.origAngle * completion;

          break;
        default:
          console.error(`Invalid value for transformation type`);
          break;
      }
    });
  }

  apply() {
    this.graph.transform(this.transformations);
  }
}