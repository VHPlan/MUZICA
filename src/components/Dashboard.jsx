import React from 'react';

export default function Dashboard() {
  return (
    <div className="glass-panel" style={{ padding: '32px', minHeight: '400px' }}>
      <h2 style={{ marginBottom: '24px' }}>Melodii Recente</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
        {/* Mock card */}
        <div style={{ background: 'rgba(0,0,0,0.3)', padding: '16px', borderRadius: '12px', border: 'var(--glass-border)' }}>
          <div style={{ height: '140px', background: 'var(--primary)', borderRadius: '8px', marginBottom: '12px', opacity: 0.8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: '3rem' }}>🎵</span>
          </div>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '4px' }}>Banii și Valoarea</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Gen: Manele • 3:12</p>
          <button onClick={() => alert("Aceasta este doar o machetă vizuală pentru design! Melodiile vor funcționa după ce conectăm API-ul.")} className="btn-primary" style={{ width: '100%', marginTop: '12px', padding: '8px' }}>▶ Redă Piesa</button>
        </div>
      </div>
    </div>
  );
}
