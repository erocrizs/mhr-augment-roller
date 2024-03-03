import React, { useCallback, useRef, useState } from 'react';
import ArmorPiecePanel from '../ArmorPiecePanel/ArmorPiecePanel';
import SearchableSelect from '../SearchableSelect/SearchableSelect';
import styles from './AugmentPage.module.css';
import AugmentButton from '../AugmentButton/AugmentButton';
import DecoSlot from '../../library/decoSlot';
import { augmentModes, simulateAugment } from '../../library/simulator';
import AugmentDisplayPanel from '../AugmentDisplayPanel/AugmentDisplayPanel';
import useInterval from '../../hooks/useInterval';
import { fetchResource } from '../../hooks/useResource';

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
const maxAttempt = 100_000;
const attemptBulkSize = 100;

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
    const simulationAttempts = useRef(0);
    const [validAugments, setValidAugments] = useState([]);
    const [simulated, setSimulated] = useState(false);
    const [validAugmentCount, setValidAugmentCount] = useState(0);

    const getPieceName = useCallback(piece => piece.name, []);

    const { valid, message: validationMessage } = verifyAugmentCriteria(
        armorPiece,
        {
            slotChange,
            skillChanges,
            resistanceChanges,
        },
        augmentMode,
    );

    const simulateAugments = useCallback(() => {
        if (simulationAttempts.current >= maxAttempt) {
            return false;
        }

        const bulkSize = Math.min(attemptBulkSize, maxAttempt - simulationAttempts.current);
        const validBulkAugments = [];
        for(let i = 0; i < bulkSize; i++) {
            const augment = simulateAugment(
                armorPiece,
                augmentPool,
                setDetails.budget,
                skills,
                augmentMode
            );
            const fitsCriteria = checkAugmentVsCriteria(
                armorPiece,
                augment.augmentedArmorPiece,
                {
                    slotChange,
                    resistanceChanges,
                    skillChanges
                }
            );

            if (fitsCriteria) {
                validBulkAugments.push(augment);
            }
        }
        simulationAttempts.current += bulkSize;
        setValidAugmentCount(c => c + validBulkAugments.length);
        setValidAugments(v => [
            ...v,
            ...validBulkAugments.slice(0, 10 - v.length)
        ]);
    }, [armorPiece, augmentMode, augmentPool, resistanceChanges, setDetails?.budget, skillChanges, skills, slotChange]);

    const {
        isRunning: simulating,
        startInterval,
        endInterval
    } = useInterval(simulateAugments, 0);

    const doneSimulating = simulated && !simulating;
    const hasAugmentsToShow = doneSimulating && validAugments.length > 0;
    const successRate = validAugmentCount / maxAttempt;
    const resultMessage = !doneSimulating ? null : (
        <>
            <p>{validAugmentCount.toLocaleString()} passed out of {simulationAttempts.current.toLocaleString()} attempts</p>
            <p>Success Rate: {(successRate * 100).toLocaleString()} %</p>
            {
                successRate > 0 && (<>
                    {successRate < 0.50 && <p>Roll {Math.max(1, Math.ceil(Math.log(1 - 0.50) / Math.log(1 - successRate))).toLocaleString()} times for 50% success.</p>}
                    {successRate < 0.75 && <p>Roll {Math.max(1, Math.ceil(Math.log(1 - 0.75) / Math.log(1 - successRate))).toLocaleString()} times for 75% success.</p>}
                    {successRate < 0.95 && <p>Roll {Math.max(1, Math.ceil(Math.log(1 - 0.95) / Math.log(1 - successRate))).toLocaleString()} times for 95% success.</p>}
                </>)
            }
        </>
    );

    const startSimulation = useCallback(() => {
        simulationAttempts.current = 0;
        setSimulated(true);
        setValidAugmentCount(0);
        setValidAugments([]);
        startInterval();
    }, [startInterval]);

    const endSimulation = useCallback(() => {
        simulationAttempts.current = 0;
        setSimulated(false);
        setValidAugmentCount(0);
        setValidAugments([]);
        endInterval();
    }, [endInterval]);

    async function updateSet(setName) {
        if (setDetails?.name === setName) {
            return;
        }

        endSimulation();
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
        const newSetDetails = await fetchResource(`/api/sets/${setName}`);

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
        const newAugPool = await fetchResource(`/api/augments/${newSetDetails?.augPool}`);
        setLoadingAugPool(false);
        setAugmentPool(newAugPool);
    }

    function updatePiece(newArmorPiece) {
        endSimulation();
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
                        mode => <span key={mode} onClick={() => {
                            if (!simulating) {
                                endSimulation();
                                setAugmentMode(mode);
                            }
                        }} className={styles.AugmentModeButton}>
                            <input type="radio"
                                checked={mode === augmentMode}
                                value={mode}
                                disabled={simulating}
                                onChange={() => {
                                    endSimulation();
                                    setAugmentMode(mode);
                                }}/>
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
                setSlotChange={v => {
                    endSimulation();
                    setSlotChange(v);
                }}
                resistanceChanges={resistanceChanges}
                setResistanceChanges={v => {
                    endSimulation();
                    setResistanceChanges(v);
                }}
                skills={skills}
                skillChanges={skillChanges}
                disabled={simulating}
                setSkillChanges={v => {
                    endSimulation();
                    setSkillChanges(v);
                }}/>
            <AugmentButton
                attempts={simulationAttempts.current}
                maxAttempt={maxAttempt}
                mode={augmentMode}
                message={resultMessage ?? validationMessage}
                simulating={simulating}
                startSimulation={startSimulation}
                endSimulation={endSimulation}
                disabled={!(armorPiece && valid) || loadingAugPool}/>
            { hasAugmentsToShow && !simulating && (
                <> 
                    <p>Check out these possible {augmentMode} augments that fit your criteria:</p>
                    <AugmentDisplayPanel augments={validAugments} baseArmorPiece={armorPiece} skills={skills}/> 
                </>
            )}
        </div>
    );
}

export default AugmentPage;
