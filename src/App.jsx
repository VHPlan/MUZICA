import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Music, LayoutGrid, Settings2, User, Mic2, FileAudio, Folder, Play, Pause, Square, Volume2, Download, Trash2, Sliders, AudioLines } from 'lucide-react';
import WorkspaceModule from './components/WorkspaceModule';
import RenderingEngine from './components/RenderingEngine';
import { generateMusicTask } from './services/AIProvider';
import './App.css';

export default function App() {
  const [activeTab, setActiveTab] = useState('studio');
  const [activeTasks, setActiveTasks] = useState([]);
  const [library, setLibrary] = useState([]);
  
  // Fake player state
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeTrack, setActiveTrack] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem('ai_music_library');
    if (saved) setLibrary(JSON.parse(saved));
  }, []);

  const saveToLibrary = (track) => {
    const updated = [track, ...library];
    setLibrary(updated);
    localStorage.setItem('ai_music_library', JSON.stringify(updated));
  };

  const deleteFromLibrary = (id) => {
    const updated = library.filter(t => t.id !== id);
    setLibrary(updated);
    localStorage.setItem('ai_music_library', JSON.stringify(updated));
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
      const taskId = await generateMusicTask(settings, provider, apiKey);
      setActiveTasks(prev => prev.map(t => t.id === newTask.id ? { ...t, externalId: taskId, progress: 15 } : t));
    } catch (err) {
      console.error(err);
      setActiveTasks(prev => prev.map(t => 
        t.id === newTask.id 
          ? { ...t, status: 'error', progress: 100, rawResponse: err.message } 
          : t
      ));
    }
  };

  // Polling simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTasks(prev => {
        let changed = false;
        const updated = prev.map(task => {
          if (task.status === 'error' || task.status === 'completed') return task;
          changed = true;
          
          let nextProgress = task.progress + (Math.random() * 2 + 1);
          if (nextProgress >= 100) {
            nextProgress = 100;
            const finalTrack = {
              id: task.id,
              title: `AI Hit - ${task.settings.genre}`,
              genre: task.settings.genre,
              date: new Date().toLocaleDateString(),
              audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'
            };
            setTimeout(() => saveToLibrary(finalTrack), 0);
            return { ...task, progress: 100, status: 'completed' };
          }
          return { ...task, progress: nextProgress };
        });
        return changed ? updated : prev;
      });
    }, 2000);
    return () => clearInterval(interval);
  }, [library]);

  const removeTask = (id) => {
    setActiveTasks(prev => prev.filter(t => t.id !== id));
  };

  const playTrack = (track) => {
    setActiveTrack(track);
    setIsPlaying(true);
  };

  const activeTask = activeTasks.length > 0 ? activeTasks[0] : null;

  return (
    <div className="daw-layout">
      <div className="daw-main">
        {/* SIDEBAR DOCK */}
        <div className="daw-sidebar">
          <div className="sidebar-icon" style={{ color: 'var(--accent-copper)', marginBottom: '16px' }}>
            <AudioLines size={28} />
          </div>
          
          <div className={`sidebar-icon ${activeTab === 'studio' ? 'active' : ''}`} onClick={() => setActiveTab('studio')} title="Workspace">
            <Sliders size={20} />
          </div>
          <div className={`sidebar-icon ${activeTab === 'library' ? 'active' : ''}`} onClick={() => setActiveTab('library')} title="File Browser">
            <Folder size={20} />
          </div>
          <div className={`sidebar-icon ${activeTab === 'presets' ? 'active' : ''}`} onClick={() => setActiveTab('presets')} title="Presets Matrix">
            <LayoutGrid size={20} />
          </div>
          
          <div style={{ flex: 1 }} />
          
          <div className="sidebar-icon" title="Settings">
            <Settings2 size={20} />
          </div>
        </div>

        {/* WORKSPACE (CENTER) */}
        <div className="daw-workspace">
          {activeTask ? (
            <RenderingEngine task={activeTask} onDismiss={() => removeTask(activeTask.id)} />
          ) : (
            <WorkspaceModule onGenerate={startGlobalGeneration} />
          )}
        </div>

        {/* LIBRARY PANEL (RIGHT) */}
        {activeTab === 'library' && (
          <div className="daw-library-panel">
            <div className="module-header" style={{ padding: '16px', margin: 0, borderBottom: '1px solid var(--border-strong)', background: 'var(--bg-dark)' }}>
              <Folder size={14} /> BROWSER
            </div>
            <div style={{ padding: '16px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {library.length === 0 && <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', marginTop: '32px' }}>No audio files found.</div>}
              {library.map(track => (
                <div key={track.id} className="module-panel" style={{ padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ overflow: 'hidden' }}>
                    <div style={{ fontSize: '0.85rem', color: '#fff', fontWeight: 600, whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{track.title}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{track.date} | 140 BPM</div>
                  </div>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button className="daw-btn" style={{ padding: '6px' }} onClick={() => playTrack(track)}><Play size={14}/></button>
                    <button className="daw-btn" style={{ padding: '6px' }} onClick={() => deleteFromLibrary(track.id)}><Trash2 size={14}/></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* DAW BOTTOM TRANSPORT/PLAYER */}
      <div className="daw-bottom-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', width: '250px' }}>
          <button className="daw-btn" style={{ padding: '12px', borderRadius: '50%' }} onClick={() => setIsPlaying(!isPlaying)}>
            {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
          </button>
          <button className="daw-btn" style={{ padding: '8px' }}><Square size={16} fill="currentColor" /></button>
          
          <div style={{ fontSize: '0.8rem', color: 'var(--accent-copper)', fontFamily: 'monospace', background: '#000', padding: '4px 8px', border: '1px solid var(--border-strong)', borderRadius: '4px' }}>
            00:03:42:15
          </div>
        </div>

        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '16px', padding: '0 32px' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-main)', width: '150px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {activeTrack ? activeTrack.title : 'No track selected'}
          </div>
          
          {/* Fake Waveform timeline */}
          <div style={{ flex: 1, height: '40px', background: '#000', borderRadius: '4px', border: '1px solid var(--border-strong)', position: 'relative', overflow: 'hidden' }}>
            {activeTrack && (
              <>
                <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '30%', background: 'rgba(184, 115, 51, 0.2)' }} />
                <div style={{ position: 'absolute', left: '30%', top: 0, bottom: 0, width: '1px', background: 'var(--accent-copper)', boxShadow: '0 0 5px var(--accent-copper)' }} />
                <svg width="100%" height="100%" preserveAspectRatio="none" viewBox="0 0 100 100">
                  <path d="M0,50 Q5,20 10,50 T20,50 T30,20 T40,50 T50,80 T60,50 T70,30 T80,50 T90,70 T100,50" fill="none" stroke="var(--text-muted)" strokeWidth="1" opacity="0.5"/>
                </svg>
              </>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', width: '200px', justifyContent: 'flex-end' }}>
          <Volume2 size={16} color="var(--text-muted)" />
          <input type="range" min="0" max="100" defaultValue="80" style={{ width: '80px' }} />
          {activeTrack && (
            <button className="daw-btn"><Download size={14} /></button>
          )}
        </div>
      </div>
    </div>
  );
}
