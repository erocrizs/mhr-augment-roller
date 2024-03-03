import { useState, useEffect } from 'react';

async function fetchResource(path) {
    const response = await fetch(path);
    const data = await response.json();
    return data;
}

export function useResource(path, defaultValue) {
    const [resource, setResource] = useState(defaultValue);

    useEffect(() => {
        fetchResource(`${process.env.REACT_APP_BACKEND_DOMAIN}${path}`).then(setResource);
    }, [path]);

    return resource;
}
