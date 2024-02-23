import React, { useCallback, useState } from 'react';
import styles from './AugmentDisplayPanel.module.css';

function AugmentDisplayPanel({ augments, baseArmorPiece }) {
    const [index, setIndex] = useState(0);
    const moveIndex = useCallback(
        change => setIndex(i => Math.max(0, Math.min(i + change, augments.length))),
        [augments.length]
    );
    
    return (
        <div className={styles.AugmentDisplayPanel}>
            <h2 className={styles.TitleRow}>Sample Augments</h2>
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
            Test {index} {JSON.stringify(augments[index].augmentedArmorPiece)}
        </div>
    );
}

export default AugmentDisplayPanel;