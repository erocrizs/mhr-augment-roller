import React, { useCallback, useState } from 'react';
import ArmorPiecePanel from '../ArmorPiecePanel/ArmorPiecePanel';
import SearchableSelect from '../SearchableSelect/SearchableSelect';

function AugmentPage({ setNames }) {
    const [loadingSet, setLoadingSet] = useState(false);
    const [setDetails, setSetDetails] = useState(null);
    const [armorPiece, setArmorPiece] = useState(null);
    // eslint-disable-next-line
    const [loadingAugPool, setLoadingAugPool] = useState(false);
    // eslint-disable-next-line
    const [augmentPool, setAugmentPool] = useState([]);

    const getPieceName = useCallback(piece => piece.name, []);

    async function updateSet(setName) {
        if (setDetails?.name === setName) {
            return;
        }

        setArmorPiece(null);

        if (!setName) {
            setSetDetails(null);
            return;
        }

        setLoadingSet(true);
        setSetDetails({name: setName});
        const setDetailsResponse = await fetch(`api/sets/${setName}`);
        const newSetDetails = await setDetailsResponse.json();
        const keepAugPool = setDetails?.augPool === newSetDetails.augPool;
        setLoadingSet(false);
        setSetDetails(newSetDetails);

        if (keepAugPool) {
            return;
        }

        setLoadingAugPool(true);
        setAugmentPool([]);
        const augPoolResponse = await fetch(`api/augments/${newSetDetails?.augPool}`);
        const newAugPool = await augPoolResponse.json();
        setLoadingAugPool(false);
        setAugmentPool(newAugPool);
    }

    return (
        <div className="AugmentPage">
            <SearchableSelect
                options={setNames}
                value={setDetails?.name ?? null}
                onChange={updateSet}
                id="SetNameInput"
                placeholder="Choose an armor set"/>
            <SearchableSelect
                options={setDetails?.pieces ?? []}
                stringMap={getPieceName}
                value={armorPiece}
                onChange={setArmorPiece}
                id="ArmorPieceInput"
                disabled={loadingSet || !setDetails?.pieces}
                placeholder="Choose an armor piece"/>
            <ArmorPiecePanel armorPiece={armorPiece}/>
        </div>
    );
}

export default AugmentPage;
