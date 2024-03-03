import React, { useCallback, useMemo } from 'react';
import styles from './ArmorPiecePanel.module.css';
import OptionDial from '../OptionDial/OptionDial';
import DecoSlotBlock from '../DecoSlotBlock/DecoSlotBlock';
import NumberDial from '../NumberDial/NumberDial';
import SkillRange from '../SkillRange/SkillRange';
import SearchableSelect from '../SearchableSelect/SearchableSelect';
import { DefenseIcon, DragonIcon, FireIcon, IceIcon, ThunderIcon, WaterIcon } from '../ResistanceIcon/ResistanceIcon';

const resistanceDialOptions = ['Any', 'Increase', 'Maintain', 'Decrease'];

function ResistanceRow({ armorPiece, resistanceChanges, setResistanceChanges, resistanceKey, label, disabled, icon }) {
    const onChangeCallback = useCallback((value) => {
        setResistanceChanges({
            ...resistanceChanges,
            [resistanceKey]: value,
        });
    }, [resistanceChanges, setResistanceChanges, resistanceKey]);

    return (
        <div className={styles.ResistanceCell}>
            {icon}
            <span className={styles.ResistanceLabel}>{label}</span>
            <span className={styles.ResistanceValue}>{(armorPiece && armorPiece[resistanceKey]) ?? '?'}</span>
            <OptionDial
                options={resistanceDialOptions}
                value={resistanceChanges[resistanceKey]}
                onChange={onChangeCallback}
                className={styles.ResistanceDial}
                disabled={!armorPiece || disabled}/>
        </div>
    );
}

function ArmorPiecePanel({ armorPiece, resistanceChanges, setResistanceChanges, slotChange, setSlotChange, skillChanges, setSkillChanges, skills, disabled }) {
    const skillNames = useMemo(
        () => skills.filter(s => s.cost !== -1 && !skillChanges?.find(aS => aS.name === s.name)).map(s => s.name),
        [skills, skillChanges]
    );
    const decoList = armorPiece?.decos ?? [0, 0, 0];
    const maxSlotChange = decoList.reduce((sum, current) => sum + (4 - current), 0);
    const deleteSkillChange = (index) => setSkillChanges(
        skillChanges.filter((_, ind) => ind !== index)
    );
    const skillBars = skillChanges.map(
        ({ name, range }, index) => <SkillRange key={`skill-${name}`}
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

    function addSkill(newSkillName) {
        if (newSkillName === null) {
            return;
        }

        const skillToAdd = skills.find(s => s.name === newSkillName);

        if (skillToAdd === null) {
            return;
        }

        setSkillChanges([
            ...skillChanges,
            {
                name: skillToAdd.name,
                range: {
                    min: 0,
                    max: skillToAdd.maxLevel
                },
            }
        ]);
    }

    skillBars.push(
        <div key={`add-skill-${skillBars.length}`}>
            Add Skill <SearchableSelect options={skillNames} onChange={addSkill} disabled={!armorPiece || disabled}/>
        </div>
    );

    return (
        <div className={styles.ArmorPiecePanel}>
            <h2 className={styles.NameRow}>{armorPiece?.name ?? '???'}</h2>
            <div className={styles.Panel}>
                <section className={styles.ArmorStats}>
                    <h3>Stats</h3>
                    <div className={styles.SlotRow}>
                        <span className={styles.SlotLabel}>Slots</span>
                        <DecoSlotBlock decoList={armorPiece?.decos ?? [0, 0, 0]}
                            slotChange={slotChange}
                            className={styles.SlotBlock}/>
                        <NumberDial value={slotChange}
                            onChange={setSlotChange}
                            min={0}
                            max={maxSlotChange}
                            disabled={!armorPiece || disabled} 
                            className={styles.SlotDial}/>
                    </div>
                    <ResistanceRow  resistanceKey="defense"
                        icon={<DefenseIcon size={20}/>}
                        armorPiece={armorPiece}
                        resistanceChanges={resistanceChanges}
                        setResistanceChanges={setResistanceChanges}
                        disabled={disabled}
                        label="Defense"/>
                    <ResistanceRow resistanceKey="fireRes"
                        icon={<FireIcon size={20}/>}
                        armorPiece={armorPiece}
                        resistanceChanges={resistanceChanges}
                        setResistanceChanges={setResistanceChanges}
                        disabled={disabled}
                        label="Fire Resist"/>
                    <ResistanceRow resistanceKey="waterRes"
                        icon={<WaterIcon size={20}/>}
                        armorPiece={armorPiece}
                        resistanceChanges={resistanceChanges}
                        setResistanceChanges={setResistanceChanges}
                        disabled={disabled}
                        label="Water Resist"/>
                    <ResistanceRow resistanceKey="thunderRes"
                        icon={<ThunderIcon size={20}/>}
                        armorPiece={armorPiece}
                        resistanceChanges={resistanceChanges}
                        setResistanceChanges={setResistanceChanges}
                        disabled={disabled}
                        label="Thunder Resist"/>
                    <ResistanceRow resistanceKey="iceRes"
                        icon={<IceIcon size={20}/>}
                        armorPiece={armorPiece}
                        resistanceChanges={resistanceChanges}
                        setResistanceChanges={setResistanceChanges}
                        disabled={disabled}
                        label="Ice Resist"/>
                    <ResistanceRow resistanceKey="dragonRes"
                        icon={<DragonIcon size={20}/>}
                        armorPiece={armorPiece}
                        resistanceChanges={resistanceChanges}
                        setResistanceChanges={setResistanceChanges}
                        disabled={disabled}
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
