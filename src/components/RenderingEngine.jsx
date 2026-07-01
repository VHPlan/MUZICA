import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, XSquare, Save, Settings2, Code, Terminal, AlertTriangle } from 'lucide-react';

const VUMeter = ({ active, left = true }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', height: '100px', width: '24px', background: '#000', padding: '2px', border: '1px solid var(--border-strong)', borderRadius: '2px' }}>
      {[...Array(15)].map((_, i) => {
        // Simple random activity animation when active
        const isActive = active && Math.random() > (i / 15);
        const isWarning = i < 3;
        const color = isWarning ? 'var(--error)' : i < 6 ? '#eab308' : 'var(--success)';
        return (
          <div 
            key={i} 
            style={{ 
              flex: 1, 
              background: isActive ? color : '#111',
              opacity: isActive ? 1 : 0.3,
              transition: 'background 0.1s, opacity 0.1s'
            }} 
          />
        );
      })}
      <div style={{ fontSize: '0.5rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '2px' }}>{left ? 'L' : 'R'}</div>
    </div>
  );
};

export default function RenderingEngine({ task, onDismiss }) {
  const [showConsole, setShowConsole] = useState(false);
  const [vuTick, setVuTick] = useState(0);

  const isError = task.status === 'error';
  const isDone = task.progress >= 100 && !isError;
  const isRendering = task.progress < 100 && !isError;

  useEffect(() => {
    if (!isRendering) return;
    const interval = setInterval(() => setVuTick(v => v + 1), 100);
    return () => clearInterval(interval);
  }, [isRendering]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', height: '100%', overflowY: 'auto' }}>
      
      <div className="module-panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Activity size={20} color={isError ? 'var(--error)' : isDone ? 'var(--success)' : 'var(--accent-copper)'} />
          <h2 style={{ fontSize: '1.2rem', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {isError ? 'RENDERING FAILED' : isDone ? 'RENDERING COMPLETE' : 'RENDERING ENGINE ACTIVE'}
          </h2>
        </div>
        <button className="daw-btn" onClick={onDismiss}><XSquare size={16} /> DISMISS</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '16px', flex: 1 }}>
        
        {/* LEFT COLUMN: Visualizer & Progress */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <div className="module-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#0a0a0a', border: '1px solid var(--border-strong)' }}>
            <div className="module-header"><Activity size={14}/> SPECTRUM ANALYZER</div>
            
            <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {isError ? (
                <div style={{ color: 'var(--error)', textAlign: 'center' }}>
                  <AlertTriangle size={48} style={{ marginBottom: '16px' }} />
                  <div style={{ fontWeight: 700, fontSize: '1.5rem', letterSpacing: '0.1em' }}>CRITICAL ERROR</div>
                  <div style={{ color: 'var(--text-muted)' }}>Audio engine crashed. See console.</div>
                </div>
              ) : isDone ? (
                <div style={{ color: 'var(--success)', textAlign: 'center' }}>
                  <Save size={48} style={{ marginBottom: '16px' }} />
                  <div style={{ fontWeight: 700, fontSize: '1.5rem', letterSpacing: '0.1em' }}>AUDIO EXPORTED</div>
                  <div style={{ color: 'var(--text-muted)' }}>Track added to library.</div>
                </div>
              ) : (
                <div style={{ display: 'flex', gap: '2px', alignItems: 'flex-end', height: '150px', width: '100%', padding: '0 20px' }}>
                  {[...Array(40)].map((_, i) => (
                    <motion.div 
                      key={i} 
                      animate={{ height: `${Math.random() * 80 + 10}%` }}
                      transition={{ duration: 0.1, repeat: Infinity, repeatType: "reverse" }}
                      style={{ flex: 1, background: 'var(--accent-copper)', opacity: 0.8 }}
                    />
                  ))}
                </div>
              )}
            </div>

            <div style={{ marginTop: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                <span>RENDER PROGRESS</span>
                <span style={{ color: 'var(--accent-copper)', fontFamily: 'monospace' }}>{Math.round(task.progress)}%</span>
              </div>
              <div style={{ height: '4px', background: '#000', border: '1px solid var(--border-strong)', borderRadius: '2px', overflow: 'hidden' }}>
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${task.progress}%` }}
                  style={{ height: '100%', background: isError ? 'var(--error)' : 'var(--accent-copper)' }}
                />
              </div>
            </div>
          </div>

          <div className="module-panel">
            <div className="module-header"><Terminal size={14}/> SYSTEM LOG</div>
            <div style={{ height: '100px', background: '#000', padding: '12px', overflowY: 'auto', fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              <div>[SYSTEM] Initializing audio engine...</div>
              <div>[PIAPI] Submitting parameters: {task.settings.genre} ({task.settings.tempo})</div>
              {task.progress > 10 && <div>[RENDER] Building instrumental stems...</div>}
              {task.progress > 40 && <div>[RENDER] Synthesizing vocal tracks ({task.settings.voice})...</div>}
              {task.progress > 70 && <div>[MASTER] Applying dynamics and limiting...</div>}
              {isDone && <div style={{ color: 'var(--success)' }}>[SYSTEM] Export successful.</div>}
              {isError && <div style={{ color: 'var(--error)' }}>[FATAL] {task.rawResponse}</div>}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Metadata & VU */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <div className="module-panel">
            <div className="module-header"><Settings2 size={14}/> TRACK METADATA</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '4px' }}>
                <span style={{ color: 'var(--text-muted)' }}>STYLE</span>
                <span style={{ fontWeight: 600 }}>{task.settings.genre}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '4px' }}>
                <span style={{ color: 'var(--text-muted)' }}>DYNAMICS</span>
                <span style={{ color: 'var(--accent-copper)', fontFamily: 'monospace' }}>{task.settings.energy}%</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '4px' }}>
                <span style={{ color: 'var(--text-muted)' }}>ALGORITHM</span>
                <span>{task.settings.speedMode}</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>VSTi RACK</span>
                <span style={{ color: '#fff', fontSize: '0.75rem' }}>{task.settings.instruments.join(', ') || 'Auto'}</span>
              </div>
            </div>
          </div>

          <div className="module-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div className="module-header" style={{ width: '100%' }}><Activity size={14}/> MASTER OUT</div>
            <div style={{ display: 'flex', gap: '16px', padding: '16px 0' }}>
              <VUMeter active={isRendering} left={true} />
              <VUMeter active={isRendering} left={false} />
            </div>
          </div>

          <button className={`daw-btn ${showConsole ? 'active' : ''}`} onClick={() => setShowConsole(!showConsole)}>
            <Code size={16} /> {showConsole ? 'HIDE DEBUG' : 'RAW API DEBUG'}
          </button>
        </div>

      </div>

      <AnimatePresence>
        {showConsole && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ overflow: 'hidden' }}>
            <div className="module-panel" style={{ background: '#0a0a0a' }}>
              <div className="module-header" style={{ color: 'var(--accent-copper)' }}><Code size={14}/> RAW HTTP RESPONSE</div>
              <pre style={{ background: '#000', padding: '16px', borderRadius: '4px', fontSize: '0.75rem', color: isError ? 'var(--error)' : 'var(--success)', overflowX: 'auto', border: '1px solid var(--border-strong)', fontFamily: 'monospace' }}>
                {JSON.stringify(isError ? task.rawResponse : (task.payloadSent || { status: 'Sent via AIProvider.js' }), null, 2)}
              </pre>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
