const { Embed } = require('discord.js'),
    types = {
        GUILD_TEXT: 'Texto',
        GUILD_VOICE: 'Voz',
        GUILD_CATEGORY: 'Categoria',
        GUILD_STAGE_VOICE: 'Palco',
        GUILD_NEWS: 'Anuncio',
        GUILD_STORE: 'Loja',
    },
    Event = require('../../structures/Event');

class ChannelDelete extends Event {
    constructor(...args) {
        super(...args, {
            dirname: __dirname,
        });
    }

    async run(client, channel) {
        if (client.config.debug) client.logger.debug(`O canal: ${channel.type == 'dm' ? channel.recipient.tag : channel.name } foi deletado ${channel.type == 'dm' ? '' : `na guild: ${channel.guild.id}`}. (${types[channel.type]})`);

        //
        if (channel.type == 'dm') return;

        try {
            const player = client.players?.get(channel.guild.id);
            if (channel.id === player?.voiceChannel || player?.textChannel) {
                player?.destroy()
            }
        } catch (err) {
            console.log.error('Um erro aconteceu' + err)
        }
    }
}

module.exports = ChannelDelete;