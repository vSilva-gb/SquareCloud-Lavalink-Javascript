const { functions : { checkMusic } } = require('../../utils'),
    Command = require('../../structures/Command');

class Stop extends Command {
    constructor(client) {
        super(client, {
            name: 'disconnect',
            guildOnly: true,
            dirname: __dirname,
            aliases: ['stop', 'desconectar', 'parar'],
            botPermissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
            description: 'Disconnect the bot from the voice channel',
            usage: 'dc',
            cooldown: 3000,
            slash: true,
        });
    }

    async run(client, message) {
        const playable = checkMusic(message.member, client);
        if (typeof (playable) !== 'boolean') return message.channel.error(playable).then(m => m.timedDelete({ timeout: 10000 }));

        const player = client.manager?.players.get(message.guildId);
        player?.destroy();
        return message.channel.success('music/dc:LEFT');
    }

    async callback(client, interaction, guild) {
        const member = guild.members.cache.get(interaction.user.id),
            channel = guild.channels.cache.get(interaction.channelId);

        const playable = checkMusic(member, client);
        if (typeof (playable) !== 'boolean') return interaction.reply({ embeds: [channel.error(playable, {}, true)], ephemeral: true });

        const player = client.manager?.players.get(member.guild.id);
        player?.destroy();
        return interaction.reply({ embeds: [channel.success('music/dc:LEFT', {}, true)] });
    }
}

module.exports = Stop;