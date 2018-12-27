class Client {
	constructor(port) {
		this.defaultPort = 8081;

		this.port = typeof port !== "undefined" ? port : this.defaultPort;

		this.requestComplete = false;
		this.winnerCode = 0;
	}

	//Tipo de jogadas  : PvP , PvC, CvP

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
					return -1;
				}

				let moveStr = this.moveToString(move);
				requestStr += "," + moveStr;
			} else {
				if (mode == GameModes.PvP) {
					return -2;
				}
			}

			requestStr += ")";
		}

		console.log(requestStr);
		return requestStr;
	}

	boardToString(board) {
		let boardStr = "[";
		board.forEach(cell => {
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
		});

		boardStr = boardStr.slice(0, -1);
		boardStr += "]";

		return boardStr;
	}

	moveToString(move) {
		let x = move.x;
		let y = move.y;
		let color;
		if ((move.state = CellState.empty)) {
			color = "emptyCell";
		} else if ((move.state = CellState.white)) {
			color = "whitePiece";
		} else if ((move.state = CellState.black)) {
			color = "blackPiece";
		}

		return x + "," + y + "," + color;
	}

	request(message) {
		let request = new XMLHttpRequest();

		this.requestComplete = false;
		request.addEventListener("load", this.requestCompleted);
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

	requestCompleted(event) {
		let response = this.responseText;

		if (!isNaN(parseInt(response))) {
			switch (parseInt(response)) {
				case 0:
					console.log("Started Successfully");
					return;
				default:
					console.log(parseInt(response));
					console.log("Undefined Err");
					return;
			}
		}

		let splited = response.split("]");

		console.log(response);

		this.winnerCode = splited[1].slice(1);

		if (!isNaN(parseInt(this.winnerCode))) {
			switch (parseInt(this.winnerCode)) {
                //TODO confirm codes
				case 0:
					console.log(parseInt(this.winnerCode));
					console.log("Valid Play, No Winner");
					return;
				case -2:
					console.log(parseInt(this.winnerCode));
					console.log("Invalid Play");
					return;
				default:
					console.log("Undefined Err");
					return;
			}
		}

		let cellArr = splited[0].slice(2);
		cellArr = cellArr.split("),");

		this.board = [];

		cellArr.forEach(cell => {
			let vals = cell.slice(5);

			let cellVals = vals.split(",");

			cell = {
				x: parseInt(cellVals[0]),
				y: parseInt(cellVals[1]),
				state: cellVals[2]
			};

			this.board.push(cell);
		});

		let lastCell = this.board.pop();
		lastCell.state = lastCell.state.replace(")", "");
		this.board.push(lastCell);

		this.requestComplete = true;

		console.log(this.board);
	}

	requestFailed(event) {
		console.warn("Request failed.");
	}
}
