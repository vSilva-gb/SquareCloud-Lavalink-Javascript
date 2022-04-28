const Event = require('../../structures/Event');

class ShardError extends Event {
    constructor(...args) {
        super(...args, {
            dirname: __dirname,
        });
    }

    async run(client, error, shardID) {
        client.logger.error(`Shard: ${shardID} encontrada um erro: ${error}`);
    }
}

module.exports = ShardError;