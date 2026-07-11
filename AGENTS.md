# Generator Link WA Undangan — Agent Context

## Project Overview

Static HTML/JS tool untuk generate personalized WhatsApp invitation links.  
Single file `index.html` + satu Vercel endpoint `api/config.js`.

## File Map

| File | Purpose |
|------|---------|
| `index.html` | Everything — UI, CSS, JS logic all in one file |
| `api/config.js` | Vercel serverless: returns env vars (baseUrl, names, date, location, time) as JSON |
| `vercel.json` | Deployment config (version 2) |

## How It Works

1. Fetch `/api/config` on load → fills form fields. Falls back kosong (user isi manual).
2. User inputs: base URL, template message, daftar tamu (Nama + No WA per baris).
3. Generate: setiap tamu → link `wa.me/{phone}?text={encodedMessage}` + link undangan `{baseUrl}?to={Nama}`.
4. Output daftar item dengan tombol "Kirim WA" (buka WA dengan pesan terisi).

### Template Placeholders

| Placeholder | Source |
|-------------|--------|
| `{nama}` | Nama tamu dari daftar |
| `{link}` | Link undangan + `?to=Nama` |
| `{nama_mempelai_1}` | Form / env |
| `{nama_mempelai_2}` | Form / env |
| `{nama_panggilan_mempelai_1}` | Form / env |
| `{nama_panggilan_mempelai_2}` | Form / env |
| `{hari_tanggal}` | Form / env |
| `{lokasi_acara}` | Form / env |
| `{waktu}` | Form / env |

### Phone Parsing

- Input: `Budi Santoso, 081234567890` → ekstrak `081234567890`
- Normalisasi: buang spasi, `-`, `()`, `+`. Drop leading `0` atau `+62` → `62`.
- Regex validasi: `^62\d{8,13}$`
- Hanya nomor Indonesia (`+62`).

## Security (already applied)

- `escapeHtml()` untuk semua nama tamu sebelum DOM injection.
- `validateUrl()` — cuma `http:` / `https:` yang lolos, `javascript:` dkk ditolak.
- CSP meta tag: restrict script/style/connect sources.
- No eval, no innerHTML from unsanitized input.
- `rel="noopener"` on all external links.

## Invariants & Constraints

- **Single-file is intentional.** Jangan split `index.html` unless explicitly asked.
- **No build tools / npm packages.** Pure HTML/CSS/JS.
- **Phone format: Indonesia (+62).** Jangan ubah regex tanpa persetujuan.
- **Bahasa: Indonesia** — UI, template default, komentar.

## Common Tasks

1. **Tambah placeholder baru**: tambah `.split('{xxx}').join(value)` di message pipeline + input field di HTML. Selesai.
2. **Ubah format WA link**: edit baris `waLink` construction.
3. **Deploy**: push to main → Vercel auto-deploy. Set env vars di Vercel dashboard.
4. **Test lokal**: buka `index.html` langsung. `/api/config` akan 404 → form tetap isi manual.
