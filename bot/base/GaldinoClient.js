const { type } = require('os');

const { Client, Collection } = require('discord.js'),
    { GuildSchema } = require('../database/models'),
    GiveawaysManager = require('./giveaway/Manager'),
    path = require('path'),
    { promisify } = require('util'),
    AudioManager = require('./Audio-Manager'),
    readdir = promisify(require('fs').readdir);

class GaldinoClient extends Client {
    constructor() {
        super({
            partials: [/*'GUILD_MEMBER', */'USER', 'MESSAGE', 'CHANNEL', 'REACTION'],
            intents: ['GUILDS', /*'GUILD_MEMBERS',*/ 'GUILD_BANS', 'GUILD_EMOJIS_AND_STICKERS', 'GUILD_MESSAGES', 'GUILD_MESSAGE_REACTIONS', 'DIRECT_MESSAGES', 'GUILD_VOICE_STATES', 'GUILD_INVITES'],
            presence: {
				status: 'online',
				activities: [{
					name: '!help',
					type: 'STREAMING',
					url: 'https://www.twitch.tv/siilvarp',
				}],
            },
        }),

        this.logger = require('../utils/Logger');

        this.giveawaysManager = new GiveawaysManager(this, {
            storage: false,
            updateCountdownEvery: 1000,
            endedGiveawaysLifetime: 604800000,
            default: {
                botPodeGanhar: false,
                exemptPermissions: [],
                embedColor: '#FF0000',
                reaction: '🎉',
            }
        });

        this.aliases = new Collection();
        this.commands = new Collection();
        this.interactions = new Collection();
        this.cooldowns = new Collection();
        this.requests = {};

        this.mongoose = require('../database/mongoose');
        
        this.config = require('../config.js')

        this.Activity = [];
        this.PresenceType = 'PLAYING';

        this.adultSiteList = [];

        this.embedCollection = new Collection();

        this.customEmojis = require('../assets/json/emojis.json');

        this.languages = require('../languages/language-meta.json');

        this.delay = ms => new Promise(res => setTimeout(res, ms));

        this.manager = new AudioManager(this);

    }

        async DeleteGuild(guild) {
            try {
                await GuildSchema.findOneAndRemove({ guildID: guild.id });
                return true;
            } catch (error) {
                if (this.config.debug) this.logger.debug(err.message);
                return false;
            }
        }

        SetActivity(type, array = []) {
            this.Activity = array;
            this.PresenceType = type;
            try {
                let j = 0;
                setInterval(() => this.user.setActivity(`${this.Activity[j++ % this.Activity.length]}`, { type: type, url: 'https://www.twitch.tv/siilvarp' }), 10000);
            } catch (error) {
                console.log(error)
            }
        }

        carregarComando(commandPath, commandName) {
            const cmd = new (require(`.${commandPath}${path.sep}${commandName}`))(this);
            //this.logger.log(`Loading Command: ${cmd.help.name}.`);
            cmd.conf.location = commandPath;
            this.commands.set(cmd.help.name, cmd);
            cmd.help.aliases.forEach((alias) => {
                this.aliases.set(alias, cmd.help.name);
            });
        }

        async loadInteractionGroup(category) {
            try {
                const commands = (await readdir('./commands/' + category + '/')).filter((v, i, a) => a.indexOf(v) === i);
                const arr = [];
                commands.forEach((cmd) => {
                        const command = new (require(`../commands/${category}${path.sep}${cmd}`))(this);
                        if (command.conf.slash) {
                            const item = {
                                name: command.help.name,
                                description: command.help.description,
                                defaultPermission: command.conf.defaultPermission,
                            };
                            if (command.conf.options[0]) {
                                item.options = command.conf.options;
                            }
                            arr.push(item);
                        }
                    
                });
                return arr;
            } catch (err) {
                return `Unable to load category ${category}: ${err}`;
            }
        }

       async deleteInteractionGroup(category, guild) {
            try {
                const commands = (await readdir('./commands/' + category + '/')).filter((v, i, a) => a.indexOf(v) === i);
                const arr = [];
                commands.forEach((cmd) => {
                    if (!this.config.disabledCommands.includes(cmd.replace('.js', ''))) {
                        const command = new (require(`../commands/${category}${path.sep}${cmd}`))(this);
                        if (command.conf.slash) {
                            arr.push({ 
                                name: command.help.name,
                                description: command.help.description,
                                options: command.conf.options,
                                defaultPermission: command.conf.defaultPermission,
                            });
                            guild.interactions.delete(command.help.name, command);
                        }
                    }
                });
                return arr;
            } catch (err) {
                return `Unable to load category ${category}: ${err}`;
            }
        }

        async unloadCommand(commandPath, commandName) {
            let command;
            if (this.commands.has(commandName)) {
                command = this.commands.get(commandName);
            } else if (this.aliases.has(commandName)) {
                command = this.commands.get(this.aliases.get(commandName));
            }
            if (!command) return `The command \`${commandName}\` doesn't seem to exist, nor is it an alias. Try again!`;
            delete require.cache[require.resolve(`.${commandPath}${path.sep}${commandName}.js`)];
            return false;
        }

        translate(key, args, locale) {
            if (!locale) locale = require('../assets/json/defaultGuildSettings.json').Language;
            const language = this.translations.get(locale);
            if (!language) return 'Invalid language set in data.';
            return language(key, args);
        }

        addEmbed(channelID, embed) {
            // collect embeds
            if (!this.embedCollection.has(channelID)) {
                this.embedCollection.set(channelID, [embed]);
            } else {
                this.embedCollection.set(channelID, [...this.embedCollection.get(channelID), embed]);
            }
        }
    }

module.exports = GaldinoClient;
