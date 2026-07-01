import React, { useState } from 'react';
import Dashboard from './components/Dashboard';
import ArtistStudio from './components/ArtistStudio';
import Settings from './components/Settings';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="app-container">
      {/* Sidebar */}
      <div className="sidebar">
        <h2 style={{ color: 'var(--secondary)' }}>AI Studio</h2>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '20px' }}>
          <button 
            style={{ 
              background: 'transparent', 
              color: activeTab === 'dashboard' ? 'var(--secondary)' : 'var(--text-muted)',
              border: 'none', 
              textAlign: 'left', 
              fontSize: '1rem', 
              cursor: 'pointer' 
            }}
            onClick={() => setActiveTab('dashboard')}
          >
            🏠 Dashboard
          </button>
          <button 
            style={{ 
              background: 'transparent', 
              color: activeTab === 'studio' ? 'var(--secondary)' : 'var(--text-muted)',
              border: 'none', 
              textAlign: 'left', 
              fontSize: '1rem', 
              cursor: 'pointer' 
            }}
            onClick={() => setActiveTab('studio')}
          >
            🎵 Artist Studio
          </button>
          <button 
            style={{ 
              background: 'transparent', 
              color: activeTab === 'settings' ? 'var(--secondary)' : 'var(--text-muted)',
              border: 'none', 
              textAlign: 'left', 
              fontSize: '1rem', 
              cursor: 'pointer' 
            }}
            onClick={() => setActiveTab('settings')}
          >
            ⚙️ Setări
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <div className="header">
          <h1>
            {activeTab === 'dashboard' && 'Dashboard'}
            {activeTab === 'studio' && 'Studio Creație'}
            {activeTab === 'settings' && 'Setări API'}
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>Bine ai venit în studioul tău virtual.</p>
        </div>

        {/* Tab Content */}
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'studio' && <ArtistStudio />}
        {activeTab === 'settings' && <Settings />}
      </div>
    </div>
  );
}

export default App;
