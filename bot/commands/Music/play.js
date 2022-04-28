const { Embed } = require('../../utils'),
    Command = require('../../structures/Command');

class Play extends Command {
    constructor(client) {
        super(client, {
            name: 'play',
			guildOnly: true,
			dirname: __dirname,
			aliases: ['p'],
			botPermissions: ['SEND_MESSAGES', 'EMBED_LINKS', 'CONNECT', 'SPEAK'],
			description: 'Listen to music without interruptions with Galdino',
			usage: 'play <link / song name>',
			cooldown: 3000,
			examples: ['play palaye royale', 'play <attachment>', 'play https://www.youtube.com/watch?v=dQw4w9WgXcQ'],
			slash: true,
			options: [{
				name: 'track',
				description: 'Song name/url',
				type: 'STRING',
				required: true,
				autocomplete: true,
            }],
        });
    }

    async run(client, message, settings) {
        if (message.guild.roles.cache.get(settings.MusicDJRole)) {
            if (!message.member.roles.cache.has(settings.MusicDJRole)) {
                return message.channel.error('misc:MISSING_ROLE').then(m => m.timedDelete({ timeout: 10000 }));
            }
        }

        if (!message.member.voice.channel) return message.channel.error('music/play:NOT_VC').then(m => m.timedDelete({ timeout: 10000 }));

        if (client.manager?.players.get(message.guildId)) {
            if (message.member.voice.channel.id != client.manager?.players.get(message.guildId).voiceChannel) return message.channel.error('misc:NOT_VOICE').then(m => m.timedDelete({ timeout: 10000 }));
        }

        if (message.member.voice.channel.full && !message.member.voice.channel.permissionsFor(message.guild.me).has('MOVE_MEMBERS')) {
            return message.channel.error('music/play:VC_FULL').then(m => m.timedDelete({ timeout: 10000 }));
        }

		if (message.args.length == 0) {
			return message.channel.error('music/play:NO_INPUT').then(m => m.timedDelete({ timeout: 10000 }));
		}

        let player;
        try {
            player = client.manager.create({
                guild: message.guildId,
                voiceChannel: message.member.voice.channel.id,
                textChannel: message.channel.id,
                selfDeafen: true,
            })
        } catch (e) {
            if (message.deletable) message.delete();
			client.logger.error(`Command: '${this.help.name}' has error: ${e.message}.`);
			return message.channel.error('misc:ERROR_MESSAGE', { ERROR: e.message }).then(m => m.timedDelete({ timeout: 10000 }));
        }

        let res;
        const search = message.args.join(' ');

        try {
            res = await player.search(search, message.author);
            if (res.loadType === 'LOAD_FAILED') {
                if (!player.queue.current) player.destroy();
                throw res.exception;
            }
        } catch (e) {
            return message.channel.error('music/play:ERROR', { ERROR: e.message }).then(m => m.timedDelete({ timeout: 10000 }));
        }

        if (res.loadType == 'NO_MATCHES') {
            if (!player.queue.current) player.destroy();
            return message.channel.error('music/play:NO_SONG');

        } else if (res.loadType == 'PLAYLIST_LOADED') {
            if (player.state !== 'CONNECTED') player.connect();

            const embed = new Embed(client, message.guild)
                .setColor(message.member.displayHexColor)
                .setDescription(message.translate('music/play:QUEUED', { NUM: res.tracks.length }));
            message.channel.send({ embeds: [embed] });

            player.queue.add(res.tracks);
            if (!player.playing && !player.paused && player.queue.totalSize === res.tracks.length) player.play();
        } else {
            if (player.state !== 'CONNECTED') player.connect();
            player.queue.add(res.tracks[0]);
            if (!player.playing && !player.paused && !player.queue.size) {
                player.play();
            } else {
                const embed = new Embed(client, message.guild)
                    .setColor('#00FF00')
                    .setDescription(message.translate('music/play:SONG_ADD', { TITLE: res.tracks[0].title, URL: res.tracks[0].uri }));
                message.channel.send({ embeds: [embed] });
            }
        }
    }

    async callback(client, interaction, guild, args) {
		const channel = guild.channels.cache.get(interaction.channelId),
			member = guild.members.cache.get(interaction.user.id),
			search = args.get('track').value;

		if (guild.roles.cache.get(guild.settings.MusicDJRole)) {
			if (!member.roles.cache.has(guild.settings.MusicDJRole)) {
				return interaction.reply({ ephemeral: true, embeds: [channel.error('misc:MISSING_ROLE', { ERROR: null }, true)] });
			}
		}

		// make sure user is in a voice channel
		if (!member.voice.channel) return interaction.reply({ ephemeral: true, embeds: [channel.error('misc:MISSING_ROLE', { ERROR: null }, true)] });

		// Check that user is in the same voice channel
		if (client.manager?.players.get(guild.id)) {
			if (member.voice.channel.id != client.manager?.players.get(guild.id).voiceChannel) return interaction.reply({ ephemeral: true, embeds: [channel.error('misc:NOT_VOICE', { ERROR: null }, true)] });
		}

		// Create player
		let player, res;
		try {
			player = client.manager.create({
				guild: guild.id,
				voiceChannel: member.voice.channel.id,
				textChannel: channel.id,
				selfDeafen: true,
			});
		} catch (err) {
			client.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
			return interaction.reply({ ephemeral: true, embeds: [channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }, true)] });
		}

		// Search for track
		try {
			res = await player.search(search, member);
			if (res.loadType === 'LOAD_FAILED') {
				if (!player.queue.current) player.destroy();
				throw res.exception;
			}
		} catch (err) {
			client.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
			return interaction.reply({ ephemeral: true, embeds: [channel.error('music/play:ERROR', { ERROR: err.message }, true)] });
		}
		// Workout what to do with the results
		if (res.loadType == 'NO_MATCHES') {
			// An error occured or couldn't find the track
			if (!player.queue.current) player.destroy();
			return interaction.reply({ ephemeral: true, embeds: [channel.error('music/play:NO_SONG', { ERROR: null }, true)] });

		} else if (res.loadType == 'PLAYLIST_LOADED') {
			// Connect to voice channel if not already
			if (player.state !== 'CONNECTED') player.connect();
			// Show how many songs have been added
			const embed = new Embed(client, guild)
				.setColor(member.displayHexColor)
				.setDescription(client.translate('music/play:QUEUED', { NUM: res.tracks.length }));

			// Add songs to queue and then play the song(s) if not already
			player.queue.add(res.tracks);
			if (!player.playing && !player.paused && player.queue.totalSize === res.tracks.length) player.play();

			return interaction.reply({ embeds: [embed] });
		} else {
			// add track to queue and play
			if (player.state !== 'CONNECTED') player.connect();
			player.queue.add(res.tracks[0]);
			if (!player.playing && !player.paused && !player.queue.size) {
				player.play();
				return interaction.reply({ content: 'Successfully started queue.' });
			} else {
				const embed = new Embed(client, guild)
					.setColor(member.displayHexColor)
					.setDescription(client.translate('music/play:SONG_ADD', { TITLE: res.tracks[0].title, URL: res.tracks[0].uri }));
				return interaction.reply({ embeds: [embed] });
			}
        }
    }
}

module.exports = Play;