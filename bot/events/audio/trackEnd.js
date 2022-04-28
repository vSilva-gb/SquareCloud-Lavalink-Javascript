const Event = require('../../structures/Event');

class TrackEnd extends Event {
    constructor(...args) {
        super(...args, {
            dirname: __dirname,
        });
    }

    async run(client, player, track) {
        //Quando a música acabar adiciona a próxima música do array para tocar
        player.get("message")?.delete().catch(() => {});
        player.addPreviousSong(track);
    }
}

module.exports = TrackEnd;