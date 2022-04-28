const { interaction } = require('../../structures/Message');
const { functions: { checkMusic } } = require('../../utils'),
    Command = require('../../structures/Command');

class Pause extends Command {
    constructor(client) {
        super(client, {
            name: 'pause',
            guildOnly: true,
            dirname: __dirname,
            aliases: ['pausar'],
            botPermissions: ['SEND_MESSAGES', 'EMBED_LINKS', 'SPEAK'],
            description: 'Pause the current song that is playing',
            usage: 'pause',
            cooldown: 4000,
            slash: true,
        });
    }

    async run(client, message, settings) {
        const playable = checkMusic(message.member, client);
        if (typeof (playable) !== 'boolean') return message.channel.error(playable).then(m => m.timedDelete({ timeout: 10000 }));

        const player = client.manager?.players.get(message.guildId);

        (player.paused) ? player.pause(false) : player.pause(true);

        return message.channel.success(`Song is now **${(player.playing) ? 'resumed' : 'paused'}.**`);
    }

    async callback(client, interaction, guild) {
        const member = guild.members.cache.get(interaction.user.id),
            channel = guild.channels.cache.get(interaction.channelId);

        const playable = checkMusic(member, client);
        if (typeof (playable) !== 'boolean') return message.channel.error(playable).then(m => m.timedDelete({ timeout: 10000 }));

        const player = client.manager?.players.get(guild.id);

        (player.paused) ? player.pause(false) : player.pause(true);

        return interaction.reply({ embeds: [channel.success(`Song is now **${(player.playing) ? 'resumed' : 'paused'}.**`, {}, true)] });
    }
}

module.exports = Pause;