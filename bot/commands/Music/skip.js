const { functions: { checkMusic } } = require('../../utils'),
    Command = require('../../structures/Command.js');

class Skip extends Command {
    constructor(client) {
        super(client, {
            name: 'skip',
            guildOnly: true,
            dirname: __dirname,
            aliases: ['next','skipto'],
            botPermissions: ['SEND_MESSAGES','EMBED_LINKS','SPEAK'],
            description: 'Skips the current song',
            usage: 'skip',
            cooldown: 3000,
            slash: true,
            options: [{
                name: 'amount',
                description: 'Position in queue to skip to',
                type: 'INTEGER',
                required: false,
            }],
        });
    }

    async run(client, message) {
        const tocando = checkMusic(message.member, client);
        if (typeof(tocando) !== 'boolean') return message.channel.error(tocando).then(m => m.timedDelete({ timeout: 10000 }));

        const player = client.manager?.players.get(message.guildId);
        if (!isNaN(message.args[0]) && message.args[0] < player.queue.length) {
            player.stop(parseInt(message.args[0]))
        } else {
            player.stop();
        }
        message.react('👍');
    }

    async callback(client, interaction, guild, args) {
        const member = guild.members.cache.get(interaction.user.id),
            channel = guild.channels.cache.get(interaction.channelId),
            valor = args.get('amount')?.value;

        const tocando = checkMusic(member, client);
        if (typeof(tocando) !== 'boolean') return interaction.reply({ embeds: [channel.error(tocando, {}, true)], ephemeral: true});

        const player = client.manager?.players.get(member.guild.id);
        if (!isNaN(valor) && valor < player.queue.length) {
            player.stop(valor);
        } else {
            player.stop();
        }
        interaction.reply({ embeds: [channel.success('music/skip:SKIPED', {}, true)] });
    }
}

module.exports = Skip;