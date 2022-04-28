const express = require('express'),
	app = express(),
	{ API } = require('../config'),
	{ promisify } = require('util'),
	readdir = promisify(require('fs').readdir),
	favicon = require('serve-favicon')
	cors = require('cors');

module.exports = async client => {
	const routes = (await readdir('./http/routes')).filter((v, i, a) => a.indexOf(v) === i),
		endpoints = [];

	// IP logger

	app.use(function(req, res, next) {
		res.setHeader('Access-Control-Allow-Origin', '*');
		if (req.originalUrl !== '/favicon.ico' || client.config.debug) {
			client.logger.log(`IP: ${req.ip || req.ips} -> ${req.originalUrl}`);
		}
		next();
	});

	// Token system
	/*app.use((req, res, next) => {
		if (API.secure && API.token !== req.query.token) {
			return res.json({ error: 'Invalid API token' });
		}
		next();
	}*/

	// Token system
	app.use((req, res, next) => {
		if (req.originalUrl !== '/webhook') {
			if (API.secure && API.token !== req.query.token) {
				return res.json({ error: 'Invalid API token' });
			}
			next();
		}
	});

	// Get all routes
	for (const route of routes) {
		if (route !== 'index.js') {
			app.use(`/${route.replace('.js', '')}`, require(`./routes/${route}`)(client));
			endpoints.push(`${route.replace('.js', '')}:`, ...(require(`./routes/${route}`)(client).stack.map(item => `\t ${item.route.path}`).filter((v, i, a) => a.indexOf(v) === i && v !== '/')));
		}
	}

	// Create web server
	app
		.use(favicon('./assets/favicon.ico'))
		.use(cors())
		.disable('x-powered-by')
		.set('trust proxy', true)
		.engine('html', require('ejs').renderFile)
		.set('view engine', 'ejs')
		.set('views', './http/views')
		.get('/', (req, res) => {
			res
				.type('text/plain')
				.send([
					`API server for ${client.user.tag}`,
					'Endpoints:',
					endpoints.join('\n'),
				].join('\n'));
		})
		// Make sure web scrapers aren't used
		.get('/robots.txt', function(req, res) {
			res
				.type('text/plain')
				.send('User-agent: *\ndisallow: /');
		})
		.get('*', async function(req, res) {
			res
				.status(404)
				.render('404-page')
			
		})
		// Run the server
		.listen(API.port, () => {
			client.logger.web(`WebServer iniciado na porta:${API.port}`);
		})
		.on('error', (err) => {
			client.logger.error(`Erro ao iniciar WebServer: ${err.message}`);
		});
};
