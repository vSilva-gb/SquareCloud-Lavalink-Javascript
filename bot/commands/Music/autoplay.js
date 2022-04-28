const { functions: { checkMusic }, Embed } = require('../../utils'),
    Command = require('../../structures/Command');

class Autoplay extends Command {
    constructor(client) {
        super(client, {
            name: 'autoplay',
            guildOnly: true,
            dirname: __dirname,
            aliases: ['auto-play'],
            botPermissions: ['SEND_MESSAGES', 'EMBED_LINKS', 'SPEAK'],
            description: 'Toggles autoplay mode.',
            usage: 'autoplay',
            cooldown: 3000,
            slash: true,
        });
    }

    async run(client, message) {
        const playable = checkMusic(message.member, client);
        if (typeof (playable) !== 'boolean' ) return message.channel.error(playable).then(m => m.timedDelete({timeout: 10000}));

        const player = client.manager?.players.get(message.guild.id);
        player.autoplay = !player.autoplay;
        const AtivadoDesativado = message.translate(`misc:${player.autoplay ? 'ENABLED' : 'DISABLED'}`);
        const embed = new Embed(client, message.guild)
            .setDescription(message.translate('music/autoplay:RESP', { TOOGLE: AtivadoDesativado }))
            .setColor(client.config.embedColor)
        message.channel.send({ embeds: [embed] });
    }
    
    async callback(client, interaction, guild) {
        const member = guild.members.cache.get(interaction.user.id),
            channel = guild.channels.cache.get(interaction.channelId);

        const playable = checkMusic(member, client);
        if (typeof (playable) !== 'boolean') return interaction.reply({ embeds: [channel.error(playable, {}, true)], ephemeral: true });

        const player = client.manager?.players.get(member.guild.id);
        player.autoplay = !player.autoplay;
        const AtivadoDesativado = guild.translate(`misc:${player.autoplay ? 'ENABLED' : 'DISABLED'}`);
        const embed = new Embed(client, guild)
            .setDescription(guild.translate('music/autoplay:RESP', { TOOGLE: AtivadoDesativado }))
            .setColor(client.config.embedColor)
        await interaction.reply({ embeds: [embed] });
    }
}

module.exports = Autoplay;