import React, { useState } from 'react';

function AugmentPage({setNames}) {
    const [armorSet, setArmorSet] = useState({ setDetails: null, augmentPool: [] });
    const [armorPiece, setArmorPiece] = useState(null);

    async function fetchSelectedState(setName) {
        if (!setNames.includes(setName) || setName === armorSet.setDetails?.name) {
            return;
        }
        
        const setResponse = await fetch(`api/sets/${setName}`);
        const setDetails = await setResponse.json();

        let augmentPool = armorSet.augmentPool;

        if (augmentPool.length === 0 || armorSet.setDetails.augPool !== setDetails.augPool) {
            const augmentResponse = await fetch(`api/augments/${setDetails.augPool}`);
            augmentPool = await augmentResponse.json();
        }

        setArmorSet({ setDetails, augmentPool });
        setArmorPiece(null);
    }

    function updateSelectedArmorPiece(pieceName) {
        const armorPiece = armorSet.setDetails.pieces.find(piece => piece.name === pieceName);
        setArmorPiece(armorPiece);
    }

    return (
        <div className="AugmentPage">
            <input list="setNameList" onChange={(e) => fetchSelectedState(e.target.value)} placeholder="Choose an armor set"/>
            <datalist id="setNameList">
                {setNames.map(setName => <option value={setName}/>)}
            </datalist>
            <input list="armorPieceList" onChange={(e) => updateSelectedArmorPiece(e.target.value)} disabled={armorSet.setDetails === null} placeholder="Choose an armor piece"/>
            <datalist id="armorPieceList">
                {armorSet.setDetails?.pieces.map(piece => <option value={piece.name}/>)}
            </datalist>
            <pre>
                {JSON.stringify(armorPiece, null, 2)}
            </pre>
        </div>
    );
}

export default AugmentPage;
