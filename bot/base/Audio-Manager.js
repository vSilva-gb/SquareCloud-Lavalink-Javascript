const { Manager } = require('erela.js'),
    Deezer = require('erela.js-deezer'),
    Spotify = require('erela.js-spotify'),
    AppleMusic = require('erela.js-apple'),
    Facebook = require('erela.js-facebook'),
    { LavalinkNodes: nodes, api_keys: { spotify } } = require('../config');
require('../structures/Player');

class AudioManager extends Manager {
    constructor(client) {
        super({
            nodes: nodes,
            plugins: [
                new Deezer({ playlistLimit: 1, albumLimit: 1 }),
                new Facebook(),
                new Spotify({ clientID: spotify.iD, clientSecret: spotify.secret }),
                new AppleMusic()
            ],
            autoPlay: true,
            send(id, payload) {
                const guild = client.guilds.cache.get(id);
                if (guild) guild.shard.send(payload);
            }
        });
    }
}

module.exports = AudioManager;