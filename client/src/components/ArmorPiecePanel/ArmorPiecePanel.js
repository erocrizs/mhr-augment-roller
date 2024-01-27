import React from 'react';
import styles from './ArmorPiecePanel.module.css';

function ArmorPiecePanel({ armorPiece }) {
    return (
        <div className={styles.ArmorPiecePanel}>
            <div className={styles.NameRow}>
                {armorPiece?.name}
            </div>
            <div className={styles.SubNameRow}>
                <span style={{display: 'block'}}>Level 1</span>
                <span style={{display: 'block'}}>Rarity {armorPiece?.rarity ?? '?'}</span>
            </div>
            <div className={styles.SlotRow}>
                <span style={{display: 'block'}}>Slots</span>
                <span style={{display: 'block'}}>
                    <span style={{display: 'inline-block'}}>-</span>
                    <span style={{display: 'inline-block'}}>-</span>
                    <span style={{display: 'inline-block'}}>-</span>
                </span>
            </div>
            <div className={styles.ResistanceTable}>
                <div className={styles.ResistanceCell}>
                    <span style={{display: 'block'}}>Defense</span>
                    <span style={{display: 'block'}}>{armorPiece?.defense ?? 0}</span>
                </div>
                <div className={styles.ResistanceCell}>
                    <span style={{display: 'block'}}>Fire Resistance</span>
                    <span style={{display: 'block'}}>{armorPiece?.fireRes ?? 0}</span>
                </div>
                <div className={styles.ResistanceCell}>
                    <span style={{display: 'block'}}>Water Resistance</span>
                    <span style={{display: 'block'}}>{armorPiece?.waterRes ?? 0}</span>
                </div>
                <div className={styles.ResistanceCell}>
                    <span style={{display: 'block'}}>Thunder Resistance</span>
                    <span style={{display: 'block'}}>{armorPiece?.thunderRes ?? 0}</span>
                </div>
                <div className={styles.ResistanceCell}>
                    <span style={{display: 'block'}}>Ice Resistance</span>
                    <span style={{display: 'block'}}>{armorPiece?.iceRes ?? 0}</span>
                </div>
                <div className={styles.ResistanceCell}>
                    <span style={{display: 'block'}}>Dragon Resistance</span>
                    <span style={{display: 'block'}}>{armorPiece?.dragonRes ?? 0}</span>
                </div>
            </div>
            <div className={styles.SkillsRow}>
                Skills
            </div>
            <div className={styles.SkillList}>
                {(armorPiece?.skills ?? []).map(skill => <div>{skill.name} x{skill.level}</div>)}
            </div>
        </div>
    );
}

export default ArmorPiecePanel;
