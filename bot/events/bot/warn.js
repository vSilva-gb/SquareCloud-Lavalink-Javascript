const Event = require('../../structures/Event');

class Warn extends Event {
    constructor(...args) {
        super(...args, {
            dirname: __dirname
        });
    }

    async run(client, info) {
        console.log('Warn:');
        console.log(info);
    }
}

module.exports = Warn;