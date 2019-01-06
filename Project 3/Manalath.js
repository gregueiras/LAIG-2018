const GameStates = Object.freeze({
	READY: 0,
	ANIMATING: 1,
	STOPPED: 2
});
const GameModes = Object.freeze({
	PvP: 0,
	PvC: 1,
	CvP: 2,
	CvC: 3
});
const GameDifficulty = Object.freeze({
	EASY: 1,
	HARD: 2
});
const PlayStatus = Object.freeze({
	OnGoing: 0,
	Finished: 1,
	Error: 2,
});
/**
 * Manalath Class, responsible for handling every game element
 * @class Manalath
 */
class Manalath {
	/**
	 * Creates an instance of Manalath.
	 * @param {*} scene this instance CGFscene
	 * @memberof Manalath
	 */
	constructor(scene) {
		this.scene = scene;
		this.board = new MyBoard(scene);
		this.selectedPiece = null;

		// x, y, state
		this.moves = [];
		this.state = GameStates.READY;
		this.cameraTimer = 0;
		this.cameraTimeElapsed = 0;
		this.cameraRotAngle = 0;

		this.animationSpan = 2;
		this.client = new Client();

		this.selectedLvl = GameDifficulty.EASY;
		this.lvl = GameDifficulty.EASY;

		this.selectedMode = GameModes.PvP;
		this.maxTurnTime = 10;
		this.turnTime = 0;
		this.mode = GameModes.PvP;

		this.activePlayer = 0; //0 || 1

		this.setPlayerInfo();

		//On overtime player play
		this.allowRandomPlay = false;

		this.playStatus = PlayStatus.OnGoing;

		this.infoMessage = "Connection not established";

		//start timers
		setInterval(() => {
			if (this.state == GameStates.READY && this.playStatus == PlayStatus.OnGoing) {
				this.playerInfo[this.activePlayer].timer += 1;
				this.turnTime += 1;

				if (this.turnTime > this.maxTurnTime) {
					if (this.isPlayerAllowed() && this.allowRandomPlay) {
						this.turnTime = 0;
						this.randomPlay();
					} else {
						document.getElementById("turnTimer").style.color = "#ef6666";
					}
				} else {
					document.getElementById("turnTimer").style.color = "#fff";
				}

				const playerTimer = this.playerInfo[this.activePlayer].timer;
				const turnTimer = this.turnTime;

				const playerTimerString = this.parseTime(playerTimer);
				const turnTimerString = this.parseTime(turnTimer);

				document.getElementById("timer").innerHTML = playerTimerString;
				document.getElementById("turnTimer").innerHTML = turnTimerString;

			}

		}, 1000);

		this.client.request(
			this.client.buildRequestParams(this.mode, this.lvl)
		);

		this.updatePanelInfo();

		if (this.isAIAllowed()) {
			this.decideAIPlay();
		}
	}

	/**
	 * Receives a time in seconds and returns it in MM:SS format
	 *
	 * @param {*} time time in seconds
	 * @returns formatted string in MM:SS format
	 * @memberof Manalath
	 */
	parseTime(time) {
		let sec = Math.floor(time % 60);
		let min = Math.floor(time / 60);
		sec = sec < 10 ? "0" + sec : sec;
		min = min < 10 ? "0" + min : min;
		return min + ":" + sec;
	}

	/**
	 * Selects a random piece make a random play
	 *
	 * @memberof Manalath
	 */
	randomPlay() {

		let cell = {};
		do {
			let board = this.board.board;
			let index = Math.floor(Math.random() * board.length);
			if (index == 30) {
				++index;
			}
			cell = board[index];
		} while (cell.state !== CellState.empty)
		const randomColor = (Math.random() > 0.5) ? CellState.black : CellState.white;

		this.AIPlay({
			x: cell.pX,
			y: cell.pY,
			state: randomColor
		});
	}
	/**
	 * Resets the game
	 *
	 * @memberof Manalath
	 */
	reset() {

		if (this.cameraAngle != 0) {
			console.warn("Camera on rotation, can't do this operation...");
			return;
		}

		this.board = new MyBoard(scene);
		this.mode = this.selectedMode;
		this.lvl = this.selectedLvl;
		this.selectedPiece = null;
		this.moves = [];
		this.state = GameStates.READY;
		this.cameraTimer = 0;
		this.cameraTimeElapsed = 0;
		this.cameraRotAngle = 0;
		this.activePlayer = 0; //0 || 1

		this.setPlayerInfo();
		this.turnTime = 0;

		this.playStatus = PlayStatus.OnGoing;

		if (typeof this.lvl === "string") {
			this.lvl = parseInt(this.lvl);
		}
		if (typeof this.mode === "string") {
			this.mode = parseInt(this.mode);
		}

		this.client = new Client();

		this.client.request(
			this.client.buildRequestParams(this.mode, this.lvl)
		);

		this.updatePanelInfo();

		if (this.isAIAllowed()) {
			this.decideAIPlay();
		}
	}

	/**
	 * Restarts the game
	 *
	 * @memberof Manalath
	 */
	restart() {

		if (this.cameraAngle != 0) {
			console.warn("Camera on rotation, can't do this operation...");
			return;
		}

		this.board = new MyBoard(scene);
		this.selectedPiece = null;
		this.moves = [];
		this.state = GameStates.READY;
		this.cameraTimer = 0;
		this.cameraTimeElapsed = 0;
		this.cameraRotAngle = 0;
		this.activePlayer = 0; //0 || 1

		//reset timers
		this.playerInfo[0].timer = 0;
		this.playerInfo[1].timer = 0;
		this.turnTime = 0;

		this.playStatus = PlayStatus.OnGoing;

		this.client = new Client();

		this.client.request(
			this.client.buildRequestParams(this.mode, this.lvl)
		);

		this.updatePanelInfo();

		if (this.isAIAllowed()) {
			this.decideAIPlay();
		}
	}
	/**
	 * Initializes both players
	 *
	 * @memberof Manalath
	 */
	setPlayerInfo() {

		let player = {
			timer: 0,
			won: 0,
		};

		this.playerInfo = [];
		this.playerInfo.push(player);
		this.playerInfo.push(JSON.parse(JSON.stringify(player)));
	}

	/**
	 * Animates the movement of the selected piece to cell
	 *
	 * @param {*} cell destination cell
	 * @memberof Manalath
	 */
	animate(cell) {
		if (
			this.selectedPiece &&
			this.state === GameStates.READY &&
			cell.state === CellState.empty
		) {
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
				}
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
			};
			this.selectedPiece.reverse = false;
			this.selectedPiece.animate = new LinearAnimation(
				this.scene.graph,
				this.animationSpan,
				[options.start, up, down, options.end]
			);
			this.play(cell);
		} else if (this.moviePlaying) {
			console.warn(`Sit back and enjoy the movie of your last game`);
		} else if (this.state !== GameStates.READY) {
			console.warn(
				`You can't play now. Please try again after a few moments`
			);
		} else if (this.selectedPiece === null) {
			console.warn(`You must select a piece first`);
		} else if (cell.state !== CellState.empty) {
			console.warn(`Please select an empty cell`);
		} else {
			console.warn(`Invalid Play`);
		}
	}

	/**
	 * Play the selected piece to cell
	 *
	 * @param {*} cell destination cell to be played
	 * @memberof Manalath
	 */
	play(cell) {
		this.selectedPiece.available = false;

		let move = {
			x: cell.pX,
			y: cell.pY,
			state: this.selectedPiece.state,
			piece: this.selectedPiece,
			cell: cell
		};

		this.validatePlayerPlay(move);

		cell.state = this.selectedPiece.state;

		this.moves.push(move);

		this.state = GameStates.ANIMATING;
		this.selectedPiece = null;

		this.changeActivePlayer();

		this.updatePanelInfo();

		setTimeout(() => {
			this.state = GameStates.READY;

			if (this.isAIAllowed()) {
				if (!this.client.isWon()) {
					this.decideAIPlay();
				}
			}
		}, this.animationSpan * 1000 + 1000);
	}
	/**
	 * Alternate the active player
	 *
	 * @memberof Manalath
	 */
	changeActivePlayer() {
		this.activePlayer++;
		this.activePlayer %= 2;
		this.turnTime = 0;
	}

	/**
	 * Changes the playStatus to Finished and increments the winner count of the player who won
	 *
	 * @memberof Manalath
	 */
	setPlayerVictory() {
		this.playStatus = PlayStatus.Finished;
		this.playerInfo[this.client.getWinnerCode() - 1].won += 1;
	}

	/**
	 * Updates the scoreboard with the winners counters
	 *
	 * @memberof Manalath
	 */
	updateScoreBoard() {
		document.getElementById("s1").innerHTML = this.playerInfo[0].won;
		document.getElementById("s2").innerHTML = this.playerInfo[1].won;
	}

	/**
	 * Updates all info on the panel
	 *
	 * @memberof Manalath
	 */
	updatePanelInfo() {
		document.getElementById("player").innerHTML = (this.activePlayer === 0) ? "Black" : "White";
		this.updateScoreBoard();

		let cnt = 0;
		let maxTry = 500;
		let interval = setInterval(() => {
			++cnt;
			if (cnt > maxTry) {
				clearInterval(interval);
				console.error("Err getting start response");
				return;
			}
			let mp = this.client.getMessagePanel();
			if (mp != -1) {
				clearInterval(interval);
				this.infoMessage = mp;
				if (this.infoMessage == "Invalid Play") {
					this.undo();
				} else if (this.client.isWon()) {
					this.setPlayerVictory();
					document.getElementById("player").innerHTML = "---";
					this.updateScoreBoard();
				}
			}
			document.getElementById("message").innerHTML = this.infoMessage;
		}, 50);
	}

	/**
	 * Validates the player move, communicating with the PROLOG server
	 *
	 * @param {*} move move to be made
	 * @memberof Manalath
	 */
	validatePlayerPlay(move) {
		//case of computer play, this was already done when searching for a play
		if (this.isPlayerAllowed()) {
			this.client.request(
				this.client.buildRequestParams(
					this.mode,
					this.lvl,
					this.board.board,
					move
				)
			);

			const maxTry = 5;
			let cnt = 0;

			let interval = setInterval(() => {
				++cnt;
				if (cnt > maxTry) {
					clearInterval(interval);
					console.error(
						"Can't get play... Something must have gone wrong"
					);
					this.playStatus = PlayStatus.Error;
				}
				let play = this.client.getMove();
				if (play != -1) {
					clearInterval(interval);
					//this.playStatus = PlayStatus.OnGoing;
				}
			}, 500);
		}
	}

	/**
	 * Asks the PROLOG server for a play and plays it
	 *
	 * @memberof Manalath
	 */
	decideAIPlay() {
		if (this.state == GameStates.ANIMATING) {
			console.warn("The game is in animation state");
			return;
		} else if (this.state == GameStates.STOPPED) {
			console.warn("The game is paused");
			return;
		} else if (this.playStatus == PlayStatus.Finished) {
			console.warn("The game is finished");
			return;
		}
		this.client.request(
			this.client.buildRequestParams(
				this.mode,
				this.lvl,
				this.board.board
			)
		);

		const maxTry = 500;
		let cnt = 0;

		let interval = setInterval(() => {
			++cnt;
			if (cnt > maxTry) {
				clearInterval(interval);
				console.error("Can't get AI play...");
				this.playStatus = PlayStatus.Error;
				return;
			}
			let play = this.client.getMove();
			if (play != -1) {
				clearInterval(interval);
				this.AIPlay(play);
			}
		}, 500);
	}

	/**
	 * Makes the play of the AI player
	 *
	 * @param {*} play play to be made
	 * @memberof Manalath
	 */
	AIPlay(play) {
		this.selectedPiece = undefined;
		do {
			let pieces = this.board.pieces;
			let index = Math.floor(Math.random() * pieces.length);
			if (index == 30) {
				++index;
			}
			let tempPiece = pieces[index];
			if (tempPiece.available && tempPiece.state === play.state) {
				this.selectedPiece = tempPiece;
			}
		} while (this.selectedPiece === undefined);
		let cell = this.board.board.find(
			element => element.pX === play.x && element.pY === play.y
		);
		this.animate(cell);
	}

	/**
	 * Undo the last movement made
	 *
	 * @memberof Manalath
	 */
	undo() {
		if (this.moves.length === 0) return false;

		if(!this.moviePlaying) {
			this.state = GameStates.ANIMATING;
			this.isUndo = true;
			this.cameraAngle = Math.PI - this.cameraAngle;
			setTimeout(() => {
				this.isUndo = false;
				this.state = GameStates.READY;
			}, this.animationSpan * 1000 / 2);
		}

		let lastMove = this.moves.pop();
		let piece = lastMove.piece;
		let cell = lastMove.cell;

		piece.reverse = true;
		piece.available = true;
		cell.state = CellState.empty;
		if (this.state != GameStates.ANIMATING) {
			return true;
		} else {
			return false;
		}
	}

	/**
	 * Handle the picking of the pieces
	 *
	 * @param {*} obj object picked
	 * @memberof Manalath
	 */
	handlePicking(obj) {
		if (!this.isPlayerAllowed()) {
			console.warn("Not your turn to play");
			return;
		} else if (this.state == GameStates.ANIMATING) {
			console.warn("The game is in animation state");
			return;
		} else if (this.state == GameStates.STOPPED) {
			console.warn("The game is paused");
			return;
		} else if (this.playStatus == PlayStatus.Finished) {
			console.warn("The game is finished");
			return;
		}

		if (this.selectedPiece) this.selectedPiece.setHighlight(false);

		if (obj.constructor.name === "MyPiece") {
			if (!obj.available) {
				console.warn(`You can't selected an already placed piece`);
			} else if (!this.moviePlaying) {
				this.selectedPiece = obj;
				obj.setHighlight(true);
			}
		} else if (obj.constructor.name === "MyBoardCell") {
			this.animate(obj);
		}
	}

	/**
	 * Displays the board and the pieces
	 *
	 * @memberof Manalath
	 */
	display() {
		this.scene.pushMatrix();

		this.scene.rotate(90 * DEGREE_TO_RAD, 1, 0, 0);
		this.scene.scale(0.5, 1, 0.5);
		this.board.display();

		this.scene.popMatrix();
	}

	/**
	 * Play all movement made in the game, like a replay movie
	 *
	 * @memberof Manalath
	 */
	playGameMovie() {
		let moves = this.moves.slice();
		while (this.moves.length !== 0) {
			this.undo();
		}
		let i = 1;
		this.moviePlaying = true;
		moves.forEach(move => {
			setTimeout(() => {
				this.state = GameStates.READY;
				this.selectedPiece = move.piece;
				this.animate(move.cell);
			}, i++ * this.animationSpan * 1000);
		});

		setTimeout(() => {
			this.moviePlaying = false;
		}, i * this.animationSpan * 1000);
	}

	/**
	 * Returns true if it is the turn of a human player, false if not
	 *
	 * @returns true if it is the turn of a human player, false if not
	 * @memberof Manalath
	 */
	isPlayerAllowed() {
		switch (this.mode) {
			case GameModes.PvP:
				return true;
			case GameModes.PvC:
				if (this.activePlayer == 0) {
					return true;
				}
				break;
			case GameModes.CvP:
				if (this.activePlayer == 1) {
					return true;
				}
				break;
			case GameModes.CvC:
				return false;
		}

		return false;
	}

	/**
	 * Returns true if it is the turn of an AI player, false if not
	 *
	 * @returns true if it is the turn of an AI player, false if not
	 * @memberof Manalath
	 */
	isAIAllowed() {
		switch (this.mode) {
			case GameModes.PvP:
				return false;
			case GameModes.PvC:
				if (this.activePlayer == 1) {
					return true;
				}
				break;
			case GameModes.CvP:
				if (this.activePlayer == 0) {
					return true;
				}
				break;
			case GameModes.CvC:
				return true;
		}
		return false;
	}

	/**
	 * Pauses the game
	 *
	 * @returns true if the game can be paused, false if not
	 * @memberof Manalath
	 */
	pause() {
		if (this.state == GameStates.READY) {
			this.state = GameStates.STOPPED;
			return true;
		}
		return false;
	}

	/**
	 * Resumes the game, and if it is the AI turn, plays
	 *
	 * @returns true if the game can be paused, false if not
	 * @memberof Manalath
	 */
	resume() {
		if (this.state == GameStates.STOPPED) {
			this.state = GameStates.READY;
			if (this.isAIAllowed()) {
				this.decideAIPlay();
			}
			return true;
		}
		return false;
	}

	/**
	 * Updates the camera timer, used in the camera rotation
	 *
	 * @param {*} currTimer current camera timer
	 * @memberof Manalath
	 */
	updateCameraTimer(currTimer) {

		if (this.state != GameStates.ANIMATING) {
			this.cameraTimer = currTimer;
		}

		this.cameraTimeElapsed = currTimer - this.cameraTimer;
	}

	/**
	 * Set the camera rotation angle
	 *
	 * @memberof Manalath
	 */
	setCameraAngle() {
		const animSpan = (this.animationSpan * 1000 / 2);
		if (this.state != GameStates.ANIMATING) {
			this.cameraAngle = 0;
			this.cameraRotAngle = 0;
			return;
		}
		//case animation state takes more time than camera rotation
		else if (this.cameraTimeElapsed > animSpan) {
			this.cameraRotAngle = Math.PI - this.cameraAngle;
			if (this.isUndo) {
				this.cameraRotAngle *= -1;
				this.undoCameraAngle += this.cameraRotAngle;
				if (this.undoCameraAngle <= 0) {
					this.cameraRotAngle = -1 * this.undoCameraAngle;
					this.undoCameraAngle = 0;
				}
			}
			this.cameraAngle = Math.PI;
			return;
		}

		if (this.undoCameraAngle == 9999) {
			this.undoCameraAngle = this.cameraAngle;
		}

		let newCamAng = Math.PI * (this.cameraTimeElapsed / animSpan);
		this.cameraRotAngle = newCamAng - this.cameraAngle;
		this.cameraAngle = newCamAng;

		if (this.isUndo) {
			this.cameraRotAngle *= -1;
			this.undoCameraAngle += this.cameraRotAngle;
			if (this.undoCameraAngle <= 0) {
				this.cameraRotAngle = -1 * this.undoCameraAngle;
				this.undoCameraAngle = 0;
			}
		}
	}
}