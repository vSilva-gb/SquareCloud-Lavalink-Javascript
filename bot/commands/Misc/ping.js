const Command = require('../../structures/Command'),
    { Embed } = require('../../utils'),
    { MessageEmbed } = require('discord.js');
const { interaction } = require('../../structures/Message');

class Ping extends Command {
    constructor(client) {
        super(client, {
            name: 'ping',
            dirname: __dirname,
            aliases: ['status'],
            botPermissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
            description: 'Check the current ping of the bot',
            usage: 'ping',
            cooldown: 2000,
            slash: true,
        });
    }

    async run(client, message) {
        const apiPing = await Math.round(client.ws.ping);
        const embed = new Embed(client, message.guild)
            .setAuthor({ name: ` | Pong`, iconURL: message.author.displayAvatarURL({ size: 2048, dynamic: true }) })
            .setDescription(`\`\`\`autohotkey\nGateway Ping : ${apiPing}ms\n\`\`\``)
        message.channel.send({ embeds: [embed] });
    }

    async callback(client, interaction, guild) {
        const apiPing = await Math.round(client.ws.ping);
        const embed = new Embed(client, guild)
            .setAuthor({ name: ` | Pong`, iconURL: interaction.user.displayAvatarURL({ size: 2048, dynamic: true }) })
            .setDescription(`\`\`\`autohotkey\nGateway Ping : ${apiPing}ms\n\`\`\``)
        return interaction.reply({ embeds: [embed], ephemeral: true })
    }
}

module.exports = Ping;