const { embed } = require('discord.js'),
    Event = require('../../structures/Event');

class VoiceStateUpdate extends Event {
    constructor(...args) {
        super(...args, {
            dirname: __dirname,
        });
    }

    async run(client, oldState, newState) {
        //
        const channel = newState.guild.channels.cache.get(newState.channel?.id ?? newState.channelId);

        //
        const settings = newState.guild.settings;
        if (Object.keys(settings).length == 0) return;

        //
        const player = client.manager?.players.get(newState.guild.id);

        if (!player) return;
        if (!newState.guild.members.cache.get(client.user.id).voice.channelId) player.destroy();
        //
        if (newState.id == client.user.id && channel.type == 'GUILD_STAGE_VOICE') {
            if (!oldState.channelId) {
                try {
                    await newState.guild.me.voice.setSuppressed(false).then(() => console.log(null));
                } catch (err) {
                    player.pause(true);
                }
                } else if (oldState.supress !== newState.suppress) {
                    player.pause(newState.suppress)
                }
            }

        if (oldState.id === client.user.id) return;
        if (!oldState.guild.members.cache.get(client.user.id).voice.channelId) return;

        //
        if (player.twentyFourSeven) return;

        //
        if (oldState.guild.members.cache.get(client.user.id).voice.channelId === oldState.channelId) {
            if (oldState.guild.me.voice?.channel && oldState.guild.me.voice.channel.members.filter(m => !m.user.bot).size === 0) {
                await client.delay(180000);

                //
                const membrosCanal = oldState.guild.me.voice.channel?.members.size;
                if (!membrosCanal || membrosCanal === 1) {
                    const novoPlayer = client.manager?.players.get(newState.guild.id);
                    (novoPlayer) ? player?.destroy() : oldState.guild.me.voice.channel?.leave()
                }
            }
        }
    }
}

module.exports = VoiceStateUpdate;