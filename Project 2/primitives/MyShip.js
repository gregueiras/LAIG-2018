class MyShip {
  constructor(scene) {
    this.scene = scene;

    const nParts = 6;
    const zOffset = 3;
    const yOffset = 1.5;

    let controlVertices = [
      [0, -yOffset, zOffset, 1],
      [0, -yOffset, 0, 1],
      [1.8, -yOffset, zOffset, 0.707],
      [1.8, -yOffset, 0, 0.707],
      [1.8, 0, zOffset, 1],
      [1.8, 0, 0, 1],
      [1.8, yOffset, zOffset, 0.707],
      [1.8, yOffset, 0, 0.707],
      [0, yOffset, zOffset, 1],
      [0, yOffset, 0, 1],
      [1.9, yOffset, zOffset, 0.707],
      [1.9, yOffset, 0, 0.707],
      [1.9, 0, zOffset, 1],
      [1.9, 0, 0, 1],
      [1.9, -yOffset, zOffset, 0.707],
      [1.9, -yOffset, 0, 0.707],
      [0, -yOffset, zOffset, 1],
      [0, -yOffset, 0, 1],


    ]

    this.side = new Patch(scene, nParts, nParts, 9, 2, controlVertices);
    this.arms = new cylinder3(scene, 8, 10, 0.7, 0.2, 2.2);
    this.center = new MySphere(scene, 1.1, 20, 20);
  }

  display() {
    this.scene.pushMatrix();
    
    this.scene.pushMatrix();
    this.scene.rotate(180 * DEGREE_TO_RAD, 1, 0, 0);
    this.scene.translate(1.55, 0, -1.5);
    this.side.display();
    this.scene.popMatrix();

    this.scene.pushMatrix();
    this.scene.translate(-1.55, 0, -1.5);
    this.scene.rotate(180 * DEGREE_TO_RAD, 1, 0, 0);
    this.scene.rotate(180 * DEGREE_TO_RAD, 0, 1, 0);
    this.side.display();
    this.scene.popMatrix();

    this.center.display();
    
    this.scene.pushMatrix();
    
    this.scene.translate(0.7, 0, 0);
    this.scene.rotate(90 * DEGREE_TO_RAD, 0, 1, 0);
    
    this.arms.display();
    this.scene.popMatrix();
    
    this.scene.pushMatrix();
    this.scene.translate(-0.7, 0, 0);
    this.scene.rotate(-90 * DEGREE_TO_RAD, 0, 1, 0);
    this.scene.rotate(-180 * DEGREE_TO_RAD, 0, 0, 1);
    
    this.arms.display();
    this.scene.popMatrix();

    this.scene.popMatrix();
  }
}