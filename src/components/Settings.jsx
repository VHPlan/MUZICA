import React, { useState, useEffect } from 'react';

export default function Settings() {
  const [apiKey, setApiKey] = useState('');

  useEffect(() => {
    const savedKey = localStorage.getItem('piapi_key');
    if (savedKey) setApiKey(savedKey);
  }, []);

  const handleSave = () => {
    localStorage.setItem('piapi_key', apiKey);
    alert('Cheia API a fost salvată cu succes local!');
  };

  return (
    <div className="glass-panel" style={{ padding: '32px', minHeight: '400px', maxWidth: '600px' }}>
      <h2 style={{ marginBottom: '24px' }}>Setări de Conexiune (Cloud)</h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>
        Cheia ta este salvată securizat doar în browserul tău. Nu este trimisă către niciun alt server în afară de PiAPI.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div>
          <label className="label-title">PiAPI Key (Pentru Muzică - Udio/Suno)</label>
          <input 
            type="password" 
            className="input-field" 
            placeholder="Introduce cheia..." 
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
          />
        </div>

        <button className="btn-primary" onClick={handleSave} style={{ width: 'fit-content' }}>💾 Salvează Cheia</button>
      </div>
    </div>
  );
}
