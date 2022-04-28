const { MessageEmbed } = require('discord.js'),
    { functions: { checkMusic }} = require('../../utils'),
    Command = require('../../structures/Command');

class Bassboost extends Command {
    constructor(client) {
        super(client, {
            name: 'bassboost',
            guildOnly: true,
            dirname: __dirname,
            aliases: ['bb'],
            botPermissions: ['SEND_MESSAGES', 'EMBED_LINKS', 'SPEAK'],
            description: 'Apply Bassboost filter to current song',
            usage: 'bassboost [value]',
            cooldown: 3000,
            examples: ['bb 8', 'bb'],
            slash: true,
            options: [{
                name: 'value',
                description: 'The value you want to bassboost the song',
                type: 'STRING',
                required: false,
            }],
        });
    }

    async run(client, message) {
        const playable = checkMusic(message.member, client);
        if (typeof (playable) !== 'boolean') return message.channel.error(playable).then(m => m.timedDelete({timeout: 10000}));

        const player = client.manager?.players.get(message.guild.id);
        let msg, embed;
        if (!message.args[0]) {
            player.setBassboost(!player.bassboost);
            const embedAtivating = new MessageEmbed()
                .setAuthor(message.translate(`music/bassboost:${player.bassboost ? 'ON' : 'OFF'}_BB`))
                .setColor(client.config.embedColor);
            msg = await message.channel.send({ embeds: [embedAtivating] });
            embed = new MessageEmbed()
                .setDescription(message.translate(`music/bassboost:DESC_${player.bassboost ? '1' : '2'}`));
            await client.delay(5000);
            return msg.edit({ content: ' ', embeds: [embed] });
        }

        if (isNaN(message.args[0])) return message.channel.error('music/bassboost:INVALID');

        player.setBassboost(parseInt(message.args[0]) / 10);
        const embedSet = new MessageEmbed()
            .setAuthor(message.translate('music/bassboost:SET_BB', { DB: message.args[0] }))
            .setColor(client.config.embedColor);
        msg = await message.channel.send({ embeds: [embedSet] });
        embed = new MessageEmbed()
            .setDescription(message.translate('music/bassboost:DESC3', { DB: message.args[0] }));
        await client.delay(5000);
        return msg.edit({ content: ' ', embeds: [embed] });
    }

    async callback(client, interaction, guild, args) {
        const member = guild.members.cache.get(interaction.user.id),
            channel = guild.channels.cache.get(interaction.channelId),
            value = args.get('value')?.value;

        const playable = checkMusic(member, client);
        if (typeof (playable) !== 'boolean') return interaction.reply({ embeds: [channel.error(playable, {}, true)], ephemeral: true });

        const player = client.manager?.players.get(member.guild.id);
        let embed;
        if (!value) {
            player.setBassboost(!player.bassboost);
            const embedAtivating = new MessageEmbed()
                .setAuthor(guild.translate(`music/bassboost:${player.bassboost ? 'ON' : 'OFF'}_BB`))
                .setColor(client.config.embedColor);
            await interaction.reply({ embeds: [embedAtivating] });
            embed = new MessageEmbed()
                .setDescription(guild.translate(`music/bassboost:DESC_${player.bassboost ? '1' : '2'}`));
            await client.delay(5000);
            return interaction.editReply({ content: ' ', embeds: [embed] });
        }

        if (isNaN(value)) return interaction.reply({ embeds: [channel.error('music/bassboost:INVALID', { ERROR: null}, true)], ephemeral: true});

        player.setBassboost(value / 10);
        const embedSet = new MessageEmbed()
            .setAuthor(guild.translate('music/bassboost:SET_BB', { DB: value }))
            .setColor(guild.config.embedColor);
        await interaction.reply({ embeds: [embedSet] });
        embed = new MessageEmbed()
            .setDescription(guild.translate('music/bassboost:DESC_3', { DB: value }));
        await client.delay(5000);
        return interaction.editReply({ content: ' ', embeds: [embed] });
    }
}

module.exports = Bassboost