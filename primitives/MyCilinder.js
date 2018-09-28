/**
 * MyObject
 * @param gl {WebGLRenderingContext}
 * @constructor
 */

class MyCilinder extends CGFobject {
    constructor(scene, slices, stacks) {
      super(scene);
  
      this.slices = slices;
      this.stacks = stacks;
      this.delta = 2 * Math.PI / this.slices;
  
      this.vertices = new Array();
      this.indices = new Array();
      this.normals = new Array();
      this.texCoords = new Array();
      this.initBuffers();
    };
  
    initVIN() {
      var alt = 1 / this.stacks;
      for (var stack = 0; stack <= this.stacks; stack++) {
  
        for (var slice = 0; slice < this.slices; slice++) {
  
  
          this.vertices.push(Math.cos(slice * this.delta));
          this.vertices.push(Math.sin(slice * this.delta));
          this.vertices.push(stack * alt - 0.5);
  
          this.normals.push(Math.cos(slice * this.delta));
          this.normals.push(Math.sin(slice * this.delta));
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
  
    initBuffers() {
      this.initVIN();
      this.primitiveType = this.scene.gl.TRIANGLES;
      this.initGLBuffers();
    };
  };