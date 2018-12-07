const CellState = Object.freeze({"empty":0, "black":1, "white":2});
class MyBoard {

  constructor(scene) {
    this.scene = scene;
    this.createBoard();
    this.board = [];
    this.grid.forEach(() => {
      this.board.push(new MyCylinderBase(scene, 6, 1));
    });
    this.base = new MyBoardCell(scene, 0.95, 0.1);

    this.cellTexture = new CGFtexture(scene, "./scenes/images/table.png");
    this.baseTexture = new CGFtexture(scene, "./scenes/images/stone.jpg");

    this.blackPiece = new MyPiece(scene, CellState.black);
    this.whitePiece = new MyPiece(scene, CellState.white);
  }

  createBoard() {
    const hex_size = 1.155;
    const map_radius = 4;
    const origin = {
      x: 0,
      y: 0
    };
    let grid = [];
    let count = 0;
    for (let q = -map_radius; q <= map_radius; q++) {
      let r1 = this.max(-map_radius, -q - map_radius);
      let r2 = this.min(map_radius, -q + map_radius);
      for (let r = r1; r <= r2; r++) {
        let x = (Math.sqrt(3) * q + Math.sqrt(3) / 2 * r) * (hex_size);
        let y = (0 * q + 3 / 2 * r) * hex_size;

        let R = r + 4;

        let color;
        if((r > -1 && q > 0) || (r > 0 && q <= 0)) {
          color = CellState.black;
        } else if (q === 0 && r === 0) {
          color = null;
        } else {
        color = CellState.white
        }

        grid[count++] = {
          xC: x + origin.x,
          yC: y + origin.y,
          pX: (q + R) * 2,
          pY: r + 4,
          piece: color,
          state: CellState.empty
        };
      }
    }
    
    this.grid = grid;
    console.log(grid.length)

  }

  display() {
    this.scene.pushMatrix();
    this.scene.translate(0,-0.1, 0);
    this.scene.scale(10, 0.1, 10);
    this.scene.rotate(-90 * DEGREE_TO_RAD, 1, 0, 0);
    this.baseTexture.bind()
    this.base.display();
    this.scene.popMatrix();
    
    this.scene.pushMatrix();
    this.scene.scale(1, 0.1, 1);
    
    for (let index = 0; index < this.grid.length; index++) {
      const cell = this.grid[index];
      const hexagon = this.board[index];
      
      this.scene.pushMatrix();
      
      this.scene.translate(cell.xC, 0, cell.yC);
      this.scene.rotate(90 * DEGREE_TO_RAD, 1, 0, 0);
      
      
      if (cell.piece) {
        this.scene.pushMatrix();

        if (cell.state === CellState.empty) {
          let dir = cell.piece === CellState.black ? 1 : -1;
          this.scene.translate(0, 10 * dir, 0);
        }
        if (cell.piece === CellState.black)
          this.blackPiece.display();
        else if (cell.piece === CellState.white)
          this.whitePiece.display();

        this.scene.popMatrix();
      }


      this.cellTexture.bind();
      hexagon.display();

      this.scene.popMatrix();
      
    }
    this.scene.popMatrix();
    
  }

  max(a, b) {
    return (a >= b) ? a : b;
  }

  min(a, b) {
    return (a <= b) ? a : b;
  }
}