const Event = require('../../structures/Event');

class Raw extends Event {
    constructor(...args) {
        super(...args, {
            dirname: __dirname,
        });
    }

    async run(client, data) {
        //Usado para o lavalink
        client.manager?.updateVoiceState(data);
        }
    }

module.exports = Raw;