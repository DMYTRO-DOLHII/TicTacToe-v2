// server.js
const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const generate = require('./generate')
const session = require('./session');

const newGameRouter = require('./routes/new-game.routes');


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
app.use('/new-game', newGameRouter);

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
				console.log(currentSession.getPlayers().size)
				if (currentSession.getPlayers().size >= 2) {
					ws.send(JSON.stringify({ type: 'sessionIsFull' }));
					return;
				}

				// Generate a user ID and add the player to the session
				const userId = generate.generateComplexUUID(6);
				currentSession.addPlayer({ playerId: userId, websocket: ws });

				console.log(`User ID: ${userId} joined session: ${sessionId}`);

				// Send the user their ID and opponent info
				let opponent = null;
				for (let [key, value] of currentSession.getPlayers()) {
					if (key !== userId) {
						opponent = key;
						break;
					}
				}

				ws.send(JSON.stringify({ type: 'joined', userId, opponentId: opponent || null }));
			}
		} catch (error) {
			console.error('Failed to parse message:', error);
		}
	});
});

module.exports = {
	app,
	server
};
