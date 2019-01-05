const CellState = Object.freeze({ empty: 0, black: 1, white: 2 });
class MyBoard {
  constructor(scene) {
    this.scene = scene;
    this.board = [];
    this.pieces = [];

    let id = 1;
    for (let index = 0; index < 61; index++) {
      this.board.push(new MyBoardCell(scene, 0.9, 0.001, id++));
      this.pieces.push(new MyPiece(scene, id++));
    }
    this.base = new MyBoardCell(scene, 0.95, 0.001);

    this.cellTexture = new CGFtexture(scene, "./scenes/images/wallpaint2.png");
    this.baseTexture = new CGFtexture(scene, "./scenes/images/stone.jpg");

    this.blackPiece = new MyPiece(scene, CellState.black);
    this.whitePiece = new MyPiece(scene, CellState.white);
    this.createBoard();
  }

  createBoard() {
    const hex_size = 1.155;
    const map_radius = 4;
    const origin = {
      x: 0,
      y: 0
    };
    let count = 0;
    for (let q = -map_radius; q <= map_radius; q++) {
      let r1 = this.max(-map_radius, -q - map_radius);
      let r2 = this.min(map_radius, -q + map_radius);
      for (let r = r1; r <= r2; r++) {
        let x = (Math.sqrt(3) * q + (Math.sqrt(3) / 2) * r) * hex_size;
        let y = (0 * q + (3 / 2) * r) * hex_size;

        let R = r + 4;

        let side;
        if ((r > -1 && q > 0) || (r > 0 && q <= 0)) {
          side = 1;
        } else if (q === 0 && r === 0) {
          side = null;
        } else {
          side = -1;
        }

        const pos = {
          xC: x + origin.x,
          yC: y + origin.y,
          pX: (q + R) * 2,
          pY: r + 4,
          side: side
        };

        if (side !== null) {
          this.pieces[count].setPosition(pos).setColor(side);
          this.board[count++].setPosition(pos);
        } else {
          this.pieces[count] = null;
          this.board[count++].setPosition(pos);
        }
      }
    }
  }

  display() {
    this.scene.pushMatrix();
    
    this.scene.translate(0, -0.1, 0);
    this.scene.scale(10, 0.1, 10);
    this.baseTexture.bind();
    this.base.display();
    this.scene.popMatrix();

    this.scene.pushMatrix();
    this.scene.scale(1, 0.1, 1);

    this.cellTexture.bind();
    this.board.forEach(hexagon => {
      hexagon.display();
    });
    this.pieces.forEach(piece => {
      if (piece) piece.display();
    });
    this.scene.popMatrix();
  }

  max(a, b) {
    return a >= b ? a : b;
  }

  min(a, b) {
    return a <= b ? a : b;
  }
}
