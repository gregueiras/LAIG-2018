/**
 * MyObject
 * @param gl {WebGLRenderingContext}
 * @constructor
 */

class MyTorus extends CGFobject {
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

  initVIN() {
    let arc = Math.PI * 2;

    for (let j = 0; j <= this.loops; j++) {
      for (let i = 0; i <= this.slices; i++) {
        let alpha = i / this.slices * arc;
        let theta = Math.PI * 2 * j / this.loops;

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


  initBuffers() {
    this.initVIN();
    this.primitiveType = this.scene.gl.TRIANGLES;
    this.initGLBuffers();
  };
};