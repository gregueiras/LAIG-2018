/**
 * MyObject
 * @param gl {WebGLRenderingContext}
 * @constructor
 */

class MyPrism extends CGFobject {
    constructor(scene, slices, stacks) {
      super(scene);
  
      this.slices = slices;
      this.stacks = stacks;
      this.delta = 2 * Math.PI / this.slices;
  
      this.vertices = new Array();
      this.indices = new Array();
      this.normals = new Array();
      this.initBuffers();
    };
  
    initVIN() {
      var alt = 1 / this.stacks;
      for (var stack = 0; stack < this.stacks; stack++) {
  
        for (var slice = 0; slice < this.slices; slice++) {
  
  
          this.vertices.push(Math.cos((slice + 1) * this.delta));
          this.vertices.push(Math.sin((slice + 1) * this.delta));
          this.vertices.push(stack * alt);
  
  
          this.vertices.push(Math.cos(slice * this.delta));
          this.vertices.push(Math.sin(slice * this.delta));
          this.vertices.push((stack + 1) * alt);
  
  
          this.vertices.push(Math.cos(slice * this.delta));
          this.vertices.push(Math.sin(slice * this.delta));
          this.vertices.push(stack * alt);
  
  
          this.vertices.push(Math.cos((slice + 1) * this.delta));
          this.vertices.push(Math.sin((slice + 1) * this.delta));
          this.vertices.push(stack * alt);
  
  
          this.vertices.push(Math.cos((slice + 1) * this.delta));
          this.vertices.push(Math.sin((slice + 1) * this.delta));
          this.vertices.push((stack + 1) * alt);
  
  
          this.vertices.push(Math.cos(slice * this.delta));
          this.vertices.push(Math.sin(slice * this.delta));
          this.vertices.push((stack + 1) * alt);
  
  
  
          for (var i = 6; i > 0; i--) {
            this.indices.push((this.vertices.length / 3) - i);
          }
  
          for (var i = 0; i < 3; i++) {
            this.normals.push(Math.cos(this.delta / 2) + slice * this.delta);
            this.normals.push(Math.sin(this.delta / 2));
            this.normals.push(0);
          }
  
          for (var i = 0; i < 3; i++) {
            this.normals.push(Math.cos(this.delta / 2) + slice * this.delta);
            this.normals.push(Math.sin(this.delta / 2));
            this.normals.push(0);
          }
        }
      }
  
    };
  
    initBuffers() {
      this.initVIN();
      this.primitiveType = this.scene.gl.TRIANGLES;
      this.initGLBuffers();
    };
  };