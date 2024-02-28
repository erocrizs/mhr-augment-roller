import React, { useCallback, useState } from 'react';
import styles from './AugmentDisplayPanel.module.css';
import DecoSlotBlock from '../DecoSlotBlock/DecoSlotBlock';
import SkillRange from '../SkillRange/SkillRange';

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
    const changeClassName = [styles.Change];
    if (change > 0) {
        changeClassName.push(styles.Positive);
    }
    else if (change < 0) {
        changeClassName.push(styles.Negative);
    }

    return (
        <>
            <span className={styles.Value}>
                {baseValue}{change !== 0 ? ` → ${augmentedValue}` : ''}
            </span>
            <span className={changeClassName.join(' ')}>
                {change !== 0 ? `${signChange}${absChange}` : ''}
            </span>
        </>
    );
}

function AugmentDisplayPanel({ augments, baseArmorPiece }) {
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
            fromLevel: level,
            toLevel: augmentedArmorPiece.skills.find(({name: n}) => (n === name)).level
        })
    );
    for (let skill of augmentedArmorPiece.skills) {
        if (skillsDiff.find(({name}) => (name === skill.name))) {
            continue;
        }

        skillsDiff.push({
            name: skill.name,
            fromLevel: 0,
            toLevel: skill.level
        });
    }

    return (
        <div className={styles.AugmentDisplayPanel}>
            <h2 className={styles.TitleRow}>{generateAugmentTitle(skillsDiff, decosDiff)}</h2>
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
            <div className={styles.ArmorStats}>
                <h3 className={styles.SectionHeader}>Armor Stats</h3>
                <div className={styles.StatRow}>
                    <span className={styles.Label}>Slots</span>
                    <DecoSlotBlock decoList={baseArmorPiece.decos}
                        slotChange={decosDiff}/>
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
                    skillsDiff.map(({name, fromLevel, toLevel}) => (
                        <div className={styles.SkillRow}>
                            <div className={styles.SkillData}>
                                <span className={styles.Label}>{name}</span>
                                <ChangeArrow augmentedValue={toLevel} baseValue={fromLevel}/>
                            </div>
                        </div>
                    ))
                }
            </div>
            <div className={styles.ArmorAugments}>
                <h3 className={styles.SectionHeader}>Augments</h3>
                {
                    augmentsApplied.map((a) => (
                        <div className={styles.AugmentRow}>
                            {JSON.stringify(a)}
                        </div>
                    ))
                }
            </div>
        </div>
    );
}

export default AugmentDisplayPanel;