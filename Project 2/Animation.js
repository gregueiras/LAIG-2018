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
  }

  update(elapsedTime) {
    this.transformations.forEach(transformation => {
      let completion = 0;


      if (elapsedTime >= transformation.endTime) {
        completion = 1;
      } else if (elapsedTime <= transformation.startTime || transformation.instant) {
        completion = 0;
      } else {
        completion = (transformation.endTime - transformation.startTime) / (elapsedTime - transformation.startTime);
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
    this.graph.transform(this.tranformations);
  }
}