class Manalath {

  constructor(scene) {
    this.scene = scene;
    this.board = new MyBoard(scene);

    this.moves = [];
    this.pieces = [];
    
    this.board.grid.forEach(cell => {
      this.pieces.push({
        x: cell.pX,
        y: cell.pY,
        value: CellState.empty
      });
    });

  }


  display() {
    this.board.display();
  }
}