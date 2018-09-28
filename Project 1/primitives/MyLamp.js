/**
 * MyObject
 * @param gl {WebGLRenderingContext}
 * @constructor
 */

class MyLamp extends CGFobject {
    constructor(scene, slices, stacks) {
      super(scene);
  
      this.slices = slices;
      this.stacks = stacks;
  
      this.vertices = new Array();
      this.indices = new Array();
      this.normals = new Array();
      this.texCoords = new Array();
      this.initBuffers();
    };
  
    initVIN() {
      var alpha = Math.PI / this.stacks;
      var theta = 2 * Math.PI / this.slices;
      for (var stack = 0; stack < this.stacks; stack++) {
        for (var slice = 0; slice <= this.slices; slice++) {
  
          this.vertices.push(Math.cos(stack * alpha) * Math.cos(slice * theta));
          this.vertices.push(Math.sin(stack * alpha));
          this.vertices.push(Math.cos(stack * alpha) * Math.sin(slice * theta));
  
          this.normals.push(Math.cos(stack * alpha) * Math.cos(slice * theta));
          this.normals.push(Math.sin(stack * alpha));
          this.normals.push(Math.cos(stack * alpha) * Math.sin(slice * theta));
  
          this.texCoords.push(0.5 - Math.cos(stack * alpha) * Math.sin(slice * theta) / 2);
          this.texCoords.push(0.5 - Math.cos(stack * alpha) * Math.cos(slice * theta) / 2);
        }
      }
  
      for (var i = 0; i <= this.slices * (this.stacks); i++) {
        this.indices.push(i);
        this.indices.push(i + (this.slices + 1));
        this.indices.push(i + 1);
  
        this.indices.push(i + this.slices);
        this.indices.push(i + this.slices + 1);
        this.indices.push(i);
  
      }
    };
  
    initBuffers() {
      this.initVIN();
      this.primitiveType = this.scene.gl.TRIANGLES;
      this.initGLBuffers();
    };
  };