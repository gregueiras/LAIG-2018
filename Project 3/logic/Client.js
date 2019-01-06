/**
 * Class responsible for talking with the PROLOG server
 *
 * @class Client
 */
class Client {
  /**
   *Creates an instance of Client.
   * @param {*} port server port to be used
   * @memberof Client
   */
  constructor(port) {
    this.defaultPort = 8081;

    this.port = typeof port !== "undefined" ? port : this.defaultPort;

    this.startRequestComplete = false;
    this.moveRequestComplete = false;

    this.winnerCode = 0;

    //stores sent board
    this.board = [];
    //receives new board
    this.newBoard = [];
    //last change
    this.move = null;

    this.messagePanel = "...";
  }

  /**
   * Build request string for player made move
   * @param {*} mode Manalath mode used
   * @param {*} lvl AI level (if applicable)
   * @param {*} board game board
   * @param {*} move last move made
   */
  buildRequestParams(mode, lvl, board, move) {
    let lvlStr = lvl.toString();

    let requestStr = "";

    //starting a game
    if (typeof board === "undefined") {
      switch (mode) {
        case GameModes.PvP:
          requestStr = "startPvP(" + lvlStr + ")";
          break;
        case GameModes.PvC:
          requestStr = "startPvC(" + lvlStr + ")";
          break;
        case GameModes.CvP:
          requestStr = "startCvP(" + lvlStr + ")";
          break;
        case GameModes.CvC:
          requestStr = "startCvC(" + lvlStr + ")";
          break;
      }
    }
    //playing move
    else {
      let boardStr = this.boardToString(board);

      requestStr = "playLoop(" + boardStr + "," + lvlStr;

      //player play
      if (typeof move !== "undefined") {
        if (mode == GameModes.CvC) {
          console.error("Cant send moves on bot play");
        }

        let moveStr = this.moveToString(move);
        requestStr += "," + moveStr;
      } else {
        if (mode == GameModes.PvP) {
          console.error("Have to send moves on player play");
        }
      }

      requestStr += ")";
    }

    return requestStr;
  }
  /**
   * Parses a manalath board to a string
   *
   * @param {*} board manalath board
   * @returns string representation of the board
   * @memberof Client
   */
  boardToString(board) {
    this.board = [];
    let boardStr = "[";
    board.forEach(cell => {
      let boardCell = {
        x: cell.pX,
        y: cell.pY,
        state: cell.state
      };

      let x = cell.pX.toString();
      let y = cell.pY.toString();

      let state;
      if (cell.state == CellState.empty) {
        state = "emptyCell";
      } else if (cell.state == CellState.white) {
        state = "whitePiece";
      } else if (cell.state == CellState.black) {
        state = "blackPiece";
      }

      boardStr += "cell(" + x + "," + y + "," + state + "),";
      this.board.push(boardCell);
    });

    boardStr = boardStr.slice(0, -1);
    boardStr += "]";

    return boardStr;
  }

	/**
	 *  Parses a manalath move to a string
	 *
	 * @param {*} move manalath move
	 * @returns
	 * @memberof Client
	 */
	moveToString(move) {
    let x = move.x;
    let y = move.y;
    let state;
    if (move.state == CellState.empty) {
      state = "emptyCell";
    } else if (move.state == CellState.white) {
      state = "whitePiece";
    } else if (move.state == CellState.black) {
      state = "blackPiece";
    }

    return x + "," + y + "," + state;
  }

	/**
	 * Sends the message to the PROLOG server
	 *
	 * @param {*} message request to be made
	 * @memberof Client
	 */
	request(message) {
    this.startRequestComplete = false;
    this.moveRequestComplete = false;

    let request = new XMLHttpRequest();

    let client = this;
    request.addEventListener("load", function() {
      client.requestCompleted(event, this.responseText);
    });
    request.addEventListener("error", this.requestFailed);
    request.open("GET", "http://localhost:" + this.port + "/" + message, true);
    request.setRequestHeader(
      "Content-Type",
      "application/x-www-form-urlencoded"
    );
    request.send();
  }

	/**
	 * Handles the response made from the server
	 *
	 * @param {*} event event that triggered this function, unused
	 * @param {*} response response recived
	 * @memberof Client
	 */
	requestCompleted(event, response) {
    this.startRequestComplete = true;

    if (!isNaN(parseInt(response))) {
      switch (parseInt(response)) {
        case 0:
          this.updateMessagePanel("Started Successfully");
          return;
        default:
          console.log(parseInt(response));
          this.updateMessagePanel("Undefined Err");
          this.moveRequestComplete = false;
          return;
      }
    }

    this.moveRequestComplete = true;

    let splited = response.split("]");

    let cellArr = splited[0].slice(2);

    this.buildNewBoard(cellArr);

    this.findMove();

    this.winnerCode = parseInt(splited[1].slice(1));

    this.handleWinnerCode();
  }
	/**
	 * Handles failed request
	 *
	 * @param {*} event
	 * @memberof Client
	 */
	requestFailed(event) {
    this.updateMessagePanel("Request failed.");
  }

	/**
	 * Rebuilds the board from a string format to an Array
	 *
	 * @param {*} cellArr board in string format 
	 * @memberof Client
	 */
	buildNewBoard(cellArr) {
    cellArr = cellArr.split("),");

    let lastCell = cellArr.pop();
    lastCell = lastCell.replace(")", "");
    cellArr.push(lastCell);

    this.newBoard = [];

    cellArr.forEach(cell => {
      let vals = cell.slice(5);

      let cellVals = vals.split(",");

      cell = {
        x: parseInt(cellVals[0]),
        y: parseInt(cellVals[1]),
        state: null
      };

      if (cellVals[2] == "emptyCell") {
        cell.state = CellState.empty;
      } else if (cellVals[2] == "whitePiece") {
        cell.state = CellState.white;
      } else if (cellVals[2] == "blackPiece") {
        cell.state = CellState.black;
      }

      this.newBoard.push(cell);
    });
  }

	/**
	 * Updates the message panel accordingly to the winner
	 *
	 * @memberof Client
	 */
	handleWinnerCode() {
    if (!isNaN(this.winnerCode)) {
      switch (this.winnerCode) {
        case 0:
          this.updateMessagePanel("Valid Play, No Winner");
          return;
        case 1:
          this.updateMessagePanel("Valid Play, Winner is Black Player");
          return;
        case 2:
          this.updateMessagePanel("Valid Play, Winner is White Player");
          return;
        case -1:
          this.updateMessagePanel("Valid Play, Draw");
          return;
        case -2:
          this.updateMessagePanel("Invalid Play");
          return;
        default:
          this.updateMessagePanel("Undefined Err");
          this.moveRequestComplete = false;
          return;
      }
    }
  }

	/**
	 * Order the board passed
	 *
	 * @param {*} board board to be ordered
	 * @memberof Client
	 */
	orderBoard(board) {
    board.sort(function(a, b) {
      if (a.x == b.x) {
        return a.y - b.y;
      }
      return a.x - b.x;
    });
  }

	/**
	 * Find the last move made, comparing the two boards and stores it in this.move
	 *
	 * @memberof Client
	 */
	findMove() {
    this.orderBoard(this.board);
    this.orderBoard(this.newBoard);

    for (let i = 0; i < this.board.length; ++i) {
      let x = this.board[i].x;
      let y = this.board[i].y;
      let s = this.board[i].state;
      let nx = this.newBoard[i].x;
      let ny = this.newBoard[i].y;
      let ns = this.newBoard[i].state;

      if (!(x == nx && y == ny)) {
        console.error("order fail");
      }

      if (x == nx && y == ny && s != ns) {
        this.move = {
          x: x,
          y: y,
          state: ns
        };

        return;
      }
    }

    console.error("Move not found");
  }

	/**
	 * If the request is complete, returns the move, else returns -1
	 *
	 * @returns returns the move if the request is complete, else returns -1
	 * @memberof Client
	 */
	getMove() {
    if (this.moveRequestComplete) return this.move;
    return -1;
  }

	/**
	 * Returns true if there is a winner, false if not
	 *
	 * @returns true if there is a winner, false if not
	 * @memberof Client
	 */
	isWon() {
    return this.winnerCode > 0;
  }

	/**
	 * Get the winner code
	 *
	 * @returns winner code
	 * @memberof Client
	 */
	getWinnerCode() {
    return this.winnerCode;
  }

	/**
	 * Update message panel with message
	 *
	 * @param {*} message message to be displayed
	 * @memberof Client
	 */
	updateMessagePanel(message) {
    this.messagePanel = message;
  }

	/**
	 * Get the message in the panel
	 *
	 * @returns the message in the panel
	 * @memberof Client
	 */
	getMessagePanel() {
    if (this.startRequestComplete) return this.messagePanel;
    return -1;
  }
}
