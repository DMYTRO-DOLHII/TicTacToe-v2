let sessions = new Map();

class Session {
	constructor(sessionId) {
		this.sessionId = sessionId;
		this.players = new Map();
		this.currentPlayer = null;
		this.board = [
			["", "", ""],
			["", "", ""],
			["", "", ""]
		]
	}

	// Add new player
	addPlayer({ playerId, websocket }) {
		if (this.players.length == 2) return -1;

		this.players.set(playerId, websocket);
	}

	// Get all players
	getPlayers() {
		return this.players;
	}

	// Function to check for a winner
	checkWinner() {
		// Check rows
		for (let row = 0; row < 3; row++) {
			if (this.board[row][0] !== "" && this.board[row][0] === this.board[row][1] && this.board[row][1] === this.board[row][2]) {
				return this.board[row][0];
			}
		}

		// Check columns
		for (let col = 0; col < 3; col++) {
			if (this.board[0][col] !== "" && this.board[0][col] === this.board[1][col] && this.board[1][col] === this.board[2][col]) {
				return this.board[0][col];
			}
		}

		// Check diagonals
		if (this.board[0][0] !== "" && this.board[0][0] === this.board[1][1] && this.board[1][1] === this.board[2][2]) {
			return this.board[0][0];
		}
		if (this.board[0][2] !== "" && this.board[0][2] === this.board[1][1] && this.board[1][1] === this.board[2][0]) {
			return this.board[0][2];
		}

		// If no winner found
		return null;
	}

	isFull() {
		return this.players.length == 2;
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

module.exports = { createNewSession, getSession };