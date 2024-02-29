import React from 'react';
import styles from './SkillBar.module.css';

function SkillBar({ maxLevel, level, range: { min, max }, barPxWidth = 25, barPxHeight = 30, skewDeg = -10 }) {
    let barClassNames = [];
    for (let currentLevel = 1; currentLevel <= maxLevel; currentLevel++) {
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

        barClassNames.push(classNames.join(' '));
    }
    const barStyle = {
        width: `${barPxWidth * maxLevel}px`,
        gridTemplateColumns: `repeat(${maxLevel}, auto)`,
        gridTemplateRows: `${barPxHeight}px`,
        transform: `skew(${skewDeg}deg, 0deg)`
    };
    return (
        <div className={styles.SkillBar} style={barStyle}>
            {
                barClassNames.map((className, i) => 
                    <div className={styles.LevelBarContainer} key={i}>
                        <div className={className}/>
                    </div>
                )
            }
        </div>
    );
}

export default SkillBar;