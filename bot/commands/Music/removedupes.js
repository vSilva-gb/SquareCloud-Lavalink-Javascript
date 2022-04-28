const Command = require('../../structures/Command'),
    { functions: { removerDuplicadas } } = require('../../utils');

class removeDupes extends Command {
    constructor(client) {
        super(client, {
            name: 'removedupes',
            guildOnly: true,
            dirname: __dirname,
            aliases: ['removerduplicadas'],
            botPermissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
            description: 'Removes all duplicated tracks from the queue.',
            usage: 'removedupes',
            cooldown: 5000,
            slash: true,
        });
    }

    async run(client, message, settings) {
        //
        if (!message.member.voice.channel) return message.channel.error('music/play:NOT_VC').then(m => m.timedDelete({ timeout: 10000 }));

        //
        if (client.manager?.players.get(message.guildId)) {
            if (message.member.voice.channel.id != client.manager?.players.get(message.guildId).voiceChannel) return message.channel.error('misc:NOT_VOICE').then(m => m.timedDelete({ timeout: 10000}));
        }

        const player = client.manager?.players.get(message.guildId);
        if (!player || !player.queue.current) return message.channel.error('misc:NO_QUEUE').then(m => m.timedDelete({ timeout: 10000 }));

        await removerDuplicadas(player)

        message.channel.success('music/rdupes:REMOVED');
    }

    async callback(client, interaction, guild) {
        const channel = guild.channels.cache.get(interaction.channelId),
            member = guild.members.cache.get(interaction.user.id);
        
        //
        if (member.voice.channel) return interaction.reply({ content: [channel.error('music/play:NOT_VC')], ephemeral: true });

        //
        if (client.manager?.players.get(guild.id)) {
            if (member.voice.channel.id != client.manager?.players.get(message.guildId).voiceChannel) return interaction.reply({ content: [channel.error('misc:NOT_VOICE')], ephemeral: true })
        }

        const player = client.manager?.players.get(guild.id);
        if (!player || !player.queue.current) return interaction.reply({ content: [channel.error('misc:NO_QUEUE')], ephemeral: true });

        interaction.deferReply();
        await removerDuplicadas(player);

        interaction.reply({ embeds: [channel.success('music/rdupes:REMOVED', {}, true)] });
    }
}

module.exports = removeDupes;