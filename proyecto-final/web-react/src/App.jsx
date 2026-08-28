import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Chat from './pages/Chat';
import Catalog from './pages/Catalog';

function Screen() {
  const { session } = useAuth();
  const [view, setView] = useState('chat'); // 'chat' | 'catalog'

  if (!session?.token) return <Login />;

  return view === 'chat' ? (
    <Chat view={view} onChangeView={setView} />
  ) : (
    <Catalog view={view} onChangeView={setView} />
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Screen />
    </AuthProvider>
  );
}
