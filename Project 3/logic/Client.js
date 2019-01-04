class Client {
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
	 * For player made move
	 * @param {*} mode Manalath.mode (TODO)
	 * @param {*} lvl Manalath.lvl (TODO)
	 * @param {*} board MyBoard.board
	 * @param {*} move Manalath.moves(last)
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

	request(message) {
		this.startRequestComplete = false;
		this.moveRequestComplete = false;

		let request = new XMLHttpRequest();

		let client = this;
		request.addEventListener("load", function() {
			client.requestCompleted(event, this.responseText);
		});
		request.addEventListener("error", this.requestFailed);
		request.open(
			"GET",
			"http://localhost:" + this.port + "/" + message,
			true
		);
		request.setRequestHeader(
			"Content-Type",
			"application/x-www-form-urlencoded"
		);
		request.send();
	}

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

	requestFailed(event) {
		this.updateMessagePanel("Request failed.");
	}

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

	orderBoard(board) {
		board.sort(function(a, b) {
			if (a.x == b.x) {
				return a.y - b.y;
			}
			return a.x - b.x;
		});
	}

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

	getMove() {
		if (this.moveRequestComplete) return this.move;
		return -1;
	}

	isWon() {
		return this.winnerCode > 0;
	}

	getWinnerCode() {
		return this.winnerCode;
	}

	updateMessagePanel(message) {
		this.messagePanel = message;
	}

	getMessagePanel() {
		if (this.startRequestComplete) return this.messagePanel;
		return -1;
	}
}
