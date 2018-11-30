class MyBoard {
  constructor(scene) {
    this.scene = scene;
    this.createBoard();
    this.board = [];
    this.grid.forEach(element => {
      this.board.push(new MyBoardCell(scene, 0.95, 1));
    });
    this.base = new MyBoardCell(scene, 0.95, 1);
  }

  createBoard() {
    const hex_size = 1.155;
    const map_radius = 4; // FIXME: This should be called map size, but I started with hexagons, and refactoring would be too hard
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
        grid[count++] = {
          xC: x + origin.x,
          yC: y + origin.y,
          pX: (q + R) * 2,
          pY: r + 4
        };
      }
    }
    
    this.grid = grid;

  }

  display() {
    this.scene.pushMatrix();
    this.scene.translate(0,-0.1, 0);
    this.scene.scale(10, 0.1, 10);
    this.scene.rotate(-90 * DEGREE_TO_RAD, 1, 0, 0);
    this.base.display();
    this.scene.popMatrix();
    
    this.scene.pushMatrix();
    this.scene.scale(1, 0.1, 1);

    for (let index = 0; index < this.grid.length; index++) {
      const cell = this.grid[index];
      const hexagon = this.board[index];

      this.scene.pushMatrix();
      
      this.scene.translate(cell.xC, -0.1, cell.yC);
      this.scene.scale(1, 0.5, 1);
      this.scene.rotate(-90 * DEGREE_TO_RAD, 1, 0, 0);
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