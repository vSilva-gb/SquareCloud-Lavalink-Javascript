const { MessageSelectMenu, MessageActionRow } = require('discord.js'),
    { Embed } = require('../../utils'),
    { getStations } = require('radio-browser'),
    Command = require('../../structures/Command');

    const flags = {
		'US': '🏴󠁧󠁢󠁥󠁮󠁧󠁿',	
		'BR': '🇧🇷',
		'FR': '🇫🇷',
		'NL': '🇳🇱',
		'DE': '🇩🇪',
		'IT': '🇮🇹',
		'CH': '🇨🇭',
		'ES': '🇪🇸',
	};

class Radio extends Command {
    constructor(client) {
        super(client, {
            name: 'radio',
            guildOnly: true,
            dirname: __dirname,
            botPermissions: ['SEND_MESSAGES', 'EMBED_LINKS', 'CONNECT', 'SPEAK'],
            description: 'List all available radios.',
            usage: 'radio <search>',
            cooldown: 3000,
            slash: true,
            options: [{
                name: 'station',
                description: 'radio station name',
                type: 'STRING',
                required: true,
            }],
        });
    }

        async run(client, message, settings) {
            //
            if (message.guild.roles.cache.get(settings.MusicDJRole)) {
                if (!message.member.roles.cache.has(settings.MusicDJRole)) {
                    return message.channel.error('misc:MISSING_ROLE').then(m => m.timedDelete({ timeout: 15000}));
                }
            }

            //
            if (!message.member.voice.channel) return message.channel.error('music/play:NOT_VC').then(m => m.timedDelete({ timeout: 10000 }));

            //
            if (client.manager?.players.get(message.guild.id)) {
                if (message.member.voice.channel.id != client.manager?.players.get(message.guild.id).voiceChannel) return message.channel.error('misc:NOT_VOICE').then(m => m.timedDelete({ timeout: 15000 }));
            }

            //
            if (!message.args[0]) return message.channel.error('misc:INCORRECT_FORMAT', { EXAMPLE: settings.prefix.concat(message.translate('music/radio:USAGE')) }).then(m => m.timedDelete({ timeout: 15000 }));

            await getStations({
                limit: 10,
                order: 'topclick',
                hidebroken: true,
                countrycodeexact: 'BR',
                language: 'pt_br',
                by: 'name',
                searchterm: message.args.join(' '),
            }).then(async data => {
                if (!data[0]) return message.channel.send('Nenhuma rádio encontrada com esse nome.').then(m => m.timedDelete({ timeout: 10000 }));

                const results = data.map((track) => ({ label: track.name, description: track.url, value: track.url, emoji: { name: flags[track.countrycode] }}));

                const row = new MessageActionRow()
                    .addComponents(
                        new MessageSelectMenu()
                        .setCustomId('radio')
                        .setPlaceholder('Selecione a rádio que você deseja!')
                        .addOptions(results)
                    );

                const embed = new Embed(client, message.guild)
                        .setDescription('Selecione a rádio que você deseja ouvir.')
                        .setFooter(`Rádio pesquisada: ${message.args.join(' ')}`);

                const msg = await message.channel.send({ embeds: [embed], components: [row] });
                const filter = (interaction) => interaction.customId === 'radio';

                const menuCollector = await msg.createMessageComponentCollector({ filter, componentType: 'SELECT_MENU', time: '120000' });

                menuCollector.on('collect', async (i) => {
                    if (i.user.id !== message.author.id) return i.deferUpdate();
                    msg.delete();

                    let player;
                    try {
                        player = client.manager.create({
                            guild: message.guild.id,
                            voiceChannel: message.member.voice.channel.id,
                            textChannel: message.channel.id,
                            selfDeafen: true,
                        });
                    } catch (err) {
                        if (message.deletable) message.delete();
                        client.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
                        return message.channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }).then(m => m.timedDelete({ timeout: 5000 }));
                    }

                    const res = await player.search(i.values[0], message.author);

                    if (res.loadType == 'NO_MATCHES') {
                        if (!player.queue.current) player.destroy();
                        return message.channel.error('music/play:NO_SONG');
                    } else { 
                        if (player.state !== 'CONNECTED') {
                            player.connect();
                        }       
                        player.queue.add(res.tracks[0]);
                        if (!player.playing && !player.paused && !player.queue.size) {
                            player.play();
                        } else {
                            embed = new Embed(client, guild)
                                .setColor(message.member.displayHexColor)
                                .setDescription(`Adicionado a flia: [${res.tracks[0].title}](${res.tracks[0].uri})`);
                            message.channel.send({ embeds: [embed] });
                        }
                    }
                })
            })
        }
    }

module.exports = Radio;