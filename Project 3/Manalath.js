const GameStates = Object.freeze({ READY: 0, ANIMATING: 1, END: 2 });
class Manalath {
  constructor(scene) {
    this.scene = scene;
    this.board = new MyBoard(scene);
    this.selectedPiece = null;

    // x, y, state
    this.moves = [];
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
    this.selectedPiece.available = false;
    
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
  }

  AIPlay(play) {
    this.selectedPiece = undefined;
    do {
      let pieces = this.board.pieces;
      let tempPiece = pieces[Math.floor(Math.random()*pieces.length)];
      if (tempPiece.available && tempPiece.state === play.state) {
        this.selectedPiece = tempPiece;
      }
      
    } while (this.selectedPiece === undefined);
    let cell = this.board.board.find(element => element.pX === play.x && element.pY === play.y);
    this.animate(cell);
  }

  display() {
    this.board.display();
  }
}
