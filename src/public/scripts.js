document.getElementById('newGameBtn').addEventListener('click', async () => {
	try {
		const response = await fetch('/new-game', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			}
		});
		const data = await response.json();

		if (data.sessionId) {
			// Redirect to the session page
			window.location.href = `/${data.sessionId}`;
		}
	} catch (error) {
		console.error('Error creating new game:', error);
	}
});
