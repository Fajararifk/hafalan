// Pure helper for "Sambung Ayat" (cloze-style fill-in-the-blank practice): pick a
// random subset of word positions to hide. Kept separate from normalize.ts/diff.ts
// since it's about *which words* to hide, not about comparing text.
export function pickBlankIndices(wordCount: number, ratio = 0.35): Set<number> {
  if (wordCount <= 0) return new Set();

  const targetCount = Math.min(wordCount, Math.max(1, Math.round(wordCount * ratio)));
  const indices = Array.from({ length: wordCount }, (_, i) => i);

  // Fisher-Yates shuffle, then take the first targetCount as the blanked positions.
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }

  return new Set(indices.slice(0, targetCount));
}
