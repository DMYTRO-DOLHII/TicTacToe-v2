const express = require('express');
const generate = require('../generate')
const router = express.Router();
const session = require('../session');

router.post('/', (req, res) => {
	const sessionId = generate.generateComplexUUID(6); // Generate a unique player ID

	session.createNewSession(sessionId);

	res.json({ sessionId });
});

module.exports = router;
