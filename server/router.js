const express = require('express');
const { getArmorSets, getArmorSetDetails } = require('./middlewares/armorSets');
const { getSkills } = require('./middlewares/skills');
const { getPoolAugments } = require('./middlewares/augments');
const router = express.Router();

router.get('/sets', getArmorSets);
router.get('/sets/:set', getArmorSetDetails);
router.get('/skills', getSkills);
router.get('/augments/:pool', getPoolAugments);

module.exports = router;
