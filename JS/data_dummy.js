// Inisialisasi Data Dummy Gabungan PDAM, PLN & WIFI di LocalStorage
(function initDummyStorage() {
    if (!localStorage.getItem('data_tagihan')) {
        const dummyData = [
            { id: "98237645", tipe: "PDAM", nama: "Andi Wijaya", periode: "Juni 2026", jumlah: 345000, total: 350000, jatuh_tempo: "20-07-2026" },
            { id: "87349123", tipe: "PDAM", nama: "Budi Santoso", periode: "Juni 2026", jumlah: 245000, total: 250000, jatuh_tempo: "20-07-2026" },
            { id: "45723890", tipe: "PDAM", nama: "Siti Rahma",  periode: "Juni 2026", jumlah: 195000, total: 200000, jatuh_tempo: "20-07-2026" },
            { id: "53219876543", tipe: "PLN", nama: "Andi Saputra", periode: "Juni 2026", jumlah: 147000, total: 150000, jatuh_tempo: "25-07-2026" },
            { id: "53214567890", tipe: "PLN", nama: "Dewi Lestari", periode: "Juni 2026", jumlah: 297000, total: 300000, jatuh_tempo: "25-07-2026" },
            
            // DATA DUMMY BARU: Internet & Wi-Fi
            { id: "10239847", tipe: "WIFI", nama: "Rian Hidayat", periode: "Juni 2026", jumlah: 325000, total: 330000, jatuh_tempo: "15-07-2026" },
            { id: "20485739", tipe: "WIFI", nama: "Farhan Malik", periode: "Juni 2026", jumlah: 445000, total: 450000, jatuh_tempo: "15-07-2026" }
        ];
        localStorage.setItem('data_tagihan', JSON.stringify(dummyData));
    }

    // Inisialisasi Data Dummy Paylater jika belum ada
    if (!localStorage.getItem('data_paylater')) {
        const dummyPaylater = {
            "Kredivo": {
                nama_user: "Zakaria",
                status_hubung: "Akun Kredivo telah terhubung (Premium Account)",
                tagihan: [
                    { id: "k-paylater", jenis: "Paylater (Tenor 30 Hari)", nominal: 350000, jatuh_tempo: "15-07-2026", kode_tagihan: "KRDV-PL-992" },
                    { id: "k-pinjaman", jenis: "Pinjaman Tunai (KrediFazz)", nominal: 1200000, jatuh_tempo: "20-07-2026", kode_tagihan: "KRDV-PJ-104" }
                ]
            },
            "Akulaku": {
                nama_user: "Zakaria",
                status_hubung: "Akun Akulaku telah terhubung (Verified User)",
                tagihan: [
                    { id: "a-paylater", jenis: "Paylater (Aculaku Pay)", nominal: 185000, jatuh_tempo: "12-07-2026", kode_tagihan: "AKU-PL-883" },
                    { id: "a-pinjaman", jenis: "Pinjaman (Dana Cicil)", nominal: 2500000, jatuh_tempo: "25-07-2026", kode_tagihan: "AKU-DC-042" }
                ]
            }
        };
        localStorage.setItem('data_paylater', JSON.stringify(dummyPaylater));
    }
    // Inisialisasi Data Dummy BPJS Kesehatan jika belum ada
    if (!localStorage.getItem('data_bpjs')) {
        const dummyBpjs = [
            {
                no_peserta: "0001234567890", // 13 Digit Standar BPJS
                nama_kepala: "Suryadi Saputra",
                kelas: "Kelas 2",
                jumlah_peserta: 3,
                periode: "Juli 2026",
                nominal: 300000, // Rp 100.000 x 3 orang
                kode_tagihan: "BPJS-77410"
            },
            {
                no_peserta: "0009876543210",
                nama_kepala: "Mega Utami",
                kelas: "Kelas 1",
                jumlah_peserta: 2,
                periode: "Juli 2026",
                nominal: 300000, // Rp 150.000 x 2 orang
                kode_tagihan: "BPJS-11209"
            }
        ];
        localStorage.setItem('data_bpjs', JSON.stringify(dummyBpjs));
    }

    // Inisialisasi Data Dummy Multi Finance jika belum ada
    if (!localStorage.getItem('data_finance')) {
        const dummyFinance = [
            {
                no_kontrak: "100020003000",
                provider: "FIF Group",
                nama_konsumen: "Hendra Wijaya",
                unit: "Honda Vario 160 (B 4102 ZAA)",
                angsuran_ke: "11 dari 35",
                nominal: 1150000,
                kode_tagihan: "FIF-INV-88"
            },
            {
                no_kontrak: "500060007000",
                provider: "Adira Finance",
                nama_konsumen: "Siti Aminah",
                unit: "Yamaha NMAX 155 (B 3099 CXX)",
                angsuran_ke: "05 dari 11",
                nominal: 1450000,
                kode_tagihan: "ADR-INV-42"
            }
        ];
        localStorage.setItem('data_finance', JSON.stringify(dummyFinance));
    }
})();

(function initDummyStorage() {
    if (!localStorage.getItem('data_pendidikan')) {
        const dummyPendidikan = [
            {
                nim: "1234567890222",
                institusi: "Universitas Pamulang",
                nama: "Zakaria",
                periode: "SPP Semester Ganjil 2025/2026",
                tagihan: [
                    { id: "c1", kode: "SPP-011", nama: "Cicilan ke 1", nominal: 300000, lunas: true },
                    { id: "c2", kode: "SPP-022", nama: "Cicilan ke 2", nominal: 300000, lunas: false },
                    { id: "c3", kode: "SPP-033", nama: "Cicilan ke 3", nominal: 300000, lunas: false },
                    { id: "uts", kode: "UTS-011", nama: "UTS", nominal: 400000, lunas: false },
                    { id: "c4", kode: "SPP-044", nama: "Cicilan ke 4", nominal: 300000, lunas: false },
                    { id: "c5", kode: "SPP-055", nama: "Cicilan ke 5", nominal: 300000, lunas: false },
                    { id: "c6", kode: "SPP-066", nama: "Cicilan ke 6", nominal: 300000, lunas: false },
                    { id: "uas", kode: "UAS-011", nama: "UAS", nominal: 400000, lunas: false }
                ]
            },
            {
                nim: "123456789012",
                institusi: "Universitas Pamulang",
                nama: "Ucup",
                periode: "SPP Semester Ganjil 2025/2026",
                tagihan: [
                    { id: "c1", kode: "SPP-011", nama: "Cicilan ke 1", nominal: 300000, lunas: true },
                    { id: "c2", kode: "SPP-022", nama: "Cicilan ke 2", nominal: 300000, lunas: true },
                    { id: "c3", kode: "SPP-033", nama: "Cicilan ke 3", nominal: 300000, lunas: true },
                    { id: "uts", kode: "UTS-011", nama: "UTS", nominal: 400000, lunas: false },
                    { id: "c4", kode: "SPP-044", nama: "Cicilan ke 4", nominal: 300000, lunas: false },
                    { id: "c5", kode: "SPP-055", nama: "Cicilan ke 5", nominal: 300000, lunas: false },
                    { id: "c6", kode: "SPP-066", nama: "Cicilan ke 6", nominal: 300000, lunas: false },
                    { id: "uas", kode: "UAS-011", nama: "UAS", nominal: 400000, lunas: false }
                ]
            },
                        {
                nim: "123456789456",
                institusi: "Universitas Pamulang",
                nama: "Mulyana Drajat",
                periode: "SPP Semester Ganjil 2025/2026",
                tagihan: [
                    { id: "c1", kode: "SPP-011", nama: "Cicilan ke 1", nominal: 300000, lunas: true },
                    { id: "c2", kode: "SPP-022", nama: "Cicilan ke 2", nominal: 300000, lunas: true },
                    { id: "c3", kode: "SPP-033", nama: "Cicilan ke 3", nominal: 300000, lunas: false },
                    { id: "uts", kode: "UTS-011", nama: "UTS", nominal: 400000, lunas: false },
                    { id: "c4", kode: "SPP-044", nama: "Cicilan ke 4", nominal: 300000, lunas: false },
                    { id: "c5", kode: "SPP-055", nama: "Cicilan ke 5", nominal: 300000, lunas: false },
                    { id: "c6", kode: "SPP-066", nama: "Cicilan ke 6", nominal: 300000, lunas: false },
                    { id: "uas", kode: "UAS-011", nama: "UAS", nominal: 400000, lunas: false }
                ]
            }
        ];
        localStorage.setItem('data_pendidikan', JSON.stringify(dummyPendidikan));
    }
})();