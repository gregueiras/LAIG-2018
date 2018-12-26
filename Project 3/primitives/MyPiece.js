class MyPiece {
  
  constructor(scene, id) {
    this.scene = scene;
    this.piece = new MySphere(scene, 1, 20, 20);
    this.color = null;
    this.id = id;
    this.set = null;
    this.currTime = 0;
    this.available = true;
    this.state = CellState.empty;
    this.highlight = false;

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
      this.state = CellState.white;
      break;
      
      case CellState.black:
      case 1:
      this.color = new CGFtexture(this.scene, "./scenes/images/space.jpg");
      this.state = CellState.black;
        break;
    }

    return this;
  }

  display() {
    this.scene.pushMatrix();

    if (!this.set) {
      const spreadFactor = 0.6;
      this.xC *= spreadFactor;
      this.yC *= spreadFactor;
      this.yC += this.side * 10;

      this.set = true;
    }

    if (this.animate && this.scene.elapsedTime) {
      if (this.reverse) {
        if (this.currTime > this.animate.span) this.currTime = this.animate.span;
        this.currTime -= this.scene.elapsedTime;
      } else {
        if (this.currTime < 0) this.currTime = 0;
        this.currTime += this.scene.elapsedTime;
      }

      this.animate.update(this.currTime);
      this.animate.apply();
    }

    this.scene.translate(this.xC, 1.2, this.yC);
    this.scene.scale(0.5, 2, 0.5);

    if (this.color) this.color.bind();
    
    this.scene.registerForPick(this.id, this);
    
    this.scene.pushMatrix();
    
    if (this.highlight) this.scene.highlightMaterial.apply();
    
    this.piece.display();
    
    if (this.highlight) this.scene.defaultMaterial.apply(); 

    this.scene.popMatrix();

    this.scene.popMatrix();
  }

  setHighlight(enable) {
    this.highlight = enable;
  }
}
