
const mongoose = require('mongoose');

module.exports = {
	init: (client) => {
		const dbOptions = {
			autoIndex: false,
			maxPoolSize: 5,
			connectTimeoutMS: 10000,
			family: 4,
			useUnifiedTopology: true,
		};
		mongoose.connect(client.config.MongoDBURl, dbOptions);
		mongoose.Promise = global.Promise;
		mongoose.connection.on('connected', () => {
			client.logger.ready('[MONGODB] Conectado a database!');
		});
		mongoose.connection.on('err', (err) => {
			client.logger.error(`[MONGODB] Um erro foi encontrado: \n ${err.stack}`);
		});
		mongoose.connection.on('disconnected', () => {
			client.logger.warn('[MONGODB] Desconectado, reconectando!');
		});
	},
	async ping() {
		const currentNano = process.hrtime();
		await mongoose.connection.db.command({ ping: 1 });
		const time = process.hrtime(currentNano);
		return (time[0] * 1e9 + time[1]) * 1e-6;
	},
};