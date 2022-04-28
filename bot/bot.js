const Client = require('./base/GaldinoClient.js');
require('./structures');

const client = new Client(),
    { promisify } = require('util'),
    readdir = promisify(require('fs').readdir),
    path = require('path');

(async () => {
    await carregarComandos();

    await carregarEventos();

    client.translations = await require('./helpers/LanguageManager')();

    client.mongoose.init(client);

    const token = client.config.token;
    client.login(token).catch(e => client.logger.error(e.message));
})();

async function carregarComandos() {
    const cmdFolder =(await readdir('./commands/')).filter((v, i, a) => a.indexOf(v) === i);
    client.logger.log(`Carregando comandos!`);
    cmdFolder.forEach(async (dir) => {
        const foundCmd = (await readdir('./commands/' + dir + '/')).filter((v, i, a) => a.indexOf(v) === i);
        foundCmd.forEach((cmd) => {
            try {
                client.carregarComando('./commands/' + dir, cmd)
            } catch (err) {
				if (client.config.debug) console.log(err);
				client.logger.error(`Impossível carregar o comando ${cmd}: ${err}`);
            }
        });
    });
    client.logger.ready('Todos comandos carregados!')
}

async function carregarEventos() {
	const eventFolder = await readdir('./events/');
	client.logger.log(`Carregando eventos!`);
	eventFolder.forEach(async pasta => {
		const subFolders = await readdir('./events/' + pasta + '/');
		subFolders.forEach(async arquivo => {
			delete require.cache[arquivo];
			const { name } = path.parse(arquivo);
			try {
				const event = new (require(`./events/${pasta}/${arquivo}`))(client, name);
				if (pasta == 'giveaway') {
					client.giveawaysManager.on(name, (...args) => event.run(client, ...args));
				} else if (pasta == 'audio') {
					client.manager.on(name, (...args) => event.run(client, ...args));
				} else {
					client.on(name, (...args) => event.run(client, ...args));
				}
			} catch (err) {
				client.logger.error(`Ocorreu um erro ao carregar o evento: ${name} erro: ${err}.`);
                console.log(err)
			}
		});
	});
    client.logger.ready('Todos os eventos carregados!');
}

process.on('unhandledRejection', err => {
    //client.logger.error(`Unhandled promise rejection: ${err.message}.`);
    console.log(err);
});