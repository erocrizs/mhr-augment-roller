const allAugments = require('../data/augments.json');

function getPoolAugments(req, res) {
    const pool = Number(req.params.pool);
    if (isNaN(pool)) {
        res.status(404);
        res.json({message: "BAD_REQUEST"});
        return;
    }
    const augments = allAugments.filter(aug => aug.pool === pool);

    if (augments.length === 0) {
        res.status(404);
        res.json({message: "NOT_FOUND"});
        return;
    }

    res.json(augments);
}

module.exports = {
    getPoolAugments,
};
