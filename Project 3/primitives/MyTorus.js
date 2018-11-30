

/**
 * Creates a torus centered on origin with interior radius on XY
 *
 * @extends {CGFobject}
 */
class MyTorus extends CGFobject {

  /**
   *Creates an instance of MyTorus.
   * @param {CGFscene} scene
   * @param {number} outRadius the outer radius 
   * @param {number} inRadius the inner radius
   * @param {number} slices the number of radial segments
   * @param {number} loops the number of radial segments centered on outer radius
   * @memberof MyTorus
   */
  constructor(scene, outRadius, inRadius, slices, loops) {
    super(scene);

    this.slices = slices;
    this.loops = loops;
    this.outRadius = outRadius;
    this.inRadius = inRadius;

    this.vertices = new Array();
    this.indices = new Array();
    this.normals = new Array();
    this.texCoords = new Array();
    this.initBuffers();
  };


  /**
   * Initializes this instance vertices, indices, normals and texture coordinates.
   *
   * @memberof MyTorus
   */
  initVIN() {
    let arc = Math.PI * 2;

    for (let j = 0; j <= this.loops; j++) {
      let theta = Math.PI * 2 * j / this.loops;

      for (let i = 0; i <= this.slices; i++) {
        let alpha = i / this.slices * arc;

        let v = {
          x: Math.cos(alpha) * (this.outRadius + this.inRadius * Math.cos(theta)),
          y: Math.sin(alpha) * (this.outRadius + this.inRadius * Math.cos(theta)),
          z: Math.sin(theta) * this.inRadius
        };

        this.vertices.push(v.x, v.y, v.z);

        let c = { //center of torus section
          x: Math.cos(alpha) * this.outRadius,
          y: Math.sin(alpha) * this.outRadius,
          z: 0
        };

        let n = { //normal between center of torus section and outer/inner layer
          x: v.x - c.x,
          y: v.y - c.y,
          z: v.z
        };

        this.normals.push(n.x, n.y, n.z);

        this.texCoords.push(i / this.slices);
        this.texCoords.push(j / this.loops);
      }
    }
    for (let j = 1; j <= this.loops; j++) {
      for (let i = 1; i <= this.slices; i++) {
        // indices

        var a = (this.slices + 1) * j + i - 1;
        var b = (this.slices + 1) * (j - 1) + i - 1;
        var c = (this.slices + 1) * (j - 1) + i;
        var d = (this.slices + 1) * j + i;

        // faces
        this.indices.push(a, b, d);
        this.indices.push(b, c, d);

      }
    }
  }


  /**
   * Initializes this instance buffers.
   *
   * @memberof MyTorus
   */
  initBuffers() {
    this.initVIN();
    this.primitiveType = this.scene.gl.TRIANGLES;
    this.initGLBuffers();
  };
};