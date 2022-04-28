const { inspect } = require('util'),
    { MessageEmbed } = require('discord.js'),
    Command = require('../../structures/Command');

class Eval extends Command {
    constructor(client) {
        super(client, {
            name: 'eval',
            ownerOnly: true,
            dirname: __dirname,
            botPermissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
            description: '[DEV] Evaluate JS code',
            usage: 'eval <code>',
            cooldown: 3000,
            examples: ['eval client.users.cache.get()'],
        });
    }

    async run(client, message, settings) {
        const msg = await message.reply('<a:Loading_emote:722650699170578455>');
        const toEval = message.args.join(' ');
        try {
            if (toEval) {
                const evaluated = await eval(toEval, { depth: 0 });

                const embed = new MessageEmbed()
					.setAuthor({ name: client.user.username + ' | Eval()', iconURL: client.user.displayAvatarURL({ size: 2048, dynamic: true }) })
					.addField('📥 Code:\n', '```yaml\n' + `${toEval.substring(0, 1010)}` + '```', false)
					.addField('📤 Retorno:\n', '```yaml\n' + `${inspect(evaluated).substring(0, 1010)}` + '```', false)
					.addField("⏱ Tempo de resposta:",`\`\`\`yaml\n${msg.createdAt - message.createdAt} ms\n\`\`\``, false)
					.addField('⚙ Tipo do Código:\n', `\`\`\`yaml\n${typeof (evaluated)}\`\`\``, false)
					.setFooter({ text: `Executado por ${message.author.username}`, iconURL: message.author.displayAvatarURL({ size: 2048, dynamic: true }) })
					.setColor('3a1b54');
				msg.edit({ content: ' ', embeds: [embed], components: [] });
            } else {
                msg.delete();
                message.channel.error('misc:INCORRECT_FORMAT', { EXAMPLE: settings.prefix.concat(message.translate('host/eval:USAGE')) }).then(m => m.timedDelete({ timeout: 50000 }));
            }
        } catch (err) {
                msg.delete();
                message.channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }).then(m => m.timedDelete({ timeout: 50000 }));
            }
        }
    }

module.exports = Eval;
