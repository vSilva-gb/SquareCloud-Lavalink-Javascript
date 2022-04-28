const Event = require('../../structures/Event'),
    { MessageEmbed} = require('discord.js')

class RateLimit extends Event {
    constructor(...args) {
        super(...args, {
            dirname: __dirname
        });
    }

    async run(client, { route, timeout, limit }) {
        client.logger.error(`Rate limit: ${route} (Cooldown: ${timeout}ms)`);

        const embed = new MessageEmbed()
            .setTitle('RateLimit hit')
            .setColor('RED')
            .addField('Path', route)
            .addField('Limit', `${limit}`, true)
            .addField('Cooldown', `${timeout}ms`, true)
            .setTimestamp();
        const modChannel = await client.channels.fetch(client.config.SupportServer.rateLimitChannelID).catch(() => client.logger.error('Error fetching rate limit logging channel'));
        if (modChannel) client.addEmbed(modChannel.id, [embed]);
    }
}

module.exports = RateLimit;