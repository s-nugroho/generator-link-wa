export default function handler(req, res) {
  const rawGuestList = process.env.GUEST_LIST || '';
  let guestList = rawGuestList;

  // Auto-detect format: kalau diawali '[' anggap JSON array, selain itu plain text.
  const trimmed = rawGuestList.trim();
  if (trimmed.startsWith('[')) {
    try {
      const parsed = JSON.parse(trimmed);
      // Terima key nama/nomor ATAU name/phone, biar fleksibel.
      guestList = parsed
        .map(g => {
          const nama = g.nama || g.name || '';
          const nomor = g.nomor || g.phone || g.number || '';
          return nama && nomor ? `${nama}, ${nomor}` : null;
        })
        .filter(Boolean)
        .join('\n');
    } catch (e) {
      // JSON invalid — fallback: kirim mentah, biar kelihatan errornya di UI daripada gagal diam-diam.
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
