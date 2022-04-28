const { timeEventSchema, WarningSchema, MutedMemberSchema, botSchema } = require('../database/models'),
    ms = require('ms'),
    { Embed, time: { getTotalTime } } = require('../utils'),
    { messageAttachment } = require('discord.js');

module.exports = async (client) => {
    const events = await timeEventSchema.find({});

    //Loop a cada 3 segundos
    setInterval(async () => {
        if (events.length == 0) return;

        //Procura pelo tipo de evento
        for (const event of events) {
            const guild = client.guilds.cache.get(event.guildID);
            const user = await client.users.fetch(event.userID);

            if (new Date() >= new Date(event.time)) {
                switch(event.type) {
                    case 'ban': {
                        break;
                    }
                    case 'reminder': {
                        break;
                    }
                    case 'mute': {
                        break;
                    }
                    case 'warn': {
                        break;
                    }
                    case 'premium': {
                        break;
                    }
                    default:
                        client.logger.error('Invalido o tipo de evento: ' + event.type)          
                }
            }
            //deletar do 'cache'
            events.splice(events.indexOf(event), 1);
        }
    }, 3000);
};