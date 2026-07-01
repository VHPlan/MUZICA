import { analyzeFeedback } from './FeedbackAnalyzer';

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
    'Saxofon': 'Saxophone',
    'Țambal': 'Cimbalom',
    'Chitară acustică': 'Acoustic guitar'
  }
};

const GLOBAL_NEGATIVE = 'No jazz, no rock, no pop, no EDM, no trap, no hip-hop, no country.';
const GLOBAL_PREFIX = `STRICT ROMANIAN ORIENTAL MUSIC ONLY.\nModern Romanian manele / Balkan oriental party style.\nRomanian lyrics only.\n${GLOBAL_NEGATIVE}\n`;

const sanitizeString = (str) => {
  if (!str) return "";
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^\w\s.,-]/gi, ' ').substring(0, 119);
};

/**
 * Builds the exact prompt structure based on the provider and settings.
 */
export const buildPrompt = (settings, provider = 'suno') => {
  const { genre, energy, tempo, instruments, voice, atmosphere, theme, speedMode } = settings;
  
  const mappedVoice = TRANSLATIONS.voice[voice] || voice;
  const mappedTempo = TRANSLATIONS.tempo[tempo] || tempo;
  
  const instrumentList = instruments && instruments.length > 0 
    ? instruments.map(i => TRANSLATIONS.instruments[i] || i).join(', ')
    : 'Standard band';

  if (provider === 'udio') {
    return `${GLOBAL_PREFIX}
Generate ONLY modern Romanian ${genre?.toLowerCase() || ''}.
Romanian lyrics only.
${mappedVoice}.
${mappedTempo}.
High energy level (${energy}/100).
Dominant instruments: ${instrumentList}.
${atmosphere} atmosphere.
Very catchy chorus.
Theme:
${theme}
Do not end abruptly.
Outro with fade out.`;
  }

  // SUNO FORMAT
  if (provider === 'suno') {
    
    const { promptModifier, negativeModifier } = analyzeFeedback();
    const learningInjection = `${promptModifier} ${negativeModifier}`;

    // Preset Prompts
    if (genre === 'Tarabană & Bass TikTok') {
      return {
        prompt: `STRICT ROMANIAN ORIENTAL MUSIC ONLY. TikTok Romanian club manele instrumental vibe, dominant darbuka/tarabană rhythm, very deep bass, oriental keyboard riff, fast dance groove, repetitive catchy hook, party atmosphere, Romanian lyrics only. No jazz, no rock, no pop, no EDM, no trap, no hip-hop. ${learningInjection} Natural outro, fade out.`,
        tags: 'tiktok, club manele, tarabana, bass, oriental'
      };
    }

    if (genre === 'Tarabană & Bass') {
      return {
        prompt: `${GLOBAL_PREFIX}\nDominant darbuka/tarabană rhythm, deep bass, oriental keyboard riff, fast dance groove, repetitive catchy hook, Romanian party atmosphere. Theme: ${theme}. ${learningInjection} Natural outro, fade out.`,
        tags: 'tarabana, bass, oriental, party'
      };
    }

    if (genre === 'Lăutărească / Țigănească') {
      return {
        prompt: `${GLOBAL_PREFIX}\nAuthentic Romanian lăutărească party music, live taraf feeling, violin, accordion, cimbalom, double bass, acoustic guitar, traditional rhythm. Theme: ${theme}. ${learningInjection} Natural outro, fade out.`,
        tags: 'lautareasca, taraf, gypsy, live'
      };
    }

    // Default Fallback
    let tags = [
      `Romanian ${genre?.toLowerCase() || ''}`,
      ...instruments.map(i => TRANSLATIONS.instruments[i] || i),
      mappedVoice,
      mappedTempo,
      `energy ${energy}`,
      `${atmosphere} atmosphere`
    ].filter(Boolean).join(', ');

    let promptText = '';
    if (speedMode === 'Rapid') {
      tags += ', catchy chorus';
      promptText = `${GLOBAL_PREFIX}\n${tags}. Theme: ${theme}.`;
    } else {
      tags += ', catchy repetitive chorus';
      promptText = `${GLOBAL_PREFIX}\n${tags}, Romanian lyrics only. Theme: ${theme}. Natural outro, fade out.`;
    }

    // Duplicat sters
    
    // Injectăm smart learning tuning
    if (promptModifier || negativeModifier) {
      if (promptText) {
        promptText = promptText.replace('Natural outro', `${promptModifier} ${negativeModifier} Natural outro`);
      }
    }

    return {
      prompt: promptText,
      tags: tags
    };
  }

  return '';
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
        prompt: promptData.prompt ? promptData.prompt : (promptData || ""),
        tags: promptData.tags ? sanitizeString(promptData.tags) : "",
        title: sanitizeString(`Hit - ${settings.genre}`),
        make_instrumental: false
      }
    };
  } else if (provider === 'udio') {
    model = "music-u";
    payload = {
      model: model,
      task_type: "generate_music",
      input: {
        gpt_description_prompt: promptData.prompt || promptData,
        negative_tags: GLOBAL_NEGATIVE,
        lyrics_type: "generate"
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
