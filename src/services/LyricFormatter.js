export const formatLyricsWithStructure = (rawText) => {
  if (!rawText) return '';
  
  // If it's a short theme (less than 15 words) and doesn't have line breaks, don't format it as lyrics
  const words = rawText.split(/\s+/).filter(Boolean);
  const lines = rawText.split('\n').map(l => l.trim()).filter(Boolean);
  
  if (words.length < 15 && lines.length <= 2) {
    return rawText; // It's just a theme prompt
  }

  let structured = "[Intro]\\n(Percussion Break)\\n\\n";
  let verseLineCount = 0;
  let hasChorus = false;
  
  const breaks = ["[Instrumental]", "(Music Break)", "(Percussion Break)", "(Tarabană Solo)"];
  let breakIndex = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // If the user already included tags, preserve them and reset our counter
    if (line.startsWith('[') || line.startsWith('(') || line.toLowerCase().includes('refren')) {
      structured += line + '\\n';
      verseLineCount = 0;
      if (line.toLowerCase().includes('refren') || line.toLowerCase().includes('chorus')) {
         hasChorus = true;
         // Ensure it's tagged properly
         if (!line.includes('[')) structured += "[Chorus]\\n";
      }
      continue;
    }

    structured += line + '\\n';
    verseLineCount++;

    // Try to detect a chorus implicitly if lines repeat (heuristic)
    // or just inject breaks every 4 lines
    if (verseLineCount >= 4) {
      if (i < lines.length - 3) { // Not at the very end
        const isApproachingEnd = i >= lines.length - 8;
        
        if (isApproachingEnd && !hasChorus) {
           structured += "\\n[Instrumental Solo]\\n\\n[Chorus]\\n\\n";
           hasChorus = true;
        } else {
           const breakTag = breaks[breakIndex % breaks.length];
           structured += `\\n${breakTag}\\n\\n`;
           breakIndex++;
        }
      }
      verseLineCount = 0;
    }
  }

  // Ensure there's a solo before the last chorus if they had an explicit chorus but no solo
  if (structured.includes('[Chorus]') && !structured.includes('[Instrumental Solo]')) {
      const lastChorusIdx = structured.lastIndexOf('[Chorus]');
      if (lastChorusIdx > 0) {
          structured = structured.substring(0, lastChorusIdx) + "\\n[Instrumental Solo]\\n\\n" + structured.substring(lastChorusIdx);
      }
  }

  structured += "\\n[Outro]\\n(Fade Out)";
  
  return structured;
};
