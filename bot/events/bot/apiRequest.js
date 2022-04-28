const Event = require('../../structures/Event');

class APIRequest extends Event {
    constructor(...args) {
        super(...args, {
            dirname: __dirname,
        });
    }

    async run(client, request) {
        client.requests[request.route] ? client.requests[request.route] += 1 : client.requests[request.route] = 1;
    }
}

module.exports = APIRequest;