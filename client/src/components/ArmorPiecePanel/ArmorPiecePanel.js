import React, { useCallback } from 'react';
import styles from './ArmorPiecePanel.module.css';
import OptionDial from '../OptionDial/OptionDial';
import DecoSlotBlock from '../DecoSlotBlock/DecoSlotBlock';
import NumberDial from '../NumberDial/NumberDial';
import SkillBar from '../SkillBar/SkillBar';

const resistanceDialOptions = ['Any', 'Increase', 'Maintain', 'Decrease'];

function ResistanceRow({ armorPiece, resistanceChanges, setResistanceChanges, resistanceKey, label }) {
    const onChangeCallback = useCallback((value) => {
        setResistanceChanges({
            ...resistanceChanges,
            [resistanceKey]: value,
        });
    }, [resistanceChanges, setResistanceChanges, resistanceKey]);

    return (
        <div className={styles.ResistanceCell}>
            <span className={styles.ResistanceLabel}>{label}</span>
            <span className={styles.ResistanceValue}>{(armorPiece && armorPiece[resistanceKey]) ?? '?'}</span>
            <OptionDial
                options={resistanceDialOptions}
                value={resistanceChanges[resistanceKey]}
                onChange={onChangeCallback}
                className={styles.ResistanceDial}
                disabled={!armorPiece}/>
        </div>
    );
}

function ArmorPiecePanel({ armorPiece, resistanceChanges, setResistanceChanges, slotChange, setSlotChange, skillChanges, setSkillChanges, skills }) {
    const decoString = armorPiece?.decos ?? '';
    const maxSlotChange = Array.from(decoString).reduce((sum, current) => sum + (4 - Number(current)), 0) + ((3 - decoString.length) * 4);
    const deleteSkillChange = (index) => setSkillChanges(
        skillChanges.filter((_, ind) => ind !== index)
    );
    const skillBars = skillChanges.map(
        ({ name, range }, index) => <SkillBar key={`skill-${name}`}
            skill={skills.find(s => s.name === name)}
            level={armorPiece?.skills?.find(s => s.name === name)?.level ?? 0}
            acceptRange={range}
            onAcceptRangeChange={
                newRange => setSkillChanges(
                    skillChanges.map(s => s.name === name ? { name, range: newRange } : s)
                )
            }
            onDelete={
                armorPiece?.skills?.find(s => s.name === name) ? null : () => deleteSkillChange(index)
            }
            className={styles.SkillRow}/>
    );

    if (skillBars.length < 5) {
        skillBars.push(<div key={`add-skill`} className={styles.SkillRow}>Add Skill</div>)
    }

    while (skillBars.length < 5) {
        skillBars.push(<div key={skillBars.length} className={styles.SkillRow}>Filler</div>)
    }

    return (
        <div className={styles.ArmorPiecePanel}>
            <h2 className={styles.NameRow}>{armorPiece?.name ?? '???'}</h2>
            <div className={styles.Panel}>
                <section className={styles.ArmorStats}>
                    <h3>Skills</h3>
                    <div className={styles.SlotRow}>
                        <span className={styles.SlotLabel}>Slots</span>
                        <DecoSlotBlock decoString={armorPiece?.decos ?? ''}
                            slotChange={slotChange}
                            className={styles.SlotBlock}/>
                        <NumberDial value={slotChange}
                            onChange={setSlotChange}
                            min={0}
                            max={maxSlotChange}
                            disabled={!armorPiece} 
                            className={styles.SlotDial}/>
                    </div>
                    <ResistanceRow  resistanceKey="defense"
                        armorPiece={armorPiece}
                        resistanceChanges={resistanceChanges}
                        setResistanceChanges={setResistanceChanges}
                        label="Defense"/>
                    <ResistanceRow resistanceKey="fireRes"
                        armorPiece={armorPiece}
                        resistanceChanges={resistanceChanges}
                        setResistanceChanges={setResistanceChanges}
                        label="Fire Resist"/>
                    <ResistanceRow resistanceKey="waterRes"
                        armorPiece={armorPiece}
                        resistanceChanges={resistanceChanges}
                        setResistanceChanges={setResistanceChanges}
                        label="Water Resist"/>
                    <ResistanceRow resistanceKey="thunderRes"
                        armorPiece={armorPiece}
                        resistanceChanges={resistanceChanges}
                        setResistanceChanges={setResistanceChanges}
                        label="Thunder Resist"/>
                    <ResistanceRow resistanceKey="iceRes"
                        armorPiece={armorPiece}
                        resistanceChanges={resistanceChanges}
                        setResistanceChanges={setResistanceChanges}
                        label="Ice Resist"/>
                    <ResistanceRow resistanceKey="dragonRes"
                        armorPiece={armorPiece}
                        resistanceChanges={resistanceChanges}
                        setResistanceChanges={setResistanceChanges}
                        label="Dragon Resist"/>
                </section>
                <section className={styles.ArmorSkills}>
                    <h3>Skills</h3>
                    <div className={styles.SkillList}>
                        {skillBars}
                    </div>
                </section>
            </div>
        </div>
    );
}

export default ArmorPiecePanel;
