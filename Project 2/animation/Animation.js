/**
 *
 * @class MyAnimation
 */
class Animation {

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

  update(currTime) {
    this.currTime = currTime;

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

          if (transformation.startAngle)
            transformation.angle += transformation.startAngle;
          
          console.log(transformation.angle);
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