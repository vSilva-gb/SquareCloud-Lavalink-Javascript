// Dependencies
const Command = require('../../structures/Command.js'),
	{ promisify } = require('util'),
	readdir = promisify(require('fs').readdir);

/**
 * Docs command
 * @extends {Command}
*/
class Docs extends Command {
	/**
 	 * @param {Client} client The instantiating client
 	 * @param {CommandData} data The data for the command
	*/
	constructor(client) {
		super(client, {
			name: 'refresh-interaction',
			ownerOnly: true,
			dirname: __dirname,
			botPermissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
			description: 'Update all the servers interaction',
			usage: 'refresh-interaction',
			cooldown: 3000,
			examples: ['refresh-interaction'],
			slash: true,
		});
	}

	async run(client, message) {
		const msg = await message.channel.send(`**> Carregando interações em ${client.guilds.cache.size} servidores!**`);
		let successCount = 0;
		// loop through each guild
		for (const guild of [...client.guilds.cache.values()]) {
			const enabledPlugins = (await readdir('./commands/')).filter((v, i, a) => v !== 'Host' && a.indexOf(v) === i);
			const data = [];

			// get slash commands for category
			for (const plugin of enabledPlugins) {
				const g = await client.loadInteractionGroup(plugin, guild);
				if (Array.isArray(g)) data.push(...g);
			}

			// get context menus
			data.push(
				{ name: 'Add to Queue', type: 'MESSAGE' },
				{ name: 'Translate', type: 'MESSAGE' },
				{ name: 'Avatar', type: 'USER' },
				{ name: 'Userinfo', type: 'USER' },
				{ name: 'Banner', type: 'USER'},
			);

			try {
				await client.guilds.cache.get(guild.id)?.commands.set(data);
				if (client.config.debug) client.logger.log('Loaded interactions for guild: ' + guild.name);
				successCount++;
			} catch (err) {
				if (client.config.debug) client.logger.error(`Failed to load interactions for guild: ${guild.id} due to: ${err.message}.`);
			}
		}

		if (successCount == 0) return msg.edit(`**> Um erro aconteceu ao atualizar as interações!\n> Verifique o console.**`)
		msg.edit(`**> Atualizado com sucesso as interações em ${successCount} de ${client.guilds.cache.size} servidores.**`);
	}

	async callback(client, interaction, guild) {
		interaction.reply(`Loading Interactions for ${client.guilds.cache.size} guilds`);
		let successCount = 0;

		for (const guild of [...client.guilds.cache.values()]) {
			const enabledPlugins = (await readdir('./commands/')).filter((v, i, a) => v !== 'Host' && a.indexOf(v) === i);
			const data = [];

			for (const plugin of enabledPlugins) {
				const g = await client.loadInteractionGroup(plugin, guild);
				if (Array.isArray(g)) data.push(...g);
			}

			data.push(
				{ name: 'Add to Queue', type: 'MESSAGE' },
				{ name: 'Translate', type: 'MESSAGE' },
				{ name: 'Avatar', type: 'USER' },
				{ name: 'Userinfo', type: 'USER' },
			);

		try {
			await client.guilds.cache.get(guild.id)?.commands.set(data);
			client.logger.log('Loaded interactions for guild: ' + guild.name);
			successCount++;
		} catch (err) {
			client.logger.error(`Failed to load interactions for guild: ${guild.id} due to: ${err.message}.`);
			}
		}
		interaction.editReply(`Successfully updated ${successCount}/${client.guilds.cache.size} servers' interactions.`)
	}
}

module.exports = Docs;