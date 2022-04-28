const { GuildSchema, userSchema } = require('../../database/models'),
	Event = require('../../structures/Event');

class Ready extends Event {
	constructor(...args) {
		super(...args, {
			dirname: __dirname,
			once: true,
		});
	}

	async run(client) {
		//Carrega o erela Player
		try {
			client.manager.init(client.user.id);
		} catch (error) {
			client.logger.error(`Ocorreu um erro ao carregar o Lavalink ${error.message}`);
		}

		try {
			await require('../../http')(client);
		} catch (error) {
			console.log(error.message)
		}

		//Carrega o Webhook Manager (Loop a cada 10Seg)
		setInterval(async () => {
			await require('../../helpers/webhookManager')(client);
		}, 10000);

		//Loop em cada guild para puxar as config da database.
		for (const guild of [...client.guilds.cache.values()]) {
			//Organiza as config da guild
			await guild.fetchSettings();
			if (guild.settings == null) await client.emit('guildCreate', guild);
		}

		//Exclui as config da guilda caso o bot seja removida enquanto estiver offline
		const data = await GuildSchema.find({});
		if (data.length > client.guilds.cache.size) {
			//O servidor que o bot foi kikado
			const guildCount = [];
			//Pega os ID's dos servidores
			for (let i = 0; i < client.guilds.cache.size; i++) {
				guildCount.push([...client.guilds.cache.values()][i].id);
			}
			//Agora verifica a database puxando pelo id da guilda
			for (const guild of data) {
				if (!guildCount.includes(guild.guildID)) {
					client.emit('guildDelete', { id: guild.guildID, name: guild.guildName });
				}
			}
		}

		client.logger.ready('Verificação da database finalizada!')

		//A cada 1 minuto procura todas as configuraçoes da guilda
		setInterval(async () => {
			if (client.config.debug) client.logger.debug('Procurando por configuraçoes dos servidores (Intervalo de 1 Minuto)');
			client.guilds.cache.forEach(async guild => {
				await guild.fetchSettings();
			});
		}, 60000);

		//Procura por usuários Premium
		const users = await userSchema.find({});
		for (let i = 0; i < users.length; i++) {
			const user = await client.users.fetch(users[i].userID);
			user.premium = users[i].premium;
			user.premiumSince = users[i].premiumSince ?? 0;
			user.cmdBanned = users[i].cmdBanned;
		}

		//Ativa o controlador de timed Events (Caso o bot reinicie)
		try {
			await require('../../helpers/TimedEventsManager')(client);
		} catch (error) {
			console.log(error);
		}
		client.logger.log(`💻 ${client.guilds.cache.size} | 👤 ${client.guilds.cache.reduce((a, g) => a + g.memberCount, 0).toString()}`, 'log');
		client.logger.log(`${client.user.tag} está pronto para uso!`, 'ready');
	}
}

module.exports = Ready;