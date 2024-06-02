document.addEventListener('DOMContentLoaded', () => {
	const socket = new WebSocket('ws://localhost:3000');

	socket.onopen = function () {
		console.log('WebSocket connection established.');

		const joinSessionMessage = {
			type: 'joinSession',
			sessionId: window.location.pathname.split('/')[1]
		};

		console.log(joinSessionMessage);

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
});
