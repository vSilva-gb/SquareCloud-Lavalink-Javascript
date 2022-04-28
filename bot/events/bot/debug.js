const Event = require('../../structures/Event');

class Debug extends Event {
    constructor(...args) {
        super(...args, {
            dirname: __dirname,
        });
    }

    async run(client, info) {
        if (client.config.debug) client.logger.debug(info)
    }
}

module.exports = Debug;