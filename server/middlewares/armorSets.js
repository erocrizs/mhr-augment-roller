const armorAugPool = require('../data/armorAugPool.json');

function getArmorSets(req, res) {
    const setNames = armorAugPool.map(set => set.ArmorSeries);
    res.json(setNames);
}

function getArmorSetDetails(req, res) {
    const setName = req.params.set;
    const details = armorAugPool.find(set => set.ArmorSeries === setName);

    if (!details) {
        res.status(404);
        res.send({message: "NOT_FOUND"});
    }

    res.json(details);
}

module.exports = {
    getArmorSets,
    getArmorSetDetails,
};
