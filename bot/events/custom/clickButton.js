const { Embed } = require('../../utils'),
    { Collection} = require('discord.js'),
    cooldowns = new Collection(),
    Event = require('../../structures/Event');

    class ClickButton extends Event {
        constructor(...args) {
            super(...args, {
                dirname: __dirname,
            });
        }

        async run(client, button) {
           /* const { customId: ID, guildId, channelId, member } = button,
                guild = client.guilds.cache.get(guildId),
                channel = client.channels.cache.get(channelId);
            button.deferUpdate()*/
        }
    }

module.exports = ClickButton;