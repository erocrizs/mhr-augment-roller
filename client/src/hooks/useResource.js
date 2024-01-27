import { useState, useEffect } from 'react';

async function fetchResource(path) {
    const response = await fetch(path);
    const data = await response.json();
    return data;
}

export function useResource(path, defaultValue) {
    const [resource, setResource] = useState(defaultValue);

    useEffect(() => {
        fetchResource(path).then(setResource);
    });

    return resource;
}
