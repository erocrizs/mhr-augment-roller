const express = require('express');
const { getArmorSets, getArmorSetDetails } = require('./middlewares/armorSets');
const { getSkillDetails } = require('./middlewares/skills');
const { getPoolAugments } = require('./middlewares/augments');
const router = express.Router();

function debugMiddleware(req, res, next) {
    console.debug('Accessing ' + req.path);
    console.debug('Params ' + JSON.stringify(req.params));
    next();
}

router.get('/sets', debugMiddleware, getArmorSets);
router.get('/sets/:set', debugMiddleware, getArmorSetDetails);
router.get('/skills/:name', debugMiddleware, getSkillDetails);
router.get('/augments/:pool', debugMiddleware, getPoolAugments);

module.exports = router;
