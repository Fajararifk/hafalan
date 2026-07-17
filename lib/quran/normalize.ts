export type CompareMode = "strict" | "lenient";

const TATWEEL = /ـ/g;

// Fatha/damma/kasra/tanwin/sukun, superscript alef, and Quranic pause/annotation marks.
// Deliberately excludes shadda (ّ): a missing shadda is a real, meaningful
// memorization mistake (it changes the letter's pronunciation), so it's never stripped.
const TASHKEEL = /[ً-ِْٰۖ-ۭ]/g;

export function normalizeArabic(text: string, mode: CompareMode): string {
  let result = text.normalize("NFC").replace(TATWEEL, "").trim().replace(/\s+/g, " ");
  if (mode === "lenient") result = result.replace(TASHKEEL, "");
  return result;
}
