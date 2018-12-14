class MyPiece {
  constructor(scene, id) {
    this.scene = scene;
    this.piece = new MySphere(scene, 1, 20, 20);
    this.color = null;
    this.id = id;
    this.set = null;
  }

  setPosition(pos) {
    this.xC = pos.xC;
    this.yC = pos.yC;
    this.pX = pos.pX;
    this.pY = pos.pY;
    this.side = pos.side;

    return this;
  }

  setColor(color) {
    switch (color) {
      case CellState.white:
      case -1:
        this.color = new CGFtexture(this.scene, "./scenes/images/metal.jpg");
        break;

      case CellState.black:
      case 1:
        this.color = new CGFtexture(this.scene, "./scenes/images/space.jpg");
        break;
    }

    return this;
  }

  display() {
    this.scene.pushMatrix();

    if (!this.set) {
      const spreadFactor = 0.6;
      this.scene.translate(this.xC * spreadFactor, 1.2, this.yC * spreadFactor);
      this.scene.translate(0, 0, this.side*10);
    }

    this.scene.rotate(90 * DEGREE_TO_RAD, 1, 0, 0);
    this.scene.scale(0.5, 0.5, 2);

    if (this.color) this.color.bind();
    this.scene.registerForPick(this.id, this);
    this.piece.display();

    this.scene.popMatrix();
  }
}
