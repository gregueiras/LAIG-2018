
/**
 * Creates a cylinder with base on XY centered on Z.
 *
 * @class MyCylinder
 * @extends {CGFobject}
 */
class MyCylinder extends CGFobject {

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

    this.slices = slices;
    this.stacks = stacks;
    this.delta = 2 * Math.PI / this.slices;

    this.vertices = new Array();
    this.indices = new Array();
    this.normals = new Array();
    this.texCoords = new Array();

    base = typeof base !== 'undefined' ? base : 1;
    top = typeof top !== 'undefined' ? top : 1;
    height = typeof height !== 'undefined' ? height : 1;

    this.base = base;
    this.top = top;
    this.b2tRatePstack = (base - top) / stacks;
    this.height = height;

    this.initBuffers();
  };


  /**
   * Initializes this instance vertices, indices, normals and texture coordinates.
   *
   * @memberof MyCylinder
   */
  initVIN() {
    var alt = this.height / this.stacks;
    for (var stack = 0; stack <= this.stacks; stack++) {

      for (var slice = 0; slice < this.slices; slice++) {
        this.vertices.push(Math.cos(slice * this.delta) * (this.base - (this.b2tRatePstack * stack)));
        this.vertices.push(Math.sin(slice * this.delta) * (this.base - (this.b2tRatePstack * stack)));
        this.vertices.push(stack * alt - this.height / 2);

        this.normals.push(Math.cos(slice * this.delta) * (this.base - (this.b2tRatePstack * stack)));
        this.normals.push(Math.sin(slice * this.delta) * (this.base - (this.b2tRatePstack * stack)));
        this.normals.push(0);

      }
    }

    for (var i = 0; i < this.slices * (this.stacks); i++) {

      this.indices.push(i);
      this.indices.push(i + 1);
      this.indices.push(i + this.slices);

      this.indices.push(i);
      this.indices.push(i + this.slices);
      this.indices.push(i + this.slices - 1);

    }

    var s = 0;
    var t = 0;

    for (var i = 0; i <= this.stacks; i++) {
      for (var j = 0; j < this.slices; j++) {
        this.texCoords.push(s, t);
        s += 1 / this.slices;
      }
      s = 0;
      t += 1 / this.stacks;
    }


  };


  /**
   * Initializes this instance buffers.
   *
   * @memberof MyCylinder
   */
  initBuffers() {
    this.initVIN();
    this.primitiveType = this.scene.gl.TRIANGLES;
    this.initGLBuffers();
  };
};