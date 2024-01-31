import React from 'react';
import { useResource } from './hooks/useResource';
import styles from './App.module.css';
import AugmentPage from './components/AugmentPage/AugmentPage';

function App() {
    const setNames = useResource('/api/sets', []);
    const skills = useResource('/api/skills', []);

    return (
        <div className={styles.App}>
            <header className={styles.Header}>
                <h1>MH Sunbreak Augment Simulator</h1>
            </header>
            <main className={styles.Main}>
                <AugmentPage setNames={setNames} skills={skills} />
            </main>
        </div>
    );
}

export default App;
