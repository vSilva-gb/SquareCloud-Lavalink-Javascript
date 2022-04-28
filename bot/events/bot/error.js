const Event = require('../../structures/Event');

class Error extends Event {
    constructor(...args) {
        super(...args, {
            dirname: __dirname,
        });
    }

    async run(client, err) {
        console.log(err)
        client.logger.error(`Foi encontrado um erro no bot: ${err.message}.`)
    }
}

module.exports = Error;