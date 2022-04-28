const { functions: { checkMusic } } = require('../../utils'),
    Command = require('../../structures/Command');

class Loop extends Command {
    constructor(client) {
        super(client, {
            name: 'loop',
            guildOnly: true,
            dirname: __dirname,
            botPermissions: ['SEND_MESSAGES', 'EMBED_LINKS','SPEAK'],
            description: 'Loops the song or queue',
            usage: 'loop [queue / song]',
            cooldown: 3000,
            examples: ['loop queue', 'loop'],
            slash: true,
            options: [{
                name: 'type',
                type: 'STRING',
                description: 'The entity you want to loop',
                required: false,
                choices: [
                    {
                        name: 'Queue',
                        value: 'Queue',
                    },
                    {
                        name: 'Song',
                        value: 'song',
                    },
                ],
            }],
        });
    }

    async run(client, message) {
        const playable = checkMusic(message.member, client);
        if (typeof (playable) !== 'boolean') return message.channel.error(playable.then(m => m.timedDelete({ timeout: 15000 })));

        const player = client.manager?.players.get(message.guild.id);

        if (!message.args[0] || message.args[0].toLowerCase() == 'song') {
            player.setTrackRepeat(!player.trackRepeat);
            const trackRepeat = message.translate(`misc:${player.trackRepeat ? 'ENABLED' : 'DISABLED'}`);
            return message.channel.send(message.translate('music/loop:TRACK', { TOGGLE: trackRepeat }));
        } else if (message.args[0].toLowerCase() == 'queue') {
            player.setQueueRepeat(!player.queueRepeat);
            const queueRepeat = message.translate(`misc:${player.queueRepeat ? 'ENABLED' : 'DISABLED'}`);
            return message.channel.send(message.translate('music/loop:QUEUE', { TOGGLE: queueRepeat }));
        }
    }

    async callback(client, interaction, guild, args) {
        const member = guild.members.cache.get(interaction.user.id),
            channel = guild.channels.cache.get(interaction.channelId),
            type = args.get('type')?.value;

        const playable = checkMusic(member, client);
        if (typeof (playable) !== 'boolean') return interaction.reply({ embeds: [channel.error(playable, {}, true)], ephemeral: true });

        const player = client.manager?.players.get(member.guild.id);
        if (!type || type == 'song') {
            player.setTrackRepeat(!player.trackRepeat);
            const trackRepeat = guild.translate(`misc:${player.trackRepeat ? 'ENABLED' : 'DISABLED'}`);
            return interaction.reply({ content: client.translate('music/loop:TRACK', { TOGGLE: trackRepeat }) });
        } else if (type == 'queue') {
            player.setQueueRepeat(!player.queueRepeat);
            const queueRepeat = guild.translate(`misc:${player.queueRepeat ? 'ENABLED' : 'DISABLED'}`);
            return interaction.reply({ content: client.translate('music/loop:QUEUE', { TOGGLE: queueRepeat })});
        }
    }
}

module.exports = Loop;