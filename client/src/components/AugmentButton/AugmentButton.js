import React from "react";
import styles from './AugmentButton.module.css';

function AugmentButton({mode, message, disabled}) {
    const messageClassName = [styles.Message];
    if (disabled) {
        messageClassName.push(styles.Error);
    }

    return <div className={styles.AugmentButton}>
        <input type="button" value={`Simulate ${mode} Augments`} className={styles.Button} disabled={disabled}/>
        <span className={messageClassName.filter(x => !!x).join(' ')}>{message}</span>
    </div>;
}

export default AugmentButton;