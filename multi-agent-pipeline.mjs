// multi-agent-pipeline.mjs
// Pipeline multi-agent "tim pembuat website" pakai Claude API (Node.js 18+, ESM)
// Install: npm install @anthropic-ai/sdk
// Run:     ANTHROPIC_API_KEY=sk-... node multi-agent-pipeline.mjs "ide website kamu"

import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic(); // otomatis baca ANTHROPIC_API_KEY dari env
const MODEL = "claude-sonnet-4-6";

// ---------- Definisi "tim" sebagai agent (role = system prompt) ----------
const AGENTS = {
  pm: {
    name: "PM Agent",
    system:
      "Kamu Product Manager. Ubah ide user jadi requirement terstruktur: " +
      "target user, 5 fitur MVP (prioritas), dan user story singkat. " +
      "Jawab ringkas dalam bullet points.",
  },
  designer: {
    name: "Designer Agent",
    system:
      "Kamu UI/UX Designer. Dari requirement yang diberikan, buat: " +
      "struktur halaman (sitemap), layout tiap halaman (deskripsi wireframe), " +
      "dan design token (warna, font, spacing). Fokus: clean, cepat, mobile-first.",
  },
  developer: {
    name: "Developer Agent",
    system:
      "Kamu Senior Fullstack JS Developer. Dari requirement + desain, tentukan: " +
      "tech stack (frontend, backend, DB), struktur folder, dan API endpoint utama. " +
      "Prioritaskan performa: SSR/SSG bila cocok, caching, lazy loading.",
  },
  qa: {
    name: "QA Agent",
    system:
      "Kamu QA Engineer. Dari requirement + rencana teknis, buat test plan: " +
      "critical path E2E (format Given/When/Then), edge case penting, " +
      "dan target performa (Core Web Vitals).",
  },
  marketing: {
    name: "Marketing Agent",
    system:
      "Kamu Marketing Specialist. Dari requirement produk, buat: " +
      "value proposition 1 kalimat, headline + subheadline landing page, " +
      "dan 3 ide konten sosmed untuk launch.",
  },
};

// ---------- Helper: panggil satu agent ----------
async function runAgent(agentKey, input) {
  const agent = AGENTS[agentKey];
  const t0 = performance.now();

  const res = await client.messages.create({
    model: MODEL,
    max_tokens: 1500,
    system: agent.system,
    messages: [{ role: "user", content: input }],
  });

  const text = res.content
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("\n");

  console.log(`✓ ${agent.name} selesai (${((performance.now() - t0) / 1000).toFixed(1)}s)`);
  return text;
}

// ---------- Orchestrator ----------
// Kunci performa: agent yang TIDAK saling bergantung dijalankan PARALEL (Promise.all),
// bukan satu-satu. Di sini hanya PM yang harus duluan; sisanya bisa jalan bersamaan.
async function runPipeline(idea) {
  console.log(`\n🚀 Pipeline dimulai untuk ide: "${idea}"\n`);
  const t0 = performance.now();

  // Tahap 1: PM (sequential — semua agent lain butuh output ini)
  const requirements = await runAgent("pm", `Ide website: ${idea}`);

  // Tahap 2: Designer, Developer, QA, Marketing (PARALEL — hemat waktu 4x)
  const [design, techPlan, testPlan, marketing] = await Promise.all([
    runAgent("designer", `Requirement:\n${requirements}`),
    runAgent("developer", `Requirement:\n${requirements}`),
    runAgent("qa", `Requirement:\n${requirements}`),
    runAgent("marketing", `Requirement:\n${requirements}`),
  ]);

  const totalSec = ((performance.now() - t0) / 1000).toFixed(1);
  console.log(`\n⏱️  Total: ${totalSec}s (paralel, bukan ${(totalSec * 2.5).toFixed(0)}s+ sequential)\n`);

  return { requirements, design, techPlan, testPlan, marketing };
}

// ---------- Main ----------
const idea = process.argv[2];

runPipeline(idea)
  .then((result) => {
    for (const [section, content] of Object.entries(result)) {
      console.log(`\n${"=".repeat(60)}\n📋 ${section.toUpperCase()}\n${"=".repeat(60)}\n${content}`);
    }
  })
  .catch((err) => {
    console.error("Pipeline gagal:", err.message);
    process.exit(1);
  });
