let sessions = new Map();

class Session {
	constructor(sessionId) {
		this.sessionId = sessionId;
		this.players = new Map();
		this.currentPlayer = null;
		this.whoStarted = null;
		this.board = [
			["", "", ""],
			["", "", ""],
			["", "", ""]
		];
		this.winner = null;
	}

	// Add new player
	addPlayer({ playerId, websocket }) {
		if (this.players.size >= 2) return -1;

		this.players.set(playerId, websocket);
	}

	// Delete player associated with a WebSocket
    deletePlayer(websocket) {
        for (const [playerId, ws] of this.players.entries()) {
            if (ws === websocket) {
                return this.players.delete(playerId);
            }
        }
        return false; // Return false if player not found
    }

	// Get current player's turn
	getCurrentPlayer() {
		return this.currentPlayer;
	}

	// Get all players
	getPlayers() {
		return this.players;
	}

	// Get random player
	randomPlayer() {
		const keysArray = Array.from(this.players.keys());
		const randomIndex = Math.floor(Math.random() * keysArray.length);
		return keysArray[randomIndex];
	}

	// Start new game
	newGame() {
		this.board = [
			["", "", ""],
			["", "", ""],
			["", "", ""]
		];
		this.winner = null;
		this.currentPlayer = this.randomPlayer();
		this.whoStarted = this.currentPlayer;
	}

	// Make a move
	makeMove(index, playerId) {
		if (this.winner) return; // Ignore moves if the game is already won

		const [row, col] = [Math.floor(index / 3), index % 3];
		if (this.board[row][col] === "") {
			this.board[row][col] = playerId === this.whoStarted ? 'X' : 'O';
			this.winner = this.checkWinner();

			if (!this.winner) {
				this.currentPlayer = this.getNextPlayer();
			}
		}
	}

	// Get the next player
	getNextPlayer() {
		const keysArray = Array.from(this.players.keys());
		const currentIndex = keysArray.indexOf(this.currentPlayer);
		const nextIndex = (currentIndex + 1) % keysArray.length;
		return keysArray[nextIndex];
	}

	// Function to check for a winner
	checkWinner() {
		const winningCombinations = [
			[[0, 0], [0, 1], [0, 2]],
			[[1, 0], [1, 1], [1, 2]],
			[[2, 0], [2, 1], [2, 2]],
			[[0, 0], [1, 0], [2, 0]],
			[[0, 1], [1, 1], [2, 1]],
			[[0, 2], [1, 2], [2, 2]],
			[[0, 0], [1, 1], [2, 2]],
			[[0, 2], [1, 1], [2, 0]]
		];

		for (let combination of winningCombinations) {
			const [a, b, c] = combination;
			const [ax, ay] = a;
			const [bx, by] = b;
			const [cx, cy] = c;

			if (this.board[ax][ay] !== "" && this.board[ax][ay] === this.board[bx][by] && this.board[bx][by] === this.board[cx][cy]) {
				return this.board[ax][ay];
			}
		}

		// If no winner found and board is full
		if (this.board.flat().every(cell => cell !== "")) {
			return 'draw';
		}

		return null;
	}

	// Get board state
	getBoard() {
		return this.board;
	}

	// Check if the session is full
	isFull() {
		return this.players.size === 2;
	}

	// Get the winner
	getWinner() {
		return this.winner;
	}

	// Check if the game is a draw
	isDraw() {
		return this.winner === 'draw';
	}
}

function createNewSession(sessionId) {
	const newSession = new Session(sessionId);
	sessions.set(sessionId, newSession);
	return newSession;
}

function getSession(sessionId) {
	return sessions.get(sessionId);
}

function findSessionSortWebsocket(websocket) {
	for (const [sessionId, currentSession] of sessions.entries()) {
		if (currentSession.players.has(websocket)) {
			return currentSession;
		}
	}
	return null; // Return null if no session found for the given WebSocket
}

module.exports = { createNewSession, getSession, findSessionSortWebsocket };
