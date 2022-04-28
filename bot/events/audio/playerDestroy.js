const Event = require('../../structures/Event');

class PlayerDestroy extends Event {
    constructor(...args) {
        super(...args, {
            dirname: __dirname,
        });
    }

    async run(client, player) {
        player.get("message")?.delete().catch(() => {});
        if (client.config.debug) client.logger.music(`Lavalink Player destroido na guilda: '${player.guild}'`);
    }
}

module.exports = PlayerDestroy;