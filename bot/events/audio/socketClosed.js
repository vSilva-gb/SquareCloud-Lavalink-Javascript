const Event = require('../../structures/Event');

class socketClosed extends Event {
    constructor(...args) {
        super(...args, {
            dirname: __dirname
        });
    }

    async run(player, payload) {
    }
}

module.exports = socketClosed;
