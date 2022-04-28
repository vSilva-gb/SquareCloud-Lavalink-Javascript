const { MessageSelectMenu, MessageActionRow } = require('discord.js'),
    { Embed } = require('../../utils'),
    Command = require('../../structures/Command');
const { interaction } = require('../../structures/Message');

class Search extends Command {
    constructor(client) {
        super(client, {
            name: 'search',
            guildOnly: true,
            dirname: __dirname,
            aliases: ['pesquisar'],
            botPermissions: ['SEND_MESSAGES', 'EMBED_LINKS', 'CONNECT', 'SPEAK'],
            description: 'Procura por uma música pelo nome',
            usage: 'search <song name>',
            cooldown: 5000,
            examples: ['search Rick Astley - Never Gonna Give You Up'],
            slash: true,
            options: [{
                name: 'music',
                description: 'What song do you want to search for?',
                type: 'STRING',
                required: true,
                autocomplete: true,
            }],
        });
    }

    async run(client, message, settings) {
        if (message.guild.roles.cache.get(settings.MusicDJRole)) {
            if (!message.member.roles.cache.has(settings.MusicDJRole)) {
                return message.channel.error('misc:MISSING_ROLE').then(m => m.timedDelete({ timeout: 10000 }));
            }
        }

        if (!message.member.voice.channel) return message.channel.error('music/play:NOT_VC').then(m => m.timedDelete({ timeout: 10000 }));

        if (client.manager?.players.get(message.guild.id)) {
            if (message.member.voice.channelId != client.manager?.players.get(message.guild.id).voiceChannel) return message.channel.error('misc:NOT_VOICE').then(m => m.timedDelete({ timeout: 10000}));
        }

        if (message.member.voice.channel.full && !message.member.voice.channel.permissionsFor(message.guild.me).has('MOVE_MEMBERS')) {
            return message.channel.error('music/play:VC_FULL').then(m => m.timedDelete({ timeout: 10000 }));
        }

        if (!message.args[0]) return message.channel.error('music/search:NO_INPUT');

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
            return message.channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }).then(m => m.timedDelete({ timeout: 50000 }));
        }

        const search = message.args.join(' ');
        let res;

        try {
            res = await player.search(search, message.author);
            if (res.loadType === 'LOAD_FAILED') {
                if (!player.queue.current) player.destroy();
                throw res.exception;
            }
        } catch (err) {
            return message.channel.error('music/search:ERROR', { ERROR: err.message }).then(m => m.timedDelete({ timeout: 50000 }));
        }

        if (res.loadType == 'NO_MATCHES') {
            if (!player.queue.current) player.destroy();
            return message.channel.error('music/search:NO_SONG');
        } else {
            let max = 10;
            if (res.tracks.length < max) max = res.tracks.length;
            const results = res.tracks.slice(0, max).map((track, index) => ({ label: track.title, description: track.author, value: `${++index}` }));

            const row = new MessageActionRow()
                .addComponents(
                    new MessageSelectMenu()
                    .setCustomId('search')
                    .setPlaceholder(message.translate('music/search:PLACEHOLDER'))
                    .setMinValues(1)
                    .setMaxValues(10)
                    .addOptions(results)
                );

            const embed = new Embed(client, message.guild)
                    .setDescription(message.translate('music/search:SELECT'))
                    .setFooter(message.translate('music/search:SEARCHED', { SONGNAME: search }));
            const msg = await message.channel.send({ embeds: [embed], components: [row] });

            const filter = (interaction) => interaction.customId === 'search';

            const menuCollector = await msg.createMessageComponentCollector({ filter, componentType: 'SELECT_MENU', time: '120000' });

            menuCollector.on('collect', (i) => {
                if (i.user.id !== message.author.id) return i.deferUpdate();
                msg.delete();

                const track = i.values;

                if (player.state !== 'CONNECTED') {
                    if(!player.voiceChannel || player.voiceChannel === null || player.voiceChannel === undefined) {
                        player = client.manager.create({
                            guild: message.guild.id,
                            voiceChannel: message.member.voice.channel.id,
                            textChannel: message.channel.id,
                            selfDeafen: true,
                        });
                    }
                    player.connect();
                }

                const promise = new Promise(async function(resolve) {
                    for (let i = 0; i < track.length; i++) {
                        player.queue.add(res.tracks[track[i] - 1]);
                        if (!player.playing && !player.paused && !player.queue.size) player.play();
                        if (i == track.length -1) resolve();
                    }
                });

                promise.then(async function() {
                    if (!player.playing && !player.paused && !player.queue.size) {
                        player.play();
                    } else {
                        const embed = new Embed(client, message.guild)
                            .setDescription(message.translate('music/search:ADDED', { QUEUED: track.length }))
                            .setColor(client.config.embedColor);
                        message.channel.send({ embeds: [embed], components: [] });
                    }
                });
            });

            menuCollector.on('end', async () => {
                msg.delete().catch(() => {});
                await message.delete().catch(() => {});
                return;
            });
        }
    }
}

module.exports = Search;