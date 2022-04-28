const { MessageEmbed, DMChannel } = require('discord.js');

module.exports = Object.defineProperties(DMChannel.prototype, {
    //Enviar mensagem de erro customizada;
    error: {
        value: function(key, args) {
            try {
                const emoji = this.client.customEmojis['galcross'];
                const embed = new MessageEmbed()
                    .setColor('15158332')
                    .setDescription(`${emoji} ${this.client.translate(key, args, require(`../assets/json/defaultGuildSettings.json`) ?? key)}`);
                return this.send({ embeds: [embed] });
            } catch (err) {
                this.client.logger.error(err.message);
            }
        },
    },
    //Enviar mensagem de sucesso customizada;
    success: {
        value: function(key, args) {
            try {
                const emoji = this.client.customEmojis['galcheck'];
                const embed = new MessageEmbed()
                    .setColor(3066993)
                    .setDescription(`${emoji} ${this.client.translate(key, args, require(`../assets/json/defaultGuildSettings.json`) ?? key)}`);
                return this.send({ embeds: [embed] });
            } catch (err) {
                this.client.logger.error(err.message)
            }
        },
    },
    //Verifica se o bot tem permissão para enviar emojis customizados;
    checkPerm: {
        value: function() {
            return true;
        },
    },
});