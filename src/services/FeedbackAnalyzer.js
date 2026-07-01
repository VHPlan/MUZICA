/**
 * FeedbackAnalyzer
 * 
 * Reads the historical feedback submitted by the user and dynamically generates
 * prompt modifiers (reinforcements) to fix frequent issues.
 */

export const analyzeFeedback = () => {
  try {
    const history = JSON.parse(localStorage.getItem('muzica_ai_feedback') || '[]');
    if (!history || history.length === 0) return { promptModifier: '', negativeModifier: '' };

    // Analizăm doar ultimele 10 feedback-uri pentru a fi relevanți
    const recentHistory = history.slice(0, 10);
    
    const complaints = {
      rock: 0,
      jazz: 0,
      tarabana_low: 0,
      bass_low: 0,
      oriental_low: 0,
      chorus_weak: 0,
      voice_bad: 0,
      slow: 0
    };

    recentHistory.forEach(item => {
      const issues = item.issues || [];
      if (issues.includes('Prea mult rock')) complaints.rock++;
      if (issues.includes('Prea mult jazz')) complaints.jazz++;
      if (issues.includes('Prea puțină tarabană')) complaints.tarabana_low++;
      if (issues.includes('Prea puțin bass')) complaints.bass_low++;
      if (issues.includes('Prea puțin oriental')) complaints.oriental_low++;
      if (issues.includes('Refren slab')) complaints.chorus_weak++;
      if (issues.includes('Vocea nu se potrivește')) complaints.voice_bad++;
      if (issues.includes('Instrumental prea lent')) complaints.slow++;
    });

    let promptModifier = [];
    let negativeModifier = [];

    // Prag de activare: dacă eroarea apare de cel puțin 2 ori în istoric
    if (complaints.rock >= 2) negativeModifier.push('ABSOLUTELY NO ROCK GUITARS, NO ROCK DRUMS, STRICTLY NO ROCK');
    if (complaints.jazz >= 2) negativeModifier.push('NO JAZZ CHORDS, NO SWING, NO BRASS JAZZ BANDS');
    
    if (complaints.tarabana_low >= 2) promptModifier.push('OVERWHELMING DOMINANT DARBUKA RHYTHM, EXTREME LOUD TARABANA PERCUSSION');
    if (complaints.bass_low >= 2) promptModifier.push('VERY DEEP SUB BASS, CLUB SHAKING BASSLINE');
    if (complaints.oriental_low >= 2) promptModifier.push('HEAVY BALKAN ORIENTAL STYLE, TRADITIONAL GYPSY LAUTAREASCA ELEMENTS');
    if (complaints.chorus_weak >= 2) promptModifier.push('EXTREMELY CATCHY INFECTIOUS CHORUS, HIGHLY REPETITIVE HOOK');
    if (complaints.slow >= 2) promptModifier.push('VERY FAST DANCE GROOVE, HIGH BPM CLUB RHYTHM');
    if (complaints.voice_bad >= 2) promptModifier.push('CLEAR ROMANIAN MANELE VOCALS, AUTHENTIC ROMANIAN PRONUNCIATION');

    return {
      promptModifier: promptModifier.length > 0 ? ` [LEARNING SYSTEM FORCED ENFORCEMENT: ${promptModifier.join(', ')}.]` : '',
      negativeModifier: negativeModifier.length > 0 ? ` [LEARNING SYSTEM EXCLUSION: ${negativeModifier.join(', ')}.]` : ''
    };

  } catch (err) {
    console.error('Eroare la analiza feedback-ului:', err);
    return { promptModifier: '', negativeModifier: '' };
  }
};
