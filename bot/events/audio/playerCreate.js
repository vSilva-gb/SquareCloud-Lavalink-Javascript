const Event = require('../../structures/Event');

class PlayerCreate extends Event {
    constructor(...args) {
        super(...args, {
            dirname: __dirname,
        });
    }

    async run(client, player) {
        if (client.config.debug) client.logger.music(`Player criado na guilda: '${player.guild}'`);
    }
}

module.exports = PlayerCreate;