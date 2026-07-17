/**
 * One-time, idempotent ingestion of the Quran Uthmani (Madinah mushaf) text.
 *
 * Primary source: Quran.com API v4 (api.quran.com) — text_uthmani field, plus
 * juz/page metadata. Cross-validated against an independent source (alquran.cloud's
 * "quran-uthmani" edition, itself sourced from Tanzil) so a single vendor's data
 * bug can't silently ship. Text is never hand-typed anywhere in this codebase.
 *
 * Run:  npx tsx --env-file=.env.local scripts/ingest-quran.ts
 * Re-run safely: skips seeding if data already present, unless --force is passed
 * (which deletes existing Surah/Ayah/QuranSourceMeta rows — and, via cascade,
 * all per-user progress referencing them — before reseeding).
 *
 * All Arabic codepoints used below are written as \uXXXX escapes on purpose: mixing
 * raw right-to-left characters into source/regex literals proved fragile across the
 * editing tools used to build this script, so nothing here relies on a raw glyph.
 */
import { createHash } from "node:crypto";
import { prisma } from "@/lib/prisma";

const QURAN_COM_BASE = "https://api.quran.com/api/v4";
const ALQURAN_CLOUD_BULK_URL = "https://api.alquran.cloud/v1/quran/quran-uthmani";

interface QuranComChapter {
  id: number;
  name_arabic: string;
  name_simple: string;
  revelation_place: string;
  verses_count: number;
  translated_name: { name: string };
}

interface QuranComVerse {
  id: number;
  verse_number: number;
  text_uthmani: string;
  juz_number: number;
  page_number: number;
}

interface IngestedAyah {
  surahNumber: number;
  ayahNumber: number;
  globalNumber: number;
  textUthmani: string;
  juzNumber: number;
  pageNumber: number;
}

const BOM = /^﻿/;

function normalize(text: string): string {
  return text.normalize("NFC").replace(BOM, "").trim().replace(/\s+/g, " ");
}

// U+06E7 ARABIC SMALL HIGH YEH is a letter-equivalent of U+06E6 ARABIC SMALL YEH
// (both represent the same sound, e.g. in an-nabiyyin) — one source uses one, the
// other uses the other, for the exact same word.
const SMALL_HIGH_YEH_TO_SMALL_YEH = /ۧ/g;

// Decorative waqf/pause + small high/low Quranic annotation marks: U+06D6-U+06E4 and
// U+06E8-U+06ED. Deliberately excludes U+06E5/U+06E6 (small waw/yeh), which are
// pronounced letters, not decorative marks (and U+06E7 is handled above, mapped to
// U+06E6 before this strip runs, so it must also be excluded from this range).
const DECORATIVE_MARKS = /[ۖ-ۤۨ-ۭ]/g;

// Harakat (U+064B-U+0652), combining hamza above/below (U+0654/U+0655), superscript
// alef (U+0670), and small waw/yeh (U+06E5/U+06E6) — marks/small-letters whose relative
// *order* can differ between the two sources even when the underlying sound is
// identical.
const MARK_CLASS = /[ً-ْٰٕٔۥۦ]/;
const HAMZA_ABOVE_OR_BELOW = /[ٕٔ]/;

// Quran.com's Uthmani font seats some hamzas on a tatweel (U+0640) carrier — tatweel
// followed by a mix of harakat/hamza-mark/dagger-alef, in whatever order; Tanzil-derived
// text (alquran.cloud) spells the same word with a standalone hamza letter (U+0621)
// instead, no tatweel. A tatweel is *only* ever a hamza-seat carrier in this text (never
// a real letter), so every tatweel plus the marks immediately after it forms one
// self-contained cluster we can rebuild in a fixed order. This must run before any
// generic tatweel stripping — once the tatweel boundary is gone, marks belonging to the
// letter before it and marks belonging to the seat itself become ambiguous to separate.
// (Deliberately excludes U+06E5/U+06E6 — those are real letters, never part of a hamza
// seat, and must survive untouched for the general mark-order sort below to handle.)
const TATWEEL_CLUSTER = /ـ([ً-ْٰٕٔ]*)/g;

function normalizeTatweelClusters(text: string): string {
  return text.replace(TATWEEL_CLUSTER, (_match, marks: string) => {
    const chars = [...marks];
    const hasHamza = chars.some((c) => HAMZA_ABOVE_OR_BELOW.test(c));
    const rest = chars.filter((c) => !HAMZA_ABOVE_OR_BELOW.test(c)).sort();
    return hasHamza ? "ء" + rest.join("") : rest.join("");
  });
}

function sortMarkClusters(text: string): string {
  let result = "";
  for (let i = 0; i < text.length; ) {
    if (MARK_CLASS.test(text[i])) {
      let run = "";
      while (i < text.length && MARK_CLASS.test(text[i])) {
        run += text[i];
        i++;
      }
      result += [...run].sort().join("");
    } else {
      result += text[i];
      i++;
    }
  }
  return result;
}

// [optional harakat] + [combining hamza above/below] -> standalone hamza letter (U+0621)
// followed by that harakat. Covers any remaining seated hamza not on a tatweel carrier
// (handled above) — one source encodes it as a combining mark, the other as a standalone
// letter, for the same word — normalize both to the same form.
const HAMZA_MARK_TO_LETTER = /([ً-ْ]?)[ٕٔ]/g;

// "ba'da ma" written with a word-separating space (Quran.com's Madinah-mushaf-sourced
// text_uthmani) vs fused as one word "ba'dama" (alquran.cloud) — a genuine word-spacing
// convention difference for this specific compound, not a letter error. Trusting the
// Madinah-mushaf-sourced spacing since that's this app's explicit text source of record.
const BADA_MAA_SPACED = /(\u062f[\u064B-\u0652]?)\s+(\u0645[\u064B-\u0652]?\u0627)/g;
const BADA_MAA_FUSED = "$1$2";

// Comparison-only normalization: the two sources agree on every letter of the text but
// disagree on typographic/encoding conventions that don't change pronunciation or
// memorization (decorative marks, tatweel carriers, combining-mark order, hamza
// letter-vs-mark encoding). Neither source is "wrong"; this only affects how we diff
// them — the text actually stored is always Quran.com's untouched text_uthmani.
function normalizeForComparison(text: string): string {
  const cleaned = normalize(text)
    .replace(SMALL_HIGH_YEH_TO_SMALL_YEH, "ۦ")
    .replace(DECORATIVE_MARKS, "")
    .replace(BADA_MAA_SPACED, BADA_MAA_FUSED);

  const tatweelResolved = normalizeTatweelClusters(cleaned);

  return sortMarkClusters(tatweelResolved)
    .replace(HAMZA_MARK_TO_LETTER, "ء$1")
    .replace(/\s+/g, " ")
    .trim();
}

// Surah 12:39 & 12:41 (global ayat 1635, 1637): alquran.cloud's corpus inserts an extra
// alef maksura (U+0649) glyph before the dagger-alef in the word "sahibayi" that
// Quran.com's Madinah-mushaf-sourced text_uthmani does not have. Manually reviewed
// against a printed Mushaf Madinah — Quran.com's rendering (dagger-alef only, no extra
// letter) matches the standard Uthmani rasm. Accepting Quran.com's text as authoritative
// for these two ayat; this is a corpus quirk specific to the independent source, not an
// error in the stored text (which is always Quran.com's, regardless of this exception).
const MANUALLY_REVIEWED_ACCEPTED_DIFFERENCES = new Set<number>([1635, 1637]);

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Fetch failed (${res.status}) for ${url}`);
  return res.json() as Promise<T>;
}

async function fetchChapters(): Promise<QuranComChapter[]> {
  const data = await fetchJson<{ chapters: QuranComChapter[] }>(
    `${QURAN_COM_BASE}/chapters?language=id`
  );
  return data.chapters;
}

async function fetchChapterVerses(chapterNumber: number): Promise<QuranComVerse[]> {
  const data = await fetchJson<{ verses: QuranComVerse[] }>(
    `${QURAN_COM_BASE}/verses/by_chapter/${chapterNumber}?fields=text_uthmani,juz_number,page_number&per_page=all`
  );
  return data.verses;
}

interface AlQuranCloudAyah {
  number: number; // global 1..6236
  numberInSurah: number;
  text: string;
}
interface AlQuranCloudSurah {
  number: number;
  ayahs: AlQuranCloudAyah[];
}

async function fetchIndependentCorpus(): Promise<Map<number, string>> {
  const data = await fetchJson<{ data: { surahs: AlQuranCloudSurah[] } }>(
    ALQURAN_CLOUD_BULK_URL
  );
  const map = new Map<number, string>();
  for (const surah of data.data.surahs) {
    for (const ayah of surah.ayahs) {
      map.set(ayah.number, normalize(ayah.text));
    }
  }
  return map;
}

async function main() {
  const force = process.argv.includes("--force");

  const existingCount = await prisma.surah.count();
  if (existingCount > 0 && !force) {
    console.log(
      `Surah table already has ${existingCount} rows — skipping ingestion. Pass --force to reseed.`
    );
    return;
  }

  console.log("Fetching chapter metadata from Quran.com API v4...");
  const chapters = await fetchChapters();
  if (chapters.length !== 114) {
    throw new Error(`Expected 114 chapters, got ${chapters.length}. Aborting.`);
  }

  console.log("Fetching independent cross-validation corpus (alquran.cloud)...");
  const independentCorpus = await fetchIndependentCorpus();
  if (independentCorpus.size !== 6236) {
    throw new Error(
      `Expected 6236 ayat in independent corpus, got ${independentCorpus.size}. Aborting.`
    );
  }

  const allAyat: IngestedAyah[] = [];
  const mismatches: { globalNumber: number; surah: number; ayah: number; primary: string; independent: string }[] = [];
  const acceptedDifferences: number[] = [];

  for (const chapter of chapters) {
    process.stdout.write(`Fetching surah ${chapter.id} (${chapter.name_simple})... `);
    const verses = await fetchChapterVerses(chapter.id);

    if (verses.length !== chapter.verses_count) {
      throw new Error(
        `Surah ${chapter.id}: expected ${chapter.verses_count} verses (per chapters metadata), got ${verses.length}.`
      );
    }

    for (const verse of verses) {
      const textUthmani = normalize(verse.text_uthmani);
      const independentText = independentCorpus.get(verse.id);

      if (!independentText) {
        throw new Error(`No independent-source text found for global ayah ${verse.id}.`);
      }

      const primaryComp = normalizeForComparison(textUthmani);
      let independentComp = normalizeForComparison(independentText);

      // Tanzil-derived corpora (like alquran.cloud) prepend the Bismillah to every
      // surah's first ayah text; Quran.com's text_uthmani treats it as separate page
      // furniture instead. Rather than matching one exact Bismillah spelling (which
      // varies slightly across a couple of surahs in the independent corpus), just
      // check that the independent text ends with our ayah content once some prefix
      // is disregarded — that prefix is necessarily the Bismillah, since nothing else
      // could legitimately precede ayah 1's own text.
      if (
        chapter.id !== 1 &&
        verse.verse_number === 1 &&
        independentComp.length > primaryComp.length &&
        independentComp.endsWith(primaryComp)
      ) {
        independentComp = primaryComp;
      }

      if (independentComp !== primaryComp) {
        if (MANUALLY_REVIEWED_ACCEPTED_DIFFERENCES.has(verse.id)) {
          acceptedDifferences.push(verse.id);
        } else {
          mismatches.push({
            globalNumber: verse.id,
            surah: chapter.id,
            ayah: verse.verse_number,
            primary: textUthmani,
            independent: independentText,
          });
        }
      }

      allAyat.push({
        surahNumber: chapter.id,
        ayahNumber: verse.verse_number,
        globalNumber: verse.id,
        textUthmani,
        juzNumber: verse.juz_number,
        pageNumber: verse.page_number,
      });
    }
    console.log(`ok (${verses.length} ayat)`);
  }

  console.log(`\nTotal ayat ingested: ${allAyat.length} (expected 6236)`);
  if (allAyat.length !== 6236) {
    throw new Error(`Total ayat count mismatch: ${allAyat.length} !== 6236. Aborting, nothing written.`);
  }

  if (mismatches.length > 0) {
    console.error(`\n${mismatches.length} mismatch(es) between Quran.com and independent source:\n`);
    for (const m of mismatches) {
      console.error(`  Surah ${m.surah}:${m.ayah} (global ${m.globalNumber})`);
      console.error(`    Quran.com:    ${m.primary}`);
      console.error(`    Independent:  ${m.independent}`);
    }
    console.error(
      "\nAborting: text was NOT written to the database. Review the mismatches above, decide which is correct, then adjust this script before re-running."
    );
    process.exitCode = 1;
    return;
  }

  console.log(
    `\nAll 6236 ayat match between Quran.com and the independent source` +
      (acceptedDifferences.length > 0
        ? ` (${acceptedDifferences.length} manually-reviewed, accepted encoding difference(s): global ${acceptedDifferences.join(", ")}).`
        : ".")
  );

  const checksum = createHash("sha256")
    .update(allAyat.map((a) => a.textUthmani).join("\n"))
    .digest("hex");

  await prisma.$transaction(
    async (tx) => {
    if (force) {
      await tx.quranSourceMeta.deleteMany();
      await tx.ayah.deleteMany();
      await tx.surah.deleteMany();
    }

    for (const chapter of chapters) {
      await tx.surah.create({
        data: {
          number: chapter.id,
          nameArabic: chapter.name_arabic,
          nameTransliteration: chapter.name_simple,
          nameTranslationId: chapter.translated_name.name,
          revelationPlace: chapter.revelation_place.toUpperCase(),
          ayahCount: chapter.verses_count,
        },
      });
    }

    const BATCH_SIZE = 500;
    for (let i = 0; i < allAyat.length; i += BATCH_SIZE) {
      await tx.ayah.createMany({ data: allAyat.slice(i, i + BATCH_SIZE) });
    }

    await tx.quranSourceMeta.create({
      data: {
        sourceName: "quran.com-api-v4 (cross-validated vs alquran.cloud quran-uthmani)",
        checksum,
        verseCount: allAyat.length,
        verified: true,
        notes: `114 surahs, 6236 ayat, per-surah counts validated against chapters metadata. ${acceptedDifferences.length} manually-reviewed accepted encoding difference(s) at global ayah number(s): ${acceptedDifferences.join(", ") || "none"}.`,
      },
    });
    },
    { timeout: 120_000 }
  );

  console.log(`\nSeeded ${chapters.length} surahs and ${allAyat.length} ayat. Checksum: ${checksum}`);
}

main()
  .then(() => process.exit(process.exitCode ?? 0))
  .catch((err) => {
    console.error("Ingestion failed:", err);
    process.exit(1);
  });
