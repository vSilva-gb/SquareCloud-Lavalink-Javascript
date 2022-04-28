const { MessageEmbed } = require('discord.js');
const Event = require('../../structures/Event');
const { Embed } = require('../../utils');

class QueueEnd extends Event {
    constructor(...args) {
        super(...args, {
            dirname: __dirname,
        });
    }

    async run(client, player, { identifier: videoID, requester }) {
        if (player.autoplay) {
            const channel = client.channels.cache.get(player.textChannel);
            const guild = client.guilds.cache.get(player.guild);
            let res;
            try {
                res = await player.search(`https://www.youtube.com/watch?v=${videoID}&list=RD${videoID};`, requester);
                if (res.loadType === 'LOAD_FAILED') {
                    if (!player.queue.current) player.destroy();
                    throw res.exception;
                }
            } catch (err) {
                return channel.error('music/play:ERROR', { ERROR: err.message }).then(m => m.timedDelete({ timeout: 10000 }));
            }

            if (res.loadType == 'NO_MATCHES') {
                if (!player.queue.current) player.destroy();
                return channel.error('music/play:NO_SONG');

            } else if (res.loadType == 'PLAYLIST_LOADED') {
                if (player.state !== 'CONNECTED') player.connect();

                const embed = new Embed(client, guild)
                    .setColor(guild.members.cache.get(requester.id)?.displayHexColor)
                    .setDescription(guild.translate('music/play:QUEUED', { NUM: res.tracks.length }));
                channel.send({ embeds: [embed] });

                player.queue.add(res.tracks);
                if (!player.playing && !player.paused && player.queue.totalSize === res.tracks.length) player.play();
            } else {
                if (player.state !== 'CONNECTED') player.connect();
                player.queue.add(res.tracks[0]);
                if (!player.playing && !player.paused && !player.queue.size) {
                    player.play();
                } else {
                    const embed = new Embed(client, guild)
                        .setColor(guild.members.cache.get(requester.id)?.displayHexColor)
                        .setDescription(guild.translate('music/play:SONG_ADD', { TITLE: res.tracks[0].title, URL: res.tracks[0].uri }));
                    channel.send({ embeds: [embed] });
                }
            }
        } else {
            player.timeout = setTimeout(() => {

                if (player.twentyFourSeven) return;
                const vcName = client.channels.cache.get(player.voiceChannel)?.name ?? 'unknown';
                const embed = new MessageEmbed()
                    .setDescription(client.guilds.cache.get(player.guild).translate('music/dc:INACTIVE', { VC: vcName }));

                client.channels.cache.get(player.textChannel)?.send({ embeds: [embed] }).then(m => m.timedDelete({ timeout: 15000 }));
                player.destroy();
            }, 18*60*1000);
        }
        player.get("message")?.delete().catch(() => {});
    }
}

module.exports = QueueEnd;