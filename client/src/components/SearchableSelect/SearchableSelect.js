import React, { useState, useMemo, useEffect } from 'react';

const identityFunction = (i => i);

function SearchableSelect({ options, stringMap = identityFunction, value, onChange, id, onBlur, placeholder, ...inputProps }) {
    const defaultValue = value ? stringMap(value) : '';
    const [inputString, setInputString] = useState(defaultValue);

    useEffect(() => {
        setInputString(value ? stringMap(value) : '');
    }, [value, stringMap])

    const [valueMap, validValues] = useMemo(() => {
        const valueMap = {};
        const validValues = [];

        for (let option of options) {
            const value = stringMap(option);
            validValues.push(value);
            valueMap[value] = option;
        }

        return [valueMap, validValues];
    }, [options, stringMap]);

    async function onInputBlur() {
        if (onBlur) {
            await onBlur();
        }

        if (inputString === '') {
            await onChange(null);
            return;
        }

        if (!validValues.includes(inputString)) {
            console.log("defocus");
            setInputString(defaultValue);
            return;
        }

        await onChange(valueMap[inputString]);
    }

    async function onInputChange(value) {
        console.log("update input to " + value);
        setInputString(value);

        if (value === '') {
            await onChange(null);
            return;
        }
        
        if (validValues.includes(value)) {
            console.log("detected value " + value);
            await onChange(valueMap[value]);
        }
    }

    const listId = `${id}-list`;
    return (
        <>
            <input list={listId}
                value={inputString}
                onChange={e => onInputChange(e.target.value)}
                onBlur={onInputBlur}
                placeholder={defaultValue ? defaultValue : placeholder}
                {...inputProps}/>
            <datalist id={listId}>
                { validValues.map(v => <option value={v} key={v}/>) }
            </datalist>
        </>
    )
}

export default SearchableSelect;
