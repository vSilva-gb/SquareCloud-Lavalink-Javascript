const { Collection } = require('discord.js'),
    { functions: { comandoUsadoInteraction } } = require('../../utils');
    Event = require('../../structures/Event');

class SlashCreate extends Event {
    constructor(...args) {
        super(...args, {
            dirname: __dirname,
        });
    }

    async run(client, interaction) {
        const guild = client.guilds.cache.get(interaction.guildId),
            cmd = client.commands.get(interaction.commandName),
            channel = guild.channels.cache.get(interaction.channelId),
            member = guild.members.cache.get(interaction.user.id);

        /*const settings = interaction.guild?.settings ?? require('../../assets/json/defaultGuildSettings.json');
        if (Object.keys(settings).length == 0) return;*/

        if (member.user.cmdBanned) {
            return interaction.reply({ embeds:[channel.error('events/message:BANNED_USER', {}, true)], ephemeral: true });
        }

        if ((guild.settings.CommandChannelToggle) && (guild.settings.CommandChannels.includes(channel.id))) {
            return interaction.reply({ embeds: [channel.error('events/message:BLACKLISTED_CHANNEL', { USER: member.user.tag }, true)], ephermal: true });
        }

        if (!channel.nsft && cmd.conf.nsfw) {
            return interaction.reply({ embeds:[channel.error('events/message:NOT_NSFW_CHANNEL', {}, true)], ephemeral: true });
        }

        let permissoesNecessarias = [];
        cmd.conf.botPermissions.forEach((perm) => {
            if (['SPEAK', 'CONNECT'].includes(perm)) {
                if (!member.voice.channel) return;
                if (!member.voice.channel.permissionsFor(guild.me).has(perm)) {
                    permissoesNecessarias.push(perm);
                } 
            } else if (!channel.permissionsFor(guild.me).has(perm)) {
                permissoesNecessarias.push(perm);
            }
        });

        if (permissoesNecessarias.length > 0) {
            client.logger.error(`Missing permission: \`${permissoesNecessarias.join(', ')}\` in [${guild.id}].`);
			return interaction.reply({ embeds: [channel.error('misc:MISSING_PERMISSION', { PERMISSIONS: permissoesNecessarias.map((p) => client.translate(`permissions:${p}`)).join(', ') }, true)], ephemeral: true });
        }
        
        //Verifica as permissões do usuário
        permissoesNecessarias = [];
        cmd.conf.userPermissions.forEach((perm) => {
            if (!channel.permissionsFor(member).has(perm)) permissoesNecessarias.push(perm);
        });

        if (permissoesNecessarias.length > 0) {
			return interaction.reply({ embeds: [channel.error('misc:USER_PERMISSION', { PERMISSIONS: permissoesNecessarias.map((p) => client.translate(`permissions:${p}`)).join(', ') }, true)], ephemeral: true });
        }

        if (!client.cooldowns.has(cmd.help.name)) {
            client.cooldowns.set(cmd.help.name, new Collection());
        }

        const now = Date.now(),
            timestamps = client.cooldowns.get(cmd.help.name),
            cooldownAmount = (member.user.premium ? cmd.conf.cooldown * 0.75 : cmd.conf.cooldown);

        if (timestamps.has(interaction.user.id)) {
            const expirationTime = timestamps.get(interaction.user.id) + cooldownAmount;

        if (now < expirationTime) {
            const timeLeft = (expirationTime - now) / 1000;
            return interaction.reply({ embeds:[channel.error('events/message:COMMAND_COOLDOWN', { NUM: timeLeft.toFixed(1) }, true)], ephemeral: true });
        }
    }

        if (client.config.debug) client.logger.debug(`Interaction: ${interaction.commandName} was ran by ${interaction.user.username}.`);
        setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);
        await cmd.callback(client, interaction, guild, interaction.options);
        timestamps.set(interaction.user.id, now);
        comandoUsadoInteraction(client, interaction);
    }
}

module.exports = SlashCreate;