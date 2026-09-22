# Integrasi Frontend ↔ Backend

`NEXT_PUBLIC_API_URL` default: `http://localhost:8080/api/v1`

## Matriks fitur

| Area | Sumber data |
|------|-------------|
| Master (tahun ajaran, semester, jurusan, guru, mapel, kelas, ruangan, jam) | API Go |
| Hari | API `GET /hari` (seed DB) |
| Jadwal semester, slot, plotting, publikasi | API jadwal |
| Konflik | API `POST .../validasi` + `GET .../konflik` (rules lokal) |
| Prediksi / resolve / tanya NL | API → ML (opsional; UI fallback jika 500) |
| Peran demo guru/siswa | UI state (auth nanti) |
| Style guide | Mock demo |

## Urutan isi DB dev

1. Tahun ajaran → Semester  
2. Master: jurusan, guru, mapel, ruangan, jam pelajaran, kelas  
3. `POST /jadwal-semester` `{ "semester_id": "..." }`  
4. `POST /jadwal-semester/:id/jurusan` + `jadwal-kelas` + slot  
5. Plotting guru → validasi → publikasi  

Backend: `make migrate-init` / `migrate up`. Restart server setelah migrasi schema.

### Seed cepat (Ganjil 2026/2027, skeleton)

Dari folder backend:

```bash
make seed-ganjil
# atau: ./scripts/seed-ganjil-2026.sh
```

Mengisi: tahun/semester Ganjil 2026/2027, 8 jurusan SMKN 4, 50 kelas (X & XI dari PDF), jam & ruangan, satu `jadwal_semester` + semua jurusan/kelas terdaftar — **tanpa `slot_jadwal`** (sel grid kosong, siap diisi). Idempotent: aman dijalankan ulang.

Setelah seed: **refresh halaman jadwal** agar katalog jam/kelas terbaca.

### Slot jadwal (template mingguan)

```bash
make seed-slots
# atau: ./scripts/seed-ganjil-slots.sh
```

Mengisi `mata_pelajaran`, `guru`, dan `slot_jadwal` untuk 50 kelas (template umum + produktif per jurusan, dari singkatan PDF). Bukan parse sel-per-sel PDF — kurasi template di `scripts/seed-slots.py`. Regenerasi: edit template lalu jalankan ulang.
