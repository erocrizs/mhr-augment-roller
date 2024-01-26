const express = require('express');
const { getArmorSets, getArmorSetDetails } = require('./middlewares/armorSets');
const { getSkillDetails } = require('./middlewares/skills');
const router = express.Router();

router.get('/sets', getArmorSets);
router.get('/sets/:set', getArmorSetDetails);
router.get('/skills/:name', getSkillDetails);

module.exports = router;
