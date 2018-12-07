class MyBoardCell {
  constructor(scene, borderFactor, heightFactor) {
    this.scene = scene;
    this.border = new MyHollowPrism(scene, 6, 1, borderFactor);
    this.base = new MyCylinderBase(scene, 6, 1);
    this.heightFactor = heightFactor;
  }

  display() {
    this.scene.pushMatrix();

    this.border.display();
    
    this.scene.translate(0, 0, 1);
    this.scene.scale(1, 1, this.heightFactor);
    this.base.display();
    
    this.scene.popMatrix();
  }
}