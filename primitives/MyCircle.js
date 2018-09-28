/**
 * MyObject
 * @param gl {WebGLRenderingContext}
 * @constructor
 */

class MyCircle extends CGFobject {
    constructor(scene, slices) {
      super(scene);
  
      this.slices = slices;
      this.delta = 2 * Math.PI / this.slices;
  
      this.vertices = new Array();
      this.indices = new Array();
      this.normals = new Array();
      this.texCoords = new Array();
  
      this.initBuffers();
    };
  
    initVIN() {
      for (var slice = 0; slice < this.slices; slice++) {
  
        this.vertices.push(Math.cos(slice * this.delta));
        this.vertices.push(Math.sin(slice * this.delta));
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
  
    initBuffers() {
      this.initVIN();
  
      this.primitiveType = this.scene.gl.TRIANGLES;
      this.initGLBuffers();
    };
  };