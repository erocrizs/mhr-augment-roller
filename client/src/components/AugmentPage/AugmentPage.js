import React, { useState, useEffect } from 'react';
import ArmorPiecePanel from '../ArmorPiecePanel/ArmorPiecePanel';

function AugmentPage({ setNames }) {
    const [armorSetInput, setArmorSetInput] = useState('');
    const [armorPieceInput, setArmorPieceInput] = useState('');
    const [setDetails, setSetDetails] = useState(null);
    // eslint-disable-next-line
    const [augmentPool, setAugmentPool] = useState([]);
    const [armorPiece, setArmorPiece] = useState(null);

    useEffect(() => {
        if (!setNames.includes(armorSetInput) || armorSetInput === setDetails?.name) {
            return;
        }

        async function fetchSetDetails() {
            const setDetailsResponse = await fetch(`api/sets/${armorSetInput}`);
            const setDetails = await setDetailsResponse.json();
            setSetDetails(setDetails);
            setArmorPieceInput(setDetails.pieces[0].name);
        }

        fetchSetDetails();
    }, [armorSetInput, setNames, setDetails?.name]);

    useEffect(() => {
        if (!setDetails?.augPool) {
            setAugmentPool([]);
            return;
        }

        async function fetchAugmentPool() {
            const augmentPoolResponse = await fetch(`api/augments/${setDetails?.augPool}`);
            const augmentPool = await augmentPoolResponse.json();
            setAugmentPool(augmentPool);
        }

        fetchAugmentPool();
    }, [setDetails?.augPool]);

    useEffect(() => {
        const armorPiece = setDetails?.pieces.find(piece => piece.name === armorPieceInput);
        if (armorPiece) {
            setArmorPiece(armorPiece);
        }
    }, [armorPieceInput, setDetails?.pieces]);

    return (
        <div className="AugmentPage">
            <input list="setNameList"
                value={armorSetInput}
                onChange={(e) => setArmorSetInput(e.target.value)}
                placeholder="Choose an armor set"/>
            <datalist id="setNameList">
                {setNames.map(setName => <option value={setName} key={setName}/>)}
            </datalist>
            <input list="armorPieceList"
                value={armorPieceInput}
                onChange={(e) => setArmorPieceInput(e.target.value)}
                disabled={setDetails === null}
                placeholder="Choose an armor piece"/>
            <datalist id="armorPieceList">
                {setDetails?.pieces.map(piece => <option value={piece.name} key={piece.name}/>)}
            </datalist>
            <ArmorPiecePanel armorPiece={armorPiece}/>
        </div>
    );
}

export default AugmentPage;
