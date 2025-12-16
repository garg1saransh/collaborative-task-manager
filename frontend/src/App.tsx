import { useState } from 'react';
import { LoginPage } from './features/auth/LoginPage';
import { loadAuth } from './features/auth/authStore';

function App() {
  const initial = loadAuth();
  const [token, setToken] = useState(initial.token);

  function handleLoggedIn() {
    const updated = loadAuth();
    setToken(updated.token);
  }

  function handleLogout() {
    localStorage.removeItem('auth');
    setToken(null);
  }

  if (!token) {
    return <LoginPage onLoggedIn={handleLoggedIn} />;
  }

  return (
    <div>
      <header style={{ padding: 16, borderBottom: '1px solid #ddd' }}>
        <span>Task Manager</span>
        <button style={{ marginLeft: 16 }} onClick={handleLogout}>
          Logout
        </button>
      </header>
      <main style={{ padding: 16 }}>
        <p>Logged in. Tasks UI will go here.</p>
      </main>
    </div>
  );
}

export default App;