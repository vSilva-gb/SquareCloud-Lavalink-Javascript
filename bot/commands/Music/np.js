const { Embed } = require('../../utils'),
    { splitBar } = require('string-progressbar'),
    Command = require('../../structures/Command');

class NowPlaying extends Command {
    constructor(client) {
        super(client, {
            name: 'np',
            guildOnly: true,
            dirname: __dirname,
            aliases: ['song'],
            botPermissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
            description: 'Shows the current song playing.',
            usage: 'np',
            cooldown: 3000,
            slash: true,
        });
    }

    async run(client, message, settings) {
        if (message.guild.roles.cache.get(settings.MusicDJRole)) {
            if (!message.member.roles.cache.has(settings.MusicDJRole)) {
                return message.channel.error('misc:MISSING_ROLE').then(m => m.timedDelete({ timeout: 10000 }));
            }
        }

        const player = client.manager?.players.get(message.guild.id);
        if (!player || !player.queue.current) return message.channel.error('misc:NO_QUEUE').then(m => m.timedDelete({ timeout: 10000 }));

        const { title, requester, thumbnail, uri, duration } = player.queue.current;
        const end = (duration > 6.048e+8) ? message.translate('music/np:LIVE') : new Date(duration).toISOString().slice(11, 19);

        try {
            const embed = new Embed(client, message.guild)
                .setAuthor({ name: message.translate('music/np:AUTHOR') })
                .setColor(message.member.displayHexColor)
                .setThumbnail(thumbnail)
                .setDescription(`[${title}](${uri}) [${message.guild.members.cache.get(requester.id)}]`)
                .addField('\u200b', new Date(player.position * player.speed).toISOString().slice(11, 19) + ' [' + splitBar(duration > 6.048e+8 ? player.position * player.speed : duration, player.position * player.speed, 15)[0] + '] ' + end, false);
            message.channel.send({ embeds: [embed] });
        } catch (err) {
            if (message.deletable) message.delete();
            client.logger.error(`Command: '${this.help.name}' has error: ${err.message}`);
            message.channel.error('misc:ERROR_MESSAGE', { ERROR: err.message}).then(m => m.timedDelete({ timeout: 5000 }));
        }
    }
    
    async callback(client, interaction, guild) {
        const member = guild.members.cache.get(interaction.user.id),
            channel = guild.channels.cache.get(interaction.channelId);
        
        if (guild.roles.cache.get(interaction.user.id)) {
            if (!member.roles.cache.has(guild.settings.MusicDJRole)) {
                return interaction.reply({ ephemeral: true, embeds: [channel.error('misc:MISSING_ROLE', { ERROR: null }, true)] });
            }
        }

        const player = client.manager?.players.get(guild.id);
        if (!player) return interaction.reply({ ephemeral: true, embeds: [channel.error('misc:NO_QUEUE', {ERROR: null }, true)] });

        const { title, requester, thumbnail, uri, duration } = player.queue.current;
        const end = (duration > 6.048e+8) ? message.translate('music/np:LIVE') : new Date(duration).toISOString().slice(11, 19);

        try {
            const embed = new Embed(client, guild)
                .setAuthor({ name: client.translate('music/np:AUTHOR') })
                .setColor(member.displayHexColor)
                .setThumbnail(thumbnail)
                .setDescription(`[${title}](${uri}) [${guild.members.cache.get(requester.id)}]`)
                .addField('\u200b', new Date(player.position * player.speed).toISOString().slice(11, 19) + ' [' + splitBar(duration < 6.048e+8 ? player.position * player.speed : duration, player.position * player.speed, 15)[0] + '] ' + end, false);
            interaction.reply({ embeds: [embed] });
        } catch (err) {
            client.logger.error(`Command: '${this.help.name}' has error: ${err.message}`);
            return interaction.reply({ ephemeral: true, embeds: [channel.error('misc:ERROR_MESSAGE', { ERROR: null }, true)] });
        }
    }
}

module.exports = NowPlaying;