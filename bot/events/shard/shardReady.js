const Event = require('../../structures/Event');

class ShardReady extends Event {
    constructor(...args) {
        super(...args, {
            dirname: __dirname,
        });
    }

    async run(client, shardID, unavailableGuilds) {
        client.logger.ready(`Shard ID: ${shardID} já está disponível com ${(unavailableGuilds || new Set()).size} servidores indisponíveis!`);
    }
}

module.exports = ShardReady;