import React, { useCallback, useState } from 'react';
import ArmorPiecePanel from '../ArmorPiecePanel/ArmorPiecePanel';
import SearchableSelect from '../SearchableSelect/SearchableSelect';
import styles from './AugmentPage.module.css';
import AugmentButton from '../AugmentButton/AugmentButton';
import DecoSlot from '../../library/decoSlot';
import { augmentModes } from '../../library/simulator';

const defaultResistanceChange = {
    defense: 'Any',
    fireRes: 'Any',
    waterRes: 'Any',
    thunderRes: 'Any',
    iceRes: 'Any',
    dragonRes: 'Any'
};

const defaultSlotChange = 0;

const modeSpecificVerifier = {
    [augmentModes.DEFAULT]: () => ({ valid: true }), // No specific restrictions
    [augmentModes.DEFENSE]: verifyDefenseAugmentCriteria,
    [augmentModes.SKILL]: () => ({ valid: true }), // No specific restrictions
    [augmentModes.SLOT]: () => ({ valid: true }), // No specific restrictions
};

const maxAugments = 7;
const maxSkills = 5;
const maxAttempt = 10_000;

function verifyAugmentCriteria(armorPiece, changes, mode) {
    if (!armorPiece) {
        return {
            valid: false,
            message: 'Choose an armor piece to augment',
        };
    }

    // Restrictions:
    // 1. Total number of changes should be at 7 max
    // 2. Total number of required skills should be at 5
    let skillCount = 0;
    let requiredSkillAugmentCount = 0;
    for (let skillChange of changes.skillChanges) {
        const baseSkill = armorPiece.skills.find(s => s.name === skillChange.name);

        if (baseSkill || skillChange.range.min > 0) {
            skillCount += 1;
        }

        const defaultLevel = baseSkill?.level ?? 0;
        if (defaultLevel < skillChange.range.min) {
            requiredSkillAugmentCount += (skillChange.range.min - defaultLevel);
        }
        else if (defaultLevel > skillChange.range.max) {
            requiredSkillAugmentCount += (defaultLevel - skillChange.range.max);
        }
    }

    const verifyModeCriteria = modeSpecificVerifier[mode];
    let result = verifyModeCriteria(
        armorPiece,
        changes,
        {requiredSkillAugmentCount}
    );

    if (!result.valid) {
        return result;
    }

    let requiredSlotAugmentCount = 0;
    while (requiredSlotAugmentCount * 3 < changes.slotChange) {
        requiredSlotAugmentCount += 1;
    }
    
    if ((requiredSlotAugmentCount + requiredSkillAugmentCount) > maxAugments) {
        return {
            valid: false,
            message: '0% - Too many required changes (slots & skill increases)',
        };
    }

    if (skillCount > maxSkills) {
        return {
            valid: false,
            message: `0% - Too many required new skills for this armor (${skillCount - armorPiece.skills.length} / ${(maxSkills - armorPiece.skills.length)})`
        };
    }

    return {
        valid: true,
        message: 'Good to go!'
    };
}

function verifyDefenseAugmentCriteria(armorPiece, changes, {requiredSkillAugmentCount}) {
    // Restrictions:
    // 1: No negative defense or resistance
    // 2: No changes in skills

    const decrease = Object.values(changes.resistanceChanges).find(change => change === 'Decrease');
    if (decrease) {
        return {
            valid: false,
            message: `0% - Defense and resistances will not decrease with Defense+ augments`
        };
    }

    if (requiredSkillAugmentCount > 0) {
        return {
            valid: false,
            message: '0% - Armor skills will never change with Defense+ augments'
        };
    }
    
    return { valid: true };
}

function checkAugmentVsCriteria(baseArmorPiece, augmentedArmorPiece, changes) {
    // check slot changes
    const targetTotalSlotLevel = changes.slotChange + baseArmorPiece.decos.reduce((s, l) => s + l, 0);
    const currentTotalSlotLevel = augmentedArmorPiece.decos.reduce((s, l) => s + l, 0);
    if (currentTotalSlotLevel < targetTotalSlotLevel) {
        return false;
    }

    // check resistance changes
    for (let resKey of Object.keys(changes.resistanceChanges)) {
        if (changes.resistanceChanges[resKey] === 'Any') {
            continue;
        }

        if (changes.resistanceChanges[resKey] === 'Maintain' && augmentedArmorPiece[resKey] !== baseArmorPiece[resKey]) {
            return false;
        }

        if (changes.resistanceChanges[resKey] === 'Increase' && augmentedArmorPiece[resKey] < baseArmorPiece[resKey]) {
            return false;
        }

        if (changes.resistanceChanges[resKey] === 'Decrease' && augmentedArmorPiece[resKey] > baseArmorPiece[resKey]) {
            return false;
        }
    }

    // check skill changes
    for (let {name, range} of changes.skillChanges) {
        const skillLevel = augmentedArmorPiece.skills.find(s => s.name === name)?.level ?? 0;
        if (skillLevel < range.min || skillLevel > range.max) {
            return false;
        }
    }

    return true;
}

function AugmentPage({ setNames, skills }) {
    const [loadingSet, setLoadingSet] = useState(false);
    const [setDetails, setSetDetails] = useState(null);
    const [armorPiece, setArmorPiece] = useState(null);
    const [loadingAugPool, setLoadingAugPool] = useState(false);
    const [augmentPool, setAugmentPool] = useState([]);
    const [slotChange, setSlotChange] = useState(defaultSlotChange);
    const [resistanceChanges, setResistanceChanges] = useState(defaultResistanceChange);
    const [skillChanges, setSkillChanges] = useState([]);
    const [augmentMode, setAugmentMode] = useState(augmentModes.DEFAULT);
    const [validAugments, setValidAugments] = useState([]);
    const [simulating, setSimulating] = useState(false);
    const [simulated, setSimulated] = useState(false);
    const [validAugmentCount, setValidAugmentCount] = useState(0);

    const getPieceName = useCallback(piece => piece.name, []);

    async function updateSet(setName) {
        if (setDetails?.name === setName) {
            return;
        }

        setSimulated(false);
        setArmorPiece(null);
        setSlotChange(defaultSlotChange);
        setResistanceChanges(defaultResistanceChange);
        setSkillChanges([]);

        if (!setName) {
            setSetDetails(null);
            return;
        }

        setLoadingSet(true);
        setSetDetails({name: setName});
        const setDetailsResponse = await fetch(`api/sets/${setName}`);
        const newSetDetails = await setDetailsResponse.json();

        for (let piece of newSetDetails.pieces) {
            piece.decos = DecoSlot.parse(piece.decos);
        }

        const keepAugPool = setDetails?.augPool === newSetDetails.augPool;
        setLoadingSet(false);
        setSetDetails(newSetDetails);

        if (keepAugPool) {
            return;
        }

        setLoadingAugPool(true);
        setAugmentPool([]);
        const augPoolResponse = await fetch(`api/augments/${newSetDetails?.augPool}`);
        const newAugPool = await augPoolResponse.json();
        setLoadingAugPool(false);
        setAugmentPool(newAugPool);
    }

    function updatePiece(newArmorPiece) {
        setSimulated(false);
        setArmorPiece(newArmorPiece);
        setSlotChange(defaultSlotChange);
        setResistanceChanges(defaultResistanceChange);
        setSkillChanges(newArmorPiece?.skills.map(skill => ({
            name: skill.name,
            range: {
                min: 0,
                max: skills.find(s => s.name === skill.name).maxLevel
            }
        })) ?? []);
    }

    const { valid, message: validationMessage } = verifyAugmentCriteria(
        armorPiece,
        {
            slotChange,
            skillChanges,
            resistanceChanges,
        },
        augmentMode,
    );

    const successRate = validAugmentCount / maxAttempt;
    const resultMessage = !simulated ? null : (
        <>
            <p>{validAugmentCount} passed out of {maxAttempt} attempts</p>
            <p>Success Rate: {(successRate * 100).toLocaleString({ minimumFractionDigits: 2 })} %</p>
            <p>Roll {Math.ceil(Math.log(1 - 0.50) / Math.log(1 - successRate))}x for 50% success</p>
            <p>Roll {Math.ceil(Math.log(1 - 0.75) / Math.log(1 - successRate))}x for 75% success</p>
            <p>Roll {Math.ceil(Math.log(1 - 0.95) / Math.log(1 - successRate))}x for 95% success</p>
        </>
    );

    const onValidAugment = useCallback(augment => {
        const fitsCriteria = checkAugmentVsCriteria(
            armorPiece,
            augment.augmentedArmorPiece,
            {
                slotChange,
                resistanceChanges,
                skillChanges
            }
        );

        if (!fitsCriteria) {
            return;
        }

        setValidAugmentCount(c => c + 1);
        setValidAugments(v => {
            if (v.length < 10) {
                return [...v, augment];
            }

            return v;
        });
    }, [armorPiece, resistanceChanges, skillChanges, slotChange]);

    const onSimulateButtonClick = useCallback((newSimulating) => {
        if (newSimulating !== simulating) {
            if (simulating) {
                console.log(validAugments);
                setSimulated(true);
            }
            else {
                setValidAugmentCount(0);
                setValidAugments([]);
            }
            setSimulating(newSimulating);
        }
    }, [simulating, validAugments]);

    return (
        <div className={styles.AugmentPage}>
            <div className={styles.EquipmentRow}>
                <span className={styles.EquipmentLabel}>Equipment</span>
                <div className={styles.EquipmentSelectGroup}>
                    <SearchableSelect
                        options={setNames}
                        value={setDetails?.name ?? null}
                        onChange={updateSet}
                        id="SetNameInput"
                        className={styles.EquipmentSelect}
                        disabled={simulating}
                        placeholder="Choose an armor set"/>
                    <SearchableSelect
                        options={setDetails?.pieces ?? []}
                        stringMap={getPieceName}
                        value={armorPiece}
                        onChange={updatePiece}
                        id="ArmorPieceInput"
                        className={styles.EquipmentSelect}
                        disabled={loadingSet || !setDetails?.pieces || simulating}
                        placeholder="Choose an armor piece"/>
                </div>
            </div>
            <div className={styles.AugmentModeRow}>
                <span className={styles.AugmentModeLabel}>Augment Mode</span>
                <div className={styles.AugmentModeButtons}>
                    {Object.values(augmentModes).map(
                        mode => <span key={mode} onClick={() => simulating || setAugmentMode(mode)} className={styles.AugmentModeButton}>
                            <input type="radio"
                                checked={mode === augmentMode}
                                value={mode}
                                disabled={simulating}
                                onChange={() => setAugmentMode(mode)}/>
                            <label className={mode === augmentMode ? styles.SelectedMode : ''}>
                                {mode[0].toUpperCase() + mode.substring(1)}
                            </label>
                        </span>
                    )}
                </div>
            </div>
            <ArmorPiecePanel
                armorPiece={armorPiece}
                slotChange={slotChange}
                setSlotChange={setSlotChange}
                resistanceChanges={resistanceChanges}
                setResistanceChanges={setResistanceChanges}
                skills={skills}
                skillChanges={skillChanges}
                disabled={simulating}
                setSkillChanges={setSkillChanges}/>
            <AugmentButton mode={augmentMode}
                message={resultMessage ?? validationMessage}
                armorPiece={armorPiece}
                armorSet={setDetails}
                augmentPool={augmentPool}
                skills={skills}
                onValidAugment={onValidAugment}
                simulating={simulating}
                setSimulating={onSimulateButtonClick}
                maxAttempt={maxAttempt}
                disabled={!(armorPiece && valid) || loadingAugPool}/>
        </div>
    );
}

export default AugmentPage;
