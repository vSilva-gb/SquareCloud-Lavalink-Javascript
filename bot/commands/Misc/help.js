const { get } = require('mongoose');
const { Embed } = require('../../utils'),
    Command = require('../../structures/Command');
const categoryArr = ['Fun', 'Giveaway', 'Guild', 'Image', 'Misc', 'Moderation', 'Music', 'NSFW', 'Plugins', 'Searcher', 'Ticket'];

class Help extends Command {
    constructor(client) {
        super(client, {
            name: 'help',
            dirname: __dirname,
            botPermissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
            description: 'Sends information about all the commands that I can do.',
            usage: 'help [COMMAND]',
            cooldown: 5000,
            examples: ['help play'],
            slash: true,
            options: [{
                name: 'command',
                description: 'Name of command to look up.',
                type: 'STRING',
                required: false,
            }],
        });
    }

    async run(client, message, settings) {
        const embed = this.createEmbed(client, settings, message.channel, message.args[0], message.author);
        message.channel.send({ embeds: [embed] });
    }

    async callback(client, interaction, guild, args) {
        const channel = guild.channels.cache.get(interaction.channelId);
        const embed = this.createEmbed(client, guild.settings, channel, args.get('command')?.value, interaction.member.user);
        interaction.reply({ embeds: [embed] });
    }

    createEmbed(client, settings, channel, command, user) {
        if (!command) {
            //Pagina padrão de help!
            const embed = new Embed(client)
                .setAuthor({ name: client.translate('misc/help:AUTHOR'), iconURL: client.user.displayAvatarURL({ dynamic: true }) })
                .setDescription([
                    client.translate('misc/help:PREFIX_DESC', { PREFIX: settings.prefix, ID: client.user.id }),
                    client.translate('misc/help:INFO_DESC', { PREFIX: settings.prefix, USAGE: client.translate('misc/help:USAGE') }),
                ].join('\n'));

            // Determina qual categoria vão ser mostradas para cada usuário...
            let categorias = client.commands.map(c => c.help.category).filter((v, i, a) => categoryArr.includes(v) && a.indexOf(v) === i);
            if (!channel.guild) categorias = categorias.filter(c => !client.commands.filter(cmd => cmd.help.category === c).first().conf.guildOnly);
            if (client.config.ownerID.includes(user.id)) categorias.push('Host');

            //Cria a embed
            categorias
                        .sort((a, b) => a.category - b.category)
                        .forEach(category => {
                            const commands = client.commands
                                .filter(c => c.help.category === category)
                                .sort((a, b) => a.help.name - b.help.name)
                                .map(c => `\`${c.help.name}\``).join('**, **');

                            const length = client.commands
                                .filter(c => c.help.category === category).size;
                            if (category == 'NSFW' && !channel.nsfw) return;
                            embed.addField(`${category} [**${length}**]`, `${commands}.`);
                        });
                        //send message
                        return embed;
                    } else if (command) {
                        //Verifica se o args é um comando
                        if (client.commands.get(command) || client.commands.get(client.aliases.get(command))) {
                            const cmd = client.commands;get(command) || client.commands.get(client.aliases.get(command));
                            // Verifica se o comando está disponível no servidor.
                            if (client.config.ownerID.includes(user.id)) {
                                return new Embed(client)
                                    .setTitle('misc/help:TITLE', { COMMAND: cmd.help.name })
                                    .setDescription([
                                        channel.guild.translate('misc/help:DESC', { DESC: channel.guild.translate(`${cmd.help.category.toLowerCase()}/${cmd.help.name}:DESCRIPTION`) }),
                                        channel.guiild.translate('misc/help:ALIAS', { ALIAS: (cmd.help.aliases.length >= 1) ? cmd.help.aliases.join(', ') : 'Nenhum' }),
                                        channel.guild.translate('misc/help:COOLDOWN', { CD: cmd.conf.cooldown / 1000 }),
                                        channel.guild.translate('misc/help:USE', { USAGE: settings.prefix.concat(client.translate(`${cmd.help.category.toLowerCase()}/${cmd.help.name}:USAGE`)) }),
                                        channel.guild.translate('misc/help:EXAMPLE', { EX: `${settings.prefix}${cmd.help.examples.join(`,\n ${settings.prefix}`)}` }),
                                        channel.guild.translate('misc/help:LAYOUT'),
                                    ].join('\n'));
                            } else {
                                return channel.error('misc/help:NO_COMMAND', {}, true);
                            }
                        } else {
                            return channel.error('misc/help:NO_COMMAND', {}, true);
                        }
                    } else {
                        return channel.error('misc:INCORRECT_FORMAT', { EXAMPLE: settings.prefix.concat(client.translate('giveaway/g-start:USAGE')) }, true);
                    }
                }
            }

module.exports = Help;
