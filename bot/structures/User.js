const { User } = require('discord.js');

module.exports = Object.defineProperties(User.prototype, {
    //Se o usuário é premium ou não
    premium: {
        value: false,
        writable: true,
        enumerable: true
    },
    //Quando que o usuário se tornou premium
    premiumSince: {
        value: '',
        writable: true,
        enumerable: true,
    },
    //Se o usuário está banido de usar os comandos do bot;
    cmdBanned: {
        value: false,
        writable: true,
        enumerable: true,
    },
});