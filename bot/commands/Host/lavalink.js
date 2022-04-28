const { Embed } = require('../../utils'),
	{ Node } = require('erela.js')
	Command = require('../../structures/Command');

class Lavalink extends Command {
	constructor(client) {
		super(client, {
			name: 'lavalink',
			ownerOnly: true,
			dirname: __dirname,
			botPermissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
			description: 'Interact with the Lavalink nodes',
			usage: 'lavalink [list | add | remove] <information>',
			cooldown: 3000,
		});
	}

	async run(client, message, settings) {
		let msg, memory, cpu, uptime, playingPlayers, players;

		switch (message.args[0]) {
			case 'list': {
				const embed = new Embed(client, message.guild)
					.setTitle('Lavalink nodes:')
					.setDescription(client.manager.nodes.map((node, index, array) => {
						return `${array.map(({ options }) => options.host).indexOf(index) + 1}.) **${node.options.host}** (Uptime: ${this.uptime(node.stats.uptime ?? 0)})`;
				}).join('\n'));
				return message.channel.send({ embeds: [embed] });
			}
			case 'add':
				try {
				// Connect to new node
					await (new Node({
						host: message.args[1] ?? 'localhost',
						password: message.args[2] ?? 'youshallnotpass',
						port: parseInt(message.args[3]) ?? 5000,
					})).connect();
					message.channel.success('host/node:ADDED_NODE');
				} catch (err) {
					client.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
					message.channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }).then(m => m.timedDelete({ timeout: 5000 }));
				}
				break;
			case 'remove': {
				try {
					await (new Node({
						host: message.args[1] ?? 'localhost',
						password: message.args[2] ?? 'youshallnotpass',
						port: parseInt(message.args[3]) ?? 5000,
					})).destroy();
					message.channel.success('host/node:REMOVED_NODE');
				} catch (err) {
					client.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
					message.channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }).then(m => m.timedDelete({ timeout: 5000 }));
				}
				break;
			}
			default:
				if (client.manager.leastUsedNodes) {
					msg = await message.channel.send(message.translate('host/lavalink:FETCHING')),
					{	memory,	cpu,	uptime,	playingPlayers,	players } = client.manager.leastUsedNodes.first().stats;
	
					// RAM usage
					const allocated = Math.floor(memory.allocated / 1024 / 1024),
						used = Math.floor(memory.used / 1024 / 1024),
						free = Math.floor(memory.free / 1024 / 1024),
						reservable = Math.floor(memory.reservable / 1024 / 1024);
	
					// CPU usage
					const systemLoad = (cpu.systemLoad * 100).toFixed(2),
						lavalinkLoad = (cpu.lavalinkLoad * 100).toFixed(2);
	
					// Lavalink uptime
					const botUptime = this.uptime(uptime);
	
					const embed = new Embed(client, message.guild)
						.setAuthor({ name: message.translate('host/lavalink:AUTHOR', { NAME: client.manager.nodes.get(message.args[0])?.options.host ?? client.manager.nodes.first().options.host }) })
						.addField(message.translate('host/lavalink:PLAYERS'), message.translate('host/lavalink:PLAYER_STATS', { PLAYING: playingPlayers, PLAYERS: players }))
						.addField(message.translate('host/lavalink:MEMORY'), message.translate('host/lavalink:MEMORY_STATS', { ALL: allocated, USED: used, FREE: free, RESERVE: reservable }))
						.addField(message.translate('host/lavalink:CPU'), message.translate('host/lavalink:CPU_STATS', { CORES: cpu.cores, SYSLOAD: systemLoad, LVLLOAD: lavalinkLoad }))
						.addField(message.translate('host/lavalink:UPTIME'), message.translate('host/lavalink:UPTIME_STATS', { NUM: botUptime }))
						.setTimestamp(Date.now());
					return msg.edit({ content: ' ', embeds: [embed] });
				} else {
					return message.channel.error('misc:INCORRECT_FORMAT', { EXAMPLE: settings.prefix.concat(message.translate('host/lavalink:USAGE')) }).then(m => m.timedDelete({ timeout: 5000 }));
				}
			}
		}

		uptime(time) {
			const calculations = {
				semana: Math.floor(time / (1000 * 60 * 60 * 24 * 7)),
				dia: Math.floor(time / (1000 * 60 * 60 * 24)),
				hora: Math.floor((time / (1000 * 60 * 60)) % 24),
				minuto: Math.floor((time / (1000 * 60)) % 60),
				segundo: Math.floor((time / 1000) % 60),
			};
			if (calculations.semana >= 1) calculations.dia -= calculations.semana * 7;
	
			let str = '';
			for (const [key, val] of Object.entries(calculations)) {
				if (val > 0) str += `${val} ${key}${val > 1 ? 's' : ''} `;
			}
	
			return str;
		}
	}

module.exports = Lavalink;