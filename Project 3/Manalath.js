class Manalath {

  constructor(scene) {
    this.board = new MyBoard(scene);
    this.blackPiece = new MyPiece(scene, 'Black');
    this.whitePiece = new MyPiece(scene, 'White');

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

    this.scene.pushMatrix();

    

    this.scene.popMatrix();

  }
}