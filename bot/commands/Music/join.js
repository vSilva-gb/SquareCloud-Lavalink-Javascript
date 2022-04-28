const { MessageEmbed } = require('discord.js'),
    Command = require('../../structures/Command');

class join extends Command {
    constructor(client) {
        super(client, {
            name: 'join',
            guildOnly: true,
            dirname: __dirname,
            aliases: [],
            botPermissions: ['SEND_MESSAGES', 'EMBED_LINKS', 'CONNECT', 'SPEAK'],
            description: 'Make the bot join in your voice channel',
            usage: 'join',
            cooldown: 3000,
            slash: true,
        });
    }

    async run(client, message, settings) {
        //
        if (message.guild.roles.cache.get(settings.MusicDJRole)) {
            if (!message.member.roles.cache.has(settings.MusicDJRole)) {
                return message.channel.error('misc:MISSING_ROLE').then(m => m.timedDelete({ timeout: 1000 }));
            }
        }

        //
        const player = client.manager?.players.get(message.guildId);

        //
        if (!message.member.voice.channel) return message.channel.error('music/join:NO_VC');

        //
        if (message.member.voice.channel.full && !message.member.voice.channel.permissionsFor(message.guild.me).has('MOVE_MEMBERS')) {
            return message.channel.error('music/play:VC_FULL').then(m => m.timedDelete({ timeout: 10000 }));
        }

        //
        if (!player) {
            try {
                await client.manager.create({
                    guild: message.guildId,
                    voiceChannel: message.member.voice.channel.id,
                    textChannel: message.channel.id,
                    selfDeafen: true,
                }).connect();

                const embed = new MessageEmbed()
                    .setColor('#00FF00')
                    .setDescription(message.translate('music/join:JOIN'))
                message.channel.send({ embeds:[embed] });
            } catch (err) {
                if (message.deletable) message.delete();
                client.logger.error(`O comando 'join' has error: ${err.message}.`);
                message.channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }).then(m => m.timedDelete({ timeout: 5000 }));
            }
        } else {
            try {
                await player.setVoiceChannel(message.member.voice.channel.id);
                await player.setTextChannel(message.channel.id);
                const embed = new MessageEmbed()
                    .setColor('#00FF00')
                    .setDescription(message.translate('music/join:MOVED'))
                message.channel.send({ embeds:[embed] });
            } catch (err) {
                if (message.deletable) message.delete();
                client.logger.error(`O comando 'join' has error: ${err.message}.`);
                message.channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }).then(m => m.timedDelete({ timeout: 5000 }));
            }
        }
    }

    async callback(client, interaction, guild) {
        //
        const member = guild.members.cache.get(interaction.user.id),
            channel = guild.channels.cache.get(interaction.channelId);

        //
        if (guild.roles.cache.get(guild.settings.MusicDJRole)) {
            if (!member.roles.cache.has(guild.settings.MusicDJRole)) {
                return interaction.reply({ embeds: [channel.error('misc:MISING_ROLE', { ERROR: null}, true)], ephemeral: true});
            }
        }

        //
        const player = client.manager?.players.get(guild.id);

        //
        if (!member.voice.channel) return interaction.reply({ embeds: [channel.error('music/join:NO_VC', { ERROR: null }, true)], ephemeral: true });

        //
        if (member.voice.channel.full && !member.voice.channel.permissionsFor(guild.me).has('MOVE_MEMBERS')) {
            return interaction.reply({ embeds: [channel.error('music/join:VC_FULL', { ERROR: null}, true)], ephemeral: true });
        }

        if (!player) {
            try {
                await client.manager.create({
                    guild: message.guildId,
                    voiceChannel: message.member.voice.channel.id,
                    textChannel: message.channel.id,
                    selfDeafen: true,
                }).connect();
    
                const embed = new MessageEmbed()
                    .setColor('#00FF00')
                    .setDescription(message.translate('music/join:JOIN'))
                interaction.reply({ embeds:[embed] });
            } catch (err) {
                if (message.deletable) message.delete();
                client.logger.error(`O comando 'join' has error: ${err.message}.`);
                return interaction.reply({ embeds: [channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }, true)], ephemeral: true });
            }
        } else {
            try {
                await player.setVoiceChannel(message.member.voice.channel.id);
                await player.setTextChannel(message.channel.id);
                const embed = new MessageEmbed()
                    .setColor('#00FF00')
                    .setDescription(message.translate('music/join:MOVED'))
                    interaction.reply({ embeds:[embed] });
            } catch (err) {
                if (message.deletable) message.delete();
                client.logger.error(`O comando 'join' has error: ${err.message}.`);
                return interaction.reply({ embeds: [channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }, true)], ephemeral: true });
            }
        }
    }
}


module.exports = join