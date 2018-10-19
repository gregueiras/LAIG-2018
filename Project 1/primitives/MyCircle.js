
/**
 * Creates a circle in XY
 *
 * @class MyCircle
 * @extends {CGFobject}
 */
class MyCircle extends CGFobject {

    /**
     * Creates an instance of MyCircle.
     * @param {CGFscene} scene this instance CGFscene
     * @param {number} slices the number of radial segments
     * @param {number} radius the radius
     * @memberof MyCircle
     */
    constructor(scene, slices, radius) {
      super(scene);
  
      this.slices = slices;
      this.delta = 2 * Math.PI / this.slices;
  
      this.vertices = new Array();
      this.indices = new Array();
      this.normals = new Array();
      this.texCoords = new Array();

      radius = typeof radius !== 'undefined' ? radius : 1;

      this.radius = radius;
  
      this.initBuffers();
    };
  
    /**
     * Initializes this instance vertices, indices, normals and texture coordinates.
     *
     * @memberof MyCircle
     */
    initVIN() {
      for (var slice = 0; slice < this.slices; slice++) {
  
        this.vertices.push(Math.cos(slice * this.delta)*this.radius);
        this.vertices.push(Math.sin(slice * this.delta)*this.radius);
        this.vertices.push(0);
      }
  
      this.vertices.push(0, 0, 0);
  
      for (var slice = 0; slice < this.slices + 1; slice++) {
        this.normals.push(0, 0, 1);
      }
  
      for (var slice = 0; slice < this.slices; slice++) {
        this.indices.push(slice, (slice + 1) % this.slices, this.slices);
      }
  
      for (var slice = 0; slice < 3 * (this.slices + 1); slice += 3) {
        this.texCoords.push(this.vertices[slice] / 2 + 0.5, -(this.vertices[slice + 1] / 2 + 0.5));
      }
  
    };
  

    /**
     * Initializes this instance buffers.
     *
     * @memberof MyCircle
     */
    initBuffers() {
      this.initVIN();
  
      this.primitiveType = this.scene.gl.TRIANGLES;
      this.initGLBuffers();
    };
  };