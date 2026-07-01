import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Music, Library, Settings2, Play, Disc3 } from 'lucide-react';
import CreationWizard from './components/CreationWizard';
import GenerationScreen from './components/GenerationScreen';
import { generateMusicTask } from './services/AIProvider';
import './App.css';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [activeTasks, setActiveTasks] = useState([]);
  const [library, setLibrary] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem('ai_music_library');
    if (saved) setLibrary(JSON.parse(saved));
  }, []);

  const saveToLibrary = (track) => {
    const updated = [track, ...library];
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
              title: `Hit - ${task.settings.genre}`,
              genre: task.settings.genre,
              date: new Date().toLocaleDateString(),
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

  const activeTask = activeTasks.find(t => !t.isBackground) || null;
  const backgroundTasksCount = activeTasks.filter(t => t.isBackground && t.status === 'pending').length;

  return (
    <div style={{ position: 'relative' }}>
      
      {/* Floating Glass Navbar */}
      <nav className="glass-nav">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={() => setActiveTab('home')}>
          <div style={{ background: '#fff', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Sparkles size={20} color="#000" />
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Muzica<span style={{ color: 'var(--text-muted)' }}>AI</span></h1>
        </div>

        <div style={{ display: 'flex', gap: '8px', background: 'var(--bg-sec)', padding: '8px', borderRadius: '100px', border: '1px solid var(--border-light)' }}>
          <button 
            className={`nav-btn ${activeTab === 'home' ? 'active' : ''}`}
            onClick={() => setActiveTab('home')}
          >
            Acasă
          </button>
          <button 
            className={`nav-btn ${activeTab === 'create' ? 'active' : ''}`}
            onClick={() => setActiveTab('create')}
          >
            Creează
          </button>
          <button 
            className={`nav-btn ${activeTab === 'library' ? 'active' : ''}`}
            onClick={() => setActiveTab('library')}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            Bibliotecă 
            {backgroundTasksCount > 0 && (
              <span style={{ background: 'var(--primary)', color: '#fff', fontSize: '0.7rem', padding: '2px 6px', borderRadius: '100px' }}>
                {backgroundTasksCount}
              </span>
            )}
          </button>
        </div>

        <div>
          <button style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}><Settings2 size={24} /></button>
        </div>
      </nav>

      {/* Main Content Area */}
      <AnimatePresence mode="wait">
        
        {/* HOME VIEW */}
        {activeTab === 'home' && (
          <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="hero-section">
              <div className="hero-mesh" />
              <motion.h1 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                style={{ fontSize: '5rem', fontWeight: 800, maxWidth: '800px', lineHeight: 1.1, marginBottom: '24px' }}
              >
                Următorul tău hit începe <span style={{ opacity: 0.5 }}>aici.</span>
              </motion.h1>
              <motion.p 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                style={{ fontSize: '1.25rem', color: 'var(--text-muted)', maxWidth: '600px', marginBottom: '48px', lineHeight: 1.5 }}
              >
                Creează muzică premium folosind cele mai avansate rețele neurale. Fără bariere tehnice, doar pură creativitate.
              </motion.p>
              
              <motion.button 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="btn-primary" 
                onClick={() => setActiveTab('create')}
              >
                <Play fill="#000" size={24} /> Începe Creația
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* CREATE VIEW */}
        {activeTab === 'create' && (
          <motion.div key="create" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} style={{ padding: '40px 20px', maxWidth: '1200px', margin: '0 auto' }}>
            {activeTask ? (
              <GenerationScreen 
                task={activeTask} 
                onDismiss={() => setActiveTasks(prev => prev.map(t => t.id === activeTask.id ? { ...t, isBackground: true } : t))} 
              />
            ) : (
              <CreationWizard onGenerate={startGlobalGeneration} />
            )}
          </motion.div>
        )}

        {/* LIBRARY VIEW */}
        {activeTab === 'library' && (
          <motion.div key="library" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} style={{ padding: '80px 40px', maxWidth: '1400px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '3rem', marginBottom: '48px' }}>Colecția Ta</h2>
            
            {library.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '100px 20px', color: 'var(--text-muted)' }}>
                <Disc3 size={64} style={{ marginBottom: '24px', opacity: 0.2 }} />
                <h3>Nu ai creat nicio melodie încă.</h3>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '32px' }}>
                {library.map((track) => (
                  <div key={track.id} style={{ display: 'flex', flexDirection: 'column', gap: '16px', cursor: 'pointer', group: 'true' }}>
                    <div style={{ aspectRatio: '1', background: 'var(--bg-card)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative' }}>
                      <div className="hero-mesh" style={{ opacity: 0.5, filter: 'blur(40px)' }} />
                      <Play size={48} color="#fff" style={{ opacity: 0.5, transition: 'opacity 0.3s' }} />
                    </div>
                    <div>
                      <h4 style={{ fontSize: '1.2rem', marginBottom: '4px' }}>{track.title}</h4>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{track.date}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
