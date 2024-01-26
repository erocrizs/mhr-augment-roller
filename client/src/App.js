import React, {useEffect, useState} from 'react';
import logo from './logo.svg';
import './App.css';

function App() {
  const [users, setUsers] = useState(['a', 'b', 'c', 'd']);
  
  useEffect(() => {
    async function fetchUsers() {
      const response = await fetch('/api');
      const data = await response.json();
      setUsers(data.users);
    }

    fetchUsers();
  });

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
        <ol>
          {users.map(user => <li>{user}</li>)}
        </ol>
      </header>
    </div>
  );
}

export default App;
