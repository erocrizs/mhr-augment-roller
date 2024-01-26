const skills = require('../data/skills.json');

function getSkillDetails(req, res) {
    const name = req.params.name;
    const details = skills.find(skill => skill.name === name);

    if (!details) {
        res.status(404);
        res.json({message: "NOT_FOUND"});
        return;
    }

    res.json(details);
}

module.exports = {
    getSkillDetails,
};
