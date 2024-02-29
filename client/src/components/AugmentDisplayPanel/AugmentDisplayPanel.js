import React, { useCallback, useState } from 'react';
import styles from './AugmentDisplayPanel.module.css';
import DecoSlotBlock from '../DecoSlotBlock/DecoSlotBlock';
import SkillBar from '../SkillBar/SkillBar';

function generateAugmentTitle(skillsDiff, decosDiff) {
    const messages = skillsDiff.filter(({fromLevel, toLevel}) => fromLevel !== toLevel)
        .sort((a, b) => (a.toLevel - a.fromLevel) - (b.toLevel - b.fromLevel))
        .map(({name, fromLevel, toLevel}) => `${name} ${toLevel > fromLevel ? '+' : ''}${toLevel - fromLevel}`);
    
    if (decosDiff > 0) {
        messages.push(`Deco Slots +${decosDiff}`);
    }

    return messages.join(', ');
}

function ChangeArrow({augmentedValue, baseValue}) {
    const change = augmentedValue - baseValue;
    const signChange = change < 0 ? '-' : '+';
    const absChange = Math.abs(change);
    const changeClassName = change < 0 ? styles.Negative : styles.Positive;

    return (
        <>
            <span className={styles.Value}>
                {
                    change === 0 ? <>
                        <b>{baseValue}</b>
                    </> : <>
                        {baseValue} → <b>{augmentedValue}</b>
                    </>
                }
            </span>
            <span className={styles.Change}>{
                change !== 0 && <>(<span className={changeClassName}>{signChange}{absChange}</span>)</>
            }</span>
        </>
    );
}

function AugmentMessage({ augment, data }) {
    const { type, value } = augment;
    const signValue = value < 0 ? '-' : '+';
    const absValue = Math.abs(value);
    const spanClassName = value < 0 ? styles.Negative : styles.Positive;

    if (type.match(/^Defense[+-]$/)) {
        return <><span className={spanClassName}>{signValue}{absValue}</span> defense</>;
    }

    if (type.match(/^\w+ res[+-]$/)) {
        const element = type.match(/^(\w+) res[+-]$/)[1].toLowerCase();
        return <><span className={spanClassName}>{signValue}{absValue}</span> {element} resistance</>;
    }

    if (type.match(/^Skill[+-]$/)) {
        return <><span className={spanClassName}>{signValue}{absValue}</span> <b>{data.skillName}</b> skill point</>;
    }

    if (type === 'Slot+') {
        return <><span className={spanClassName}>{signValue}{absValue}</span> decoration slot</>;
    }
}

function AugmentDisplayPanel({ augments, baseArmorPiece, skills }) {
    const [index, setIndex] = useState(0);
    const moveIndex = useCallback(
        change => setIndex(i => Math.max(0, Math.min(i + change, augments.length))),
        [augments.length]
    );
    const { augmentedArmorPiece, augmentsApplied } = augments[index];
    const decosDiff = new Array(3).fill(0).reduce((sum, _, i) => sum + augmentedArmorPiece.decos[i] - baseArmorPiece.decos[i], 0);
    const skillsDiff = baseArmorPiece.skills.map(
        ({name, level}) => ({
            name,
            maxLevel: skills.find(s => s.name === name).maxLevel,
            fromLevel: level,
            toLevel: augmentedArmorPiece.skills.find(({name: n}) => (n === name)).level
        })
    );
    for (let skill of augmentedArmorPiece.skills) {
        if (skill.level === 0 || skillsDiff.find(({name}) => (name === skill.name))) {
            continue;
        }

        skillsDiff.push({
            name: skill.name,
            maxLevel: skills.find(s => s.name === skill.name).maxLevel,
            fromLevel: 0,
            toLevel: skill.level
        });
    }

    return (
        <div className={styles.AugmentDisplayPanel}>
            <div className={styles.IndexDial}>
                <button className={styles.DialButton} onClick={() => moveIndex(-1)} disabled={index <= 0}>
                    <span className={styles.LeftTriangle}/>
                </button>
                <div className={styles.Indicators}>
                    {
                        augments.map((_, i) => <span className={[styles.Indicator, index === i ? styles.Selected : ''].join(' ')} key={i}></span>)
                    }
                </div>
                <button className={styles.DialButton} onClick={() => moveIndex(1)} disabled={index >= (augments.length - 1)}>
                    <span className={styles.RightTriangle}/>
                </button>
            </div>
            <h2 className={styles.TitleRow}>{generateAugmentTitle(skillsDiff, decosDiff)}</h2>
            <div className={styles.AugmentBody}>
                <div className={styles.ArmorStats}>
                    <h3 className={styles.SectionHeader}>Armor Stats</h3>
                    <div className={styles.StatRow}>
                        <span className={styles.Label}>Slots</span>
                        <DecoSlotBlock decoList={baseArmorPiece.decos}
                            slotChange={decosDiff}/>
                        <span className={styles.Change}>{
                            decosDiff !== 0 && <>(<span className={styles.Positive}>+{decosDiff}</span>)</>
                        }</span>
                    </div>
                    <div className={styles.StatRow}>
                        <span className={styles.Label}>Defense</span>
                        <ChangeArrow augmentedValue={augmentedArmorPiece.defense} baseValue={baseArmorPiece.defense}/>
                    </div>
                    <div className={styles.StatRow}>
                        <span className={styles.Label}>Fire Resist</span>
                        <ChangeArrow augmentedValue={augmentedArmorPiece.fireRes} baseValue={baseArmorPiece.fireRes}/>
                    </div>
                    <div className={styles.StatRow}>
                        <span className={styles.Label}>Water Resist</span>
                        <ChangeArrow augmentedValue={augmentedArmorPiece.waterRes} baseValue={baseArmorPiece.waterRes}/>
                    </div>
                    <div className={styles.StatRow}>
                        <span className={styles.Label}>Thunder Resist</span>
                        <ChangeArrow augmentedValue={augmentedArmorPiece.thunderRes} baseValue={baseArmorPiece.thunderRes}/>
                    </div>
                    <div className={styles.StatRow}>
                        <span className={styles.Label}>Ice Resist</span>
                        <ChangeArrow augmentedValue={augmentedArmorPiece.iceRes} baseValue={baseArmorPiece.iceRes}/>
                    </div>
                    <div className={styles.StatRow}>
                        <span className={styles.Label}>Dragon Resist</span>
                        <ChangeArrow augmentedValue={augmentedArmorPiece.dragonRes} baseValue={baseArmorPiece.dragonRes}/>
                    </div>
                </div>
                <div className={styles.ArmorSkills}>
                    <h3 className={styles.SectionHeader}>Armor Skills</h3>
                    {
                        skillsDiff.map(({name, maxLevel, fromLevel, toLevel}) => (
                            <div className={styles.SkillRow} key={name}>
                                <div className={styles.SkillData}>
                                    <span className={styles.Label}>{name}</span>
                                    <ChangeArrow augmentedValue={toLevel} baseValue={fromLevel}/>
                                </div>
                                <div className={styles.SkillBar}>
                                    <SkillBar 
                                        maxLevel={maxLevel}
                                        level={fromLevel}
                                        range={{min: toLevel, max: toLevel}}
                                        barPxWidth={15}
                                        barPxHeight={15}
                                        skewDeg={0}/>
                                </div>
                            </div>
                        ))
                    }
                </div>
                <div className={styles.ArmorAugments}>
                    <h3 className={styles.SectionHeader}>Augments</h3>
                    <ul>
                    {
                        augmentsApplied.map((a, i) => (
                            <li className={styles.AugmentRow} key={i}><AugmentMessage {...a}/></li>
                        ))
                    }
                    </ul>
                </div>
            </div>
        </div>
    );
}

export default AugmentDisplayPanel;