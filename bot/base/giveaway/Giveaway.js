const merge = require('deepmerge'), 
	{ EventEmitter} = require('events');
const { resolve } = require('path');

class Giveaway extends EventEmitter {
	constructor(manager, options) {
		super()
			
		this.manager = manager;
					
		this.client = manager.client;

		this.premio = options.premio

		this.iniciadoEm = options.iniciadoEm

		this.finalizadoEm = options.finalizadoEm

		this.finalizado = options.finalizado

		this.channelID = options.channelID

		this.messageID = options.messageID

		this.guildID = options.guildID

		this.contadorGanhadores = options.contadorGanhadores

		this.ganhadoresID = options.ganhadoresID

		this.criadoPor = options.criadoPor

		this.messages = options.messages;

		this.extraData = options.extraData

		this.options = options

		this.message = null
	}

	get messageURl() {
		return `https://discord.com/channels/${this.guildID}/${this.channelID}/${this.messageID}`;
	}

	get tempoRestante() {
		return this.finalizadoEm - Date.now();
	}

	get duracaoSorteio() {
		return this.finalizadoEm - this.iniciadoEm;
	}

	get embedColor() {
		return this.options.embedColor || this.manager.options.default.embedColor
	}

	get embedColorEnd() {
		return this.options.embedColorEnd || this.manager.options.default.embedColorEnd;
	}

	get reaction() {
		return this.options.reaction || this.manager.options.default.reaction
	}

	get botsPodemGanhar() {
		return this.options.botsPodemGanhar || this.manager.options.default.botsPodemGanhar;
	}

	get excetoPermissoes() {
		return this.options.excetoPermissoes || this.manager.options.default.excetoPermissoes
	}

	async excetoMembros(member) {
		if (this.options.excetoMembros && typeof this.options.excetoMembros === 'function') {
			try {
				return this.options.excetoMembros(member);
			} catch (error) {
				console.log(error);
				return false;
			}
		}
		if (this.manager.options.default.excetoMembros && typeof this.manager.options.default.excetoMembros === 'function') {
			return this.manager.options.default.excetoMembros(member);
		}
		return false;
	}

	get channel() {
		return this.client.channel.cache.get(this.channel.id);
	}

	get textoTempoRestante() {
		const roundTowardsZero = this.remainingTime > 0 ? Math.floor : Math.ceil;
		// Gets days, hours, minutes and seconds
		const days = roundTowardsZero(this.remainingTime / 86400000),
			hours = roundTowardsZero(this.remainingTime / 3600000) % 24,
			minutes = roundTowardsZero(this.remainingTime / 60000) % 60;
		let seconds = roundTowardsZero(this.remainingTime / 1000) % 60;
		// Increment seconds if equal to zero
		if (seconds === 0) seconds++;
		// Whether values are inferior to zero
		const isDay = days > 0,
			isHour = hours > 0,
			isMinute = minutes > 0,
			dayUnit = days < 2 && (this.messages.units.pluralS || this.messages.units.days.endsWith('s')) ? this.messages.units.days.substr(0, this.messages.units.days.length - 1)	: this.messages.units.days,
			hourUnit = hours < 2 && (this.messages.units.pluralS || this.messages.units.hours.endsWith('s')) ? this.messages.units.hours.substr(0, this.messages.units.hours.length - 1) : this.messages.units.hours,
			minuteUnit = minutes < 2 && (this.messages.units.pluralS || this.messages.units.minutes.endsWith('s')) ? this.messages.units.minutes.substr(0, this.messages.units.minutes.length - 1) : this.messages.units.minutes,
			secondUnit = seconds < 2 && (this.messages.units.pluralS || this.messages.units.seconds.endsWith('s')) ? this.messages.units.seconds.substr(0, this.messages.units.seconds.length - 1) : this.messages.units.seconds;
		// Generates a first pattern
		const pattern =
            (!isDay ? '' : `{days} ${dayUnit}, `) +
            (!isHour ? '' : `{hours} ${hourUnit}, `) +
            (!isMinute ? '' : `{minutes} ${minuteUnit}, `) +
            `{seconds} ${secondUnit}`;
		// Format the pattern with the right values
		return this.messages.timeRemaining
			.replace('{duration}', pattern)
			.replace('{days}', days.toString())
			.replace('{hours}', hours.toString())
			.replace('{minutes}', minutes.toString())
			.replace('{seconds}', seconds.toString());
	}

	get data() {
		return {
			messageID: this.messageID,
			channelID: this.channelID,
			guildID: this.guildID,
			iniciadoEm: this.iniciadoEm,
			finalizadoEm: this.finalizadoEm,
			finalizado: this.finalizado,
			contadorGanhadores: this.contadorGanhadores,
			ganhadores: this.ganhadoresID,
			premio: this.premio,
			messages: this.messages,
			criadoPor: this.criadoPor,
			embedColor: this.options.embedColor,
			embedColorEnd: this.options.embedColorEnd,
			botsPodemGanhar: this.botsPodemGanhar,
			excetoPermissoes: this.excetoPermissoes,
			excetoMembros: this.excetoMembros,
			reaction: this.options.reaction,
			requirements: this.requirements,
			ganhadoresIDs: this.ganhadoresID,
			extraData: this.extraData,
		};
	}

	async carregarMensagens() {
		return new Promise(async (resolve, reject) => {
			if (!this.messageID) return;
			const mensagem = await this.channel.messages.fetch(this.messageID).catch(() => {});
			if (!mensagem) {
				this.manager.giveaways = this.manager.giveaways.filter((g) => g.messageID !== this.messageID);
				this.manager.deletarSorteio(this.messageID);
				return reject('Não foi possivel carregar a mensagem com o ID ' + this.messageID + '.');
			}
			this.message = message
			resolve(this.message)
		});
	}

	async verificarEntradaDoUsuario(user) {
		const guild = this.channel.guild;
		if (!user) return false;
		const member = guild.member.cache.get(user.id) || await guild.members.fetch(user.id);
		const excetoMembros = await this.excetoMembros(member);
		if (excetoMembros) return false;
		const hasPermission = this.excetoPermissoes.some((permission) => member.hasPermission(permission));
		if (hasPermission) return false;
		return true;
	}

	async sortear(contadorGanhadores) {
		if (!this.message) return [];
		const reactions = this.message.reactions.cache;
		const reaction = reactions.get(this.reaction) || reactions.find((r) => r.emoji.name === this.reaction);
		if (!reaction) return [];
		const guild = this.channel.guild;
		if (this.manager.options.hasGuildMembersIntent) await guild.members.fetch();
		const users = (await reaction.users.fetch())
			.filter((u) => !u.bot || u.bot === this.botsPodemGanhar)
			.filter((u) => u.id !== this.message.client.user.id); 

		const ganhadoresSorteados = users.random(contadorGanhadores || this.contadorGanhadores);
		const ganhadores = [];

		for (const u of ganhadoresSorteados) {
			const entradaValida = await this.verificarEntradaDoUsuario(u) && !ganhadores.some((ganhadores) => ganhadores.id === u.id);
			if (entradaValida) {
				ganhadores.push(u);
			} else {
				for (const user of users.array()) {
					const jaSorteado = ganhadores.some((ganhadores) => ganhadores.id === user.id);
					if (jaSorteado) continue;
					const entradaDoUsuarioValida = await this.verificarEntradaDoUsuario(user);
					if (!entradaDoUsuarioValida) {continue;} else {
						ganhadores.push(user);
						break
					}
				}
			}
		}
		return ganhadores.map((user) => guild.members.cache.get(user.id) || user);
	}

	editar(options = {}) {
		return new Promise(async (resolve, reject) => {
			if (this.finalizado) {
				return reject('O sorteio com o ID da mensagem' + this.messageID + 'já foi finalizado.');
			}
			if (!this.channel) {
				return reject('Não foi possivel encontrar o canal do sorteio com a mensagem ID ' + this.messageID + '.');
			}
			await this.carregarMensagens();
			if (!this.message) {
				return reject('Não foi possivel encontrar o canal do sorteio com a mensagem ID ' + giveaway.messageID + '.');
			}
			if (options.novoContadorGanhadores) this.contadorGanhadores = options.novoContadorGanhadores;
			if (options.novoPremio) this.premio = options.novoPremio
			if (options.addTempo) this.finalizadoEm = this.finalizadoEm = options.addTempo;
			if (options.setEndTimestamp) this.finalizadoEm = options.setEndTimestamp;
			if (options.newMessages) this.messages = merge(this.messages, options.newMessages);
			if (options.newExtraData) this.extraData = options.newExtraData;
			await this.manager.editarSorteio(this.messageID, this.data);
			resolve(this)
		});
	}

	finalizar() {
		return new Promise(async (resolve, reject) => {
			if (this.finalizado) {
				return reject('O sorteio com o ID da mensagem' + this.messageID + 'já foi finalizado.');
			}
			if (!this.channel) {
				return reject('Não foi possivel encontrar o canal do sorteio com a mensagem ID ' + this.messageID + '.');
			}
			this.finalizado = true;
			await this.carregarMensagens();
			if (!this.message) {
				return reject('Não foi possivel encontrar o canal do sorteio com a mensagem ID ' + giveaway.messageID + '.');
			}
			const ganhadores = await this.sortear;
			this.manager.emit('giveawayEnded', this, ganhadores);
			this.manager.editarSorteio(this.messageID, this.data);
			if (ganhadores.length > 0 && ganhadores.length >= this.contadorGanhadores) {
				this.ganhadoresID = ganhadores.map((w) => w.id);
				this.manager.editarSorteio(this.messageID, this.data);
				const embed = this.manager.gerarEmbedFim(this, ganhadores);
				this.message.edit({ content: this.messages.sorteioFinalizado, embeds: [embed] });
				const ganhadoresFormatados = ganhadores.map((w) => `<@${w.id}>`).join(', ');
				this.message.channel.send(
					this.messages.mensagemVencedor
						.replace('{winners}', ganhadoresFormatados)
						.replace('{premio}', this.premio)
						.replace('{messageURl}', this.messageURl), { allowedMentions: {users: ganhadores.map(w => w.id) } },
				);
				resolve(ganhadores);
			} else {
				const embed = this.manager.gerarSemParticipantesValidosEmbed(this);
				this.message.edit({ content: this.messages.sorteioFinalizado, embeds: [embed] });
				resolve();
			}
		});
	}

	sortearNovamente(options) {
		return new Promise(async(resolve, reject) => {
			if (this.finalizado) {
				return reject('O sorteio com o ID da mensagem' + this.messageID + 'já foi finalizado.');
			}
			if(!this.channel) {
				return reject('Não foi possivel encontrar o canal do sorteio com a mensagem ID ' + this.messageID + '.');
			}
			await this.carregarMensagens();
			if(this.message) {
				return reject('Não foi possivel encontrar o canal do sorteio com a mensagem ID ' + giveaway.messageID + '.');
			}
			const ganhadores = await this.sortear(options.contadorGanhadores);
			if (ganhadores.length > 0) {
				this.ganhadoresID = ganhadores.map((w) => w.id);
				this.manager.editarSorteio(this.messageID, this.data);
				const embed = this.manager.gerarEmbedFim(this, ganhadores);
				this.message.edit(this.messages.sorteioFinalizado, { embed });
				const ganhadoresFormatados = ganhadores.map((w) => '<@' + w.id + '>').join(', ');
				this.channel.send(options.message.parabens
					.replace('{ganhadores}', ganhadoresFormatados)
					.replace('{messageURl', this.messageURl),
					);
				resolve(ganhadores)
			} else {
				this.channel.send(options.mesages.error);
				resolve(new Array());
			}
		});
	}
}

module.exports = Giveaway;
