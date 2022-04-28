const Event = require('../../structures/Event');

class PlayerMove extends Event {
    constructor(...args) {
        super(...args, {
            dirname: __dirname,
        });
    }

    async run(client, player, curChannel, newChannel) {
        //Canal de voz atualizado
        if (!newChannel) {
            player.get("message")?.delete().catch(() => {});
            player.destroy()
        } else {
            await player.setVoiceChannel(newChannel ?? player.VoiceChannel);
            player.pause(true);
            await client.delay(1000);
            player.pause(false);
        }
    }
}

module.exports = PlayerMove;