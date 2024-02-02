import { WeightedListRandom, getRandomFromList } from "./random.js";

export const augmentModes = {
    DEFAULT: 'default',
    DEFENSE: 'defense',
    SLOT: 'slot+',
    SKILL: 'skill+',
};

/**
 * Assumptions about augment algorithm:
 * 1) There is a limit of seven maximum total augment
 * 2) The initial preset rolls per augmenting mode (see getFirstAugments) are counted towards the 50 maximum rolls allowed
 * 3) Skill+ and Skill- augments that happen to cancels each other's effect will not be removed from the seven slots
 * 4) Skill+ augments can roll for skills that are already maxed out (since it can be cancelled out by a Skill- as per 3)
 * 5) Skill- augments can roll for skills that are already 0 (since it can be cancelled out by a Skill+ as per 3)
 * 6) "Limit of 5 total skills" means the total skill points can go over 5 as long as the number of skill types is at most 5
 * 7) If the last defense augment rolled to fill the quota causes all the defenses to net 0, then all defense augments are still deleted and rolling for augments will still continue after
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

            ({ augment, rolls }) = firstRollResult;
        }
        else if (appliedAugments.length === 6) {
            // If one quota left and there's still budget remaining, roll for a defense augment
            ({ augment, rolls }) = augmentModePool.getFillCostAugment(remainingBudget);

            if (augment === null) {
                break;
            }
        }
        else {
            ({ augment, rolls }) = augmentModePool.getRandomAugment();
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
                    undoAugment(augmentedArmorPiece, appliedDefAugment);
                }
            }

            netDefenseChange = 0;
            continue;
        }

        try {
            applyAugment(augmentedArmorPiece, augment, appliedAugments, armorPiece);
            remainingBudget -= augment.cost;
            if (isDefenseType) {            
                netDefenseChange += augment.value;
            }
        }
        catch (e) {
            // augment not applicable
        }
    }

    return {
        augmentedArmorPiece,
        augmentsApplied: appliedAugments
    };
}

// throws when not valid
function applyAugment(augmentedArmorPiece, augment, appliedAugments, baseArmorPiece) {
    // todo
}

function undoAugment(armorPiece, appliedAugment) {
    // todo
}

function getCost (aug) {
    return aug.cost;
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
            getCost,
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
            getCost,
        );
        yield {
            augment: defenseAugPool.getRandom()[0],
            rolls: 1
        };

        const skillAugPool = new WeightedListRandom(
            this.defaultAugments.list.filter(aug => aug.type.match(/^Skill[+-]$/)),
            getCost,
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
            getCost,
        );
        this.defenseAugments = new WeightedListRandom(
            this.resistanceAugments.list.filter(aug => aug.type.match(/^Defense\+$/)),
            getCost,
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
            augment: getRandomFromList(this.augmentPool.filter(aug => aug.class === 'skill+First')),
            rolls: 1
        };

        const skillAugPool = new WeightedListRandom(
            this.defaultAugments.list.filter(aug => aug.type === 'Skill+'),
            getCost,
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
            getCost,
        );
        yield {
            augment: slotAugPool.getRandom()[0],
            rolls: 1
        };
    }
}
