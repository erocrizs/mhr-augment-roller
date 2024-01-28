import React from 'react';
import styles from './NumberDial.module.css';


function NumberDial({ min, max, value, onChange, className, id, style, disabled }) {
    async function updateValue(delta) {
        const newValue = Math.max(min, Math.min(max, value + delta));

        if (newValue !== value) {
            onChange(newValue);
        }
    }

    return (
        <div id={id} className={`${className} ${styles.NumberDial} ${disabled ? styles.Disabled : ''}`} style={style}>
            <div className={styles.FlexContainer}>
                <button className={styles.DialButton} onClick={() => updateValue(-1)} disabled={disabled || value <= min}>
                    -
                </button>
                <span className={styles.DialDisplay}>{value}</span>
                <button className={styles.DialButton} onClick={() => updateValue(1)} disabled={disabled || value >= max}>
                    +
                </button>
            </div>
        </div>
    )
}

export default NumberDial;
