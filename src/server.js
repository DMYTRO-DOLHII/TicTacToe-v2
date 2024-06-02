const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const generate = require('./generate');
const session = require('./session');

// Set EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/views'));

// Serve static files (CSS)
app.use(express.static(path.join(__dirname, '/public')));

// Route to render the index page
app.get('/', (req, res) => {
	res.render('index');
});

// Handle /new-game POST
app.post('/new-game', (req, res) => {
	const sessionId = generate.generateComplexUUID(6); // Generate a unique game session ID

	session.createNewSession(sessionId);

	res.json({ sessionId });
});

// Route for game sessions
app.get('/:sessionId', (req, res) => {
	const { sessionId } = req.params;
	const currentSession = session.getSession(sessionId);

	// Check if the session exists
	if (!currentSession) {
		res.render('session-not-found');
		return;
	}

	// Check if the session is full
	if (currentSession.players.size >= 2) {
		res.render('session-is-full');
		return;
	}

	// If the session exists and is not full, render the game session page
	res.render('game-session', { sessionId });
});

// WebSocket server logic
wss.on('connection', (ws) => {
	console.log('New player connected');

	ws.on('message', (message) => {
		try {
			const data = JSON.parse(message);

			if (data.type === 'joinSession') {
				const { sessionId } = data;
				let currentSession = session.getSession(sessionId);

				// Check if the session exists
				if (!currentSession) {
					ws.send(JSON.stringify({ type: 'sessionNotFound' }));
					return;
				}

				// Check if the session is full
				if (currentSession.getPlayers().size >= 2) {
					ws.send(JSON.stringify({ type: 'sessionIsFull' }));
					return;
				}

				// Generate a user ID and add the player to the session
				const userId = generate.generateComplexUUID(6);
				currentSession.addPlayer({ playerId: userId, websocket: ws });

				// Send the user their ID and opponent info
				let opponentId = null;
				for (let [key, value] of currentSession.getPlayers()) {
					if (key !== userId) {
						opponentId = key;
						break;
					}
				}

				if (opponentId) {
					// Start a new game
					currentSession.newGame();

					let currentPlayer = currentSession.getCurrentPlayer();

					// Notify both players
					currentSession.getPlayers().get(opponentId).send(JSON.stringify(
						{ type: 'joined', userId: opponentId, opponentId: userId }
					));
					currentSession.getPlayers().get(userId).send(JSON.stringify(
						{ type: 'joined', userId: userId, opponentId: opponentId }
					));

					// Send gameStart message to both players
					const gameStartMessage = JSON.stringify({ type: 'gameStart', currentPlayer: currentPlayer });
					currentSession.getPlayers().get(opponentId).send(gameStartMessage);
					currentSession.getPlayers().get(userId).send(gameStartMessage);
				}
			}

			if (data.type === 'makeMove') {
				const { sessionId, index, playerId } = data;
				let currentSession = session.getSession(sessionId);

				// Make the move if it's the player's turn
				if (currentSession && currentSession.getCurrentPlayer() === playerId) {
					currentSession.makeMove(index, playerId);

					// Broadcast the updated game state to both players
					const gameState = {
						type: 'gameUpdate',
						board: currentSession.getBoard(),
						currentPlayer: currentSession.getCurrentPlayer(),
						winner: currentSession.getWinner(),
						isDraw: currentSession.isDraw()
					};

					currentSession.getPlayers().forEach(player => {
						player.send(JSON.stringify(gameState));
					});
				}
			}

			if (data.type === 'restartGame') {
				const { sessionId } = data;
				const currentSession = session.getSession(sessionId);

				// Check if the session exists
				if (!currentSession) {
					ws.send(JSON.stringify({ type: 'sessionNotFound' }));
					return;
				}

				// Reset the game state
				currentSession.newGame();

				// Broadcast the new game state to all players
				currentSession.getPlayers().forEach((player) => {
					player.send(JSON.stringify({ type: 'gameStart', currentPlayer: currentSession.getCurrentPlayer() }));
				});
			}
		} catch (error) {
			console.error('Failed to parse message:', error);
		}
	});

	ws.on('close', () => {
		const sessionToRemoveFrom = session.findSessionSortWebsocket(ws);

		if (sessionToRemoveFrom) {
			sessionToRemoveFrom.deletePlayer(ws);

			// Notify the remaining player that they are waiting for an opponent
			sessionToRemoveFrom.getPlayers().forEach(player => {
				player.send(JSON.stringify({ type: 'opponentLeft' }));
			});
		}
	});
});

module.exports = {
	app,
	server
};
