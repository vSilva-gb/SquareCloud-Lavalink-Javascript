// Dependencies
const express = require('express'),
	router = express.Router();

module.exports = (client) => {
	// statistics page
	router.get('/', async (req, res) => {

		res.status(200).json({
			guildCount: client.guilds.cache.size,
			cachedUsers: client.users.cache.size,
			totalMembers: client.guilds.cache.map(g => g).reduce((a, b) => a + b.memberCount, 0),
			uptime: Math.round(process.uptime() * 1000),
			commandCount: client.commands.size,
			memoryUsed: (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2),
			textChannels: client.channels.cache.filter(({ type }) => type === 'GUILD_TEXT').size,
			voiceChannels: client.channels.cache.filter(({ type }) => type === 'GUILD_VOICE').size,
			MessagesSeen: client.messagesSent,
			CommandsRan: client.commandsUsed,
			ping: Math.round(client.ws.ping),
			Lavalink: client.manager.nodes.map(node => ({
				name: node.options.identifier,
				stats: node.stats,
			})),
		});
	});

	return router;
};
