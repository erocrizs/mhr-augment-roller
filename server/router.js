const express = require('express');
const { getArmorSets, getArmorSetDetails } = require('./middlewares/armorSets');
const router = express.Router();

router.get('/sets', getArmorSets);
router.get('/sets/:set', getArmorSetDetails);

module.exports = router;
