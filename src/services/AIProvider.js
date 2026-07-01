// src/services/AIProvider.js

// Maps UI terminology to AI prompt terminology
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

const GLOBAL_NEGATIVE = 'Do not generate jazz, swing, blues, soul, funk, lounge, acoustic jazz, sax jazz.';

const NEGATIVE_RULES = {
  'Manele': `Do not generate rock. Do not generate pop. Do not generate EDM. Do not generate trap. ${GLOBAL_NEGATIVE}`,
  'Lăutărească': `Do not generate rock. Do not generate EDM. Do not generate trap. ${GLOBAL_NEGATIVE}`,
  'Trap': `Do not generate rock. Do not generate acoustic folk. ${GLOBAL_NEGATIVE}`,
  'Pop': `Do not generate rock. Do not generate metal. ${GLOBAL_NEGATIVE}`,
  'Rock': `Do not generate EDM. Do not generate trap. ${GLOBAL_NEGATIVE}`,
  'House': `Do not generate acoustic. Do not generate rock. ${GLOBAL_NEGATIVE}`
};

/**
 * Builds the exact prompt structure based on the provider and settings.
 */
export const buildPrompt = (settings, provider = 'suno') => {
  const { genre, subgenre, energy, tempo, instruments, voice, atmosphere, language, theme, speedMode } = settings;
  
  const mappedVoice = TRANSLATIONS.voice[voice] || voice;
  const mappedTempo = TRANSLATIONS.tempo[tempo] || tempo;
  const mappedLanguage = TRANSLATIONS.language[language] || language;
  
  const instrumentList = instruments && instruments.length > 0 
    ? instruments.map(i => TRANSLATIONS.instruments[i] || i).join(', ')
    : 'Standard band';

  const negative = NEGATIVE_RULES[genre] || 'Do not change genre.';

  if (provider === 'udio') {
    return `Generate ONLY modern ${mappedLanguage} ${subgenre?.toLowerCase() || ''} ${genre?.toLowerCase() || ''}.
${mappedLanguage} lyrics only.
${mappedVoice}.
${mappedTempo}.
High energy level (${energy}/100).
Dominant instruments: ${instrumentList}.
${atmosphere} atmosphere.
Very catchy chorus.
Theme:
${theme}

${negative}
Do not change genre.
Do not end abruptly.
Outro with fade out.`;
  }

  // SUNO FORMAT
  if (provider === 'suno') {
    // Exact requested prompt for Club Manele
    if (genre === 'Manele' && (subgenre === 'Club' || subgenre === 'Petrecere')) {
      return {
        prompt: `Modern Romanian club manele, Balkan oriental party music, dominant darbuka/tarabană rhythm, deep bass, oriental keyboard riff, accordion accents, short violin solo, male Romanian vocal, fast dance groove, repetitive catchy chorus, Romanian lyrics only. Theme: ${theme}. No jazz, no swing, no blues, no funk, no rock, no electric guitar, no EDM, no trap, no hip-hop. Natural outro, fade out.`,
        tags: 'club manele, darbuka, oriental'
      };
    }

    let tags = [
      `Modern ${mappedLanguage} ${subgenre?.toLowerCase() || ''} ${genre?.toLowerCase() || ''}`,
      ...instruments.map(i => TRANSLATIONS.instruments[i] || i),
      mappedVoice,
      mappedTempo,
      `energy ${energy}`,
      `${atmosphere} atmosphere`
    ].filter(Boolean).join(', ');

    let promptText = '';
    if (speedMode === 'Rapid') {
      tags += ', catchy chorus';
      promptText = `${tags}. Theme: ${theme}. ${negative}`;
    } else {
      tags += ', catchy repetitive chorus';
      promptText = `${tags}, ${mappedLanguage} lyrics only. Theme: ${theme}. ${negative} Natural outro, fade out.`;
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
        prompt: promptData.prompt,
        tags: promptData.tags,
        title: `AI Hit - ${settings.genre}`,
        make_instrumental: false
      }
    };
  } else if (provider === 'udio') {
    model = "music-u";
    payload = {
      model: model,
      task_type: "generate_music",
      input: {
        gpt_description_prompt: promptData,
        negative_tags: "rock, metal, abrupt ending",
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
