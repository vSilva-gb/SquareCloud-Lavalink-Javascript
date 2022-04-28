const users = require('../database/models/Author');

module.exports = async (client, author) => {
    const u = await users.findOne({ authorID: author.id});
    if (!u) return false;
    if (!u.lastVoted) u.lastVoted = Date.now();
    if (u.lastVoted < Date.now() - 43200000) {
        u.voted = false;
        await u.save().catch(e => console.log(e.message));
        return false;
    }
    else {
        u.voted = true;
        await u.save().catch(e => console.log(e.message));
        return true;
    }
}