import React from 'react';
import styles from './SkillBar.module.css';

function SkillBar({ skill, level, acceptRange, onAcceptRangeChange }) {
    const editable = !!acceptRange;
    let barClassNames = [];
    const { min, max } = acceptRange;

    function updateMin(newMin) {
        const min = Math.min(skills.maxLevel, Math.max(0, newMin));
        const max = Math.min(skills.maxLevel, Math.max(min, max));
        onAcceptRangeChange({ min, max });
    }

    function updateMax(newMax) {
        const max = Math.min(skills.maxLevel, Math.max(0, newMax));
        const min = Math.min(max, Math.max(0, min));
        onAcceptRangeChange({ min, max });
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

    return (
        <div className={styles.SkillBar}>
            <div className={styles.Details}>
                <span className={styles.Name}>
                    {skill.name}
                </span>
                <span className={styles.Level}>
                    Level {level}
                </span>
            </div>
            <div className={styles.BarSecion}>
                <input type="range"
                    value={min}
                    onChange={e => updateMin(e.target.value)}
                    min={0}
                    max={skill.maxLevel}
                    step={1}
                    disabled={!editable}
                    className={`${styles.Range} ${styles.MinRange}`}/>
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
                    value={max}
                    onChange={e => updateMax(e.target.value)}
                    min={0}
                    max={skill.maxLevel}
                    step={1}
                    disabled={!editable}
                    className={`${styles.Range} ${styles.MaxRange}`}/>
            </div>
        </div>
    );
}

export default SkillBar;
