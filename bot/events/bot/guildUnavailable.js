const unavaibleGuilds = [],
    Event = require('../../structures/Event');

class GuildUnavaible extends Event {
    constructor(...args) {
        super(...args, {
            dirname: __dirname,
        });
    }

    async run(client, guild) {
        if (client.config.debug) client.logger.debug(`A guilda: ${guild.name} está atualmente indisponível.`);

        if(unavaibleGuilds.includes(guild.id)) {
            setTimeout(function() {
                unavaibleGuilds.splice(unavaibleGuilds.indexOf(guild.id), 1);
            }, 60 * 60 * 1000);
        } else {
            client.logger.log(`[GUILD INDISPONIVEL] ${guild.name} (${guild.id}).`);
            unavaibleGuilds.push(guild.id);
        }
    }
}

module.exports = GuildUnavaible