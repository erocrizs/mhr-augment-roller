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
import { levelUpgradeToList } from '../../library/decoSlot';

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

function DecoSlotBlock({ decoList, slotChange = 0, className }) {
    const slotChanges = levelUpgradeToList(decoList, slotChange);
    return (
        <span className={`${styles.DecoSlotBlock} ${className}`}>
            <span className={styles.FlexContainer}>
                {
                    decoList.map(
                        (slotLevel, idx) => <DecoSlot slotLevel={slotLevel} slotChange={slotChanges[idx]} key={idx}/>
                    )
                }
            </span>
        </span>
    )
}

export default DecoSlotBlock;