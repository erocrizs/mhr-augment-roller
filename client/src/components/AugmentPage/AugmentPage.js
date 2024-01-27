import React, { useState } from 'react';

function AugmentPage({setNames}) {
    const [selectedSet, setSelectedState] = useState({ setDetails: null, augmentPool: [] });

    async function fetchSelectedState(setName) {
        if (!setNames.includes(setName) || setName === selectedSet.setDetails?.name) {
            return;
        }
        
        const setResponse = await fetch(`api/sets/${setName}`);
        const setDetails = await setResponse.json();

        let augmentPool = selectedSet.augmentPool;

        if (augmentPool.length === 0 || selectedSet.setDetails.augPool !== setDetails.augPool) {
            const augmentResponse = await fetch(`api/augments/${setDetails.augPool}`);
            augmentPool = await augmentResponse.json();
        }

        setSelectedState({ setDetails, augmentPool });
    }

    return (
        <div className="AugmentPage">
            <input list="setNameList" onChange={(e) => fetchSelectedState(e.target.value)}/>
            <datalist id="setNameList">
                {setNames.map(setName => <option value={setName}/>)}
            </datalist>
            <pre>
                {JSON.stringify(selectedSet.setDetails, null, 2)}
                {JSON.stringify(selectedSet.augmentPool, null, 2)}
            </pre>
        </div>
    );
}

export default AugmentPage;
