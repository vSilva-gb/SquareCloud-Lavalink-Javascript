const { Embed, functions: {checkMusic } } = require('../../utils'),
    Command = require('../../structures/Command');

class Volume extends Command {
    constructor(client) {
        super(client, {
            name: 'volume',
            guildOnly: true,
            dirname: __dirname,
            aliases: ['vol'],
            botPermissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
            description: 'Changes the volume of the song',
            usage: 'volume <Number>',
            cooldown: 5000,
            examples: ['volume 50'],
            slash: true,
            options: [{
                name: 'volume',
                description: 'The value to set volume',
                type: 'INTEGER',
                required: false,
            }],
        });
    }

    async run(client, message) {
        const playable = checkMusic(message.member, client);
        if (typeof (playable) !== 'boolean') return message.channel.error(playable).then(m => m.timedDelete({ timeout: 10000 }));

        const player = client.manager?.players.get(message.guild.id);

        if (!message.args[0]) {
            const embed = new Embed(client, message.guild)
                .setColor('GOLD')
                .setDescription(message.translate('music/volume:CURRENT', { NUM: player.volume }));
            return message.channel.send({ embeds: [embed] });
        }

        if (Number(message.args[0]) <= 0 || Number(message.args[0]) > 1000) return message.channel.error('music/volume:TOO_HIGH').then(m => m.timedDelete({ timeout: 10000 }));

        player.setVolume(Number(message.args));
        const embed = new Embed(client, message.guild)
            .setColor('GOLD')
            .setDescription(message.translate('music/volume:UPDATED', { NUM: player.volume}));
        return message.channel.send({ embeds: [embed] });
    }

    async callback(client, interaction, guild, args) {
        const member = guild.members.cache.get(interaction.user.id),
            channel = guild.channels.cache.get(interaction.channelId),
            volume = args.get('volume')?.value;

        const playable = checkMusic(member, client);
        if (typeof (playable) !== 'boolean') return interaction.reply({ embeds: [channel.error(playable, {}, true)], ephemeral: true});

        const player = client.manager?.players.get(guild.id);
        if (!volume) {
            const embed = new Embed(client, guild)
                .setColor('GOLD')
                .setDescription(guild.translate('music/volume:UPDATED', { NUM: player.volume}));
            return interaction.reply({ embeds: [embed] });
        }

        if (volume <= 0 || volume > 1000) return interaction.reply({ embeds: [channel.error('music/volume:TOO_HIGH', { ERROR: null }, true)], ephemeral: true });

        player.setVolume(volume);
        const embed = new Embed(client, guild)
            .setColor('GOLD')
            .setDescription(guild.translate('music/volume:UPDATED', { NUM: player.volume }));
        return interaction.reply({ embeds: [embed] });
    }
}

module.exports = Volume;