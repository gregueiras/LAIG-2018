const GameStates = Object.freeze({
	READY: 0,
	ANIMATING: 1,
	END: 2,
	STOPPED: 3
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
class Manalath {
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

		//TODO Implement on the menu
		this.selectedLvl = GameDifficulty.EASY;
		this.lvl = GameDifficulty.EASY;

		this.selectedMode = GameModes.PvP;
		this.mode = GameModes.PvP;

		this.activePlayer = 0; //0 || 1

		this.setPlayerInfo();

		//start timers
		let game = this;
		setInterval(function () {
			if (game.state == GameStates.READY) {
				game.playerInfo[game.activePlayer].timer += 1;

				const timer = game.playerInfo[game.activePlayer].timer;

				let sec = Math.floor(timer % 60);
				let min = Math.floor(timer / 60);

				sec = sec < 10 ? "0" + sec : sec;
				min = min < 10 ? "0" + min : min;


				document.getElementById("timer").innerHTML = min + ":" + sec;
			}

		}, 1000);

		this.playStatus = PlayStatus.OnGoing;

		this.infoMessage = "Connection not established";

		this.client.request(
			this.client.buildRequestParams(this.mode, this.lvl)
		);

		this.updatePanelInfo();

		if (this.isAIAllowed()) {
			this.decideAIPlay();
		}
	}

	reset() {
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

	restart() {
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

		console.log(this.playerInfo);

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

	setPlayerInfo() {

		let player = {
			timer: 0,
			won: 0,
		};

		this.playerInfo = [];
		this.playerInfo.push(player);
		this.playerInfo.push(JSON.parse(JSON.stringify(player)));
	}

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

		setTimeout(() => {
			this.state = GameStates.READY;
			if (this.client.isWon()) {
				this.setPlayerVictory();
				return;
			}

			this.changeActivePlayer();

			this.updatePanelInfo();

			if (this.isAIAllowed()) {
				this.decideAIPlay();
			}
		}, this.animationSpan * 1000 + 250);
	}

	changeActivePlayer() {
		this.activePlayer++;
		this.activePlayer %= 2;

	}

	setPlayerVictory() {
		this.playStatus = PlayStatus.Finished;
		this.playerInfo[this.activePlayer].won += 1;
		let looser = (this.activePlayer + 1) % 2;
		this.playerInfo[looser].won = 0;
		document.getElementById("streak").innerHTML = this.playerInfo[this.activePlayer].won;
	}

	updatePanelInfo() {
		document.getElementById("player").innerHTML = this.activePlayer + 1;
		document.getElementById("streak").innerHTML = this.playerInfo[this.activePlayer].won;

		let cnt = 0;
		let maxTry = 50;
		let game = this;
		let interval = setInterval(function () {
			++cnt;
			if (cnt > maxTry) {
				clearInterval(interval);
				console.error("Err getting start response");
				return;
			}
			let mp = game.client.getMessagePanel();
			if (mp != -1) {
				clearInterval(interval);
				game.infoMessage = mp;
			}
			document.getElementById("message").innerHTML = game.infoMessage;
		}, 500);
	}

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

			const maxTry = 50;
			let cnt = 0;

			let game = this;
			let interval = setInterval(function () {
				++cnt;
				if (cnt > maxTry) {
					clearInterval(interval);
					console.error(
						"Can't get play... Something must have gone wrong"
					);
					game.playStatus = PlayStatus.Error;
				}
				let play = game.client.getMove();
				if (play != -1) {
					clearInterval(interval);
					game.playStatus = PlayStatus.OnGoing;
				}
			}, 500);
		}
	}

	decideAIPlay() {
		if (this.state == GameStates.ANIMATING) {
			console.warn("The game is in animation state");
			return;
		} else if (this.state == GameStates.STOPPED) {
			console.warn("The game is paused");
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

		let game = this;
		let interval = setInterval(function () {
			++cnt;
			if (cnt > maxTry) {
				clearInterval(interval);
				console.error("Can't get AI play...");
				game.playStatus = PlayStatus.Error;
				return;
			}
			let play = game.client.getMove();
			if (play != -1) {
				clearInterval(interval);
				game.playStatus = PlayStatus.OnGoing;
				game.AIPlay(play);
			}
		}, 500);
	}

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

	undo() {
		if (this.moves.length === 0) return;

		let lastMove = this.moves.pop();
		let piece = lastMove.piece;
		let cell = lastMove.cell;

		piece.reverse = true;
		piece.available = true;
		cell.state = CellState.empty;
	}

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

	display() {
		this.scene.pushMatrix();

		this.scene.rotate(90 * DEGREE_TO_RAD, 1, 0, 0);
		this.scene.scale(0.5, 1, 0.5);
		this.board.display();

		this.scene.popMatrix();
	}

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

	pause() {
		if (this.state == GameStates.READY) {
			this.state = GameStates.STOPPED;
			return true;
		}
		return false;
	}

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

	updateCameraTimer(currTimer) {

		if (this.state != GameStates.ANIMATING) {
			this.cameraTimer = currTimer;
		}

		this.cameraTimeElapsed = currTimer - this.cameraTimer;
	}

	setCameraAngle() {
		const animSpan = (this.animationSpan * 1000 / 2);
		if (this.state != GameStates.ANIMATING) {
			//case no finished on time
			if(this.cameraAngle > Math.PI * 0.9) {
				this.cameraRotAngle = Math.PI - this.cameraAngle;
				this.cameraAngle = 0;
			} else {
				this.cameraAngle = 0;
				this.cameraRotAngle = 0;
			}
			return;
		} 
		//case animation state takes more time than camera rotation
		else if (this.cameraTimeElapsed > animSpan) {
			this.cameraRotAngle = Math.PI - this.cameraAngle;
			this.cameraAngle = Math.PI;
			return;
		} 

		let newCamAng = Math.PI * (this.cameraTimeElapsed / animSpan);
		this.cameraRotAngle = newCamAng - this.cameraAngle;
		this.cameraAngle = newCamAng;

	}
}