class Manalath {

  constructor(scene) {
    this.scene = scene;
    this.board = new MyBoard(scene);
    this.selectedPiece = null;
    this.moves = [];
    this.pieces = [];

  }

  animate(cell) {
    if (this.selectedPiece) {
      console.log(this.selectedPiece, cell);
      //this.selectedPiece.animate = new CircularAnimation(this.scene.graph, 10, )
      this.selectedPiece = null;
    } else {
      console.warn(`You must select a piece first`);
    }
  }

  display() {
    this.board.display();
  }
}