import React from 'react';
import { useResource } from './hooks/useResource';
import './App.css';
import AugmentPage from './components/AugmentPage/AugmentPage';

function App() {
    const setNames = useResource('/api/sets', []);

    return (
        <div className="App">
            <AugmentPage setNames={setNames} />
        </div>
    );
}

export default App;
