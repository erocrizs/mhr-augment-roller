import React from 'react';
import styles from './ResistanceIcon.module.css';

import defenseSrc from '../../assets/resistances/defense.png';
import fireSrc from '../../assets/resistances/fire.png';
import waterSrc from '../../assets/resistances/water.png';
import thunderSrc from '../../assets/resistances/thunder.png';
import iceSrc from '../../assets/resistances/ice.png';
import dragonSrc from '../../assets/resistances/dragon.png';

function BaseIcon({src, size}) {
    const style = {
        backgroundImage: `url(${src})`,
        width: `${size}px`,
        height: `${size}px`,
    };
    return <div className={styles.ResistanceIcon} style={style}/>;
}

export function DefenseIcon({size}) {
    return <BaseIcon src={defenseSrc} size={size}/>;
}
export function FireIcon({size}) {
    return <BaseIcon src={fireSrc} size={size}/>;
}
export function WaterIcon({size}) {
    return <BaseIcon src={waterSrc} size={size}/>;
}
export function ThunderIcon({size}) {
    return <BaseIcon src={thunderSrc} size={size}/>;
}
export function IceIcon({size}) {
    return <BaseIcon src={iceSrc} size={size}/>;
}
export function DragonIcon({size}) {
    return <BaseIcon src={dragonSrc} size={size}/>;
}
