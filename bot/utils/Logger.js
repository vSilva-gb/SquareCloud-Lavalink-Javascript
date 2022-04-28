// 
const chalk = require('chalk'),
	moment = require('moment-timezone');

// Logger
exports.log = (content, type = 'log') => {
	if (content == 'error') return;
	const timestamp = `[${moment().tz('America/Sao_Paulo').format('HH:mm')}]:`;
	switch (type) {
	case 'log':

		console.log(`${timestamp} ${('📜 ')} ${content} `);
		break;
	case 'warn':

		console.log(`${timestamp} ${('⚠️ ')} ${chalk.bold.yellowBright(content)} `);
		break;
	case 'error':

		console.log(`${timestamp} ${('❌ ')} ${chalk.bold.red(content)} `);
		break;
	case 'debug':
	
		console.log(`${timestamp} ${chalk.bgBlue('🐛 ')} ${content} `);
		break;
	case 'cmd':

		console.log(`${timestamp} ${chalk.bgBlue('')} ${content}`);
		break;
	case 'ready':

		console.log(`${timestamp} ${('✔️ ')} ${content}`);
		break;
	case 'music':

		console.log(`${timestamp} ${(`🎵 ${chalk.bold.redBright('[LAVALINK]')}` )} ${chalk.bold.blueBright(content)}`)
		break;

	case 'web':

		console.log(`${timestamp} ${chalk.bold.blueBright('🌐 ')} ${content}`)
		break;

	default:
		break;
	}
};

exports.warn = (...args) => this.log(...args, 'warn');

exports.error = (...args) => this.log(...args, 'error');

exports.debug = (...args) => this.log(...args, 'debug');

exports.cmd = (...args) => this.log(...args, 'cmd');

exports.ready = (...args) => this.log(...args, 'ready');

exports.music = (...args) => this.log(...args, 'music');

exports.web = (...args) => this.log(...args, 'web');