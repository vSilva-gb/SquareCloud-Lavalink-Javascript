const { logger } = require('./utils');
const { AutoPoster} = require('topgg-autoposter');
const { ShardingManager } = require('discord.js');

(async () => {

    const manager = new ShardingManager('./bot.js', {
        totalShards: 'auto',
        token: require('./config.js').token,
    });

    try {
    const poster = AutoPoster(require('./config.js').api_keys.topggtoken, manager, {interval: 3.6e+6})
        poster.once('posted', (stats) => {
        logger.warn(`Status enviado para top.gg | ${stats.serverCount} servidores atualmente.`)
    })
    } catch (error) {
        logger.error(`Ops, aconteceu um erro ao enviar o status para o TOP.GG: ${error.message}`)
    }

    logger.warn('Inicializando Shard(s)...')
    try {
        await manager.spawn();
    } catch (err) {
        logger.error(`Ops, aconteceu um erro ao carregar as shard: ${err.message}`);
    }

    manager.on('shardCreate', (shard) => {
        logger.log(`Shard ${shard.id} iniciada.`)
    })
})();