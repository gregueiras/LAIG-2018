/**
 * Creates a cylinder with base on XY centered on Z.
 * This one uses 2 half cylinders and rotates one
 * to form a complete cylinder.
 * @extends {CGFobject}
 */
class Cylinder2 extends CGFobject {

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

    this.npartsU = slices/2;
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

    var alphaX = Math.cos(Math.PI / 4);
    var alphaY = Math.sin(Math.PI / 4);

    var m = Math.tan(Math.PI / 3);
    var b = alphaY + m * alphaX;
    var maxY = b;
    var maxX = -1*((-1 - b) / m);

    this.controlVertex = [
      //6
      [
        [this.top, 0, topZ, 1],
        [this.base, 0, baseZ, 1],
      ],
      //7
      [
        [this.top, -this.top, topZ, 4],
        [this.base, -this.base, baseZ, 4],
      ],
      //0
      [
        [0, -this.top, topZ, 15],
        [0, -this.base, baseZ, 15],
      ],
      //1
      [
        [-this.top, -this.top, topZ, 4],
        [-this.base, -this.base, baseZ, 4],
      ],
      //2
      [
        [-this.top, 0, topZ, 1],
        [-this.base, 0, baseZ, 1],
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
    this.scene.pushMatrix();
    this.scene.rotate(Math.PI, 0, 0, 1);
    this.obj.display();
    this.scene.popMatrix();
  }

};