// Dependencies
const express = require('express'),
	router = express.Router();

// Command page
module.exports = (client) => {
	// List of all commands
	router.get('/', (req, res) => {

		// show list of commands
		const categories = client.commands
			.map(c => c.help.category)
			.filter((v, i, a) => a.indexOf(v) === i)
			.sort((a, b) => a - b)
			.map(category => ({
				name: category,
				commands: client.commands.filter(c => c.help.category === category)
					.sort((a, b) => a.help.name - b.help.name)
					.map(c => c.help.name),
			}));
		res.status(200).json({ categories });
	});

	// JSON view of all commands
	router.get('/json', (req, res) => {

		res.status(200).json([...client.commands]);
	});

	// Show information on a particular command
	router.get('/:command', (req, res) => {

		// check if command exists
		if (client.commands.get(req.params.command) || client.commands.get(client.aliases.get(req.params.command))) {
			const command = client.commands.get(req.params.command) || client.commands.get(client.aliases.get(req.params.command));
			res.status(200).json({ command });
		} else {
			res.status(400).json({ error: 'Invalid command!' });
		}
	});

	return router;
};
