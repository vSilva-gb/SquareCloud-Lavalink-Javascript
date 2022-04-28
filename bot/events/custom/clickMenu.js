const translate = require('@vitalets/google-translate-api'),
    { Collection } = require('discord.js'),
    Event = require('../../structures/Event');
const { time } = require('../../utils');

class ClickMenu extends Event {
    constructor(...args) {
        super(...args, {
            dirname: __dirname,
        });
    }

    async run(client, interaction) {
        const guild = client.guilds.cache.get(interaction.guildId),
            channel = guild.channels.cache.get(interaction.channelId),
            member = guild.members.cache.get(interaction.user.id);

        //Verifica se o usuário está em 'cooldown'
        if(!client.cooldowns.has(interaction.commandName)) {
            client.cooldowns.set(interaction.commandName, new Collection());
        }

        const now = Date.now(),
            timestamps = client.cooldowns.get(interaction.commandName),
            cooldownAmount = (member.user.premium ? 2250 : 3000);

        if (timestamps.has(member.id)) {
            const expirationTime = timestamps.get(member.id) + cooldownAmount;

            if (now < expirationTime) {
                const timeLeft = (expirationTime - now) / 1000;
                return interaction.reply({ embeds:[channel.error('events/message:COMMAND_COOLDOWN', { NUM: timeLeft.toFixed(1) }, true)], ephemeral: true });
            }
        }

		if (client.config.debug) client.logger.debug(`Context menu: ${interaction.commandName} was ran by ${member.user.username}.`);
		setTimeout(() => timestamps.delete(member.id), cooldownAmount);

        switch (interaction.commandName) {
            case 'Avatar':
                client.commands.get('avatar').reply(client, interaction, channel, interaction.targetId);
                break;
            case 'Banner':
                client.commands.get('banner').reply(client, interaction, channel, interaction.targetId);
                break;
            case 'Userinfo':
                if (interaction.commandName == 'Userinfo') client.commands.get('user-info').reply(client, interaction, channel, interaction.targetId);
                break;
            case 'Translate': {
                // fetch message and check if message has content
			    const message = await channel.messages.fetch(interaction.targetId);
			    if (!message.content) return interaction.reply({ embeds: [channel.error('There is no content on this message for me to translate.', {}, true)], ephemeral: true });

			    // translate message to server language
			    try {
				    const bar = await translate(message.content, { to: guild.settings.Language.split('-')[0] });
				    interaction.reply({ content: `Translated to \`English\`: ${bar.text}` });
			    } catch (err) {
				    client.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
				    interaction.reply({ embeds: [channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }, true)], ephemeral: true });
			    }
			    break;
            }
            case 'Add to Queue': {
                const message = await channel.messages.fetch(interaction.targetId);
                const args = new Map().set('track', { value: message.content });
                client.commands.get('play').callback(client, interaction, guild, args);
                break;
            }
            case 'Banner': {
                if (interaction.commandName == 'Banner') client.commands.get('user-info').reply(client, interaction, channel, interaction.targetId);
                break;
            }
            default:
                    interaction.reply({ content: 'Something went wrong', ephemeral: true})
            }
            timestamps.set(member.id, now);
    }
}

module.exports = ClickMenu;