import React from 'react';
import styles from './SkillBar.module.css';

function SkillBar({ skill, level, acceptRange={}, onAcceptRangeChange, onDelete }) {
    const editable = !!acceptRange;
    const deletable = editable && !!onDelete;
    let barClassNames = [];
    const { min, max } = acceptRange;

    function updateMin(newMin) {
        newMin = Math.min(skill.maxLevel, Math.max(0, newMin));
        const newMax = Math.min(skill.maxLevel, Math.max(newMin, max));
        onAcceptRangeChange({ min: newMin, max: newMax });
    }

    function updateMax(newMax) {
        newMax = Math.min(skill.maxLevel, Math.max(0, newMax));
        const newMin = Math.min(newMax, Math.max(0, min));
        onAcceptRangeChange({ min: newMin, max: newMax });
    }

    function deleteSkill() {
        if (onDelete) {
            onDelete();
        }
    }

    for (let currentLevel = 1; currentLevel <= skill.maxLevel; currentLevel++) {
        const levelReached = currentLevel <= level;
        const minReached = currentLevel <= min;
        const maxReached = currentLevel <= max;

        const classNames = [styles.LevelBar];

        if (levelReached) {
            classNames.push(styles.ReachBar);

            if (!minReached) {
                classNames.push(styles.MinMinusBar)
            }

            if(!maxReached) {
                classNames.push(styles.MaxMinusBar);
            }
        }
        else {
            if (minReached) {
                classNames.push(styles.MinPlusBar);
            }

            if (maxReached) {
                classNames.push(styles.MaxPlusBar);
            }
        }

        barClassNames.push(classNames.filter(x => !!x).join(' '));
    }

    const classNames = [styles.SkillBar];

    if (editable) {
        classNames.push(styles.Editable);
    }

    if (deletable) {
        classNames.push(styles.Deletable);
    }

    return (
        <div className={classNames.join(' ')}>
            <div className={styles.Details}>
                <span className={styles.Name}>
                    {skill.name}
                </span>
                <span className={styles.Level}>
                    Level {level}
                </span>
                <button className={styles.Delete} disabled={!deletable} onClick={deleteSkill}>
                    X
                </button>
            </div>
            <div className={styles.BarSection}>
                <input type="range"
                    value={max ?? 0}
                    onChange={e => updateMax(e.target.value)}
                    min={0}
                    max={skill.maxLevel}
                    step={1}
                    disabled={!editable}
                    className={`${styles.Range} ${styles.MaxRange}`}/>
                <div className={styles.Bar}>
                    {
                        barClassNames.map((className, i) => 
                            <div className={styles.LevelBarContainer} key={i}>
                                <div className={className}/>
                            </div>
                        )
                    }
                </div>
                <input type="range"
                    value={min ?? 0}
                    onChange={e => updateMin(e.target.value)}
                    min={0}
                    max={skill.maxLevel}
                    step={1}
                    disabled={!editable}
                    className={`${styles.Range} ${styles.MinRange}`}/>
            </div>
        </div>
    );
}

export default SkillBar;
