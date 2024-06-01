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

// Handle new-game
app.use('/new-game', newGameRouter);

// Route for game sessions
app.get('/:sessionId', (req, res) => {
	const { sessionId } = req.params;

	const currentSession = session.getSession(sessionId);

	if (!currentSession) {
		res.render('session-not-found');
		return;
	}

	if (currentSession.isFull()) {
		res.render('session-is-full');
	}


	console.log(currentSession);

	const userId = generate.generateComplexUUID(6);
	currentSession.addPlayer(userId);

	res.cookie('userId', userId, { httpOnly: true })

	// Render the game session page
	res.render('game-session', { sessionId, userId });
});

// WebSocket server logic
wss.on('connection', (ws) => {
	console.log('WebSocket connection established');
	// WebSocket handling logic
});

module.exports = {
	app,
	server
};
