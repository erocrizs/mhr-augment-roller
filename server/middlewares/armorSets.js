const armorAugPool = require('../data/armorAugPool.json');
const armorPieces = require('../data/armorPieces.json');

function getArmorSets(req, res) {
    const setNames = armorAugPool.map(set => set.name);
    res.json(setNames);
}

function getArmorSetDetails(req, res) {
    const setName = req.params.set;
    const details = armorAugPool.find(set => set.name === setName);

    if (!details) {
        res.status(404);
        res.json({message: "NOT_FOUND"});
        return;
    }

    details.pieces = armorPieces.filter(ap => ap.set === setName);
    res.json(details);
}

module.exports = {
    getArmorSets,
    getArmorSetDetails,
};
