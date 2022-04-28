const { functions: { checkMusic } } = require('../../utils'),
    Command = require('../../structures/Command');

class Resume extends Command {
    constructor(client) {
        super(client, {
            name: 'resume',
            guildOnly: true,
            dirname: __dirname,
            aliases: ['resumir'],
            botPermissions: ['SEND_MESSAGES', 'EMBED_LINKS', 'SPEAK'],
            description: 'Resumes the music',
            usage: 'resume',
            cooldown: 3000,
            slash: true,
        });
    }

    async run(client, message, settings) {
        const playable = checkMusic(message.member, client);
        if (typeof (playable) !== 'boolean') return message.channel.error(playable).then(m => m.timedDelete({ timeout: 1000 }));

        const player = client.manager?.players.get(message.guild.id);

        if (!player.paused) return message.channel.error('music/resume:IS_RESUMED', { PREFIX: settings.prefix });

        player.pause(false);
        return message.channel.success('music/resume:SUCCESS')
    }

    async callback(client, interaction, guild) {
        const member = guild.members.cache.get(interaction.user.id),
            channel = guild.channels.cache.get(interaction.channelId);

        const playable = checkMusic(member, client);
        if (typeof (playable) !== 'boolean') return interaction.reply({ embeds: [channel.error(playable, {}, true)], ephemeral: true});

        const player = client.manager?.players.get(member.guild.id);

        if (!player.paused) return interaction.reply({ ephemeral: true, embeds: [channel.error('music/resume:IS_RESUMED', {}, true)] });
        
        player.pause(false);
        return interaction.reply({ embeds: [channel.success('music/resume:SUCCESS', {}, true)]});
    }
}

module.exports = Resume;