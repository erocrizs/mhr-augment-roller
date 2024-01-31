import React, { useCallback, useState } from 'react';
import ArmorPiecePanel from '../ArmorPiecePanel/ArmorPiecePanel';
import SearchableSelect from '../SearchableSelect/SearchableSelect';
import styles from './AugmentPage.module.css';

const defaultResistanceChange = {
    defense: 'Any',
    slots: 'Any',
    fireRes: 'Any',
    waterRes: 'Any',
    thunderRes: 'Any',
    iceRes: 'Any',
    dragonRes: 'Any'
};

const defaultSlotChange = 0;

function AugmentPage({ setNames, skills }) {
    const [loadingSet, setLoadingSet] = useState(false);
    const [setDetails, setSetDetails] = useState(null);
    const [armorPiece, setArmorPiece] = useState(null);
    // eslint-disable-next-line
    const [loadingAugPool, setLoadingAugPool] = useState(false);
    // eslint-disable-next-line
    const [augmentPool, setAugmentPool] = useState([]);
    const [slotChange, setSlotChange] = useState(defaultSlotChange);
    const [resistanceChanges, setResistanceChanges] = useState(defaultResistanceChange);
    const [skillChanges, setSkillChanges] = useState([]);

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
        setSkillChanges(newArmorPiece.map(skill => ({
            name: skill.name,
            range: {
                min: 0,
                max: skills.find(s => s.name === skill.name).maxValue
            }
        })));
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
                        placeholder="Choose an armor set"/>
                    <SearchableSelect
                        options={setDetails?.pieces ?? []}
                        stringMap={getPieceName}
                        value={armorPiece}
                        onChange={updatePiece}
                        id="ArmorPieceInput"
                        className={styles.EquipmentSelect}
                        disabled={loadingSet || !setDetails?.pieces}
                        placeholder="Choose an armor piece"/>
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
                setSkillChanges={setSkillChanges}/>
        </div>
    );
}

export default AugmentPage;
