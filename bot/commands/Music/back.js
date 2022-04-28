const { functions: { checkMusic }} = require('../../utils'),
    Command = require('../../structures/Command');

class Back extends Command {
    constructor(client) {
        super(client, {
            name: 'back',
            guildOnly: true,
            dirname: __dirname,
            aliases: ['previous', 'prev'],
            botPermissions: ['SEND_MESSAGES', 'EMBED_LINKS', 'SPEAK'],
            description: 'Plays the previous song in the queue',
            usage: 'back',
            cooldown: 3000,
            slash: true,
        });
    }

    async run(client, message) {
        const playable = checkMusic(message.member, client);
        if (typeof (playable) !== 'boolean') return message.channel.error(playable).then(m => m.timedDelete({ timeout: 10000}));

        const player = client.manager?.players.get(message.guildId);
        if (player.queue.previous == null) return message.channel.send(message.translate('music/back:NO_PREV'));

        player.queue.unshift(player.queue.previous);
        player.stop();
        message.react("🔄").catch((e) => {});
    }

    async callback(client, interaction, guild) {
        const member = guild.members.cache.get(interaction.user.id),
            channel = guild.channels.cache.get(interaction.channelId);
        
        const playable = checkMusic(member, client);
        if (typeof (playable) !== 'boolean') return interaction.reply({ embeds: [channel.error(playable, {}, true)], ephemeral: true });

        const player = client.manager?.players.get(member.guild.id);
        if (player.queue.previous == null) return interaction.reply({ content: guild.translate('music/back:NO_PREV') });

        player.queue.unshift(player.queue.previous);
        player.stop();
        interaction.reply({ embeds: [channel.success('music/back:BACK_SKIPED', {}, true)] });
    }
}

module.exports = Back;