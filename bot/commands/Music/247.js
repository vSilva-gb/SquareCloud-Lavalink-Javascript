const { functions: { checkMusic }, Embed } = require('../../utils'),
    Command = require('../../structures/Command');

class TwentyFourSeven extends Command {
    constructor(client) {
        super(client, {
            name: '247',
            guildOnly: true,
            dirname: __dirname,
            aliases: ['stay', '24/7'],
            botPermissions: ['SEND_MESSAGES', 'EMBED_LINKS', 'SPEAK'],
            description: 'Make the bot stay 24/7 on your voice channel',
            usage: '247',
            cooldown: 5000,
            slash: true,
        });
    }

    async run(client, message) {
        const playable = checkMusic(message.member, client);
        if (typeof (playable) !== 'boolean' ) return message.channel.error(playable).then(m => m.timedDelete({timeout: 10000}));

        const player = client.manager?.players.get(message.guildId);
        player.twentyFourSeven = !player.twentyFourSeven;
        const AtivadoDesativado = message.translate(`misc:${player.twentyFourSeven ? 'ENABLED' : 'DISABLED'}`);
        const embed = new Embed(client, message.guild)
            .setDescription(message.translate('music/247:RESP', { TOGGLE: AtivadoDesativado }))
            .setColor(client.config.embedColor)
        message.channel.send({ embeds: [ embed ]});
    }

    async callback(client, interaction, guild) {
        const member = guild.members.cache.get(interaction.user.id),
            channel = guild.channels.cache.get(interaction.channelId);

        const playable = checkMusic(member, client);
        if (typeof (playable) !== 'boolean') return interaction.reply({ embeds: [channel.error(playable, {}, true)], ephemeral: true });

        const player = client.manager?.players.get(member.guild.id);
        player.twentyFourSeven = !player.twentyFourSeven;
        const AtivadoDesativado = guild.translate(`misc:${player.twentyFourSeven ? 'ENABLED' : 'DISABLED'}`);
        const embed = new Embed(client, guild)
            .setDescription(guild.translate('music/247:RESP', { TOGGLE: AtivadoDesativado }))
            .setColor(client.config.embedColor)
        await interaction.reply({ embeds: [embed] });
    }
}

module.exports = TwentyFourSeven;