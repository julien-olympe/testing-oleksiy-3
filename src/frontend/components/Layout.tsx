import { ReactNode } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header
        style={{
          backgroundColor: '#2c3e50',
          color: 'white',
          padding: '1rem 2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <h1 style={{ margin: 0, fontSize: '1.5rem' }}>Wind Power Plant Investigation</h1>
        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span>{user.username}</span>
            <button
              onClick={handleLogout}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#e74c3c',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              Logout
            </button>
          </div>
        )}
      </header>
      <main style={{ flex: 1, padding: '2rem' }}>{children}</main>
      <footer
        style={{
          backgroundColor: '#ecf0f1',
          padding: '1rem',
          textAlign: 'center',
          color: '#7f8c8d',
        }}
      >
        <p style={{ margin: 0 }}>Version 1.0.0</p>
      </footer>
    </div>
  );
}
