

/**
 * Creates a sphere centered on origin.
 * 
 * @extends {CGFobject}
 */
class MySphere extends CGFobject {

  /**
   *Creates an instance of MySphere.
   * @param {CGFscene} scene this instance CGFscene
   * @param {number} radius the radius
   * @param {number} slices the number of radial segments
   * @param {number} stacks the number of segments along the height
   * @memberof MySphere
   */
  constructor(scene, radius, slices, stacks) {
    super(scene);

    this.slices = slices;
    this.stacks = stacks;
    this.radius = radius;


    this.vertices = new Array();
    this.indices = new Array();
    this.normals = new Array();
    this.texCoords = new Array();
    this.initBuffers();
  };


  /**
   * Initializes this instance vertices, indices, normals and texture coordinates.
   *
   * @memberof MySphere
   */
  initVIN() {


    for (let j = 0; j <= this.stacks; j++) {
      let theta = Math.PI * j / this.stacks;

      for (let i = 0; i <= this.slices; i++) {
        let alpha = Math.PI * 2 * i / this.slices;

        let n = {
          x: Math.cos(alpha) * Math.sin(theta),
          y: Math.cos(theta),
          z: Math.sin(alpha) * Math.sin(theta)
        };

        this.normals.push(n.x, n.y, n.z);

        let v = {
          x: this.radius * n.x,
          y: this.radius * n.y,
          z: this.radius * n.z
        };

        this.vertices.push(v.x, v.y, v.z);

        this.texCoords.push(1 - (i / this.slices));
        this.texCoords.push(1 - (j / this.stacks));
      }
    }
    for (let j = 0; j < this.stacks; j++) {
      for (let i = 0; i < this.slices; i++) {
        let n = (j * (this.slices + 1)) + i;
        let m = n + this.slices + 1;

        this.indices.push(n + 1, m, n);
        this.indices.push(n + 1, m + 1, m);
      }
    }


  }


  /**
   * Initializes this instance buffers.
   *
   * @memberof MySphere
   */
  initBuffers() {
    this.initVIN();
    this.primitiveType = this.scene.gl.TRIANGLES;
    this.initGLBuffers();
  };


  /**
   * Displays this instance.
   *
   * @memberof MySphere
   */
  display() {
    this.scene.pushMatrix();

    this.scene.rotate(Math.PI / 2, 1, 0, 0);
    super.display();

    this.scene.popMatrix();
  }
};