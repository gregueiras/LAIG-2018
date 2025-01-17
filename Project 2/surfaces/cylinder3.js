/**
 * Creates a cylinder with base on XY centered on Z.
 * Slightly crooked, kept for style reasons (used in MyShip)
 * @extends {CGFobject}
 */
class Cylinder3 extends CGFobject {

  /**
   *Creates an instance of MyCylinder.
   * @param {CGFscene} scene this instance CGFscene
   * @param {number} slices the number of radial segments
   * @param {number} stacks the number of segments along the height
   * @param {number} base the base radius
   * @param {number} top the top radius
   * @param { number} height the distance from base to top
   */
  constructor(scene, slices, stacks, base, top, height) {
    super(scene);

    this.npartsU = slices;
    this.npartsV = stacks;

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
   */
  initObj() {
    var baseZ = 0;
    var topZ = this.height;

    this.controlVertex = [
      [
        [this.top, 0, topZ, 1],
        [this.base, 0, baseZ, 1],
      ],
      [
        [this.top, -this.top, topZ, 1.00],
        [this.base, -this.base, baseZ, 1.00],
      ],
      [
        [0, -this.top, topZ, 1],
        [0, -this.base, baseZ, 1],
      ],
      [
        [-this.top, -this.top, topZ, 1.00],
        [-this.base, -this.base, baseZ, 1.00],
      ],
      [
        [-this.top, 0, topZ, 10],
        [-this.base, 0, baseZ, 10],
      ],
      [
        [-this.top, this.top, topZ, 1.00],
        [-this.base, this.base, baseZ, 1.00],
      ],
      [
        [0, this.top, topZ, 1],
        [0, this.base, baseZ, 1],
      ],
      [
        [this.top, this.top, topZ, 1.00],
        [this.base, this.base, baseZ, 1.00],
      ],
      [
        [this.top, 0, topZ, 1],
        [this.base, 0, baseZ, 1],
      ],
    ];
    this.degreesU = this.controlVertex.length - 1;
    this.degreesV = this.controlVertex[0].length - 1;

    this.initGeometry();
  }

  initGeometry() {
    var nurbsSurface = new CGFnurbsSurface(this.degreesU, this.degreesV, this.controlVertex);

    this.obj = new CGFnurbsObject(this.scene, this.npartsU, this.npartsV, nurbsSurface);

  }

  display() {
    this.obj.display();
  }

};