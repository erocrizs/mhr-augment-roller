import React, { useMemo } from 'react';
import styles from './OptionDial.module.css';

const identityFunction = (i => i);

function OptionDial({ options, stringMap = identityFunction, value, onChange, className, id, style }) {
    const [indexDict] = useMemo(() => {
        const indexDict = {};

        for (let i = 0; i < options.length; i++) {
            const display = stringMap(options[i]);
            indexDict[display] = i;
        }

        return [indexDict];
    }, [options, stringMap]);

    const displayString = stringMap(value);
    const index = indexDict[displayString];

    async function moveIndex(delta) {
        const newIndex = (index + delta + options.length) % options.length;
        onChange(options[newIndex]);
    }

    return (
        <div id={id} className={`${styles.OptionDial} ${className}`} style={style}>
            <div className={styles.FlexContainer}>
                <button className={styles.DialButton} onClick={() => moveIndex(-1)}><span className={styles.LeftTriangle}/></button>
                <span className={styles.DialDisplay}>{displayString}</span>
                <button className={styles.DialButton} onClick={() => moveIndex(1)}><span className={styles.RightTriangle}/></button>
            </div>
        </div>
    )
}

export default OptionDial;
