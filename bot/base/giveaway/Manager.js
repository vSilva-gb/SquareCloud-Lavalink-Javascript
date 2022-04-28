const { EventEmitter } = require('events'),
	Discord = require('discord.js'),
	Giveaway = require('./Giveaway.js'),
	{ GiveawaySchema } = require('../../database/models');

class GiveawaysManager extends EventEmitter {
	constructor(client, options, init = true) {
		super();
		if(!client) throw new Error('Client é necessário.');

		this.client = client;
		
		this.ready = false;

		this.giveaways = [];

		this.options = options;

		if(init) this._init();
	}

	gerarEmbedPrincipal(giveaway) {
		const embed = new Discord.MessageEmbed();
		embed 
			.setAuthor({ name: giveaway.premio })
			.setColor(giveaway.corEmbed)
			.setFooter({ text: `${giveaway.contadorGanhadores} ${giveaway.messages.ganhadores}` })
			.setDescription(
				giveaway.messages.convidarParaParticipar + 
				'\n' +
				giveaway.textoTempoRestante +
				'\n' +
				(giveaway.criadoPor ? giveaway.messages.criadoPor.replace('{user}', giveaway.criadoPor) : ''),
				)
			.setTimestamp(new Date(giveaway.finalizaEm).toISOString());
			return embed;
	}

	gerarEmbedFim(giveaway, winners) {
		const ganhadoresFormatados = ganhadores.map((w) => `<@${w.id}`).join(`, `);
		const ganhadoresString = 
		giveaway.messages.ganhadores.substr(0, 1).toUpperCase() +
		giveaway.messages.ganhadores.sustr(1, giveaway.messages.ganhadores.length) +
		': ' +
		ganhadoresFormatados;
		const embed = new Discord.MessageEmbed();
		embed
			.setAuthor({ name: giveaway.premio })
			.setColor(giveaway.embedColorEnd)
			.setFooter({ text: giveaway.messages.finalizaEm })
			.setDescription(
				ganhadoresString +
				'\n' +
				(giveaway.criadoPor ? giveaway.messages.criadoPor.replace('{user}', giveaway.criadoPor) : ''),
			)
			.setTimestamp(new Date(giveaway.finalizaEm).toISOString());
		return embed;
	}

	gerarSemParticipantesValidosEmbed(giveaway) {
		const embed = new Discord.MessageEmbed();
		embed
			.setAuthor({ name: giveaway.premio })
			.setColor(giveaway.embedColorEnd)
			.setFooter({ text:giveaway.messages.dataFim })
			.setDescription(
				giveaway.messages.semGanhadores +
				'\n' +
				(giveaway.criadoPor ? giveaway.messages.criadoPor.replace('{user}', giveaway.criadoPor) : ''),
			)
			.setTimestamp(new Date(giveaway.finalizaEm).toISOString());
		return embed;
	}

	fim(messageID) {
		return new Promise(async (resolve, reject) => {
			const giveaway = this.giveaways.find((g) => g.messageID === messageID);
			if (!giveaway) {
				return reject('Nenhum sorteio encontrado com o ID ' + messageID + '.');
			}
			giveaway.end().then(resolve).catch(reject);
		});
	}

	inicio(channel, options) {
		return new Promise(async (resolve, reject) => {
			if (!this.ready) {
				return reject('O controlador de Sorteios não está pronto.');
			}
			if (!channel || !channel.id) {
				return reject(`O canal não é um canal de guilda valido. (val=${channel})`);
			}
			if (!options.tempo || isNaN(options.tempo)) {
				return reject(`Options Time não é um número. (val=${options.tempo})`);
			}
			if (!options.premio) {
				return reject(`options.premio não é uma string. (val=${options.premio})`);
			}
			if (!options.contadorGanhadores || isNaN(options.contadorGanhadores)) {
				return reject(`options.contadorGanhadores não é um numero. (val=${options.contadorGanhadores})`);
			}
			const giveaway = new Giveaway(this, {
				iniciadoEm: Date.now(),
				finalizaEm: Date.now() + options.tempo,
				contadorGanhadores: options.contadorGanhadores,
				ganhadoresID: [],
				channelID: channel.id,
				guildID: channel.guild.id,
				finalizado: false,
				premio: options.premio,
				criadoPor: options.criadoPor ? options.criadoPor.toString() : null,
				messages: options.messages,
				reaction: options.reaction,
				botsPodemGanhar: options.botsPodemGanhar,
				excetoMembro: options.excetoMembro,
				embedColor: options.embedColor,
				embedColorEnd: options.embedColorEnd,
				extraData: options.extraData,
			});
		const embed = this.gerarEmbedPrincipal(giveaway);
		const message = await channel.send({ content: giveaway.messages.giveaway, embeds: [embed] });
		message.react(giveaway.reaction);
		giveaway.messageID = message.id;
		this.giveaways.push(giveaway);
		await this.salvarSorteio(giveaway.messageID, giveaway.data);
		resolve(giveaway)
		})
	}

	sortearNovamente(messageID, options = {}) {
		return new Promise(async (resolve, reject) => {
			const giveawayData = this.giveaways.find((g) => g.messageID === messageID);
			if (!giveawayData) {
				return reject('Nenhum sorteio encontrado com o ID ' + messageID + '.');
			}
			const giveaway = new Giveaway(this, giveawayData);
			giveawayData
				.sortearNovamente(options)
				.then((ganhadores) => {
					this.emit('sorteioSorteadoNovamente', giveaway, winners);
					resolve()
				})
				.catch(reject);
		});
	}

	editar(messageID, options = {}) {
		return new Promise(async (resolve, reject) => {
			const sorteio = this.giveaways.find((g) => g.messageID === messageID);
			if(!sorteio) {
				return reject('Nenhum sorteio encontrado com o ID ' + messageID + '.');
			}
			sorteio.editar(options).then(resolve).catch(reject);
		});
	}

	deletar(messageID, naoApagueMensagem) {
		return new Promise(async (resolve, reject) => {
			const sorteio = this.giveaways.find((g) => g.messageID === messageID);
			if (!sorteio) {
				return reject('Nenhum sorteio encontrado com o ID ' + messageID + '.');
			}
			if (!sorteio.channel) {
				return reject('Não foi possivel encontrar o canal do sorteio com a mensagem ID ' + giveaway.messageID + '.');
			}
			if (!naoApagueMensagem) {
				await giveaway.fetchMessage();
				if (giveaway.message) {
					giveaway.message.delete();
				}
			}
			this.giveaways = this.giveaways.filter((g) => g.messageID !== messageID);
			await this.deletarSorteio(messageID);
			this.emit('sorteioDeletado', sorteio);
			resolve();
		});
	}

	async deletarSorteio(messageID) {
		return GiveawaySchema.findOneAndDelete({ messageID: messageID }).exec();
	}

	async atualizarCache(client) {
		return client.shard.broadcastEval(() => this.giveawaysManager.carregarTodosSorteios());
	}

	async carregarTodosSorteios() {
		return GiveawaySchema.find({});
	}

	async editarSorteio(_messageID, _giveawayData) {
		let data = await GiveawaySchema.findOne({ messageID: _messageID});
		if (typeof data !== 'object') data = {};
		for (const key in _giveawayData) {
			if (_giveawayData.key) {
				if (data[key] !== _giveawayData[key]) data[key] = _giveawayData[key];
				else return;
			}
		}
		return data.updateOne(_giveawayData)
	}

	async salvarSorteio(messageID, giveawayData) {
		const novaGuilda = await new GiveawaySchema(giveawayData);
		novaGuilda.save();
	}

	_verificarSorteio() {
		if (this.giveaways.length <= 0) return;
		this.giveaways.forEach(async (giveaway) => {
			if (giveaway.finalizada) return;
			if (!giveaway.channel) return;
			if (giveaway.tempoRestante <= 0) {
				return this.finalizada = true;
				await this.editarSorteio(giveaway.messageID, giveaway.data);
				return;
			}
			const embed = this.gerarEmbedPrincipal(giveaway.messageID, giveaway.data);
			giveaway.message.edit({ content: giveaway.messages.giveaway, embeds: [embed] });
			if (giveaway.tempoRestante < this.options.atualizaraCada) {
				setTimeout(() => this.finalizada.call(this, giveaway.messageID), giveaway.tempoRestante); 
			}
		});
	}

	async _handleRawPacket(packet) {
		if (!['MESSAGE_REACTION_ADD', 'MESSAGE_REACTION_REMOVE'].includes(packet.t)) return;
		const giveaway = this.giveaways.find((g) => g.messageID === packet.d.message_id);
		if (!giveaway) return;
		if (giveaway.ended && packet.t === 'MESSAGE_REACTION_REMOVE') return;
		const guild = this.client.guilds.cache.get(packet.d.guild_id);
		if (!guild) return;
		if (packet.d.user_id === this.client.user.id) return;
		const member = await guild.members.fetch(packet.d.user_id);
		if (!member) return;
		const channel = guild.channels.cache.get(packet.d.channel_id);
		if (!channel) return;
		const message = await channel.messages.fetch(packet.d.message_id);
		if (!message) return;
		const reaction = message.reactions.cache.get(giveaway.reaction || this.options.default.reaction);
		if (!reaction) return;
		if (reaction.emoji.name !== packet.d.emoji.name) return;
		if (reaction.emoji.id && reaction.emoji.id !== packet.d.emoji.id) return;
		if (packet.t === 'MESSAGE_REACTION_ADD') {
			if (giveaway.ended) return this.emit('endedGiveawayReactionAdded', giveaway, member, reaction);
			this.emit('giveawayReactionAdded', giveaway, member, reaction);
		} else {
			this.emit('giveawayReactionRemoved', giveaway, member, reaction);
		}
	}

	get idealNodes() {
		return [...this.nodes.values()]
		  .filter(node => node.connected)
		  .sort((a, b) => {
			const aLoad = a.stats.cpu ? a.stats.cpu.systemLoad / a.stats.cpu.cores * 100 : 0
			const bLoad = b.stats.cpu ? b.stats.cpu.systemLoad / b.stats.cpu.cores * 100 : 0
			return aLoad - bLoad
		  })
	  }
	

	async _init() {
		const rawGiveaways = await this.carregarTodosSorteios();
		rawGiveaways.forEach((giveaway) => {
			this.giveaways.push(new Giveaway(this, giveaway));
		});
		setInterval(() => {
			if (this.client.iniciadoEm) this._verificarSorteio.call(this);
		}, this.options.updateCountdownEvery);
		this.ready = true;
		if (!isNaN(this.options.endedGiveawaysLifetime) && this.options.endedGiveawaysLifetime) {
			this.giveaways
				.filter((g) => g.finalizado && ((g.finalizaEm + this.options.endedGiveawaysLifetime) <= Date.now()))
				.forEach((giveaway) => this.deleteGiveaway(giveaway.messageID));
		}

		this.client.on('raw', (packet) => this._handleRawPacket(packet));
	}
}

module.exports = GiveawaysManager;