
/**
 * Creates a cylinder with base showing on XY centered on Z.
 * @extends {CGFobject}
 */
class MyCylinderBase extends CGFobject {

  /**
   *Creates an instance of MyCylinderBase.
   * @param {CGFscene} scene this instance CGFscene
   * @param {number} slices the number of radial segments
   * @param {number} stacks the number of segments along the height
   * @param {number} base the base radius
   * @param {number} top the top radius
   * @param { number} height the distance from base to top
   * @memberof MyCylinderBase
   */
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


  /**
   * Displays this instance
   *
   * @memberof MyCylinderBase
   */
  display() {
    this.scene.pushMatrix();
    this.scene.translate(0, 0, this.height / 2);

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
    this.scene.popMatrix();
  }
};