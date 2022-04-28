const Event = require('../../structures/Event');

class InteractionCreate extends Event {
    constructor(...args) {
        super(...args, {
            dirname: __dirname,
        });
    }

    async run(client, interaction) {
        if (interaction.isCommand()) return client.emit('slashCreate', interaction);

        if (interaction.isButton()) return client.emit('clickButton', interaction);

        if (interaction.isContextMenu()) return client.emit('clickMenu', interaction);

        if (interaction.isAutocomplete()) return client.emit('autoComplete', interaction);
    }
}

module.exports = InteractionCreate;