import { useState, useEffect } from 'react';

export async function fetchResource(path) {
    const response = await fetch(`${process.env.REACT_APP_BACKEND_DOMAIN}${path}`);
    const data = await response.json();
    return data;
}

export function useResource(path, defaultValue) {
    const [resource, setResource] = useState(defaultValue);

    useEffect(() => {
        fetchResource(path).then(setResource);
    }, [path]);

    return resource;
}
