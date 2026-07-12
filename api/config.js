// Parser CSV sederhana yang tetap aman kalau ada koma di dalam field bertanda kutip
// (misal nama pakai gelar: "Dr. Budi Santoso, S.T., M.M.").
function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const next = text[i + 1];

    if (inQuotes) {
      if (char === '"' && next === '"') {
        field += '"';
        i++;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        field += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ',') {
        row.push(field);
        field = '';
      } else if (char === '\n' || char === '\r') {
        if (char === '\r' && next === '\n') i++;
        row.push(field);
        rows.push(row);
        row = [];
        field = '';
      } else {
        field += char;
      }
    }
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter(r => r.some(cell => cell.trim() !== ''));
}

async function fetchGuestListFromSheet(sheetUrl) {
  const res = await fetch(sheetUrl);
  if (!res.ok) throw new Error('Gagal fetch Google Sheet: ' + res.status);
  const csvText = await res.text();
  const rows = parseCsv(csvText);
  if (rows.length === 0) return '';

  // Deteksi baris header: kalau kolom kedua baris pertama gak ada angka sama sekali,
  // anggap itu header ("Nama, Nomor") dan dilewatin.
  const firstRowLooksLikeHeader = rows[0][1] && !/\d/.test(rows[0][1]);
  const dataRows = firstRowLooksLikeHeader ? rows.slice(1) : rows;

  return dataRows
    .map(r => {
      const nama = (r[0] || '').trim();
      const nomor = (r[1] || '').trim();
      return nama ? `${nama}, ${nomor || '(nomor kosong)'}` : null;
    })
    .filter(Boolean)
    .join('\n');
}

export default async function handler(req, res) {
  let guestList = '';

  const sheetUrl = process.env.GUEST_LIST_SHEET_URL;
  if (sheetUrl) {
    try {
      guestList = await fetchGuestListFromSheet(sheetUrl);
    } catch (e) {
      // Sheet gagal diambil (link salah/private/koneksi) — fallback ke GUEST_LIST kalau ada.
      guestList = '';
    }
  }

  // Fallback / opsi manual: env var GUEST_LIST (plain text atau JSON), dipakai kalau
  // GUEST_LIST_SHEET_URL kosong atau gagal fetch.
  if (!guestList) {
    const rawGuestList = process.env.GUEST_LIST || '';
    const trimmed = rawGuestList.trim();
    if (trimmed.startsWith('[')) {
      try {
        const parsed = JSON.parse(trimmed);
        guestList = parsed
          .map(g => {
            const nama = g.nama || g.name || '';
            const nomor = g.nomor || g.phone || g.number || '';
            return nama ? `${nama}, ${nomor || '(nomor kosong)'}` : null;
          })
          .filter(Boolean)
          .join('\n');
      } catch (e) {
        guestList = rawGuestList;
      }
    } else {
      guestList = rawGuestList;
    }
  }

  res.status(200).json({
    baseUrl: process.env.INVITE_BASE_URL || '',
    mempelai1: process.env.MEMPELAI_1 || '',
    mempelai2: process.env.MEMPELAI_2 || '',
    panggilan1: process.env.PANGGILAN_1 || '',
    panggilan2: process.env.PANGGILAN_2 || '',
    hariTanggal: process.env.HARI_TANGGAL || '',
    lokasi: process.env.LOKASI_ACARA || '',
    waktu: process.env.WAKTU_ACARA || '',
    guestList,
  });
}
