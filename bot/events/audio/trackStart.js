const { Embed } = require('../../utils'),
    { MessageButton, MessageActionRow } = require('discord.js'),
    { functions: { musicaTocada, randomDicas } } = require('../../utils')
    Event = require('../../structures/Event');

class TrackStart extends Event {
    constructor(...args) {
        super(...args, {
            dirname: __dirname,
        });
    }

    async run(client, player, track) {
        //Evento quando uma música é iniciada
        //Desestruturando track
        const { uri, title, author, duration, thumbnail } = track;
        //
        musicaTocada(client, uri, title, author, duration, thumbnail);

        const embed = new Embed(client, client.guilds.cache.get(player.guild))
			.setColor(client.config.embedColor)
			.setAuthor({ name: '| ' + client.translate('music/np:AUTHOR'), iconURL: client.user.displayAvatarURL({ format: 'png', size: 1024 }) })
			.setDescription(`[${track.title}](${track.uri}) [${client.guilds.cache.get(player.guild).members.cache.get(track.requester.id)}]`)
            .setFooter(`Dica: ${await randomDicas()}`);

		const trackStartMsg = await client.channels.cache.get(player.textChannel)?.send({ embeds: [embed]/*, components: [row]*/ });
            await player.set("message", trackStartMsg);
            //.then(m => m.timedDelete({ timeout: (track.duration < 6.048e+8) ? track.duration : 60000 }));
        
        if (player.timeout != null) return clearTimeout(player.timeout);
    }
}

module.exports = TrackStart;