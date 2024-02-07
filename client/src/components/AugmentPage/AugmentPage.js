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

    const getPieceName = useCallback(piece => piece.name, []);

    async function updateSet(setName) {
        if (setDetails?.name === setName) {
            return;
        }

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

    const { valid, message } = verifyAugmentCriteria(
        armorPiece,
        {
            slotChange,
            skillChanges,
            resistanceChanges,
        },
        augmentMode,
    );

    const onValidAugment = useCallback((augment) => {
        setValidAugments(v => {
            if (v.length < 10) {
                return [...v, augment];
            }

            return v;
        });
    }, [setValidAugments])

    const onSimulateButtonClick = useCallback((newSimulating) => {
        if (newSimulating !== simulating) {
            if (simulating) {
                console.log(validAugments);
            }
            else {
                setValidAugments([]);
            }
            setSimulating(newSimulating);
        }
    }, [simulating, validAugments])

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
                message={message}
                armorPiece={armorPiece}
                armorSet={setDetails}
                augmentPool={augmentPool}
                skills={skills}
                onValidAugment={onValidAugment}
                simulating={simulating}
                setSimulating={onSimulateButtonClick}
                disabled={!(armorPiece && valid) || loadingAugPool}/>
        </div>
    );
}

export default AugmentPage;
