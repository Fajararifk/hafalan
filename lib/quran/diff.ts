import { diffArrays, diffChars } from "diff";
import { normalizeArabic, type CompareMode } from "./normalize";

export interface CharDiffPart {
  same: boolean;
  text: string;
}

export type DiffOp =
  | { type: "MATCH"; word: string }
  | { type: "MISSING"; word: string }
  | { type: "EXTRA"; word: string }
  | { type: "SUBSTITUTION"; expected: string; actual: string; charDiff: CharDiffPart[] };

export interface CompareResult {
  scorePercent: number;
  ops: DiffOp[];
}

// Adjacent MISSING+EXTRA pairs almost always mean "the user wrote a different word
// here" rather than two unrelated mistakes — show them as one substitution with a
// letter-level highlight instead of two separate word-level flags.
function mergeSubstitutions(rawOps: DiffOp[]): DiffOp[] {
  const ops: DiffOp[] = [];
  for (let i = 0; i < rawOps.length; i++) {
    const current = rawOps[i];
    const next = rawOps[i + 1];
    if (current.type === "MISSING" && next?.type === "EXTRA") {
      const charDiff = diffChars(current.word, next.word).map((part) => ({
        same: !part.added && !part.removed,
        text: part.value,
      }));
      ops.push({ type: "SUBSTITUTION", expected: current.word, actual: next.word, charDiff });
      i++; // consume the EXTRA we just merged
    } else {
      ops.push(current);
    }
  }
  return ops;
}

export function compareAyah(
  canonicalText: string,
  userInput: string,
  mode: CompareMode
): CompareResult {
  const canonWords = normalizeArabic(canonicalText, mode).split(" ").filter(Boolean);
  const userWords = normalizeArabic(userInput, mode).split(" ").filter(Boolean);

  const parts = diffArrays(canonWords, userWords);
  const rawOps: DiffOp[] = [];
  let matched = 0;

  for (const part of parts) {
    if (!part.added && !part.removed) {
      matched += part.value.length;
      for (const word of part.value) rawOps.push({ type: "MATCH", word });
    } else if (part.removed) {
      for (const word of part.value) rawOps.push({ type: "MISSING", word });
    } else if (part.added) {
      for (const word of part.value) rawOps.push({ type: "EXTRA", word });
    }
  }

  const scorePercent = canonWords.length ? Math.round((matched / canonWords.length) * 100) : 0;

  return { scorePercent, ops: mergeSubstitutions(rawOps) };
}
