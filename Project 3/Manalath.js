const GameStates = Object.freeze({ READY: 0, ANIMATING: 1, END: 2 });
class Manalath {
  constructor(scene) {
    this.scene = scene;
    this.board = new MyBoard(scene);
    this.selectedPiece = null;

    // x, y, state
    this.moves = [];
    this.pieces = [];
    this.state = GameStates.READY;

    this.animationSpan = 2;
    this.client = new Client();
  }

  animate(cell) {
    if (this.selectedPiece && this.state === GameStates.READY && cell.state === CellState.empty) {

      const options = {
        upOffset: 3,
        start: {
          x: this.selectedPiece.xC,
          y: 0,
          z: this.selectedPiece.yC
        },
        end: {
          x: cell.xC,
          y: 0,
          z: cell.yC
        },
      };
      let up = {
        x: this.selectedPiece.xC,
        y: options.upOffset,
        z: this.selectedPiece.yC
      };
      let down = {
        x: cell.xC,
        y: options.upOffset,
        z: cell.yC
      }      
      this.selectedPiece.animate = new LinearAnimation(
        this.scene.graph,
        this.animationSpan,
        [
          options.start,
          up,
          down,
          options.end
        ]
      );

      this.play(cell);

    } else {
      console.warn(`You must select a piece first`);
    }
  }

  play(cell) {
    cell.state = this.selectedPiece.state;
    this.moves.push({
      x: cell.pX,
      y: cell.pY,
      state: cell.state
    });
    this.state = GameStates.ANIMATING;
    this.selectedPiece = null;
    setTimeout(() => {
      this.state = GameStates.READY;
    }, this.animationSpan * 1000);

    console.log(this.moves)
    console.log(cell)
  }

  display() {
    this.board.display();
  }
}
