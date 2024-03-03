import React from "react";
import styles from './AugmentButton.module.css';

function AugmentButton({ attempts, maxAttempt, mode, message, simulating, startSimulation, endSimulation, disabled }) {
    const messageClassName = [styles.Message];
    if (disabled) {
        messageClassName.push(styles.Error);
    }
    if (simulating) {
        messageClassName.push(styles.Simulating);
    }

    return <div className={styles.AugmentButton}>
        {
            simulating
            ? <input type="button" value={`Cancel Simulation`} className={styles.Button} disabled={disabled} onClick={endSimulation}/>
            : <input type="button" value={`Simulate ${mode[0].toUpperCase()}${mode.substring(1)} Augments`} className={styles.Button} disabled={disabled} onClick={startSimulation}/>
        }
        <span className={messageClassName.filter(x => !!x).join(' ')} style={{backgroundSize: `${(100 * attempts)/maxAttempt}%`}}>
            {simulating ? `${attempts.toLocaleString()} / ${maxAttempt.toLocaleString()}` : message}
        </span>
    </div>;
}

export default AugmentButton;