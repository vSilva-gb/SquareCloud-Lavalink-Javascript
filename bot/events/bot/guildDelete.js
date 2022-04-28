const { GiveawaySchema, WarningSchema, ReactionRoleSchema } = require('../../database/models'),
    { MessageEmbed } = require('discord.js'),
    Event = require('../../structures/Event');

class GuildDelete extends Event {
    constructor(...args) {
        super(...args, {
            dirname: __dirname,
        });
    }

    async run(client, guild) {
        if (!client.isReady() && !guild.available) return;
        client.logger.log(`[GUILD LEAVE] ${guild.name} (${guild.id}) removed the bot.`);
        await client.DeleteGuild(guild);

        // Send message to channel that bot has left a server
		let attachment;
		try {
			const embed = new MessageEmbed()
				.setTitle(`[GUILD LEAVE] ${guild.name}`);
			embed.setDescription([
				`Guild ID: ${guild.id ?? 'undefined'}`,
				`Owner: ${client.users.cache.get(guild.ownerId)?.tag}`,
				`MemberCount: ${guild?.memberCount ?? 'undefined'}`,
			].join('\n'));

			const modChannel = await client.channels.fetch(client.config.SupportServer.GuildChannel).catch(() => client.logger.error(`Error fetching guild: ${guild.id} logging channel`));
			if (modChannel) client.addEmbed(modChannel.id, [embed, attachment]);
		} catch (err) {
			client.logger.error(`Event: '${this.conf.name}' has error: ${err.message}.`);
		}

        /*//Limpa toda a database com config do sewrvidor
        await GiveawaySchema.deleteMany({ guildID: guild.id }, function(err) {
            if (err) client.logger.error(err.message);
        });
        
        await WarningSchema.deleteMany({ guildID: guild.id }, function(err) {
            if (err) client.logger.error(err.message);
        });

        await ReactionRoleSchema.deleteMany({ guildID: guild.id }, function(err) {
            if (err) client.logger.error(err.message);
        });*/

        //Caso exista algum player ativo no servidor antes dele sair, irá destroir o player!
        try {
            const player = client.manager.players.get(guild.id);
            player?.destroy()
        } catch (error) {
            client.logger.error(`Aconteceu um erro ao destroir o player após o bot sair do servidor: ${guild.name} com o erro ${error.message}`)
        }
    }
}

module.exports = GuildDelete;