//Create a discord bot
const {Client, Intents} = require('discord.js');
//Create a client with intents
const client = new Client({
    //Intents
    intents: [Intents.FLAGS.GUILDS]
});

//Crie o evento ready
client.on('ready', () => {
    console.log('I am ready!');
    //Crie uma função para usar o status viewing
    client.user.setActivity('O meu dono me criar novamente... Em breve!', {type: 'WATCHING'});
});

//Crie o evento message
client.on('message', message => {
    if (message.content.includes['!']) {
        console.log(message.content)
    }
});

client.login('NjYxNDEwMjk4ODY2OTU4MzM5.XgrAVw.vfFg8n188SeAY_dKXdB4X7d8VDg');