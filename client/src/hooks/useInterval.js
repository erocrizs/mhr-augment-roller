import { useEffect, useRef, useState } from 'react';

/**
 * @param {Function} func function to call on interval; interval stops when this returns false
 * @param {Number} delay interval in MS between calls
 */
function useInterval(func, delay) {
    const intervalId = useRef(null);
    const intervalFunction = useRef();
    const [isRunning, setIsRunning] = useState(false);

    useEffect(() => {
        intervalFunction.current = func;
    }, [func]);

    if (isRunning && intervalId.current === null) {
        intervalId.current = setInterval(() => {
            if (!isRunning) {
                return;
            }

            const result = intervalFunction.current();
            if (result === false) {
                setIsRunning(false);
            }
        }, delay);
    }
    else if (!isRunning && intervalId.current !== null) {
        clearInterval(intervalId.current);
        intervalId.current = null;
    }

    return {
        isRunning,
        startInterval: () => setIsRunning(true),
        endInterval: () => setIsRunning(false)
    };
}

export default useInterval;