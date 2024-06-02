# Tic Tac Toe Multiplayer Game

This is a simple multiplayer Tic Tac Toe game built using WebSocket technology. Players can join game sessions and play against each other in real-time.

## Features

- Multiplayer gameplay: Play against another player in real-time.
- Random player selection: Randomly determine which player goes first.
- Win and draw detection: The game automatically detects when a player wins or if it's a draw.
- Restart functionality: Players can restart the game after a win or draw.

## Technologies Used

- Node.js: Backend server environment.
- Express.js: Web framework for Node.js.
- WebSocket: Enables real-time bidirectional communication between clients and server.
- HTML/CSS/JavaScript: Frontend development.
- EJS: Templating engine for rendering HTML pages dynamically.
- CSS: Styling the user interface.

## Installation

1. Clone the repository:

```bash
git clone https://github.com/DMYTRO-DOLHII/TicTacToe-v2
```

2. Navigate to the project directory:

```bash
cd TicTacToe-v2
```

3. Install dependencies:

```bash
npm install ws express
```

## Usage

1. Start the server:
```bash
npm run start:dev
```

2. Open your web browser and go to http://localhost:3000 to access the game.

3. Enter a unique session ID to create or join a game session.

4. Share the session ID with your opponent to play against them.

5. Enjoy playing Tic Tac Toe!

## Contributing

Contributions are welcome! If you have any ideas for improvements or new features, feel free to fork the repository and submit a pull request.