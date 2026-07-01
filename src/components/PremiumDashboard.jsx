import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader, CheckCircle, Disc3, Music, Play, Zap, Info } from 'lucide-react';

export default function PremiumDashboard({ task, onReset, goToLibrary }) {
  const [showDebug, setShowDebug] = useState(false);
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
    if (progress < 15) return "AI analizează cerințele...";
    if (progress < 30) return "Se scriu versurile...";
    if (progress < 50) return "Se creează ritmul și instrumentalul...";
    if (progress < 75) return "Se generează linia vocală...";
    if (progress < 90) return "Mixăm și masterizăm...";
    return "Aproape gata...";
  };

  if (!task && progress === 100) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        style={{ padding: '80px 20px', textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}
      >
        <div className="glass-panel" style={{ padding: '60px 40px', border: '1px solid var(--success)' }}>
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.2 }}
          >
            <CheckCircle size={80} style={{ color: 'var(--success)', marginBottom: '32px' }} />
          </motion.div>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '16px', color: '#fff', fontWeight: 800, letterSpacing: '-0.02em' }}>Melodia este gata!</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', marginBottom: '48px' }}>Hitul tău a fost generat, mixat și masterizat cu succes.</p>
          
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
            <button className="btn-primary" onClick={goToLibrary} style={{ padding: '16px 32px', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Play size={20} /> Ascultă acum
            </button>
            <button className="btn-secondary" onClick={onReset} style={{ padding: '16px 32px', fontSize: '1.1rem' }}>
              Creează alt hit
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  const { genre, energy, instruments, speedMode } = task.settings;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel" 
      style={{ padding: '40px', minHeight: '600px', maxWidth: '1000px', margin: '0 auto', border: '1px solid var(--border-gold)' }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '48px', borderBottom: '1px solid var(--border-glass)', paddingBottom: '32px' }}>
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--glow-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--primary)' }}
        >
          <Disc3 size={32} color="var(--primary)" />
        </motion.div>
        <div>
          <h2 style={{ fontSize: '2rem', margin: '0 0 8px 0', color: '#fff', letterSpacing: '-0.02em' }}>Studioul Lucrează...</h2>
          <p style={{ margin: 0, color: 'var(--primary)', fontSize: '1.1rem', fontWeight: 500 }}>{getLoadingText()}</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '40px' }}>
        {/* Left Column: Progress Timeline */}
        <div>
          <div style={{ marginBottom: '32px', background: 'var(--bg-card)', borderRadius: '100px', padding: '6px', border: '1px solid var(--border-glass)', overflow: 'hidden' }}>
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
              style={{ height: '8px', background: 'linear-gradient(90deg, var(--primary), var(--accent))', borderRadius: '100px', boxShadow: '0 0 15px var(--glow-gold)' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {steps.map((step, idx) => {
              const status = getStepStatus(step.threshold);
              return (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '16px', opacity: status === 'pending' ? 0.4 : 1, transition: 'opacity 0.3s' }}>
                  <div style={{ 
                    width: '32px', height: '32px', borderRadius: '50%', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: status === 'completed' ? 'var(--success)' : status === 'active' ? 'var(--glow-gold)' : 'rgba(255,255,255,0.05)',
                    border: `1px solid ${status === 'active' ? 'var(--primary)' : 'transparent'}`
                  }}>
                    {status === 'completed' && <CheckCircle size={16} color="#000" />}
                    {status === 'active' && <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}><Loader size={16} color="var(--primary)" /></motion.div>}
                    {status === 'pending' && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--text-muted)' }} />}
                  </div>
                  <span style={{ fontSize: '1.1rem', color: status === 'active' ? '#fff' : 'var(--text-muted)', fontWeight: status === 'active' ? 600 : 400 }}>{step.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Metadata */}
        <div>
          <div style={{ background: 'var(--bg-card)', padding: '32px', borderRadius: '24px', border: '1px solid var(--border-glass)' }}>
            <h3 style={{ fontSize: '1.2rem', color: '#fff', margin: '0 0 24px 0', display: 'flex', alignItems: 'center', gap: '8px' }}><Info size={18} color="var(--primary)"/> Detalii Producție</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '16px', borderBottom: '1px solid var(--border-glass)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Gen</span>
                <span style={{ color: '#fff', fontWeight: 600 }}>{genre}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '16px', borderBottom: '1px solid var(--border-glass)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Energie</span>
                <span style={{ color: 'var(--primary)', fontWeight: 600 }}>{energy}%</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '16px', borderBottom: '1px solid var(--border-glass)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Mod Generare</span>
                <span style={{ color: '#fff', fontWeight: 600 }}>{speedMode}</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>Instrumente</span>
                <span style={{ color: '#fff', fontSize: '0.95rem' }}>{instruments.join(', ') || 'Auto'}</span>
              </div>
            </div>
          </div>

          <button className="btn-secondary" style={{ width: '100%', marginTop: '24px' }} onClick={onReset}>
            Rulează în fundal
          </button>
          
          <button className="btn-secondary" style={{ width: '100%', marginTop: '12px', background: 'transparent', border: '1px dashed var(--border-glass)' }} onClick={() => setShowDebug(!showDebug)}>
            {showDebug ? 'Ascunde Debug' : '⚙️ Arată Debug Mode'}
          </button>
        </div>
      </div>

      {/* Debug Panel */}
      <AnimatePresence>
        {showDebug && task && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{ marginTop: '32px', overflow: 'hidden' }}
          >
            <div style={{ padding: '24px', background: '#0a0a0a', borderRadius: '16px', border: '1px solid var(--border-glass)' }}>
              <h3 style={{ color: 'var(--primary)', margin: '0 0 16px 0' }}>Sistem Debug Intern</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                <div style={{ background: '#111', padding: '12px', borderRadius: '8px' }}><strong>Provider:</strong> {task.provider}</div>
                <div style={{ background: '#111', padding: '12px', borderRadius: '8px' }}><strong>Model:</strong> {task.modelUsed}</div>
                <div style={{ gridColumn: 'span 2', background: '#111', padding: '12px', borderRadius: '8px' }}><strong>Endpoint:</strong> {task.endpointUsed}</div>
              </div>
              <div style={{ marginBottom: '16px' }}>
                <strong style={{ color: '#9ca3af' }}>Payload trimis (Spre AI):</strong>
                <pre style={{ background: '#000', padding: '16px', borderRadius: '12px', fontSize: '0.85rem', color: '#a78bfa', overflowX: 'auto', marginTop: '8px' }}>
                  {JSON.stringify(task.payloadSent, null, 2)}
                </pre>
              </div>
              <div>
                <strong style={{ color: '#9ca3af' }}>Răspuns PiAPI:</strong>
                <pre style={{ background: '#000', padding: '16px', borderRadius: '12px', fontSize: '0.85rem', color: '#34d399', overflowX: 'auto', marginTop: '8px' }}>
                  {JSON.stringify(task.rawResponse, null, 2)}
                </pre>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
