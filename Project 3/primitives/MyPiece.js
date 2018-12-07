class MyPiece {
  constructor(scene, color) {
    this.scene = scene;
    this.piece = new MySphere(scene, 1, 20, 20);

    this.white = new CGFtexture(scene, "./scenes/images/metal.jpg");
    this.black = new CGFtexture(scene, "./scenes/images/space.jpg");
    this.state = color;
  }

  display() {
    this.scene.pushMatrix();

    switch(this.state) {
      case CellState.white:
        this.white.bind();
        break;
      
      case CellState.black:
        this.black.bind();
        break;
      
    }

    if (this.state === CellState.white) {
      this.white.bind();
    } else {
      this.black.bind();
    }
    this.scene.translate(0, 0, -2);
    this.scene.scale(0.5, 0.5, 2);
    this.piece.display();

    this.scene.popMatrix();
  }
}
