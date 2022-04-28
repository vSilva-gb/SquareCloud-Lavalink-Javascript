const Event = require('../../structures/Event');

class ShardReconnecting extends Event {
    constructor(...args) {
        super(...args, {
            dirname: __dirname,
        });
    }

    async run(client, shardID) {
        client.logger.debug(`Shard: ${shardID} está tentando se reconectar.`)
    }
}

module.exports = ShardReconnecting;