/**
 * MyObject
 * @param gl {WebGLRenderingContext}
 * @constructor
 */

class MyCylinderBase extends CGFobject {
  constructor(scene, slices, stacks, base, top, height) {
    super(scene);

    base = typeof base !== 'undefined' ? base : 1;
    top = typeof top !== 'undefined' ? top : 1;
    height = typeof height !== 'undefined' ? height : 1;

    this.base = base;
    this.top = top;
    this.height = height;

    this.cylinder = new MyCylinder(scene, slices, stacks, base, top, height);
    this.circle = new MyCircle(scene, slices, 1);
    this.b = new MyCircle(scene, slices, 3);

  };

  display() {
    this.scene.pushMatrix();

    this.scene.translate(0, 0, -this.height / 2);
    this.scene.rotate(Math.PI, 1, 0, 0);
    this.scene.scale(this.base, this.base, this.base);
    this.circle.display();

    this.scene.popMatrix();

    this.scene.pushMatrix();

    this.scene.translate(0, 0, this.height / 2);

    this.scene.scale(this.top, this.top, this.top);
    this.circle.display();

    this.scene.popMatrix();

    this.cylinder.display();
  }
};