const { paginate, Embed } = require('../../utils'),
    { time: { getReadableTime } } = require('../../utils'),
    Command = require('../../structures/Command');

class Previous extends Command {
    constructor(client) {
        super(client, {
            name: 'previous',
            guildOnly: true,
            dirname: __dirname,
            aliases: ['played'],
            botPermissions: ['SEND_MESSAGES', 'EMBED_LINKS', 'SPEAK', 'ADD_REACTIONS'],
            description: 'Display the previous tracks that have been played.',
            usage: 'previous [pageNumber]',
            cooldown: 3000,
            examples: ['previous', 'previous 2'],
        });
    }

    async run(client, message, settings) {
        if (message.guild.roles.cache.get(settings.MusicDJRole)) {
            if (!message.member.roles.cache.has(settings.MusicDJRole)) {
                return message.channel.error('misc:MISSING_ROLE').then(m => m.timedDelete({ timeout: 15000 }));
            }
        }

        const player = client.manager?.players.get(message.guild.id);
        if (!player) return message.channel.error('misc:NO_QUEUE').then(m => m.timedDelete({ timeout: 15000 }));

        const queue = player.previousTracks;
        if (queue.size === 0) {
            const embed = new Embed(client, message.guild)
                .setTitle('No previous tracks have been played');
            return message.channel.send({ embeds: [embed] });
        }

        let pagesNum = Math.ceil(player.previousTracks.length / 10);
        if (pagesNum === 0) pagesNum = 1;

        const songStrings = [];
        for (let i = 0; i < player.previousTracks.length; i++) {
            const song = player.previousTracks[player.previousTracks.length - (i + 1)];
            songStrings.push(
				`**${i + 1}.** [${song.title}](${song.uri}) \`[${getReadableTime(song.duration)}]\` • <@${!song.requester.id ? song.requester : song.requester.id}>`);
        }

        const pages = [];
        for (let i = 0; i < pagesNum; i++) {
            const str = songStrings.slice(i * 10, i * 10 + 10).join('');
            const embed = new Embed(client, message.guild)
                .setAuthor({ name: `Previous Tracks - ${message.guild.name}`, iconURL: message.guild.iconURL() })
                .setDescription(`**Last Track**: ${str == '' ? '  Nothing' : '\n\n' + str }`)
                .setFooter({ text: `Page ${i + 1}/${pagesNum} | ${player.previousTracks.length} song(s)` });
            pages.push(embed);
        }

        if (!message.args[0]) {
            if (pages.length == pagesNum && player.previousTracks.length > 10) paginate(client, message, pages, message.author.id);
            else return message.channel.send({ embeds: [pages[0]] });
        } else {
            if (isNaN(message.args[0])) return message.channel.error('Page must be a number.');
            if (message.args[0] > pagesNum) return message.channel.error(`There are only ${pagesNum} pages available.`);
            const pageNum = message.args[0] == 0 ? 1: message.args[0] - 1;
            return message.channel.send({ embeds: [pages[pageNum]] });
        }
    }
}

module.exports = Previous;