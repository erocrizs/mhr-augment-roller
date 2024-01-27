import React from 'react';
import { useResource } from './hooks/useResource';
import './App.css';

function App() {
    const setNames = useResource('/api/sets', []);

    return (
        <div className="App">
            Hello World
            <ul>
                {setNames.map(setName => <li>{setName}</li>)}
            </ul>
        </div>
    );
}

export default App;
