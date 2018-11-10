/**
 * Creates a cylinder with base on XY centered on Z.
 * @extends {CGFobject}
 */
class cylinder2 extends CGFobject {

  /**
   *Creates an instance of MyCylinder.
   * @param {CGFscene} scene this instance CGFscene
   * @param {number} slices the number of radial segments
   * @param {number} stacks the number of segments along the heigth
   * @param {number} base the base radius
   * @param {number} top the top radius
   * @param { number} height the distance from base to top
   * @memberof MyCylinder
   */
  constructor(scene, slices, stacks, base, top, height) {
    super(scene);

    this.npartsU = stacks;
    this.npartsV = slices;

    base = typeof base !== 'undefined' ? base : 1;
    top = typeof top !== 'undefined' ? top : 1;
    height = typeof height !== 'undefined' ? height : 1;

    this.base = base;
    this.top = top;
    this.height = height;

    this.initObj();

    this.initBuffers();
  };


  /**
   * Initializes this instance vertices, indices, normals and texture coordinates.
   *
   * @memberof MyCylinder
   */
  initObj() {
    var baseZ = this.height / 2;
    var topZ = -this.height / 2;

    var baseCtrlPoints = [
      [this.base / 2, 0, baseZ, 1],
      [this.base / 2, this.base / 2, baseZ, 1],
      [0, this.base / 2, baseZ, 1],
      [-this.base / 2, this.base / 2, baseZ, 1],
      [-this.base / 2, 0, baseZ, 1],
      [-this.base / 2, -this.base / 2, baseZ, 1],
      [0, -this.base / 2, baseZ, 1],
      [this.base / 2, -this.base / 2, baseZ, 1],
      [this.base / 2, 0, baseZ, 1]
    ];

    var topCtrlPoints = [
      [this.top / 2, 0, topZ, 1],
      [this.top / 2, this.top / 2, topZ, 1],
      [0, this.top / 2, topZ, 1],
      [-this.top / 2, this.top / 2, topZ, 1],
      [-this.top / 2, 0, topZ, 1],
      [-this.top / 2, -this.top / 2, topZ, 1],
      [0, -this.top / 2, topZ, 1],
      [this.top / 2, -this.top / 2, topZ, 1],
      [this.top / 2, 0, topZ, 1]
    ];

    this.controlVertex = [baseCtrlPoints, topCtrlPoints];
    this.degreesU = this.controlVertex.length - 1;
    this.degreesV = baseCtrlPoints.length - 1;

    this.initGeometry();
  }

  initGeometry() {
    console.log(this.controlVertex);
    console.log(this.degreesU);
    console.log(this.degreesV);
    console.log(this.npartsU);
    console.log(this.npartsV);
    var nurbsSurface = new CGFnurbsSurface(this.degreesU, this.degreesV, this.controlVertex);

    this.obj = new CGFnurbsObject(this.scene, this.npartsU, this.npartsV, nurbsSurface);

    console.log(nurbsSurface);
    console.log(this.obj);
  }

  display() {
    this.obj.display();
  }

};