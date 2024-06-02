document.addEventListener('DOMContentLoaded', () => {
	const socket = new WebSocket('ws://localhost:10000');
	let userId = null;
	let currentPlayer = null;

	socket.onopen = function () {
		console.log('WebSocket connection established.');

		const joinSessionMessage = {
			type: 'joinSession',
			sessionId: window.location.pathname.split('/')[1]
		};

		socket.send(JSON.stringify(joinSessionMessage));
	};

	socket.onmessage = function (event) {
		const message = JSON.parse(event.data);

		if (message.type === 'joined') {
			console.log('Joined session with user ID:', message.userId);
			console.log('Opponent ID:', message.opponentId);

			// Save userId and opponentId in cookies
			setCookie('userId', message.userId, 1);
			setCookie('opponentId', message.opponentId, 1);

			userId = message.userId;

			// Check if both userId and opponentId are available
			if (message.userId && message.opponentId) {
				document.getElementById('opponentInfo').innerText = `Your opponent: ${message.opponentId}`;
			}
		}

		if (message.type === 'opponentLeft') {
			document.getElementById('opponentInfo').innerText = 'Waiting for opponent...';
			// Additional code if needed...
		}

		if (message.type === 'gameStart') {
			currentPlayer = message.currentPlayer;
			updateTurnIndicator();
			document.getElementById('restartButton').style.display = 'none';
			clearBoard();
		}

		if (message.type === 'gameUpdate') {
			currentPlayer = message.currentPlayer;
			updateBoard(message.board);
			updateTurnIndicator();

			// Check for winner or draw
			if (message.isDraw) {
				document.getElementById('turn').innerText = 'It\'s a draw!';
				document.getElementById('restartButton').style.display = 'block';
			} else if (message.winner) {
				document.getElementById('turn').innerText = `${message.winner} wins!`;
				document.getElementById('restartButton').style.display = 'block';
			}
		}
	};

	// Set cookie for some time
	function setCookie(name, value, days) {
		let expires = "";
		if (days) {
			const date = new Date();
			date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
			expires = "; expires=" + date.toUTCString();
		}
		document.cookie = name + "=" + (value || "") + expires + "; path=/";
	}

	// Get cookie value
	function getCookie(name) {
		const cookieName = name + "=";
		const decodedCookie = decodeURIComponent(document.cookie);
		const cookieArray = decodedCookie.split(';');
		for (let i = 0; i < cookieArray.length; i++) {
			let cookie = cookieArray[i];
			while (cookie.charAt(0) === ' ') {
				cookie = cookie.substring(1);
			}
			if (cookie.indexOf(cookieName) === 0) {
				return cookie.substring(cookieName.length, cookie.length);
			}
		}
		return null;
	}

	const sessionIdField = document.getElementById('sessionId');
	const copyButton = document.getElementById('copyButton');

	// Copy session ID to clipboard when button is clicked
	copyButton.addEventListener('click', () => {
		sessionIdField.select();
		sessionIdField.setSelectionRange(0, 99999); // For mobile devices
		document.execCommand('copy');
		// Display popup text
		copyButton.innerText = 'Copied!';
		setTimeout(() => {
			copyButton.innerText = 'Copy';
		}, 1000);
	});

	document.getElementById('returnHome').addEventListener('click', () => {
		window.location.href = '/';
	});

	// Add click event listeners to each cell
	const cells = document.querySelectorAll('.cell');
	cells.forEach((cell, index) => {
		cell.addEventListener('click', () => handleCellClick(index));
	});

	function handleCellClick(index) {
		if (userId !== currentPlayer) {
			// Not this player's turn
			return;
		}

		// Make move and send it to the server
		socket.send(JSON.stringify({
			type: 'makeMove',
			sessionId: window.location.pathname.split('/')[1],
			index,
			playerId: userId
		}));
	}

	function updateTurnIndicator() {
		const turn = currentPlayer === userId ? 'Your turn' : 'Your opponent\'s turn';
		document.getElementById('turn').innerText = turn;
	}

	function updateBoard(board) {
		const userId = getCookie('userId');
		board.forEach((row, rowIndex) => {
			row.forEach((value, colIndex) => {
				const cell = document.getElementById(`cell-${rowIndex}${colIndex}`);
				cell.innerText = value ? (value === 'X' ? 'X' : 'O') : '';
			});
		});
	}

	function clearBoard() {
		const cells = document.querySelectorAll('.cell');
		cells.forEach(cell => {
			cell.innerText = ''; // Clear the inner text of each cell
		});
	}


	// Function to handle restart button click
	document.getElementById('restartButton').addEventListener('click', () => {
		// Hide restart button
		document.getElementById('restartButton').style.display = 'none';
		// Send restart game message to the server
		const restartMessage = {
			type: 'restartGame',
			sessionId: window.location.pathname.split('/')[1]
		};
		socket.send(JSON.stringify(restartMessage));
	});
});
