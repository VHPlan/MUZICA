import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, CheckCircle2, AlertCircle, RefreshCw, ChevronLeft } from 'lucide-react';

export default function GenerationScreen({ task, onDismiss }) {
  const isError = task.status === 'error';
  const isDone = task.progress >= 100 && !isError;

  if (isError) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ padding: '24px', textAlign: 'center' }}>
        <div className="dash-card" style={{ borderColor: 'rgba(239, 68, 68, 0.3)', background: 'rgba(239, 68, 68, 0.05)' }}>
          <AlertCircle size={48} color="#ef4444" style={{ marginBottom: '16px' }} />
          <h2 style={{ fontSize: '1.5rem', marginBottom: '12px', color: '#ef4444' }}>Generare întreruptă</h2>
          <p style={{ fontSize: '1rem', color: '#fca5a5', marginBottom: '24px' }}>
            {task.rawResponse}
          </p>
          <button className="btn-primary" onClick={onDismiss} style={{ background: '#ef4444', color: '#fff' }}>
            <RefreshCw size={16} /> Încearcă din nou
          </button>
        </div>
      </motion.div>
    );
  }

  if (isDone) {
    const track = task.finalTrack || {};
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ padding: '24px', textAlign: 'center' }}>
        <div className="dash-card" style={{ borderColor: 'rgba(16, 185, 129, 0.3)', background: 'rgba(16, 185, 129, 0.05)' }}>
          <CheckCircle2 size={48} color="#10b981" style={{ marginBottom: '16px' }} />
          <h2 style={{ fontSize: '1.5rem', marginBottom: '12px' }}>Sinteză Completă</h2>
          <p style={{ fontSize: '1rem', color: 'var(--text-muted)', marginBottom: '24px' }}>
            Noua ta piesă este pregătită și a fost salvată în bibliotecă.
          </p>
          
          {/* Quick Play & Download actions */}
          {track.audioUrl && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
              <audio controls src={track.audioUrl} style={{ width: '100%', maxWidth: '400px', height: '40px' }} />
              <div style={{ display: 'flex', gap: '12px' }}>
                <a href={track.audioUrl} download target="_blank" rel="noreferrer" className="btn-secondary" style={{ textDecoration: 'none' }}>Download MP3</a>
                {track.videoUrl && (
                  <a href={track.videoUrl} download target="_blank" rel="noreferrer" className="btn-secondary" style={{ textDecoration: 'none' }}>Download MP4</a>
                )}
              </div>
            </div>
          )}

          <button className="btn-primary" onClick={onDismiss}>
            <ChevronLeft size={16} /> Înapoi la Spațiul de Lucru
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="dash-card" style={{ padding: '48px 24px', textAlign: 'center' }}>
      
      <div style={{ position: 'relative', width: '120px', height: '120px', margin: '0 auto 32px' }}>
        <motion.div 
          animate={{ scale: [1, 1.1, 1], rotate: [0, 180, 360] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--accent))', filter: 'blur(20px)', opacity: 0.4 }}
        />
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: 'var(--bg-main)', borderRadius: '50%', width: '64px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px rgba(0,0,0,0.5)', border: '1px solid var(--border-light)' }}>
          <Sparkles size={24} color="var(--primary)" />
        </div>
      </div>

      <h2 style={{ fontSize: '1.5rem', marginBottom: '12px' }}>Rețeaua lucrează...</h2>
      <p style={{ fontSize: '1rem', color: 'var(--text-muted)', marginBottom: '32px' }}>
        Sintetizăm vocea și instrumentalul pentru "{task.settings.genre}".
      </p>

      <div style={{ width: '100%', height: '6px', background: 'var(--bg-main)', borderRadius: '100px', overflow: 'hidden', border: '1px solid var(--border-light)' }}>
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${task.progress}%` }}
          style={{ height: '100%', background: 'linear-gradient(90deg, var(--primary), var(--accent))', borderRadius: '100px' }}
        />
      </div>
      <div style={{ marginTop: '12px', fontWeight: 600, fontSize: '1rem', color: 'var(--primary)' }}>{Math.round(task.progress)}%</div>

      <button className="btn-secondary" onClick={onDismiss} style={{ marginTop: '32px' }}>
        Rulează în fundal
      </button>

    </motion.div>
  );
}
