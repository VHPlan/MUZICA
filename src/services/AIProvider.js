import { analyzeFeedback } from './FeedbackAnalyzer';
import { formatLyricsWithStructure } from './LyricFormatter';

const TRANSLATIONS = {
  voice: {
    'Masculină': 'Male vocal',
    'Feminină': 'Female vocal',
    'Duo': 'Male and female duet vocals'
  },
  tempo: {
    'Lent': 'Slow tempo',
    'Mediu': 'Medium tempo',
    'Rapid': 'Fast tempo'
  },
  language: {
    'Română': 'Romanian',
    'Engleză': 'English',
    'Spaniolă': 'Spanish',
    'Italiană': 'Italian'
  },
  instruments: {
    'Tarabană': 'dominant darbuka/tarabană',
    'Acordeon': 'accordion accents',
    'Vioară': 'violin solo',
    'Clape': 'oriental keyboard',
    'Saxofon': 'saxophone solo',
    'Țambal': 'cimbalom',
    'Chitară acustică': 'acoustic guitar',
    'Bass': 'heavy deep 808 bass',
    'Clarinet': 'balkan clarinet solo'
  }
};

const GLOBAL_NEGATIVE = 'No rock, no jazz, no classical, no country, no heavy metal, no acoustic indie.';

const sanitizeString = (str) => {
  if (!str) return "";
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^\w\s.,-]/gi, ' ').substring(0, 119);
};

export const buildPrompt = (settings, provider = 'suno') => {
  const { genre, energy, tempo, instruments, voice, atmosphere, theme, speedMode } = settings;
  
  const formattedTheme = formatLyricsWithStructure(theme);
  
  const mappedVoice = TRANSLATIONS.voice[voice] || voice;
  const mappedTempo = TRANSLATIONS.tempo[tempo] || tempo;
  
  const instrumentList = instruments && instruments.length > 0 && !instruments.includes('Auto')
    ? instruments.map(i => TRANSLATIONS.instruments[i] || i).join(', ')
    : '';

  // Genre specific directives
  let genreDirectives = '';
  let genreTags = '';

  if (genre === 'Tarabană & Bass') {
    genreDirectives = "Viral Balkan trap, modern Romanian manele, dominant darbuka/tarabană percussion, extremely deep 808 bass, oriental keyboard riff, fast dance groove, repetitive catchy hook, club party atmosphere.";
    genreTags = "balkan trap, darbuka, oriental percussion, heavy bass, party, modern manele";
  } else if (genre === 'Trapanele') {
    genreDirectives = "Romanian trapanele, fusion of modern trap music and oriental manele, extremely heavy distorted 808 bass, hip-hop rhythm, autotune vocals, modern street vibe, dark club atmosphere.";
    genreTags = "trapanele, trap, 808 bass, oriental hip-hop, autotune, modern manele";
  } else if (genre === 'Manele Vechi (Anii 2000)') {
    genreDirectives = "Classic old-school Romanian manele from the 2000s (stil vechi), nostalgic oriental pop, classic Casio keyboard tones, emotional traditional balkan rhythm, authentic lăutăresc party vibe.";
    genreTags = "manele vechi, 2000s, classic oriental pop, nostalgic, balkan";
  } else if (genre === 'Manele de Jale') {
    genreDirectives = "Extremely emotional and sad Romanian manele (manele de jale/supărare), slow sorrowful tempo, crying violin, deep emotional vocals, melancholic and tragic atmosphere.";
    genreTags = "manele de jale, sad, emotional, crying violin, slow tempo, melancholic";
  } else if (genre === 'Balkan Brass') {
    genreDirectives = "High-energy Balkan brass band music (muzică balcanică cu alămuri), aggressive trumpets, tuba, fast balkan wedding rhythm, chaotic joyful party atmosphere.";
    genreTags = "balkan brass, trumpets, tuba, fast tempo, balkan wedding, energetic";
  } else if (genre === 'Manele de Club') {
    genreDirectives = "Extremely commercial Romanian club manele, modern EDM-oriental fusion, very heavy bass, reggaeton dance rhythm, modern synthesizer melodies, high energy club banger.";
    genreTags = "club manele, EDM oriental, heavy bass, reggaeton rhythm, synth pop";
  } else if (genre === 'Petrecere') {
    genreDirectives = "Romanian traditional party music (manele vechi/petrecere), upbeat tempo, live accordion solos, violin, joyful and highly energetic wedding rhythm.";
    genreTags = "party music, accordion, violin, traditional pop, upbeat, wedding";
  } else if (genre === 'Lăutărească') {
    genreDirectives = "Authentic Romanian lăutărească music, live taraf feeling, acoustic instruments, violin, accordion, cimbalom (țambal), traditional acoustic rhythm.";
    genreTags = "lautareasca, taraf, gypsy folk, live acoustic, cimbalom";
  } else if (genre === 'Țigănești') {
    genreDirectives = "Authentic fiery Gypsy folk music (muzică țigănească autentică de joc), extreme acoustic virtuosity, very fast tempo, highly improvised violin and accordion solos, dynamic rhythm, raw traditional Roma culture vibe.";
    genreTags = "gypsy folk, muzica tiganeasca, fast acoustic, virtuoso violin, roma music, energetic";
  } else {
    genreDirectives = `Romanian ${genre} style, balkan oriental pop.`;
    genreTags = "balkan, oriental, pop";
  }

  const { promptModifier, negativeModifier } = analyzeFeedback();
  const learningInjection = `${promptModifier} ${negativeModifier}`;
  const isCustomLyrics = theme && theme.split(/\\s+/).length > 5;
  const isInstrumental = !theme || theme.trim() === '' || voice === 'Fără Voce';

  if (provider === 'udio') {
    const stylePrompt = `romanian, ${genreTags}, ${mappedVoice}, ${mappedTempo}, energy ${energy}, ${atmosphere} atmosphere${instrumentList ? `, ${instrumentList}` : ''}. ${genreDirectives} ${learningInjection}`;
    
    return {
      style: stylePrompt,
      lyrics: isInstrumental ? '' : formattedTheme,
      isCustomLyrics,
      isInstrumental
    };
  }

  if (provider === 'suno') {
    let finalTags = `romanian, ${genreTags}, ${mappedTempo}, ${atmosphere}`.substring(0, 119);
    
    let sunoPrompt = '';
    if (!isInstrumental) {
      let styleMetaTag = `[Style: ${genreDirectives} Instruments: ${instrumentList || 'none'}. Vibe: ${atmosphere}, Energy: ${energy}/100]`;
      sunoPrompt = `${styleMetaTag}\\n\\n${formattedTheme}`;
    }

    return {
      style: finalTags,
      lyrics: sunoPrompt,
      isCustomLyrics,
      isInstrumental
    };
  }
};

/**
 * Main API call to PiAPI
 */
export const generateMusicTask = async (settings, provider, apiKey) => {
  const promptData = buildPrompt(settings, provider);
  
  let payload = {};
  let model = "";
  let endpoint = 'https://api.piapi.ai/api/v1/task';

  if (provider === 'suno') {
    model = "music-s";
    payload = {
      model: model,
      task_type: "generate_music",
      input: {
        prompt: promptData.isInstrumental ? "" : promptData.lyrics,
        tags: sanitizeString(promptData.style),
        title: sanitizeString(`Proiect ${settings.genre}`),
        make_instrumental: promptData.isInstrumental
      }
    };
  } else if (provider === 'udio') {
    model = "music-u";
    let lType = promptData.isCustomLyrics ? "user" : "generate";
    if (promptData.isInstrumental && settings.voice === 'Fără Voce') {
        lType = "instrumental";
    }
    payload = {
      model: model,
      task_type: "generate_music",
      input: {
        gpt_description_prompt: promptData.style,
        prompt: promptData.lyrics,
        negative_tags: promptData.isInstrumental ? GLOBAL_NEGATIVE + ", vocals, singing, voices" : GLOBAL_NEGATIVE,
        lyrics_type: lType
      }
    };
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    if (response.status === 503) {
      throw new Error('Eroare 503: Serverele AI (Suno/Udio) sunt momentan supraaglomerate sau indisponibile. Te rog să încerci din nou în câteva minute, sau schimbă providerul din Pasul 5.');
    }
    throw new Error('Eroare API PiAPI: ' + response.status);
  }
  const data = await response.json();
  
  if (!data?.data?.task_id && !data?.task_id) {
    throw new Error('Eroare API PiAPI: Nu s-a putut obține task_id.');
  }
  
  return { 
    taskId: data?.data?.task_id || data?.task_id, 
    payloadSent: payload,
    endpointUsed: endpoint,
    modelUsed: model,
    rawResponse: data
  };
};

export const checkTaskStatus = async (taskId, apiKey) => {
  const response = await fetch(`https://api.piapi.ai/api/v1/task/${taskId}`, {
    headers: { 'x-api-key': apiKey }
  });
  if (!response.ok) throw new Error('Eroare comunicare server.');
  return await response.json();
};
