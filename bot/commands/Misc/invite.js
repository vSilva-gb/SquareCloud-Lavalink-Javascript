const { MessageEmbed } = require('discord.js'),
    { functions: { genInviteLink } } = require('../../utils'),
    { Embed } = require('../../utils')
    Command = require('../../structures/Command');

class Invite extends Command {
    constructor(client) {
        super(client, {
            name: 'invite',
            dirname: __dirname,
            aliases: ['inv', 'convite'],
            botPermissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
            description: 'Send an invite link so people can add me to their server.',
            usage: 'invite',
            cooldown: 2000,
            slash: true,
        });
    }

    async run(client, message) {
        const avatar = message.author.displayAvatarURL({ size: 2048, dynamic: true });
        const embed = this.createEmbed(client, avatar);
		message.channel.send({ embeds: [embed] });
    }

    async callback(client, interaction, guild) {
        const member = guild.members.cache.get(interaction.user.id);
        const avatar = member.user.displayAvatarURL({ size: 2048, dynamic: true });
        const embed = this.createEmbed(client, avatar);
		return interaction.reply({ embeds: [embed] });
    }

    createEmbed(client, avatar) {
        return new Embed(client, avatar)
            .setAuthor({ name: ` | Galdino Invite`, iconURL: avatar })
            .setDescription(`[Invite Galdino](${genInviteLink(client)})`)
            .setColor(client.config.embedColor);
    }
}

module.exports = Invite;