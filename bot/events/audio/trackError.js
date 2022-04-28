const { MessageEmbed } = require('discord.js'),
    Event = require('../../structures/Event');

class TrackError extends Event {
    constructor(...args) {
        super(...args, {
            dirname: __dirname,
        });
    }

    async run(client, player, track, payload) {
        //Quando uma música causar erro esse evento é disparado
		// when a track causes an error
		if (client.config.debug) client.logger.log(`Track error: ${payload.error} in guild: ${player.guild}.`);

		// reset player filter (might be the cause)
		player.resetFilter();

        player.get("message")?.delete().catch(() => {});

		// send embed
		const embed = new MessageEmbed()
			.setColor(15158332)
			.setDescription(`An error has occured on playback: \`${payload.error}\``);
		client.channels.cache.get(player.textChannel)?.send({ embeds: [embed] }).then(m => m.timedDelete({ timeout: 15000 }));
    }
}

module.exports = TrackError;