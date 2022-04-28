const Event = require('../../structures/Event');

class ShardDisconnect extends Event {
    constructor(...args) {
        super(...args, {
            dirname: __dirname,
        });
    }

    async run(client, event, shardID) {
        client.logger.error(`Shard: ${shardID} desconectada com o erro: ${event.reason}`)
    }
}

module.exports = ShardDisconnect;