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
    'Tarabană': 'Darbuka (tarabană)',
    'Acordeon': 'Accordion',
    'Vioară': 'Violin',
    'Clape': 'Keyboard/Synth',
    'Saxofon': 'Saxophone',
    'Țambal': 'Cimbalom',
    'Chitară acustică': 'Acoustic guitar'
  }
};

const NEGATIVE_RULES = {
  'Manele': 'Do not generate rock. Do not generate pop. Do not generate EDM. Do not generate trap.',
  'Lăutărească': 'Do not generate rock. Do not generate EDM. Do not generate trap.',
  'Trap': 'Do not generate rock. Do not generate acoustic folk.',
  'Pop': 'Do not generate rock. Do not generate metal.',
  'Rock': 'Do not generate EDM. Do not generate trap.',
  'House': 'Do not generate acoustic. Do not generate rock.'
};

/**
 * Builds the exact prompt structure based on the provider and settings.
 */
export const buildPrompt = (settings, provider = 'suno') => {
  const { genre, subgenre, energy, tempo, instruments, voice, atmosphere, language, theme } = settings;
  
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
    // For Suno, tags drive the musical style, prompt drives the lyrics/theme
    const tags = [
      `${mappedLanguage} ${genre}`,
      subgenre,
      mappedVoice,
      mappedTempo,
      `energy ${energy}`,
      ...instruments.map(i => TRANSLATIONS.instruments[i] || i),
      `${atmosphere} vibe`
    ].filter(Boolean).join(', ');

    const promptText = `Generate lyrics in ${mappedLanguage} language.
Theme: ${theme}.
Atmosphere: ${atmosphere}.
Structure: [Intro], [Verse 1], [Chorus], [Verse 2], [Chorus], [Instrumental Solo], [Chorus], [Outro], [Fade Out].
Rules: ${negative}`;

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

  if (provider === 'suno') {
    payload = {
      model: "music-s",
      task_type: "generate_music",
      input: {
        prompt: promptData.prompt,
        tags: promptData.tags,
        title: `AI Hit - ${settings.genre}`,
        make_instrumental: false
      }
    };
  } else if (provider === 'udio') {
    payload = {
      model: "music-u",
      task_type: "generate_music",
      input: {
        gpt_description_prompt: promptData,
        negative_tags: "rock, metal, abrupt ending",
        lyrics_type: "generate"
      }
    };
  }

  const response = await fetch('https://api.piapi.ai/api/v1/task', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) throw new Error('Eroare API PiAPI: ' + response.status);
  const data = await response.json();
  
  if (!data?.data?.task_id && !data?.task_id) {
    throw new Error('Răspuns invalid PiAPI, fără Task ID.');
  }
  
  return { taskId: data?.data?.task_id || data?.task_id, payloadSent: payload };
};
