const Event = require('../../structures/Event');

class NodeConnect extends Event {
    constructor(...args) {
        super(...args, {
            dirname: __dirname,
        });
    }

    async run(client, node) {
        client.logger.music(`Conectado ao servidor: ${node.options.identifier}.`)
    }
}

module.exports = NodeConnect;