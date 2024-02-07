import React, { useCallback, useEffect, useRef, useState } from "react";
import styles from './AugmentButton.module.css';
import { simulateAugment } from "../../library/simulator";

const maxAttempt = 10_000;

function AugmentButton({ mode, message, disabled, armorPiece, armorSet, augmentPool, skills, onValidAugment, simulating, setSimulating }) {
    const [attempts, setAttempts] = useState(0);
    const simulationInterval = useRef();

    const startSimulation = useCallback(() => {
        if (!armorSet || !armorPiece) {
            return;
        }

        if (simulationInterval.current) {
            clearInterval(simulationInterval.current);
        }

        simulationInterval.current = setInterval(() => {
            setAttempts(a => a + 10);
            for (let i = 0; i < 100; i++) {
                onValidAugment(
                    simulateAugment(armorPiece, augmentPool, armorSet.budget, skills, mode)
                );
            }
        }, 1);
    }, [armorPiece, augmentPool, armorSet, skills, mode, onValidAugment]);

    useEffect(() => {
        if (attempts === 0 && simulating && !simulationInterval.current) {
            startSimulation();
        }
        
        if (simulationInterval.current && (!simulating || attempts >= maxAttempt)) {
            clearInterval(simulationInterval.current);
            simulationInterval.current = null;
            setSimulating(false);
        }
    }, [attempts, simulating, startSimulation, setSimulating]);

    const messageClassName = [styles.Message];
    if (disabled) {
        messageClassName.push(styles.Error);
    }

    function startSimulating() {
        setSimulating(true);
        setAttempts(0);
    }

    function endSimulating() {
        setSimulating(false);
    }

    return <div className={styles.AugmentButton}>
        {
            simulating
            ? <input type="button" value={`Cancel Simulation ${attempts} / ${maxAttempt}`} className={styles.Button} disabled={disabled} onClick={endSimulating}/>
            : <input type="button" value={`Simulate ${mode} Augments`} className={styles.Button} disabled={disabled} onClick={startSimulating}/>
        }
        <span className={messageClassName.filter(x => !!x).join(' ')}>{message}</span>
    </div>;
}

export default AugmentButton;