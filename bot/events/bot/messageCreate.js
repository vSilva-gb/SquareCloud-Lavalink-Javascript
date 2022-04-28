const { Collection } = require('discord.js'),
    { Embed } = require('../../utils'),
    { time: { getReadableTime }, functions: { genInviteLink }} = require('../../utils'),
    Event = require('../../structures/Event'),
    { findBestMatch } = require('string-similarity'),
    { functions: { comandoUsado } } = require('../../utils');

class MessageCreate extends Event {
    constructor(...args) {
        super(...args, {
            dirname: __dirname,
        });
    }

    async run(client, message) {

        if (message.author.bot) return;

        const settings = message.guild?.settings ?? require('../../assets/json/defaultGuildSettings.json');
        if (Object.keys(settings).length == 0) return;

        //Verifica se o bot foi mencionado
        /*if (message.content == `<@${client.user.id}>`) {
            return message.channel.send({ embeds: [embed] });
        }*/

    //Verifica se a mensagem é um comando
	const args = message.content.split(/ +/);
		if ([settings.prefix, `<@!${client.user.id}>`].find(p => message.content.startsWith(p))) {
            if (message.content.length === settings.prefix.length) return;
			const command = args.shift().slice(settings.prefix.length).toLowerCase();
			let cmd = client.commands.get(command) || client.commands.get(client.aliases.get(command));
			if (!cmd && message.content.startsWith(`<@!${client.user.id}>`)) {
				// check to see if user is using mention as prefix
				cmd = client.commands.get(args[0]) || client.commands.get(client.aliases.get(args[0]));
				args.shift();
				if (!cmd) return
			} else if (!cmd) {
				const comandos = client.commands.map((key, value) => value);
				const match = findBestMatch(command, comandos);
				if (match.bestMatch.rating >= 0.3) {
					message.channel.error("Esse comando não existe! Você quis dizer ``" + match.bestMatch.target + "``?");
                    return;
				} else { 
                    message.channel.error("Esse comando não existe! Se você quiser ver todos os comandos disponíveis, use !help");
                    return;
                }
			}
			message.args = args;

    //Verifica se o usuario está na lista de banidos

    if (message.author.cmdBanned) {
        return message.channel.error('events/message:BANNED_USER').then(m => m.timedDelete({ timeout: 5000 }));
    }

    // Certifique-se de que comandos somente da guilda sejam feitos somente na guilda
    if (!message.guild && cmd.conf.guildOnly) {
        return message.reply('events/message:GUILD_ONLY').then(m => m.timedDelete({ timeout: 5000 }));
    }

    // Verifique se o comando está sendo executado em um canal na blacklist
    if ((settings.CommandChannelToggle) && (settings.CommandChannels.includes(message.channel.id))) {
        return message.channel.error('events/message:BLACKLISTED_CHANNEL', { USER: message.author.tag }).then(m => m.timedDelete({ timeout:5000 }));
    }

    if (cmd.conf.ownerOnly && !client.config.ownerID.includes(message.author.id)) {
        return message.channel.error('<:PepeThumbs:889310827000266773> **|** Boa tentativa, mas você não tem acesso a esse comando...').then(m => m.timedDelete({ timeout: 5000 }));
    }

    // Verifica se a mensagem é de um servidor
    if (message.guild) {
        // Verifica se o bot
        let permissoesNecessarias = [];
        cmd.conf.botPermissions.forEach((perm) => {
            if (['SPEAK', 'CONNECT'].includes(perm)) {
                if (!message.member.voice.channel) return;
                if (!message.member.voice.channel.permissionsFor(message.guild.me).has(perm)) {
                    permissoesNecessarias.push(perm);
                } 
            } else if (!message.channel.permissionsFor(message.guild.me).has(perm)) {
                permissoesNecessarias.push(perm);
            }
        })

        if (permissoesNecessarias.length > 0) {
            if (client.config.debug) client.logger.error(`Missing permission: '${permissoesNecessarias.join(', ')}' in [${message.guildId}].`);
            return message.channel.error('misc:MISSING_PERMISSION', { PERMISSIONS: permissoesNecessarias.map((p) => message.translate(`permissions:${p}`)).join(', ') })?.then(m => m.timedDelete({ timeout: 10000 }));
        }
        
        //Verifica as permissões do usuário
        permissoesNecessarias = [];
        cmd.conf.userPermissions.forEach((perm) => {
            if (!message.channel.permissionsFor(message.member).has(perm)) {
                permissoesNecessarias.push(perm);
            }
        });

        if (permissoesNecessarias.length > 0) {
            return message.channel.error('misc:USER_PERMISSION', { PERMISSIONS: permissoesNecessarias.map((p) => message.translate(`permissions:${p}`)).join(', ') }).then(m => m.timedDelete({ timeout: 10000 }));
        }
    }

        //Verifica se o usuário está em 'cooldown'
        if(!client.cooldowns.has(cmd.help.name)) {
            client.cooldowns.set(cmd.help.name, new Collection());
        }

        const now = Date.now();
        const timestamps = client.cooldowns.get(cmd.help.name);
        const cooldownAmount = (message.author.premium ? cmd.conf.cooldown * 0.75 : cmd.conf.cooldown);

        if (timestamps.has(message.author.id)) {
            const tempoExpiracao = timestamps.get(message.author.id) + cooldownAmount;

            if (now < tempoExpiracao) {
                const tempoRestante = (tempoExpiracao - now) / 1000;
                return message.channel.error('events/message:COMMAND_COOLDOWN', { NUM: tempoRestante.toFixed(1) })
            }
        }

        //Roda o comando
        if (client.config.debug) client.logger.debug(`Comando: ${cmd.help.name} foi executado por ${message.author.tag}${!message.guild ? ' no DM\'s' : ` no servidor: ${message.guildId}`}.`);
        //client.logger.debug(`Comando: ${cmd.help.name} foi executado por ${message.author.tag}${!message.guild ? ' no DM\'s' : ` no servidor: ${message.guildId}`}.`);
        cmd.run(client, message, settings);
        timestamps.set(message.author.id, now);
        setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);
        comandoUsado(client, message);
        }
    }
}

module.exports = MessageCreate;
