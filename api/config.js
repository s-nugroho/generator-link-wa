export default function handler(req, res) {
  res.status(200).json({
    baseUrl: process.env.INVITE_BASE_URL || '',
    mempelai1: process.env.MEMPELAI_1 || '',
    mempelai2: process.env.MEMPELAI_2 || '',
    panggilan1: process.env.PANGGILAN_1 || '',
    panggilan2: process.env.PANGGILAN_2 || '',
    hariTanggal: process.env.HARI_TANGGAL || '',
    lokasi: process.env.LOKASI_ACARA || '',
    waktu: process.env.WAKTU_ACARA || '',
  });
}
