const { MessageEmbed } = require('discord.js');

class GalClientEmbed extends MessageEmbed {
    constructor(client, guild, data = {}) {
        super(data);
        this.client = client;
        this.guild = guild;
        this.setColor(client.config.embedColor)
    }

    setTitle(key, args) {
        const Language = this.guild?.settings.Language ?? require('../assets/json/defaultGuildSettings.json').Language;
        this.title = this.client.translate(key, args, Language) ? this.client.translate(key, args, Language) : key;
        return this;
    }

    setFooter(key, args, icon) {
        if (typeof args === 'object') {
            const Language = this.guild?.settings.Language ?? require('../assets/json/defaultGuildSettings.json').Language;
            this.footer = {
                text: this.client.translate(key, args, Language),
                iconURL: icon,
            };
        } else {
            this.footer = {
                text: key,
                iconURL: args,
            };
        }
        return this;
    }
}

module.exports = GalClientEmbed;