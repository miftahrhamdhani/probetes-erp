# Folder Koreksi — Perbaikan Data Terkurasi

Berisi file koreksi yang **diedit manusia** lalu diterapkan ke database oleh script.
Tujuannya: menerapkan keputusan owner tanpa mengubah pipeline mentah, dan **tanpa menghapus
data asli** (hapus = arsip, merge = tetap simpan nama asli). Bisa diedit ulang kapan saja
begitu ada jawaban baru dari owner.

## koreksi_produk.csv

Satu baris = satu produk. Kolom:

| Kolom | Arti |
|---|---|
| `product_id` | ID produk (jangan diubah) |
| `nama_produk` | nama produk (acuan, jangan diubah) |
| `kategori_lama` | kategori lama (info) |
| `kategori_baru` | **kategori tujuan** — isi salah satu: Herbal / Makanan / Minyak Balur / Edukasi / Device / Event / Jasa |
| `aksi` | `set_kategori` (default) · `hapus` (arsip) · `gabung` · `keluar_sales` |
| `target_gabung` | jika `aksi=gabung`, ID produk tujuan gabung |
| `perlu_review` | `ya` = tebakan otomatis, **mohon owner cek/koreksi** |
| `catatan` | keterangan |

**Cara edit:** ubah `kategori_baru` untuk baris yang `perlu_review=ya`, atau ganti `aksi`
sesuai keputusan. Simpan file (tetap format CSV, encoding UTF-8).

## Menerapkan

```bash
# lihat rencana perubahan (tidak mengubah apa pun)
python data_migrasi/scripts/apply_koreksi_produk.py

# terapkan ke database + patch CSV output
python data_migrasi/scripts/apply_koreksi_produk.py --apply
```

Catatan:
- `hapus` = set status `archived` (baris tetap ada, tidak dihapus fisik).
- `keluar_sales` = tandai `is_sales_item=false` (mis. Pro Herbal Dummy = kiriman affiliator).
- `gabung` = `order_items` dipindah ke produk tujuan (nama asli tetap tersimpan di
  `original_product_name`), produk sumber diarsipkan. Beda COD/TF tetap terbaca dari
  `orders.payment_method` (tidak perlu kolom tag baru).
- Perubahan ini ke database live. Bila migrasi penuh di-run ulang dari `raw/`, jalankan
  lagi script ini setelahnya (atau nanti koreksi ini di-wire ke build_migration).
