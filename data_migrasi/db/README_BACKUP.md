# Cadangan Database Probetes ERP

## Cara kerja

- **Manual**: buka halaman Status Cadangan di aplikasi (`/database/backup-status`), klik "Cadangkan Sekarang". Bisa kapan saja, tidak perlu setup apa pun.
- **Otomatis**: atur jadwal (Harian/Mingguan/Bulanan) di halaman yang sama, lalu daftarkan `backup_scheduled.py` ke Task Scheduler Windows (sekali saja, langkah di bawah). Setelahnya, cadangan otomatis berjalan sendiri **selama komputer menyala** pada jam yang dijadwalkan.

Semua cadangan (manual maupun otomatis) tersimpan sebagai file CSV dalam sub-folder bertanggal di folder yang diatur, dan tercatat di tabel "Riwayat Cadangan" pada halaman yang sama.

## Setup Task Scheduler (sekali saja)

1. Buka **Task Scheduler** (cari di Start Menu).
2. Klik **Create Basic Task...** di panel kanan.
3. Nama: `Probetes ERP - Cadangan Harian`. Klik Next.
4. Trigger: pilih **Daily**, klik Next. Atur jam, misal `02:00` (dini hari, saat komputer biasanya menyala tapi tidak dipakai kerja). Klik Next.
5. Action: pilih **Start a program**, klik Next.
6. Program/script, isi path Python, misal:
   ```
   C:\Users\Miftah Ramdhani\AppData\Local\Programs\Python\Python311\python.exe
   ```
7. Add arguments, isi:
   ```
   backup_scheduled.py
   ```
8. Start in (optional), isi folder script ini:
   ```
   D:\APP DEVELOPER\ERP PROBETES\data_migrasi\db
   ```
9. Klik Next, lalu **Finish**.

Task ini akan jalan **setiap hari** jam 02:00, tapi script `backup_scheduled.py` sendiri yang memutuskan apakah hari itu perlu backup beneran, sesuai jadwal (Harian/Mingguan/Bulanan) yang Anda atur di halaman Status Cadangan. Jadi cukup daftarkan trigger harian sekali ini saja — tidak perlu bikin ulang tiap kali ganti jadwal di aplikasi.

## Catatan penting

- Task Scheduler + script ini **hanya jalan kalau komputer menyala** pada jam terjadwal. Kalau komputer mati/tidur saat itu, cadangan hari itu terlewat (baru jalan lagi di jadwal berikutnya).
- Password database ditulis langsung di `backup_scheduled.py` (baris `DB = dict(...)`) — sama seperti skrip migrasi lain di folder ini. Jaga file ini tidak ikut ter-upload/dibagikan ke luar.
- Untuk uji coba tanpa menunggu jadwal, jalankan langsung dari terminal:
  ```
  cd "D:\APP DEVELOPER\ERP PROBETES\data_migrasi\db"
  python backup_scheduled.py
  ```
  Kalau jadwal sedang "manual" atau hari ini tidak cocok (misal jadwal Bulanan tapi bukan tanggal 1), script akan mencetak pesan dan tidak membuat cadangan — itu wajar, bukan error.
