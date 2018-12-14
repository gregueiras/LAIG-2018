class MyBoardCell {
  constructor(scene, borderFactor, heightFactor, id) {
    this.scene = scene;
    this.border = new MyHollowPrism(scene, 6, 1, borderFactor);
    this.base = new MyCylinderBase(scene, 6, 1);
    this.heightFactor = heightFactor;
    this.id = id;
    this.state = CellState.empty;
    this.xC = 0;
    this.yC = 0;
  }

  setPosition(pos) {
    this.xC = pos.xC;
    this.yC = pos.yC;
    this.pX = pos.pX;
    this.pY = pos.pY;
  }

  display() {
    this.scene.pushMatrix();

    this.scene.translate(this.xC, 0, this.yC);
    this.scene.rotate(90 * DEGREE_TO_RAD, 1, 0, 0);
    this.border.display();

    this.scene.translate(0, 0, 1 - this.heightFactor - 0.01);
    this.scene.scale(1, 1, this.heightFactor);

    if (this.id) this.scene.registerForPick(this.id, this);
    this.base.display();

    this.scene.popMatrix();
  }
}
