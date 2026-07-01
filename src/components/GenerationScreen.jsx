import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, CheckCircle2, AlertCircle, RefreshCw, ChevronLeft } from 'lucide-react';

export default function GenerationScreen({ task, onDismiss }) {
  const isError = task.status === 'error';
  const isDone = task.progress >= 100 && !isError;

  if (isError) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ padding: '100px 20px', textAlign: 'center', maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ background: 'rgba(239, 68, 68, 0.1)', padding: '64px', borderRadius: 'var(--radius-lg)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
          <AlertCircle size={80} color="#ef4444" style={{ marginBottom: '32px' }} />
          <h1 style={{ fontSize: '3rem', marginBottom: '24px', color: '#ef4444' }}>Generare întreruptă</h1>
          <p style={{ fontSize: '1.25rem', color: '#fca5a5', marginBottom: '48px', lineHeight: 1.5 }}>
            {task.rawResponse}
          </p>
          <div style={{ display: 'flex', gap: '24px', justifyContent: 'center' }}>
            <button className="btn-primary" onClick={onDismiss} style={{ background: '#ef4444', color: '#fff' }}>
              <RefreshCw /> Încearcă din nou
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  if (isDone) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ padding: '100px 20px', textAlign: 'center', maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ background: 'var(--bg-card)', padding: '64px', borderRadius: 'var(--radius-lg)' }}>
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', damping: 15 }}>
            <CheckCircle2 size={80} color="#10b981" style={{ marginBottom: '32px' }} />
          </motion.div>
          <h1 style={{ fontSize: '3rem', marginBottom: '24px' }}>Magia e gata!</h1>
          <p style={{ fontSize: '1.25rem', color: 'var(--text-muted)', marginBottom: '48px' }}>
            Noua ta piesă este pregătită și a fost salvată în bibliotecă.
          </p>
          <button className="btn-primary" onClick={onDismiss}>
            <ChevronLeft /> Creează o altă piesă
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ padding: '100px 20px', textAlign: 'center', maxWidth: '800px', margin: '0 auto' }}>
      
      <div style={{ position: 'relative', width: '200px', height: '200px', margin: '0 auto 64px' }}>
        {/* Magic glowing orb */}
        <motion.div 
          animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: '50%', background: 'linear-gradient(135deg, #8b5cf6, #38bdf8)', filter: 'blur(40px)', opacity: 0.5 }}
        />
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: '#fff', borderRadius: '50%', width: '80px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 40px rgba(255,255,255,0.5)' }}>
          <Sparkles size={40} color="#000" />
        </div>
      </div>

      <h1 style={{ fontSize: '3rem', marginBottom: '24px' }}>Rețeaua lucrează...</h1>
      <p style={{ fontSize: '1.25rem', color: 'var(--text-muted)', marginBottom: '64px' }}>
        Sintetizăm vocea și instrumentalul pentru "{task.settings.genre}".
      </p>

      <div style={{ width: '100%', height: '8px', background: 'var(--bg-card)', borderRadius: '100px', overflow: 'hidden' }}>
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${task.progress}%` }}
          style={{ height: '100%', background: '#fff', borderRadius: '100px' }}
        />
      </div>
      <div style={{ marginTop: '16px', fontWeight: 600, fontSize: '1.25rem' }}>{Math.round(task.progress)}%</div>

      <button className="btn-secondary" onClick={onDismiss} style={{ marginTop: '64px' }}>
        Rulează în fundal
      </button>

    </motion.div>
  );
}
