const Event = require('../../structures/Event');

class NodeError extends Event {
    constructor(...args) {
        super(...args, {
            dirname: __dirname,
        });
    }

    async run(client, node, error) {
        client.logger.music(`Lavalink node: '${node.options.identifier}', ocorreu um erro: '${error}'.`)
    }
}

module.exports = NodeError;
