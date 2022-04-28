const { MessageEmbed, MessageAttachment } = require('discord.js'),
    { promisify } = require('util'),
    readdir = promisify(require('fs').readdir);
    Event = require('../../structures/Event');

class GuildCreate extends Event {
    constructor(...args) {
        super(...args, {
            dirname: __dirname
        });
    }

    async run(client, guild) {
        //Log Server Join
        client.logger.log(`[GUILD JOIN] ${guild.name} (${guild.id}) adicionou o bot`);

        //Aplicar as configuraçoes do servidor
        try {
            //Criar configuraçoes do servidor e procurar pelo cache.
            await guild.fetchSettings(); 
        } catch (error) {
            client.logger.error(`Evento: '${this.conf.name}' ocorreu um erro: ${error.message}.`)
        }

        const owner = await guild.members.fetch(guild.ownerId);
        const embed = new MessageEmbed()
            .setTitle("GUILD JOIN")
            .addField("📝 Nome: ", guild.name, true)
            .addField("👑 Owner: ", owner.user.tag, true)
            .addField("👥 Users: ", guild.memberCount.toString(), true)  
            .addField("✅ Verificada: ", guild.verified.toString(), true)
            //.addField("🌎 Region: ", guild.region, true)
            .addField("🆔 ", guild.id, true)
            .setThumbnail(guild.iconURL({dynamic: true}))

        const modChannel = await client.channels.fetch(client.config.SupportServer.GuildChannel).catch(() => client.logger.error(`Error fetching guild: ${guild.id} logging channel`));
		if (modChannel) client.addEmbed(modChannel.id, [embed]);

        const enabledPlugins = (await readdir('./commands/')).filter((v, i, a) => v !== 'Host' && a.indexOf(v) === i);
        const data = [];
        for (const plugin of enabledPlugins) {
            const g = await client.loadInteractionGroup(plugin, guild);
            if (Array.isArray(g)) data.push(...g);
        }

        try {
            await client.guilds.cache.get(guild.id)?.commands.set(data);
            client.logger.log(`Interaçoes do servidor ${guild.name} carregadas`);
        } catch (error) {
            client.logger.error(`Failed to load interactions for guild: ${guild.id} due to: ${error.message}.`);
        }
    }
}

module.exports = GuildCreate
