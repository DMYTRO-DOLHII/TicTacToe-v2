// index.js
const { server } = require('./server');

// Define Port
const PORT = process.env.PORT || 3000;

// Start the Express server
server.listen(PORT, () => {
	console.log(`Server running at ${process.env.DOMAIN_URL || `http://localhost:${PORT}/`}`);
});
