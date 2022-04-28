const Command = require('../../structures/Command'),
	{ songSchema } = require('../../database/models'),
	{ MessageEmbed } = require('discord.js');

class Charts extends Command {
    constructor(client) {
        super(client, {
            name: 'chart',
			guildOnly: true,
			dirname: __dirname,
			aliases: ['maistocadas'],
			botPermissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
			description: 'See the most played songs',
			usage: 'charts',
			cooldown: 10000,
			examples: [],
        });
    }

	async run(client, message) {
		const msg = await message.channel.send(message.translate('music/charts:SEARCHING'));

		songSchema.find().sort([['timesPlayed', 'descending']]).exec(async (err, res) => {
			if (err) return;
			const songsArr = [];

			for (let i = 0; i < 10; i++) {
				try {
					songsArr.push(`**${i + 1}.** ${res[i].songName} (${res[i].timesPlayed.toLocaleString()} plays)`);
				}
				catch (e) {
					return message.channel.error('misc:ERROR_MESSAGE', { ERROR: e.message }).then(m => m.timedDelete({ timeout: 10000 }));
				}
			}

			const embed = new MessageEmbed()
				.setAuthor({ name: 'Top Charts', iconURL: client.user.displayAvatarURL()})
				.addField(message.translate('music/charts:RESP'), `${songsArr.join('\n')}`)
				.setTimestamp()
				//.setColor('RANDOM');
			msg.edit({ content: ' ', embeds: [embed] });
		});
	}

	async callback(client, interaction, guild) {
		interaction.reply({ content: message.translate('music/charts:SEARCHING') });

		songSchema.find().sort([['timesPlayed', 'descending']]).exec(async (err, res) => {
			if (err) return callback(err);
			const songsArr = [];
			
			for(let i = 0; i < 10; i++) {
				try {
					songsArr.push(`**${i + 1}.** ${res[i].songName} (${res[i].timesPlayed.toLocaleString()} plays)`);
				} catch (error) {
					return message.channel.error('misc:ERROR_MESSAGE', { ERROR: e.message }).then(m => m.timedDelete({ timeout: 10000 }));
				}
			}

			const embed = new MessageEmbed()
				.setAuthor({ name: 'Top Charts', iconURL: client.user.displayAvatarURL()})
				.addField(message.translate('music/charts:RESP'), `${songsArr.join('\n')}`)
				.setTimestamp()
			interaction.editReply({ content: ' ', embeds: [embed] });
		});
	}
};

module.exports = Charts;