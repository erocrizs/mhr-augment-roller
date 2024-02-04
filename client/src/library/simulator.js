import { WeightedListRandom, getRandomFromList } from "./random.js";

export const augmentModes = {
    DEFAULT: 'default',
    DEFENSE: 'defense',
    SLOT: 'slot+',
    SKILL: 'skill+',
};

const elementToResistanceMap = {
    'Fire': 'fireRes',
    'Water': 'waterRes',
    'Thunder': 'thunderRes',
    'Ice': 'iceRes',
    'Dragon': 'dragonRes',
};

/**
 * Assumptions about augment algorithm:
 * 1) There is a limit of seven maximum total augment
 * 2) The initial preset rolls per augmenting mode (see getFirstAugments) are counted towards the 50 maximum rolls allowed
 * 3) Skill+ and Skill- augments that happen to cancels each other's effect will not be removed from the seven slots
 * 4) Skill+ augments will not roll for skills that are already maxed out at the time of rolling
 * 5) Skill- augments will not roll for skills that are already 0 at the time of rolling
 * 6) "Limit of 5 total skills" means the total skill points can go over 5 as long as the number of skill types is at most 5
 * 7) The "fill quota defense" happens after all 50 rolls, hence not affecting by clearing augments with net 0 defense
 * 8) Rolls to change [-def, -ele] to [+def, +ele] and [+-skill] to [+def] while using Defense Mode augmenting counts toward the 50 maximum rolls allowed
 */
export function simulateAugment(armorPiece, augmentPool, budget, skills, augmentMode) {
    const augmentedArmorPiece = structuredClone(armorPiece);
    const appliedAugments = [];
    const augmentModePool = createAugmentModePool(augmentPool, augmentMode);

    let netDefenseChange = 0;
    let rollsLeft = 50;
    let firstRolls = augmentModePool.getFirstAugments();
    let remainingBudget = budget;

    while (rollsLeft > 0 && remainingBudget > 0 && appliedAugments.length < 7) {
        let augment = null;
        let rolls = 0;

        if (firstRolls) {
            let { value: firstRollResult, done } = firstRolls.next();

            if (done) {
                firstRolls = null;
                continue;
            }

            augment = firstRollResult.augment;
            rolls = firstRollResult.rolls;
        }
        else {
            const randomResult = augmentModePool.getRandomAugment();
            augment = randomResult.augment;
            rolls = randomResult.rolls;
        }

        rollsLeft -= rolls;

        if (rollsLeft < 0) {
            // last roll was skipped internally
            break;
        }

        let overBudget = augment.cost > remainingBudget;
        if (overBudget) {
            // skip the augment if it is over the budget
            continue;
        }

        let isDefenseType = augment.type.match(/^Defense[+-]$/);
        if (isDefenseType && (netDefenseChange + augment.value) === 0) {
            // if all defense augments total to zero, then clear all those augments

            for(let i = appliedAugments.length - 1; i >= 0; i--) {
                const appliedDefAugment = appliedAugments[i];
                if (appliedDefAugment.augment.match(/^Defense[+-]$/)) {
                    appliedAugments.splice(i, 1);
                    undoAugment({
                        augmentedArmorPiece, 
                        appliedAugment: appliedDefAugment
                    });
                    remainingBudget += appliedDefAugment.augment.cost;
                }
            }

            netDefenseChange = 0;
            continue;
        }

        try {
            const appliedAugment = applyAugment({ augmentedArmorPiece, augment, skills });
            appliedAugments.push(appliedAugment);
            remainingBudget -= augment.cost;
            if (isDefenseType) {            
                netDefenseChange += augment.value;
            }
        }
        catch (e) {
            // augment not applicable
        }
    }

    if (remainingBudget > 0 && appliedAugments.length < 7) {
        const fillResult = augmentModePool.getFillCostAugment(remainingBudget);
        const { augment } = fillResult;

        if (augment) {
            const appliedAugment = applyAugment({ augmentedArmorPiece, augment, skills });
            appliedAugments.push(appliedAugment);
        }
    }

    return {
        augmentedArmorPiece,
        augmentsApplied: appliedAugments,
        remainingBudget,
        rollsLeft
    };
}

function parseDecoString(decoString) {
    const parsedDecos = decoString.split('').map(Number);
    while (parsedDecos.length < 3) {
        parsedDecos.push(0);
    }
    return parsedDecos;
}

function serializeDecoList(decoList) {
    return decoList.filter(s => s > 0).join('');
}

// throws when not valid
function applyAugment({ augmentedArmorPiece, augment, skills }) {
    const { type, value, cost } = augment;

    if (type.match(/^Defense[+-]$/)) {
        augmentedArmorPiece.defense += value;
        return { augment, data: null };
    }

    if (type.match(/^\w+ res[+-]$/)) {
        const element = type.match(/^(\w+) res[+-]$/)[1];
        const res = elementToResistanceMap[element];
        augmentedArmorPiece[res] += value;
        return { augment, data: null };
    }

    if (type === 'Slot+') {
        const adjustments = [0, 0, 0];
        const adjustedSlots = parseDecoString(augmentedArmorPiece.decos);

        let remainingValue = value;
        while (remainingValue > 0) {
            if (adjustedSlots[2] === 4) {
                break;
            }

            if (adjustedSlots[2] === 0) {
                for (let i = 0; i < 3; i++) {
                    if (adjustedSlots[i] === 0) {
                        adjustedSlots[i] = 1;
                        adjustments[i] += 1;
                        break;
                    }
                }
                remainingValue -= 1;
                continue;;
            }

            for (let i = 0; i < 3; i++) {
                if (adjustedSlots[i] < 4) {
                    const toBeAdded = Math.min(remainingValue, 4 - adjustedSlots[i]);
                    adjustedSlots[i] += toBeAdded;
                    adjustments[i] += toBeAdded;
                    remainingValue -= toBeAdded;
                    break;
                }
            }
        }

        augmentedArmorPiece.decos = serializeDecoList(adjustedSlots);
        return { augment, data: { adjustments } };
    }

    const skillMap = {};
    for(let skill of augmentedArmorPiece.skills) {
        skillMap[skill.name] = skill;
    }

    if (type === 'Skill+') {
        const skillPool = skills.filter(s => (s.cost === cost) && (skillMap[s.name]?.level !== s.maxLevel));
        const [addedSkill] = getRandomFromList(skillPool);

        if (!skillMap[addedSkill.name]) {
            if (augmentedArmorPiece.skills.length === 5) {
                throw 'Maximum limit of 5 skills reached';
            }

            skillMap[addedSkill.name] = {
                name: addedSkill.name,
                level: 0
            };
            augmentedArmorPiece.skills.push(skillMap[addedSkill.name]);
        }

        skillMap[addedSkill.name].level += 1;
        return { augment, data: { skillName: addedSkill.name } };
    }

    if (type === 'Skill-') {
        const skillPool = augmentedArmorPiece.skills.filter(s => s.level > 0);
        if (skillPool.length === 0) {
            throw 'No skills left to reduce';
        }
        const [reducedSkill] = getRandomFromList(skillPool);
        reducedSkill.level -= 1;
        return { augment, data: { skillName: reducedSkill.name } };
    }
}

function undoAugment({ augmentedArmorPiece, appliedAugment }) {
    const { augment, data} = appliedAugment;
    const { type, value } = augment;

    if (type.match(/^Defense[+-]$/)) {
        augmentedArmorPiece.defense -= value;
        return;
    }

    if (type.match(/^\w+ res[+-]$/)) {
        const element = type.match(/^(\w+) res[+-]$/)[1];
        const res = elementToResistanceMap[element];
        augmentedArmorPiece[res] -= value;
        return;
    }

    if (type === 'Slot+') {
        const { adjustments } = data;
        const adjustedSlots = parseDecoString(augmentedArmorPiece.decos);

        for (let i = 0; i < 3; i++) {
            adjustedSlots[i] -= adjustments[i];
        }

        augmentedArmorPiece.decos = serializeDecoList(adjustedSlots);
        return;
    }

    const { skillName } = data;
    const affectedSkill = augmentedArmorPiece.skills.find(s => s.name === skillName);
    if (type === 'Skill+') {
        affectedSkill.level -= 1;
        return;
    }
    if (type === 'Skill-') {
        affectedSkill.level += 1;
        return;
    }
}

function getProbabilityWeight (aug) {
    return aug.probabilityWeight;
}

function createAugmentModePool(augmentPool, augmentMode) {
    if (augmentMode === augmentModes.DEFENSE) {
        return new DefenseAugmentModePool(augmentPool);
    }

    if (augmentMode === augmentModes.SKILL) {
        return new SkillAugmentModePool(augmentPool);
    }

    if (augmentMode === augmentModes.SLOT) {
        return new SlotAugmentModePool(augmentPool);
    }

    return new DefaultAugmentModePool(augmentPool);
}

class DefaultAugmentModePool {
    constructor(augmentPool) {
        this.augmentPool = augmentPool;
        this.defaultAugments = new WeightedListRandom(
            augmentPool.filter(aug => aug.class === 'default'),
            getProbabilityWeight,
        );
    }

    getRandomAugment() {
        return {
            augment: this.defaultAugments.getRandom()[0],
            rolls: 1,
        };
    }

    *getFirstAugments() {
        const defenseAugPool = new WeightedListRandom(
            this.defaultAugments.list.filter(aug => aug.type.match(/^Defense[+-]$/)),
            getProbabilityWeight,
        );
        yield {
            augment: defenseAugPool.getRandom()[0],
            rolls: 1
        };

        const skillAugPool = new WeightedListRandom(
            this.defaultAugments.list.filter(aug => aug.type.match(/^Skill[+-]$/)),
            getProbabilityWeight,
        );
        yield {
            augment: skillAugPool.getRandom()[0],
            rolls: 1
        };
    }

    getFillCostAugment(remainingBudget) {
        const lastAugments = this.augmentPool.filter(aug => aug.class === 'lastFiller')
            .sort((a, b) => a.cost > b.cost ? -1 : a.cost < b.cost ? -1 : 0); // sort by largest to smallest cost

        for (let augment of lastAugments) {
            if (remainingBudget >= augment.cost) {
                return { augment, rolls: 1 };
            }
        }

        return {
            augment: null,
            rolls: 1
        };
    }
}

class DefenseAugmentModePool extends DefaultAugmentModePool {
    constructor(augmentPool) {
        super(augmentPool);
        this.resistanceAugments = new WeightedListRandom(
            this.defaultAugments.list.filter(aug => aug.type.match(/^Defense\+$/) || aug.type.match(/^\w+ res\+$/)),
            getProbabilityWeight,
        );
        this.defenseAugments = new WeightedListRandom(
            this.resistanceAugments.list.filter(aug => aug.type.match(/^Defense\+$/)),
            getProbabilityWeight,
        );
    }

    getRandomAugment() {
        const augment = this.defaultAugments.getRandom()[0];
        
        if (augment.type.match(/^Skill[+-]$/)) {
            return {
                augment: this.defenseAugments.getRandom()[0],
                rolls: 2
            };
        }

        if (augment.type.match(/^Defense\-$/) || augment.type.match(/^\w+ res\-$/)) {
            return {
                augment: this.resistanceAugments.getRandom()[0],
                rolls: 2
            };
        }

        return { augment, rolls: 1 };
    }

    *getFirstAugments() {
        yield {
            augment: this.defenseAugments.getRandom()[0],
            rolls: 1
        };
    }
}

class SkillAugmentModePool extends DefaultAugmentModePool {
    constructor(augmentPool) {
        super(augmentPool);
    }

    *getFirstAugments() {
        yield {
            augment: this.augmentPool.find(aug => aug.type === 'Skill-') ?? null,
            rolls: 1
        };

        yield {
            augment: getRandomFromList(this.augmentPool.filter(aug => aug.class === 'skill+First'))[0],
            rolls: 1
        };

        const skillAugPool = new WeightedListRandom(
            this.defaultAugments.list.filter(aug => aug.type === 'Skill+'),
            getProbabilityWeight,
        );
        yield {
            augment: skillAugPool.getRandom()[0],
            rolls: 1
        };
    }
}

class SlotAugmentModePool extends DefaultAugmentModePool {
    constructor(augmentPool) {
        super(augmentPool);
    }

    *getFirstAugments() {
        yield {
            augment: this.augmentPool.find(aug => aug.class === 'slot+First'),
            rolls: 1
        };

        const slotAugPool = new WeightedListRandom(
            this.defaultAugments.list.filter(aug => aug.type === 'Slot+'),
            getProbabilityWeight,
        );
        yield {
            augment: slotAugPool.getRandom()[0],
            rolls: 1
        };
    }
}
