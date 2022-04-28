// 
const { version, MessageEmbed } = require('discord.js'),
	{ Embed } = require('../../utils'),
	{ time: { getReadableTime } } = require('../../utils'),
	os = require('os'),
	Command = require('../../structures/Command.js');
const moment = require('moment')
	moment.locale('pt-BR');

class Botinfo extends Command {
	constructor(client) {
		super(client, {
			name: 'botinfo',
			dirname: __dirname,
			aliases: ['bio', 'about'],
			botPermissions: [ 'SEND_MESSAGES', 'EMBED_LINKS'],
			description: 'Check some information about the bot',
			usage: 'botinfo',
			cooldown: 2000,
			slash: true,
		});
	}

	async run(client, message, settings) {
		const embed = await this.createEmbed(client, message.guild, settings);
		message.channel.send({ embeds: [embed] });
	}

	async callback(client, interaction, guild) {
		const settings = guild.settings;
		const embed = await this.createEmbed(client, guild, settings);
		interaction.reply({ embeds: [embed], ephemeral: true });
	}

    async createEmbed(client, guild, settings) {
        return new Embed(client, guild)
        	.addField(`<:passg:912188453389746247> ID`, `\`\`\`${client.user.id}\`\`\``, true)
        	.addField(`<:ram:912182288698204251> RAM`, `\`\`\`${Math.trunc((process.memoryUsage().heapUsed) / 1024 / 1000)} MB / ${Math.trunc(os.totalmem() / 1024 / 1000)} MB (${Math.round((Math.round(process.memoryUsage().heapUsed / 1024 / 1024) / Math.round(os.totalmem() / 1024 / 1024)) * 100)}%)\`\`\``, true)
        	.addField(`<:networkg:912187773778292787> Ping`, `\`\`\`${client.ws.ping}ms\`\`\``, true)
			.addField(`<:networkg:912187773778292787> Database Ping`, `\`\`\`${Math.round(await client.mongoose.ping())}ms\`\`\``, true)
        	.addField(`<:systemg:912187472014897163> Sistema`, `\`\`\`${os.platform()}\`\`\``, true)
        	.addField(`<:pilhag:912185923956006922> Servidores | Usuários`, `\`\`\`💻 ${client.guilds.cache.size} | 👤 ${client.guilds.cache.reduce((a, g) => a + g.memberCount, 0).toString()}\`\`\``, true)
        	.addField(`<:toogleg:912186493819293706> Uptime`, `\`\`\`${getReadableTime(client.uptime)}\`\`\``, false)
        	.addField(`<:procg:912185052274778162> Processador`, `\`\`\`${os.cpus().map(i => `${i.model}`)[0]}\`\`\``, false)
			.addField(`<:cpug:912193996732891136> Uso de CPU`, `\`\`\`${(process.cpuUsage().user / 1024 / 1024).toFixed(2)}%\`\`\``, true)
        	.addField(`<:lapisg:912185400502665247> criado em`, `<t:${Math.round(client.user.createdAt/1000)}:D>`, true)
        	.addField(`DEV`, `<@238458279888420864>\nhttps://galdino.app`, true)
    }
}

module.exports = Botinfo;