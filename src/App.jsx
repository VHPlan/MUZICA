import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Library, Play, Trash2, Plus, HardDrive } from 'lucide-react';
import CreationWizard from './components/CreationWizard';
import GenerationScreen from './components/GenerationScreen';
import { generateMusicTask, checkTaskStatus } from './services/AIProvider';
import './App.css';

export default function App() {
  const [activeTasks, setActiveTasks] = useState([]);
  const [library, setLibrary] = useState([]);
  const [currentTrack, setCurrentTrack] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem('ai_music_library');
    if (saved) setLibrary(JSON.parse(saved));
  }, []);

  const saveToLibrary = (track) => {
    setLibrary(prev => {
      const updated = [track, ...prev];
      localStorage.setItem('ai_music_library', JSON.stringify(updated));
      return updated;
    });
  };

  const deleteFromLibrary = (trackId, e) => {
    e.stopPropagation();
    setLibrary(prev => {
      const updated = prev.filter(t => t.id !== trackId);
      localStorage.setItem('ai_music_library', JSON.stringify(updated));
      return updated;
    });
    if (currentTrack?.id === trackId) {
      setCurrentTrack(null);
    }
  };

  const startGlobalGeneration = async (settings, provider, apiKey) => {
    let newTask = {
      id: Date.now().toString(),
      settings,
      provider,
      apiKey,
      progress: 5,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    
    setActiveTasks(prev => [...prev, newTask]);
    
    try {
      const response = await generateMusicTask(settings, provider, apiKey);
      setActiveTasks(prev => prev.map(t => t.id === newTask.id ? { ...t, externalId: response.taskId, progress: 15 } : t));
    } catch (err) {
      console.error(err);
      setActiveTasks(prev => prev.map(t => 
        t.id === newTask.id 
          ? { ...t, status: 'error', progress: 100, rawResponse: err.message } 
          : t
      ));
    }
  };

  useEffect(() => {
    const pollTasks = async () => {
      const pending = activeTasks.filter(t => t.status === 'pending' && t.externalId);
      for (let task of pending) {
        try {
          const res = await checkTaskStatus(task.externalId, task.apiKey);
          const data = res.data || res;
          if (data.status === 'completed' || data.status === 'success') {
            const resultData = data.data || data;
            
            // BULLETPROOF RECURSIVE SEARCH FOR URLs
            const findUrl = (obj, keyName) => {
              if (!obj || typeof obj !== 'object') return null;
              if (obj[keyName] && typeof obj[keyName] === 'string' && obj[keyName].startsWith('http')) return obj[keyName];
              for (const k in obj) {
                const res = findUrl(obj[k], keyName);
                if (res) return res;
              }
              return null;
            };

            let extractedAudio = findUrl(resultData, 'audio_url') || findUrl(resultData, 'audio_file') || findUrl(resultData, 'file_url') || '';
            let extractedVideo = findUrl(resultData, 'video_url') || findUrl(resultData, 'video_file') || '';
            let extractedImage = findUrl(resultData, 'image_url') || findUrl(resultData, 'image_file') || findUrl(resultData, 'cover_url') || '';

            const finalTrack = {
              id: task.id,
              title: `Hit - ${task.settings.genre}`,
              genre: task.settings.genre,
              date: new Date().toLocaleDateString(),
              audioUrl: extractedAudio,
              videoUrl: extractedVideo,
              imageUrl: extractedImage,
              rawResponse: data
            };
            saveToLibrary(finalTrack);
            setActiveTasks(prev => prev.map(t => t.id === task.id ? { ...t, progress: 100, status: 'completed', finalTrack } : t));
            setCurrentTrack(finalTrack); // Pop up bottom player instantly
          } else if (data.status === 'failed' || data.status === 'error') {
            setActiveTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: 'error', progress: 100, rawResponse: 'Eroare generare.' } : t));
          } else {
            let nextProgress = task.progress + (Math.random() * 2 + 1);
            if (nextProgress > 95) nextProgress = 95;
            setActiveTasks(prev => prev.map(t => t.id === task.id ? { ...t, progress: nextProgress } : t));
          }
        } catch (e) {
          // ignore network temp errors
        }
      }
    };

    const interval = setInterval(pollTasks, 3000);
    return () => clearInterval(interval);
  }, [activeTasks]);

  const activeTask = activeTasks.find(t => !t.isBackground) || null;
  const backgroundTasksCount = activeTasks.filter(t => t.isBackground && t.status === 'pending').length;

  return (
    <div className="app-container">
      
      {/* SIDEBAR: LIBRARY */}
      <div className="sidebar">
        <div style={{ padding: '24px 16px', borderBottom: '1px solid var(--border-light)' }}>
          <h1 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={18} color="var(--primary)" /> MuzicaAI Studio
          </h1>
        </div>
        
        <div style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Proiecte ({library.length})</div>
          {backgroundTasksCount > 0 && (
            <div style={{ background: 'var(--primary)', color: '#fff', fontSize: '0.7rem', padding: '2px 6px', borderRadius: '4px' }}>
              {backgroundTasksCount} în lucru
            </div>
          )}
        </div>

        <div className="scroll-area">
          {library.length === 0 ? (
            <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--text-muted)' }}>
              <HardDrive size={32} style={{ opacity: 0.2, marginBottom: '8px' }} />
              <div style={{ fontSize: '0.9rem' }}>Niciun proiect salvat.</div>
            </div>
          ) : (
            library.map(track => (
              <div 
                key={track.id} 
                className={`library-item ${currentTrack?.id === track.id ? 'active' : ''}`}
                onClick={() => setCurrentTrack(track)}
              >
                <div style={{ width: '32px', height: '32px', borderRadius: '4px', background: track.imageUrl ? `url(${track.imageUrl}) center/cover` : 'var(--bg-card)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Play size={14} color="#fff" style={{ opacity: currentTrack?.id === track.id ? 1 : 0.5 }} />
                </div>
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <div style={{ fontSize: '0.9rem', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{track.title}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{track.date} {track.audioUrl ? '' : '• Err'}</div>
                </div>
                <button 
                  onClick={(e) => deleteFromLibrary(track.id, e)}
                  style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* MAIN CONTENT: WORKSPACE */}
      <div className="main-content">
        <div className="top-bar">
          <h2 style={{ fontSize: '1.25rem' }}>Spațiu de Lucru</h2>
          {!activeTask && (
            <button className="btn-primary" onClick={() => {}} style={{ background: 'transparent', border: '1px solid var(--border-light)', color: 'var(--text-main)' }}>
              <Plus size={16} /> Proiect Nou
            </button>
          )}
        </div>

        <div style={{ padding: '24px', maxWidth: '900px', margin: '0 auto' }}>
          <AnimatePresence mode="wait">
            {activeTask ? (
              <motion.div key="gen" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <GenerationScreen 
                  task={activeTask} 
                  onDismiss={() => setActiveTasks(prev => prev.map(t => t.id === activeTask.id ? { ...t, isBackground: true } : t))} 
                />
              </motion.div>
            ) : (
              <motion.div key="wiz" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <CreationWizard onGenerate={startGlobalGeneration} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* BOTTOM PLAYER */}
      {currentTrack && (
        <div className="bottom-player">
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', minWidth: '200px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '4px', background: currentTrack.imageUrl ? `url(${currentTrack.imageUrl}) center/cover` : 'var(--bg-card)' }} />
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{currentTrack.title}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>MuzicaAI Studio</div>
            </div>
          </div>
          
          <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
            {currentTrack.audioUrl ? (
              <audio controls src={currentTrack.audioUrl} autoPlay style={{ width: '100%', maxWidth: '600px', height: '32px' }} />
            ) : (
              <div style={{ color: 'var(--danger)', fontSize: '0.85rem' }}>
                URL Audio Indisponibil 
                <button onClick={() => alert(JSON.stringify(currentTrack.rawResponse, null, 2))} style={{ marginLeft: '8px', padding: '2px 8px', fontSize: '0.75rem' }}>JSON</button>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '12px', minWidth: '200px', justifyContent: 'flex-end' }}>
            {currentTrack.audioUrl && (
              <a href={currentTrack.audioUrl} download target="_blank" rel="noreferrer" className="btn-secondary">MP3</a>
            )}
            <button className="btn-secondary" onClick={() => setCurrentTrack(null)}>Închide</button>
          </div>
        </div>
      )}
    </div>
  );
}
