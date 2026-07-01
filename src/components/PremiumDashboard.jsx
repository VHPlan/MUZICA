import React, { useState, useEffect } from 'react';
import { Loader, CheckCircle, Disc3, Music, Play, BookOpen } from 'lucide-react';

const TRIVIA_FACTS = [
  "AI-ul analizează sute de mii de modele ritmice pentru a crea un hit unic.",
  "Fiecare melodie este generată 100% de la zero. Nu există două piese identice.",
  "Mixajul și masterizarea sunt aplicate automat pentru o claritate de studio.",
  "Vocile generate folosesc rețele neurale avansate pentru a simula emoția umană.",
  "Instrumentele sunt sintetizate folosind modele fizice pentru realism maxim."
];

export default function PremiumDashboard({ task, onReset, goToLibrary }) {
  const [triviaIndex, setTriviaIndex] = useState(0);
  const [showDebug, setShowDebug] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setTriviaIndex(prev => (prev + 1) % TRIVIA_FACTS.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  // Determine current step based on progress
  const progress = task ? task.progress : 100;
  
  const steps = [
    { label: "Analizăm stilul muzical", threshold: 15 },
    { label: "Scriem versurile", threshold: 30 },
    { label: "Compunem instrumentalul", threshold: 50 },
    { label: "Generăm vocea", threshold: 75 },
    { label: "Mix & Master", threshold: 90 },
    { label: "Pregătim fișierul final", threshold: 99 }
  ];

  const getStepStatus = (threshold) => {
    if (progress >= 100) return 'completed';
    const currentIndex = steps.findIndex(s => progress <= s.threshold);
    const thisIndex = steps.findIndex(s => s.threshold === threshold);
    
    if (thisIndex < currentIndex || (thisIndex === 0 && currentIndex === -1 && progress > 0)) return 'completed';
    if (thisIndex === currentIndex) return 'active';
    return 'pending';
  };

  const getLoadingText = () => {
    if (progress >= 100) return "Melodia este gata!";
    if (progress < 15) return "🎼 AI analizează cerințele...";
    if (progress < 30) return "✍️ Se scriu versurile...";
    if (progress < 50) return "🥁 Se creează ritmul și instrumentalul...";
    if (progress < 75) return "🎤 Se generează linia vocală...";
    if (progress < 90) return "🎧 Mixăm și masterizăm...";
    return "✨ Aproape gata...";
  };

  if (!task && progress === 100) {
    return (
      <div className="premium-dashboard-container" style={{ animation: 'fadeIn 0.5s ease-out' }}>
        <div className="dashboard-glass success-glow">
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <CheckCircle size={64} style={{ color: 'var(--success)', marginBottom: '24px', animation: 'scaleIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }} />
            <h1 style={{ fontSize: '2.5rem', marginBottom: '16px', color: '#fff' }}>Melodia a fost creată cu succes!</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', marginBottom: '40px' }}>Hitul tău este pregătit. Apasă play sau explorează biblioteca.</p>
            
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
              <button className="btn-primary glow-btn" onClick={goToLibrary} style={{ padding: '16px 32px', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Play size={20} /> Ascultă acum
              </button>
              <button className="btn-secondary" onClick={onReset} style={{ padding: '16px 32px', fontSize: '1.1rem' }}>
                Creează un alt hit
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const { genre, energy, instruments, speedMode } = task.settings;

  return (
    <div className="premium-dashboard-container" style={{ animation: 'fadeIn 0.8s ease-out' }}>
      {/* Background Ambience */}
      <div className="ambient-orb cyan"></div>
      <div className="ambient-orb purple"></div>
      
      <div className="dashboard-glass">
        {/* Header */}
        <div className="dashboard-header">
          <div className="header-icon-wrapper">
            <Disc3 size={32} className="spin-slow" style={{ color: 'var(--primary)' }} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.8rem', margin: '0 0 4px 0', color: '#fff' }}>AI creează următorul tău hit</h2>
            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '1rem' }}>{getLoadingText()}</p>
          </div>
        </div>

        {/* Main Grid */}
        <div className="dashboard-grid">
          {/* Left Column: Progress & Steps */}
          <div className="progress-section">
            <div className="progress-bar-container">
              <div className="progress-bar-glow" style={{ width: `${progress}%` }}></div>
              <div className="progress-percentage">{Math.round(progress)}%</div>
            </div>

            <div className="steps-list">
              {steps.map((step, idx) => {
                const status = getStepStatus(step.threshold);
                return (
                  <div key={idx} className={`step-item ${status}`}>
                    <div className="step-icon">
                      {status === 'completed' && <CheckCircle size={18} />}
                      {status === 'active' && <Loader size={18} className="spin-fast" />}
                      {status === 'pending' && <div className="circle-empty"></div>}
                    </div>
                    <span className="step-label">{step.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Metadata & Trivia */}
          <div className="info-section">
            <div className="metadata-card">
              <h3 style={{ fontSize: '1.1rem', color: '#fff', marginBottom: '16px' }}>Detalii Producție</h3>
              <div className="metadata-grid">
                <div className="meta-item">
                  <span className="meta-label">Gen</span>
                  <span className="meta-value">{genre}</span>
                </div>
                <div className="meta-item">
                  <span className="meta-label">Energie</span>
                  <span className="meta-value">{energy}%</span>
                </div>
                <div className="meta-item">
                  <span className="meta-label">Mod</span>
                  <span className="meta-value" style={{ color: speedMode === 'Rapid' ? 'var(--accent)' : 'var(--primary)' }}>{speedMode}</span>
                </div>
                <div className="meta-item full-width">
                  <span className="meta-label">Instrumente Principale</span>
                  <span className="meta-value" style={{ fontSize: '0.9rem' }}>{instruments.join(', ') || 'Auto'}</span>
                </div>
              </div>
            </div>

            <div className="trivia-card">
              <div className="trivia-header">
                <span className="bulb-icon">💡</span> Știai că...
              </div>
              <div className="trivia-content" key={triviaIndex} style={{ animation: 'fadeIn 0.5s' }}>
                {TRIVIA_FACTS[triviaIndex]}
              </div>
            </div>
            
            <button className="btn-secondary" style={{ width: '100%', marginTop: '16px', background: 'rgba(255,255,255,0.05)', border: 'none' }} onClick={onReset}>
              Ascunde acest panou (Rulează în fundal)
            </button>

            <button className="btn-secondary" style={{ width: '100%', marginTop: '8px', background: 'transparent', border: '1px dashed rgba(255,255,255,0.2)', color: 'var(--text-muted)' }} onClick={() => setShowDebug(!showDebug)}>
              {showDebug ? 'Ascunde Debug' : '⚙️ Arată Debug Mode'}
            </button>
          </div>
        </div>

        {/* Debug Panel */}
        {showDebug && task && (
          <div style={{ marginTop: '24px', padding: '20px', background: 'rgba(0,0,0,0.5)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', overflowX: 'auto' }}>
            <h3 style={{ color: 'var(--primary)', marginBottom: '16px' }}>Debug Mode</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div><strong>Provider:</strong> {task.provider}</div>
              <div><strong>Model:</strong> {task.modelUsed}</div>
              <div style={{ gridColumn: 'span 2' }}><strong>Endpoint:</strong> {task.endpointUsed}</div>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <strong>Payload trimis (Spre AI):</strong>
              <pre style={{ background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '8px', fontSize: '0.8rem', color: '#a78bfa' }}>
                {JSON.stringify(task.payloadSent, null, 2)}
              </pre>
            </div>
            <div>
              <strong>Răspuns PiAPI (Task Creation):</strong>
              <pre style={{ background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '8px', fontSize: '0.8rem', color: '#34d399' }}>
                {JSON.stringify(task.rawResponse, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
