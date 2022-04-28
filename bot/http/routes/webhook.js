const express = require('express'),
    Topgg = require('@top-gg/sdk'),
    webhook = new Topgg.Webhook('a.b.n.e.r.123'),
    { voteReward } = require('../../utils'),
	router = express.Router();

module.exports = (client) => {
    router.get('/', async (req, res) => {
        res.status(401);
        res.end();
    });

    router.post('/', webhook.listener(async (vote) => {
            const user = await client.users.fetch(vote.user);
            voteReward(client, user);
        /*const user = vote.user;
        const fetchedUser = await client.users.fetch(user, { force: true});
        try {
            fetchedUser?.send({ content: '**Obrigado por votar, assim você apoia o meu desenvolvimento.\nVocê poderá votar novamente em 12 horas.**'});
        } catch (err) {
            return;
        }*/
    }));

    return router;
}