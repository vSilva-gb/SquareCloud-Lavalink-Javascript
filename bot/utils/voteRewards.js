const { MessageEmbed } = require('discord.js'),
    users = require('../database/models/Author');

module.exports = async (client, user) => {
    users.findOne({
        authorID: user.id,
    }, async (err, u) => {
        if (err) console.log(err);
        let lastVotedTime = 'Null';
        if (!u) {
            const newAuthor = new users({
                authorID: user.id,
                authorName: user.username,
                songsPlayed: 0,
                commandsUsed: 0,
                voted: true,
                votedTimes: 1,
                votedConst: true,
                lastVoted: Date.now(),
            });
            await newAuthor.save().catch(e => console.log(e));
        }
        else {
            if(!Number.isInteger(u.votedTimes)) u.votedTimes = 1;
            else u.votedTimes++;
            lastVotedTime = Date(u.lastVoted).toString().substring(0, 15);
            u.lastVoted = Date.now();
            u.voted = true;
            u.votedConst = true;
            await u.save().catch(e => console.log(e));
        }

        const embed = new MessageEmbed()
            .setAuthor({ name: `${user.tag} - (${user.id})`, iconURL: user.displayAvatarURL() })
            .setDescription(`**${user.username}** voted for the bot!\n\nTimes Voted: \`${u.votedTimes}\``)
            .setThumbnail(user.displayAvatarURL())
            .setColor('BLURPLE')
            .setTimestamp()

        //const channel = client.guilds.cache.get('');
        //channel.send({ embeds: [embed] });

        const fetchedUser = await client.users.fetch(user.id, { force: true});
        try {
            fetchedUser?.send({ content: '**Obrigado por votar, assim você apoia o meu desenvolvimento.\nVocê poderá votar novamente em 12 horas.**'});
        } catch (err) {
            return;
        }
    })
}