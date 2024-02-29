const skills = require('../data/skills.json');

function getSkills(req, res) {
    res.json(skills);
}

module.exports = {
    getSkills,
};
