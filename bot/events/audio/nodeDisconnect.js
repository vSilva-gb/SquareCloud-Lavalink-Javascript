const Event = require('../../structures/Event');

class NodeDisconnect extends Event {
    constructor(...args) {
        super(...args, {
            dirname: __dirname,
        });
    }

    async run(client, node, reason) {
        client.logger.music(`Lavalink Node: '${node.options.identifier}' desconectado.`)
    }
}

module.exports = NodeDisconnect;