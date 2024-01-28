import React from 'react';
import styles from './DecoSlotBlock.module.css';

import deco10 from '../../assets/decos/deco1.png';
import deco11 from '../../assets/decos/deco1-1.png';
import deco20 from '../../assets/decos/deco2.png';
import deco21 from '../../assets/decos/deco2-1.png';
import deco22 from '../../assets/decos/deco2-2.png';
import deco30 from '../../assets/decos/deco3.png';
import deco31 from '../../assets/decos/deco3-1.png';
import deco32 from '../../assets/decos/deco3-2.png';
import deco33 from '../../assets/decos/deco3-3.png';
import deco40 from '../../assets/decos/deco4.png';
import deco41 from '../../assets/decos/deco4-1.png';
import deco42 from '../../assets/decos/deco4-2.png';
import deco43 from '../../assets/decos/deco4-3.png';
import deco44 from '../../assets/decos/deco4-4.png';

const sourceMap = {
    '1': [deco10, deco11],
    '2': [deco20, deco21, deco22],
    '3': [deco30, deco31, deco32, deco33],
    '4': [deco40, deco41, deco42, deco43, deco44],
};

function DecoSlot({ slotLevel, slotChange }) {
    const finalSlotLevel = slotLevel + slotChange;
    
    if (finalSlotLevel === 0) {
        return (<span className={styles.SlotImage}>-</span>)
    }

    return (
        <img className={styles.SlotImage}
            src={sourceMap[finalSlotLevel][slotChange]}
            alt={`Deco Slot ${finalSlotLevel}`}/>
    );
}

function getSlotChanges(baseSlotLevels, slotChange) {
    const slotLevels = Array.from(baseSlotLevels);
    const slotChanges = [0, 0, 0];

    for (let i = 0; i < slotChange; i++) {
        if (slotLevels[2] === 4) {
            break;
        }

        if (slotLevels[2] === 0) {
            let updated = false;

            for (let slotIdx = 0; slotIdx < 3; slotIdx++) {
                if (slotLevels[slotIdx] === 0) {
                    slotLevels[slotIdx] += 1;
                    slotChanges[slotIdx] += 1;
                    updated = true;
                    break;
                }
            }

            if (updated) {
                continue;
            }
        }

        for (let slotIdx = 0; slotIdx < 3; slotIdx++) {
            if (slotLevels[slotIdx] < 4) {
                slotLevels[slotIdx] += 1;
                slotChanges[slotIdx] += 1;
                break;
            }
        }
    }

    return slotChanges;
}

function DecoSlotBlock({ decoString, slotChange = 0, className }) {
    const baseSlotLevels = decoString.split('').map(Number);

    while (baseSlotLevels.length < 3) {
        baseSlotLevels.push(0);
    }

    const slotChanges = getSlotChanges(baseSlotLevels, slotChange);

    return (
        <span className={`${styles.DecoSlotBlock} ${className}`}>
            <span className={styles.FlexContainer}>
                {
                    baseSlotLevels.map(
                        (slotLevel, idx) => <DecoSlot slotLevel={slotLevel} slotChange={slotChanges[idx]} key={idx}/>
                    )
                }
            </span>
        </span>
    )
}

export default DecoSlotBlock;