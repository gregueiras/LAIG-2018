class Client {

    constructor(port) {
        this.defaulPort = 8081;

        this.port = typeof port !== 'undefined' ? port : this.defaulPort;

        this.requestComplete = false;
        this.winnerCode = 0;

    }

    //Tipo de jogadas  : PvP , PvC, CvP

    /**
     * 
     * @param {*} board MyBoard.board
     * @param {*} move Manalath.moves(last)
     */
    buildRequestParams(board, move) {
        let boardStr = '[';
        board.forEach(cell => {
            let x = toString(cell.pX);
            let y = toString(cell.pY);

            let state;
            if (cell.state = CellState.empty) {
                state = "emptyCell";
            } else if (cell.state = CellState.white) {
                state = "whitePiece";
            } else if (cell.state = CellState.black) {
                state = "blackPiece";
            }

            boardStr += "cell(" + x + "," + y + "," + state + "),";
        });

        boardStr = boardStr.slice(0, -1);
        boardStr += ']';

        let x = (move.x);
        let y = (move.y);
        let color;
        if (move.state = CellState.empty) {
            color = "emptyCell";
        } else if (move.state = CellState.white) {
            color = "whitePiece";
        } else if (move.state = CellState.black) {
            color = "blackPiece";
        }

        let requestStr = "[" + boardStr + "," + x + "," + y + "," + color + "]"

        return requestStr;
    }

    request(message) {
        let request = new XMLHttpRequest();

        this.requestComplete = false;
        request.addEventListener('load', this.requestCompleted);
        request.addEventListener('error', this.requestFailed);
        request.open('GET', 'http://localhost:' + this.port + '/' + message, true);
        request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        request.send();
    }

    requestCompleted(event) {
        let response = this.responseText;
        let splited = response.split(']');

        this.winnerCode = splited[1].slice(1);

        let cellArr = splited[0].slice(2);
        cellArr = cellArr.split('),');

        this.board = [];

        cellArr.forEach(cell => {

            let vals = cell.slice(5);

            let cellVals = vals.split(',');

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
        console.warn('Request failed.');
    }

}