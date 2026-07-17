# Hafalan Al-Quran

Aplikasi web untuk menghafal Al-Quran ayat per ayat dengan target harian, gating (tidak bisa lanjut ke ayat baru sebelum ayat sebelumnya ditandai hafal), kuis ketik ulang, murojaah, dan dashboard progres. Teks Arab (skrip Uthmani/Madinah) diambil dari Quran.com API dan divalidasi silang otomatis terhadap sumber independen sebelum disimpan — lihat `scripts/ingest-quran.ts`.

## Prasyarat

- **Node.js 20 atau lebih baru** (Next.js 16 butuh minimal 18.18, proyek ini pakai Node 20.19.6). Cek dengan:
  ```
  node -v
  ```
  Kalau versinya di bawah 18.18, ganti dulu (lihat catatan nvm di bawah).
- Akses ke database **Neon Postgres** (connection string sudah ada di `.env.local`, jangan commit file ini).

### Kalau `node -v` menunjukkan versi lama (nvm)

Sistem ini pakai `nvm-windows` (nvm4w). Untuk pindah versi:
```
nvm ls            # lihat versi yang sudah terpasang
nvm use 20.19.6   # pakai versi ini (harus dijalankan dengan hak admin kalau gagal diam-diam)
```

## Setup pertama kali

Sudah dilakukan sekali di proyek ini, tapi kalau clone ulang atau pindah mesin, urutannya:

1. Install dependencies:
   ```
   npm install
   ```
2. Buat `.env.local` di root proyek (**jangan commit**, sudah di-gitignore lewat pola `.env*`) berisi:
   ```
   DATABASE_URL="<connection string Neon, pooled, ada -pooler di host>"
   DIRECT_URL="<connection string Neon yang sama, tanpa -pooler, untuk migrasi>"
   AUTH_SECRET="<random string, generate dengan: node -e "console.log(require('crypto').randomBytes(32).toString('base64'))">"
   ```
3. Jalankan migrasi database (membuat semua tabel):
   ```
   npx prisma migrate dev
   ```
4. Isi data Al-Quran (114 surat, 6.236 ayat) — sekali saja, aman dijalankan ulang karena otomatis dilewati kalau data sudah ada:
   ```
   npx tsx --env-file=.env.local scripts/ingest-quran.ts
   ```
   Kalau perlu isi ulang dari awal (menghapus semua data Quran + progres user yang terkait): tambahkan `--force`.

## Menjalankan aplikasi (development)

```
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000). Halaman utama otomatis redirect ke `/login` (atau `/dashboard` kalau sudah login). Daftar akun baru lewat `/register`.

## Build production

```
npm run build
npm run start
```

## Struktur singkat

```
app/(auth)/login, register              — halaman login & daftar
app/(dashboard)/dashboard               — ringkasan progres
app/(dashboard)/hafalan                 — daftar target + buat target baru (dengan gate)
app/(dashboard)/hafalan/[targetId]      — halaman hafalan per target: teks ayat, kuis, tombol "Tandai Sudah Hafal"
app/(dashboard)/murojaah                — ulang ayat yang sudah hafal (bebas gate)
app/(dashboard)/surah/[surahNumber]     — daftar ayat per surat
lib/actions/                            — server actions (targets, quiz, auth)
lib/quran/normalize.ts, diff.ts         — logika normalisasi & diff untuk kuis
lib/queries/                            — query agregasi progres & target
prisma/schema.prisma                    — skema database
scripts/ingest-quran.ts                 — ambil & validasi teks Quran, isi database
```

## Script npm yang tersedia

| Perintah | Fungsi |
|---|---|
| `npm run dev` | Jalankan development server (Turbopack) |
| `npm run build` | Build production |
| `npm run start` | Jalankan hasil build production |
| `npm run lint` | Jalankan ESLint |
| `npx prisma studio` | Buka GUI untuk lihat/edit data database langsung |
| `npx prisma migrate dev` | Buat/jalankan migrasi database baru setelah ubah `schema.prisma` |
