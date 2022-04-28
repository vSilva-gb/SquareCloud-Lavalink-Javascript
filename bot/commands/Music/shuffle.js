const { MessageEmbed } = require('discord.js'),
    { functions: { checkMusic }, Embed } = require('../../utils'),
    Command = require('../../structures/Command');

class Shuffle extends Command {
    constructor(client) {
        super(client, {
            name: 'shuffle',
            guildOnly: true,
            dirname: __dirname,
            botPermissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
            description: 'Shuffles the playlist.',
            usage: 'shuffle',
            cooldown: 3000,
            slash: true,
        });
    }

    async run(client, message, settings) {
        const playable = checkMusic(message.member, client);
        if (typeof (playable) !== 'boolean') return message.channel.error(playable).then(m => m.timedDelete({ timeout: 10000 }));

        const player = client.manager?.players.get(message.guild.id);
        player.queue.shuffle();
        const embed = new MessageEmbed()
            .setColor('RANDOM')
            .setDescription(message.translate('music/shuffle:DESC'));
        message.channel.send({ embeds: [embed] });
    }

    async callback(client, interaction, guild) {
        const member = guild.members.cache.get(interaction.user.id),
            channel = guild.channels.cache.get(interaction.channelId);

        const playable = checkMusic(message.member, client);
        if (typeof (playable) !== 'boolean') return message.channel.error(playable).then(m => m.timedDelete({ timeout: 10000 }));

        const player = client.manager?.players.get(member.guild.id);
        player.queue.shuffle();
        const embed = new MessageEmbed(client, guild)
            .setColor('RANDOM')
            .setDescription(guild.translate('music/shuffle:DESC'));
        interaction.reply({ embeds: [embed] });
    }
}

module.exports = Shuffle;