// --- DATABASE SIMULASI (LOCAL STORAGE) ---
const STORAGE_KEY_SALDO = 'payapps_saldo';
const STORAGE_KEY_TRX = 'payapps_transactions';
const STORAGE_KEY_PROFILE = 'payapps_profile_data'; // Diubah agar menyimpan objek utuh

// Nilai Default jika Local Storage kosong
if (localStorage.getItem(STORAGE_KEY_SALDO) === null) localStorage.setItem(STORAGE_KEY_SALDO, '750000'); 
if (localStorage.getItem(STORAGE_KEY_TRX) === null) localStorage.setItem(STORAGE_KEY_TRX, JSON.stringify([]));

// Default data profil (berupa Objek/JSON)
const defaultProfile = {
    nama: 'Zakaria'
};

if (localStorage.getItem(STORAGE_KEY_PROFILE) === null) {
    localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(defaultProfile));
}

// --- FUNGSI GETTER & SETTER ---
const getSaldo = () => parseInt(localStorage.getItem(STORAGE_KEY_SALDO));
const updateSaldo = (amount) => { localStorage.setItem(STORAGE_KEY_SALDO, amount.toString()); updateGlobalUI(); };

const getTransactions = () => JSON.parse(localStorage.getItem(STORAGE_KEY_TRX));
const addTransaction = (trx) => {
    const trxs = getTransactions();
    trxs.unshift(trx);
    localStorage.setItem(STORAGE_KEY_TRX, JSON.stringify(trxs));
    updateGlobalUI();
};

// Fungsi Baru untuk Mengambil Data Profil (Objek)
const getProfile = () => JSON.parse(localStorage.getItem(STORAGE_KEY_PROFILE));

// Fungsi Baru untuk Memperbarui Data Profil
const updateProfile = (profileData) => {
    localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(profileData));
};

document.addEventListener("DOMContentLoaded", () => {
    // Gunakan fungsi getProfile() yang sudah kita buat sebelumnya
    const profil = getProfile(); 
    const saldoSaatIni = getSaldo();

    if (profil) {
        // Mengisi masing-masing input secara spesifik
        document.getElementById('prof-input-nama').value = profil.nama || '';
        document.getElementById('prof-input-email').value = profil.email || '';
        document.getElementById('prof-input-nohp').value = profil.nohp || '';
        document.getElementById('prof-input-tgllahir').value = profil.tgllahir || '';
        document.getElementById('prof-input-alamat').value = profil.alamat || '';
        
        // Mengubah teks nama di atas avatar (bukan objeknya, tapi namanya saja)
        document.getElementById('prof-nama').innerText = profil.nama || 'Zakaria';
    }
    
    if (document.getElementById('prof-input-saldo')) {
        document.getElementById('prof-input-saldo').value = saldoSaatIni;
    }
});



const formatRp = (num) => 'Rp ' + num.toLocaleString('id-ID');

function updateGlobalUI() {
    document.getElementById('global-saldo').innerText = formatRp(getSaldo());
}

        function initEnginePendidikan() {
            const inputNim = document.getElementById('edu-nim');
            const selectInstitusi = document.getElementById('edu-institusi');
            const selectItemBayar = document.getElementById('edu-item-bayar');
            const selectMetode = document.getElementById('edu-metode');
            const containerDetail = document.getElementById('edu-detail-tagihan');
            const btnSubmit = document.getElementById('edu-btn-submit');
            const wrapperInstruksi = document.getElementById('edu-instruksi-wrapper');
            const hiddenNominalFix = document.getElementById('edu-nominal-fix');

            let currentMahasiswa = null;

            if (inputNim && selectInstitusi) {
                inputNim.addEventListener('input', jalankanPencarian);
                selectInstitusi.addEventListener('change', jalankanPencarian);

                function jalankanPencarian() {
                    const nimValue = inputNim.value.trim();
                    const institusiValue = selectInstitusi.value;
                    const dbPendidikan = JSON.parse(localStorage.getItem('data_pendidikan')) || [];

                    currentMahasiswa = dbPendidikan.find(m => m.nim === nimValue && m.institusi === institusiValue);

                    if (currentMahasiswa) {
                        renderTabelRincian(currentMahasiswa.tagihan, currentMahasiswa.periode, currentMahasiswa.nama, currentMahasiswa.nim);

                        // --- MODIFIKASI: Menambahkan KODE TAGIHAN di dalam Dropdown Pilihan ---
                        let opsiHtml = '<option value="" disabled selected>Pilih item cicilan...</option>';
                        let adaTagihanBelumLunas = false;
                        let totalSemuaBelumLunas = 0;

                        currentMahasiswa.tagihan.forEach(item => {
                            if (!item.lunas) {
                                opsiHtml += `<option value="${item.id}">${item.kode} - ${item.nama} </option>`;
                                totalSemuaBelumLunas += item.nominal;
                                adaTagihanBelumLunas = true;
                            }
                        });

                        if (adaTagihanBelumLunas) {
                            opsiHtml += `<option value="ALL"> Pilih Semua Komponen </option>`;
                            selectItemBayar.removeAttribute('disabled');
                        } else {
                            opsiHtml = '<option value="" disabled>Semua komponen SPP sudah lunas!</option>';
                            selectItemBayar.setAttribute('disabled', 'true');
                        }

                        selectItemBayar.innerHTML = opsiHtml;
                        selectMetode.removeAttribute('disabled');
                        btnSubmit.removeAttribute('disabled');
                    } else {
                        containerDetail.innerHTML = `<div class="alert alert-warning py-2 text-xs mb-0"><i class="bi bi-exclamation-triangle-fill me-1"></i> Data mahasiswa tidak ditemukan pada institusi ini.</div>`;
                        containerDetail.classList.remove('d-none');
                        selectItemBayar.innerHTML = '<option value="" disabled selected>Masukkan NIM terlebih dahulu...</option>';
                        selectItemBayar.setAttribute('disabled', 'true');
                        selectMetode.setAttribute('disabled', 'true');
                        btnSubmit.setAttribute('disabled', 'true');
                        wrapperInstruksi.innerHTML = `<p class="text-muted small m-0">Silakan isi data mahasiswa untuk memunculkan detail struktur biaya.</p>`;
                    }
                }

                selectItemBayar.addEventListener('change', function() {
                    if (!currentMahasiswa) return;

                    const pilihan = this.value;
                    let selectedNominal = 0;

                    if (pilihan === 'ALL') {
                        const listBelumLunas = currentMahasiswa.tagihan.filter(i => !i.lunas);
                        renderTabelRincian(listBelumLunas, currentMahasiswa.periode, currentMahasiswa.nama, currentMahasiswa.nim, true);
                        selectedNominal = listBelumLunas.reduce((acc, curr) => acc + curr.nominal, 0);
                    } else {
                        const itemTerpilih = currentMahasiswa.tagihan.filter(i => i.id === pilihan);
                        renderTabelRincian(itemTerpilih, currentMahasiswa.periode, currentMahasiswa.nama, currentMahasiswa.nim, true);
                        if(itemTerpilih.length > 0) selectedNominal = itemTerpilih[0].nominal;
                    }
                    
                    hiddenNominalFix.value = selectedNominal;
                });

                selectMetode.addEventListener('change', function() {
                    const metode = this.value;
                    let htmlContent = '';

                    if (metode === 'Virtual Account') {
                        const randomVA = '88012' + Math.floor(10000000 + Math.random() * 90000000);
                        htmlContent = `
                            <div class="p-3 bg-light rounded border border-info border-opacity-25">
                                <small class="text-muted d-block mb-1 fw-medium">Nomor Virtual Account</small>
                                <div class="d-flex align-items-center justify-content-between mb-1">
                                    <span class="fs-5 fw-bold text-info tracking-wide d-block">${randomVA}</span>
                                    <!-- Tombol Salin Cepat ala Aplikasi Real -->
                                    <button type="button" class="btn btn-sm btn-outline-info py-0 px-2 rounded-2" onclick="navigator.clipboard.writeText('${randomVA}'); alert('Nomor VA berhasil disalin!');">
                                        <small>Salin</small>
                                    </button>
                                </div>
                                <small class="text-xs text-muted d-block mb-3"><i class="bi bi-info-circle me-1"></i>Salin nomor di atas untuk transfer bank.</small>

                                <!-- Bagian Panduan Pembayaran Real -->
                                <div class="border-top pt-2 mt-2 text-start">
                                    <span class="text-dark small fw-semibold d-block mb-2">Petunjuk Pembayaran:</span>
                                    
                                    <div class="accordion accordion-flush" id="petunjukVA">
                                        <!-- Pilihan 1: Mobile Banking -->
                                        <div class="accordion-item bg-transparent border-bottom-0">
                                            <h2 class="accordion-header">
                                                <button class="accordion-button collapsed p-2 small text-secondary bg-transparent shadow-none" type="button" data-bs-toggle="collapse" data-bs-target="#stepMbanking">
                                                    <small><i class="bi bi-phone me-2 text-info"></i>Via Mobile Banking (m-Banking)</small>
                                                </button>
                                            </h2>
                                            <div id="stepMbanking" class="accordion-collapse collapse" data-bs-parent="#petunjukVA">
                                                <div class="accordion-body p-2 pt-0 text-muted" style="font-size: 0.8rem;">
                                                    1. Buka aplikasi m-Banking Anda.<br>
                                                    2. Pilih menu <strong>Transfer</strong> > <strong>Virtual Account</strong>.<br>
                                                    3. Masukkan atau tempel nomor VA di atas.<br>
                                                    4. Periksa data tagihan, masukkan PIN Anda, lalu konfirmasi.
                                                </div>
                                            </div>
                                        </div>

                                        <!-- Pilihan 2: ATM -->
                                        <div class="accordion-item bg-transparent border-bottom-0">
                                            <h2 class="accordion-header">
                                                <button class="accordion-button collapsed p-2 small text-secondary bg-transparent shadow-none" type="button" data-bs-toggle="collapse" data-bs-target="#stepATM">
                                                    <small><i class="bi bi-credit-card me-2 text-info"></i>Via ATM</small>
                                                </button>
                                            </h2>
                                            <div id="stepATM" class="accordion-collapse collapse" data-bs-parent="#petunjukVA">
                                                <div class="accordion-body p-2 pt-0 text-muted" style="font-size: 0.8rem;">
                                                    1. Masukkan kartu ATM dan PIN Anda.<br>
                                                    2. Pilih menu <strong>Bayar/Beli</strong> atau <strong>Transfer ke Bank Lain</strong>.<br>
                                                    3. Pilih opsi <strong>Virtual Account</strong>.<br>
                                                    4. Masukkan nomor VA, pastikan nominal sesuai, lalu tekan **Ya**.
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>`;
                    } else if (metode === 'QRIS') {
                        htmlContent = `
                            <div class="text-center">
                                <small class="text-muted d-block mb-2 fw-medium">Pindai Kode QRIS</small>
                                <div class="d-inline-block mb-2">
                                    <i class="bi bi-qr-code text-dark" style="font-size: 4.5rem;"></i>
                                </div>
                                <small class="text-xs text-muted d-block">Mendukung GoPay, OVO, Dana, LinkAja, & M-Banking</small>
                            </div>`;
                    } else if (metode === 'Kasir') {
                        const randomKodeKasir = 'TRX-' + Math.floor(100000 + Math.random() * 900000);
                        htmlContent = `
                            <div class="p-3 bg-light rounded border border-warning border-opacity-25">
                                <small class="text-muted d-block mb-1 fw-medium">Lokasi Gerai Kasir</small>
                                <span class="fw-bold text-dark d-block mb-2">Alfamart / Indomaret Terdekat</span>
                                <small class="text-muted d-block mb-1 fw-medium">Kode Pembayaran</small>
                                <span class="fs-5 fw-bold text-warning tracking-wide d-block">${randomKodeKasir}</span>
                            </div>`;
                    }
                    wrapperInstruksi.innerHTML = htmlContent;
                });
            }

            // --- MODIFIKASI: Render Tabel Rincian dengan Kolom KODE ---
            function renderTabelRincian(arrayTagihan, periode, namaMhs, nimMhs, isFilterMode = false) {
                let barisHtml = '';
                let grandTotal = 0;

                arrayTagihan.forEach(item => {
                    const statusIcon = item.lunas 
                        ? '<span class="text-success fw-bold"><i class="bi bi-check-lg"></i></span>' 
                        : '<span class="text-danger fw-bold"><i class="bi bi-x-lg"></i></span>';
                    
                    barisHtml += `
                        <tr>
                            <td class="py-1"><span class="badge bg-light text-secondary border fw-mono me-1" style="font-size: 0.7rem;">${item.kode}</span></td>
                            <td class="py-1 text-secondary">${item.nama}</td>
                            <td class="py-1 fw-semibold text-end">Rp ${item.nominal.toLocaleString('id-ID')}</td>
                            <td class="py-1 text-end">${statusIcon}</td>
                        </tr>`;
                    grandTotal += item.nominal;
                });

                containerDetail.innerHTML = `
                    <div class="border rounded bg-white p-3 animate__animated animate__fadeIn" style="font-size: 0.85rem;">
                        <div class="mb-3 pb-2 border-bottom">
                            <span class="d-block fw-bold text-dark fs-6">${periode}</span>
                            <div class="text-muted mt-1" style="font-size: 0.8rem;">
                                <div>Nama Mahasiswa : <span class="text-dark fw-medium">${namaMhs}</span></div>
                                <div>NIM : <span class="text-dark fw-medium">${nimMhs}</span></div>
                            </div>
                        </div>
                        <table class="table table-sm table-borderless mb-0">
                            <thead>
                                <tr class="border-bottom text-muted mb-1" style="font-size: 0.75rem;">
                                    <th>Kode</th><th>Komponen</th><th class="text-end">Biaya</th><th class="text-end">Status</th>
                                </tr>
                            </thead>
                            <tbody>${barisHtml}</tbody>
                            <tfoot>
                                <tr class="border-top">
                                    <td class="fw-bold text-dark pt-2" colspan="2">${isFilterMode ? 'Total Bayar' : 'Total Seluruh'}</td>
                                    <td class="fw-bold text-success text-end pt-2" style="font-size: 1rem;" colspan="2">Rp ${grandTotal.toLocaleString('id-ID')}</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>`;
                containerDetail.classList.remove('d-none');
            }
        }


// Fungsi Mengambil File HTML Terpisah Secara Asynchronous
async function loadPage(pageName) {
    const mainContent = document.getElementById('main-content');
    const pageTitle = document.getElementById('page-title');
    
    pageTitle.innerText = pageName.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

    try {
        // Melakukan fetch ke file html target di dalam folder /pages
        const response = await fetch(`pages/${pageName}.html`);
        
        if (!response.ok) throw new Error('Halaman tidak ditemukan');
        
        const htmlContent = await response.text();
        
        // Suntikkan kode HTML eksternal ke dalam container utama layout
        mainContent.innerHTML = htmlContent;

        // Inisialisasi logika script form/tabel setelah HTML selesai di-load
        initPageController(pageName);

    } catch (error) {
        mainContent.innerHTML = `<div class="alert alert-danger">Gagal memuat halaman: ${error.message}. Pastikan Anda menjalankan web via Local Server (Live Server).</div>`;
    }
}

// --- CONTROLLERS LOGIC UNTUK TIAP FORM ---
function initPageController(pageName) {
    const currentSaldo = getSaldo();

    if (pageName === 'dashboard') {
        const trxs = getTransactions();
        document.getElementById('dash-saldo').innerText = formatRp(currentSaldo);
        document.getElementById('dash-trx-count').innerText = trxs.filter(t => t.status === 'Sukses').length;
        
        const totalPengeluaran = trxs.reduce((sum, item) => item.type === 'debit' ? sum + item.amount : sum, 0);
        document.getElementById('dash-pengeluaran').innerText = formatRp(totalPengeluaran);

        const tbody = document.getElementById('dash-table-body');
        tbody.innerHTML = trxs.slice(0, 3).map(t => `
            <tr>
                <td><small class="text-muted">${t.date}</small></td>
                <td><strong>${t.service}</strong></td>
                <td class="${t.type === 'credit' ? 'text-success' : 'text-danger'}">${t.type === 'credit' ? '+' : '-'}${formatRp(t.amount)}</td>
                <td><span class="badge bg-success">${t.status}</span></td>
            </tr>
        `).join('') || `<tr><td colspan="4" class="text-center py-3 text-muted">Belum ada transaksi terakhir.</td></tr>`;
    }



   










// ==========================================
// ==========================================
      // 2. HALAMAN TAGIHAN
// ==========================================

    if (pageName === 'bayar-tagihan') {
        
        // ==========================================
        // 1. HANDLER MODAL PDAM
        // ==========================================
        const btnPdam = document.querySelector('.btn-pdam');
        if (btnPdam) {
            btnPdam.addEventListener('click', function() {
                const oldModal = document.getElementById('modalPdam');
                if (oldModal) oldModal.remove();

                fetch('modal/modal-pdam.html')
                    .then(response => response.text())
                    .then(htmlModal => {
                        document.body.insertAdjacentHTML('beforeend', htmlModal);
                        const modalElement = document.getElementById('modalPdam');
                        const pdamModalInstance = new bootstrap.Modal(modalElement);
                        pdamModalInstance.show();

                        initPencarianTagihan('pdam-nopel', 'pdam-detail-tagihan', 'pdam-nominal', 'pdam-metode', 'pdam-btn-submit', 'PDAM');
                        initMetodePembayaranListener('pdam-metode', 'pdam-instruksi-wrapper');
                        initFormPdamListener(pdamModalInstance);
                    })
                    .catch(err => console.error('Gagal memuat modal PDAM:', err));
            });
        }

        // ==========================================
        // 2. HANDLER MODAL LISTRIK PLN
        // ==========================================
        const btnPln = document.querySelector('.btn-pln');
        if (btnPln) {
            btnPln.addEventListener('click', function() {
                const oldModal = document.getElementById('modalPln');
                if (oldModal) oldModal.remove();

                fetch('modal/modal-pln.html')
                    .then(response => response.text())
                    .then(htmlModal => {
                        document.body.insertAdjacentHTML('beforeend', htmlModal);
                        const modalElement = document.getElementById('modalPln');
                        const plnModalInstance = new bootstrap.Modal(modalElement);
                        plnModalInstance.show();

                        initPencarianTagihan('pln-nopel', 'pln-detail-tagihan', 'pln-nominal', 'pln-metode', 'pln-btn-submit', 'PLN');
                        initMetodePembayaranListener('pln-metode', 'pln-instruksi-wrapper');
                        initFormPlnListener(plnModalInstance);
                    })
                    .catch(err => console.error('Gagal memuat modal PLN:', err));
            });
        }

        // ==========================================
        // 3. HANDLER MODAL INTERNET & WIFI
        // ==========================================
        const btnWifi = document.querySelector('.btn-wifi'); // Sesuaikan class button pemicu di file utama kamu
        if (btnWifi) {
            btnWifi.addEventListener('click', function() {
                const oldModal = document.getElementById('modalWifi');
                if (oldModal) oldModal.remove();

                fetch('modal/modal-wifi.html') // Sesuaikan path lokasi folder file html modal
                    .then(response => response.text())
                    .then(htmlModal => {
                        document.body.insertAdjacentHTML('beforeend', htmlModal);
                        const modalElement = document.getElementById('modalWifi');
                        const wifiModalInstance = new bootstrap.Modal(modalElement);
                        wifiModalInstance.show();

                        // Jalankan engine pencarian untuk tipe 'WIFI'
                        initPencarianTagihan('wifi-nopel', 'wifi-detail-tagihan', 'wifi-nominal', 'wifi-metode', 'wifi-btn-submit', 'WIFI');
                        initMetodePembayaranListener('wifi-metode', 'wifi-instruksi-wrapper');
                        initFormWifiListener(wifiModalInstance);
                    })
                    .catch(err => console.error('Gagal memuat modal Wi-Fi:', err));
            });
        }

        // ==========================================
        // 3. HANDLER MODAL pendidikan
        // ==========================================
        const btnEdu = document.querySelector('.btn-pendidikan'); 
        if (btnEdu) {
            btnEdu.addEventListener('click', function() {
                // Bersihkan instans modal lama jika ada duplikasi di DOM
                const oldModal = document.getElementById('modalPendidikan');
                if (oldModal) oldModal.remove();

                // Ambil file HTML modal pendidikan
                fetch('modal/modal-pendidikan.html')
                    .then(response => response.text())
                    .then(htmlModal => {
                        document.body.insertAdjacentHTML('beforeend', htmlModal);
                        const modalElement = document.getElementById('modalPendidikan');
                        const eduModalInstance = new bootstrap.Modal(modalElement);
                        eduModalInstance.show();

                        // Jalankan engine pencarian & dropdown otomatis yang sudah dibuat sebelumnya
                        initEnginePendidikan();
                        
                        // Aktifkan listener submit form dengan alert & loading di bawah ini
                        initFormEduListener(eduModalInstance);
                    })
                    .catch(err => console.error('Gagal memuat arsitektur modal pendidikan:', err));
            });
        }

        // ==========================================
        // 5. ENGINE SATU MODAL UNTUK MULTI PAYLATER
        // ==========================================
        const cardsPaylater = document.querySelectorAll('.btn-kredivo, .btn-akulaku'); // Sesuaikan class selector pada komponen card dashboard kamu
        cardsPaylater.forEach(card => {
            card.addEventListener('click', function() {
                // Deteksi provider berdasarkan class card yang diklik
                const provider = this.classList.contains('btn-kredivo') ? 'Kredivo' : 'Akulaku';

                const oldModal = document.getElementById('modalPaylater');
                if (oldModal) oldModal.remove();

                fetch('modal/modal-paylater.html')
                    .then(response => response.text())
                    .then(htmlModal => {
                        document.body.insertAdjacentHTML('beforeend', htmlModal);
                        const modalElement = document.getElementById('modalPaylater');
                        const paylaterModalInstance = new bootstrap.Modal(modalElement);
                        paylaterModalInstance.show();

                        initEnginePaylater(provider);
                        initFormPaylaterListener(paylaterModalInstance, provider);
                    })
                    .catch(err => console.error('Gagal memuat arsitektur modal paylater:', err));
            });
        });

        // ==========================================
        // 6. HANDLER MODAL BPJS KESEHATAN
        // ==========================================
        const btnBpjs = document.querySelector('.btn-bpjs'); // Pastikan tombol menu BPJS kamu memiliki kelas ini
        if (btnBpjs) {
            btnBpjs.addEventListener('click', function() {
                const oldModal = document.getElementById('modalBpjs');
                if (oldModal) oldModal.remove();

                fetch('modal/modal-bpjs.html')
                    .then(response => response.text())
                    .then(htmlModal => {
                        document.body.insertAdjacentHTML('beforeend', htmlModal);
                        const modalElement = document.getElementById('modalBpjs');
                        const bpjsModalInstance = new bootstrap.Modal(modalElement);
                        bpjsModalInstance.show();

                        initEngineBpjs();
                        initFormBpjsListener(bpjsModalInstance);
                    })
                    .catch(err => console.error('Gagal memuat arsitektur modal BPJS:', err));
            });
        }

        // ==========================================
        // 7. MULTI FINANCE ENGINE SYSTEM
        // ==========================================
        const btnFinance = document.querySelector('.btn-finance'); // Sesuaikan class selector pada menu item dashboard kamu
        if (btnFinance) {
            btnFinance.addEventListener('click', function() {
                const oldModal = document.getElementById('modalFinance');
                if (oldModal) oldModal.remove();

                fetch('modal/modal-finance.html')
                    .then(response => response.text())
                    .then(htmlModal => {
                        document.body.insertAdjacentHTML('beforeend', htmlModal);
                        const modalElement = document.getElementById('modalFinance');
                        const finModalInstance = new bootstrap.Modal(modalElement);
                        finModalInstance.show();

                        initEngineFinance();
                        initFormFinanceListener(finModalInstance);
                    })
                    .catch(err => console.error('Gagal merender arsitektur modal multi finance:', err));
            });
        }

        // ==========================================
        // ENGINE PENCARIAN LOCALSTORAGE (SUDH UPDATE NAMA)
        // ==========================================
        function initPencarianTagihan(idInput, idDetailContainer, idHiddenNominal, idMetodeSelect, idBtnSubmit, tipeLayanan) {
            const inputNopel = document.getElementById(idInput);
            const container = document.getElementById(idDetailContainer);
            const hiddenNominal = document.getElementById(idHiddenNominal);
            const selectMetode = document.getElementById(idMetodeSelect);
            const btnSubmit = document.getElementById(idBtnSubmit);

            if (inputNopel) {
                inputNopel.addEventListener('input', function() {
                    const valueKetik = this.value.trim();
                    const database = JSON.parse(localStorage.getItem('data_tagihan')) || [];
                    
                    // Cari data berdasarkan ID dan kecocokan tipe layanan (PDAM / PLN)
                    const dataKetemu = database.find(item => item.id === valueKetik && item.tipe === tipeLayanan);

                    if (dataKetemu) {
                        // Tampilkan tabel rincian data termasuk NAMA PELANGGAN
                        container.innerHTML = `
                            <div class="table-responsive border rounded bg-white p-2 animate__animated animate__fadeIn">
                                <table class="table table-sm table-borderless mb-0" style="font-size: 0.85rem;">
                                    <tr><td class="text-muted py-1">ID Pelanggan</td><td class="fw-bold py-1 text-end">${dataKetemu.id}</td></tr>
                                    <tr><td class="text-muted py-1">Nama Pelanggan</td><td class="fw-bold text-dark py-1 text-end">${dataKetemu.nama}</td></tr>
                                    <tr><td class="text-muted py-1">Periode</td><td class="fw-semibold py-1 text-end">${dataKetemu.periode}</td></tr>
                                    <tr><td class="text-muted py-1">Jumlah Tagihan</td><td class="fw-semibold py-1 text-end">Rp ${dataKetemu.jumlah.toLocaleString('id-ID')}</td></tr>
                                    <tr><td class="text-muted py-1">Jatuh Tempo</td><td class="text-danger py-1 text-end">${dataKetemu.jatuh_tempo}</td></tr>
                                    <tr class="border-top"><td class="fw-bold text-dark py-1">Total Bayar</td><td class="fw-bold text-primary py-1 text-end" style="font-size: 1rem;">Rp ${dataKetemu.total.toLocaleString('id-ID')}</td></tr>
                                </table>
                            </div>`;
                        container.classList.remove('d-none');
                        hiddenNominal.value = dataKetemu.total; 
                        selectMetode.removeAttribute('disabled'); 
                        btnSubmit.removeAttribute('disabled');   
                    } else {
                        // Jika tidak ada data yang cocok, kunci form kembali
                        container.innerHTML = `<div class="alert alert-warning py-2 text-xs mb-0"><i class="bi bi-exclamation-triangle-fill me-1"></i> Data pelanggan tidak ditemukan atau tidak sesuai.</div>`;
                        container.classList.remove('d-none');
                        hiddenNominal.value = '';
                        selectMetode.setAttribute('disabled', 'true');
                        btnSubmit.setAttribute('disabled', 'true');
                    }
                });
            }
        }


        // ENGINE DETEKSI DAN ATUR STRUKTUR DROP DOWN SECARA OTOMATIS
        function initEnginePaylater(providerName) {
            const titleModal = document.getElementById('paylater-modal-title');
            const txtStatusHubung = document.getElementById('paylater-status-text');
            const selectJenisTagihan = document.getElementById('paylater-jenis-tagihan');
            const inputNominalView = document.getElementById('paylater-nominal-view');
            const inputNominalRaw = document.getElementById('paylater-nominal-raw');
            const selectMetode = document.getElementById('paylater-metode');
            const containerInvoice = document.getElementById('paylater-detail-invoice');
            const wrapperInstruksi = document.getElementById('paylater-instruksi-wrapper');
            const btnSubmit = document.getElementById('paylater-btn-submit');

            // Ambil master data paylater dari localstorage
            const dbPaylater = JSON.parse(localStorage.getItem('data_paylater')) || {};
            const dataProvider = dbPaylater[providerName];

            if (dataProvider) {
                // 1. Set Judul & Informasi Status Hubung Akun di bagian atas
                titleModal.innerHTML = `<i class="bi bi-wallet2 me-2"></i>Tagihan Pembayaran ${providerName}`;
                txtStatusHubung.innerText = dataProvider.status_hubung;

                // 2. Suntik Pilihan ke Dropdown Jenis Tagihan
                let opsiHtml = '<option value="" disabled selected>Pilih jenis tagihan...</option>';
                dataProvider.tagihan.forEach(t => {
                    opsiHtml += `<option value="${t.id}">${t.jenis}</option>`;
                });
                selectJenisTagihan.innerHTML = opsiHtml;

                // 3. Event ketika Jenis Tagihan Dipilih (Nominal Otomatis Terisi)
                selectJenisTagihan.addEventListener('change', function() {
                    const idTerpilih = this.value;
                    const tagihanTerpilih = dataProvider.tagihan.find(t => t.id === idTerpilih);

                    if (tagihanTerpilih) {
                        // Pasang Nominal Otomatis
                        inputNominalView.value = tagihanTerpilih.nominal.toLocaleString('id-ID');
                        inputNominalRaw.value = tagihanTerpilih.nominal;

                        // Buka Akses Form Metode Pembayaran
                        selectMetode.removeAttribute('disabled');
                        btnSubmit.removeAttribute('disabled');

                        // Tampilkan Invoice Ringkas di Sebelah Kanan
                        containerInvoice.innerHTML = `
                            <div class="border rounded bg-white p-3 animate__animated animate__fadeIn" style="font-size: 0.85rem;">
                                <div class="mb-2 pb-2 border-bottom">
                                    <span class="badge bg-dark fw-mono mb-1">${tagihanTerpilih.kode_tagihan}</span>
                                    <div class="fw-bold text-dark fs-6">${tagihanTerpilih.jenis}</div>
                                </div>
                                <div class="text-secondary" style="font-size: 0.82rem;">
                                    <div class="d-flex justify-content-between mb-1"><span>Nama Pemilik Akun</span><span class="text-dark fw-medium">${dataProvider.nama_user}</span></div>
                                    <div class="d-flex justify-content-between mb-1"><span>Batas Jatuh Tempo</span><span class="text-danger fw-semibold">${tagihanTerpilih.jatuh_tempo}</span></div>
                                    <hr class="my-2">
                                    <div class="d-flex justify-content-between pt-1"><span class="fw-bold text-dark">Total Pembayaran</span><span class="fw-bold text-primary fs-5">Rp ${tagihanTerpilih.nominal.toLocaleString('id-ID')}</span></div>
                                </div>
                            </div>`;
                        containerInvoice.classList.remove('d-none');
                    }
                });

                selectMetode.addEventListener('change', function() {
                    const metode = this.value;
                    let htmlContent = '';

                    if (metode === 'Virtual Account') {
                        const randomVA = '88012' + Math.floor(10000000 + Math.random() * 90000000);
                        htmlContent = `
                            <div class="p-3 bg-light rounded border border-info border-opacity-25">
                                <small class="text-muted d-block mb-1 fw-medium">Nomor Virtual Account</small>
                                <div class="d-flex align-items-center justify-content-between mb-1">
                                    <span class="fs-5 fw-bold text-info tracking-wide d-block">${randomVA}</span>
                                    <!-- Tombol Salin Cepat ala Aplikasi Real -->
                                    <button type="button" class="btn btn-sm btn-outline-info py-0 px-2 rounded-2" onclick="navigator.clipboard.writeText('${randomVA}'); alert('Nomor VA berhasil disalin!');">
                                        <small>Salin</small>
                                    </button>
                                </div>
                                <small class="text-xs text-muted d-block mb-3"><i class="bi bi-info-circle me-1"></i>Salin nomor di atas untuk transfer bank.</small>

                                <!-- Bagian Panduan Pembayaran Real -->
                                <div class="border-top pt-2 mt-2 text-start">
                                    <span class="text-dark small fw-semibold d-block mb-2">Petunjuk Pembayaran:</span>
                                    
                                    <div class="accordion accordion-flush" id="petunjukVA">
                                        <!-- Pilihan 1: Mobile Banking -->
                                        <div class="accordion-item bg-transparent border-bottom-0">
                                            <h2 class="accordion-header">
                                                <button class="accordion-button collapsed p-2 small text-secondary bg-transparent shadow-none" type="button" data-bs-toggle="collapse" data-bs-target="#stepMbanking">
                                                    <small><i class="bi bi-phone me-2 text-info"></i>Via Mobile Banking (m-Banking)</small>
                                                </button>
                                            </h2>
                                            <div id="stepMbanking" class="accordion-collapse collapse" data-bs-parent="#petunjukVA">
                                                <div class="accordion-body p-2 pt-0 text-muted" style="font-size: 0.8rem;">
                                                    1. Buka aplikasi m-Banking Anda.<br>
                                                    2. Pilih menu <strong>Transfer</strong> > <strong>Virtual Account</strong>.<br>
                                                    3. Masukkan atau tempel nomor VA di atas.<br>
                                                    4. Periksa data tagihan, masukkan PIN Anda, lalu konfirmasi.
                                                </div>
                                            </div>
                                        </div>

                                        <!-- Pilihan 2: ATM -->
                                        <div class="accordion-item bg-transparent border-bottom-0">
                                            <h2 class="accordion-header">
                                                <button class="accordion-button collapsed p-2 small text-secondary bg-transparent shadow-none" type="button" data-bs-toggle="collapse" data-bs-target="#stepATM">
                                                    <small><i class="bi bi-credit-card me-2 text-info"></i>Via ATM</small>
                                                </button>
                                            </h2>
                                            <div id="stepATM" class="accordion-collapse collapse" data-bs-parent="#petunjukVA">
                                                <div class="accordion-body p-2 pt-0 text-muted" style="font-size: 0.8rem;">
                                                    1. Masukkan kartu ATM dan PIN Anda.<br>
                                                    2. Pilih menu <strong>Bayar/Beli</strong> atau <strong>Transfer ke Bank Lain</strong>.<br>
                                                    3. Pilih opsi <strong>Virtual Account</strong>.<br>
                                                    4. Masukkan nomor VA, pastikan nominal sesuai, lalu tekan **Ya**.
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>`;
                    } else if (metode === 'QRIS') {
                        htmlContent = `
                            <div class="text-center">
                                <small class="text-muted d-block mb-2 fw-medium">Pindai Kode QRIS</small>
                                <div class="d-inline-block mb-2">
                                    <i class="bi bi-qr-code text-dark" style="font-size: 4.5rem;"></i>
                                </div>
                                <small class="text-xs text-muted d-block">Mendukung GoPay, OVO, Dana, LinkAja, & M-Banking</small>
                            </div>`;
                    } else if (metode === 'Kasir') {
                        const randomKodeKasir = 'TRX-' + Math.floor(100000 + Math.random() * 900000);
                        htmlContent = `
                            <div class="p-3 bg-light rounded border border-warning border-opacity-25">
                                <small class="text-muted d-block mb-1 fw-medium">Lokasi Gerai Kasir</small>
                                <span class="fw-bold text-dark d-block mb-2">Alfamart / Indomaret Terdekat</span>
                                <small class="text-muted d-block mb-1 fw-medium">Kode Pembayaran</small>
                                <span class="fs-5 fw-bold text-warning tracking-wide d-block">${randomKodeKasir}</span>
                            </div>`;
                    }
                    wrapperInstruksi.innerHTML = htmlContent;
                });
            }
        }

        // ENGINE PENCARIAN NOMOR PESERTA BPJS OTOMATIS
        function initEngineBpjs() {
            const inputNopes = document.getElementById('bpjs-nopes');
            const selectMetode = document.getElementById('bpjs-metode');
            const containerInvoice = document.getElementById('bpjs-detail-invoice');
            const wrapperInstruksi = document.getElementById('bpjs-instruksi-wrapper');
            const btnSubmit = document.getElementById('bpjs-btn-submit');
            const inputNominalRaw = document.getElementById('bpjs-nominal-raw');

            if (inputNopes) {
                inputNopes.addEventListener('input', function() {
                    const nopesValue = this.value.trim();
                    const dbBpjs = JSON.parse(localStorage.getItem('data_bpjs')) || [];

                    // Cocokkan data nomor peserta
                    const dataPeserta = dbBpjs.find(b => b.no_peserta === nopesValue);

                    if (dataPeserta) {
                        inputNominalRaw.value = dataPeserta.nominal;
                        selectMetode.removeAttribute('disabled');
                        btnSubmit.removeAttribute('disabled');

                        // Render Invoice Profesional di Sebelah Kanan
                        containerInvoice.innerHTML = `
                            <div class="border rounded bg-white p-3 animate__animated animate__fadeIn" style="font-size: 0.85rem;">
                                <div class="mb-2 pb-2 border-bottom">
                                    <span class="badge bg-primary bg-opacity-10 text-primary fw-mono mb-1">${dataPeserta.kode_tagihan}</span>
                                    <div class="fw-bold text-dark fs-6">BPJS Kesehatan Keluarga</div>
                                </div>
                                <div class="text-secondary" style="font-size: 0.82rem;">
                                    <div class="d-flex justify-content-between mb-1"><span>Nama Kepala KK</span><span class="text-dark fw-semibold">${dataPeserta.nama_kepala}</span></div>
                                    <div class="d-flex justify-content-between mb-1"><span>Fasilitas Kelas</span><span class="text-dark fw-medium">${dataPeserta.kelas}</span></div>
                                    <div class="d-flex justify-content-between mb-1"><span>Jumlah Anggota</span><span class="text-dark fw-medium">${dataPeserta.jumlah_peserta} Jiwa</span></div>
                                    <div class="d-flex justify-content-between mb-1"><span>Periode Tagihan</span><span class="text-dark fw-medium">${dataPeserta.periode}</span></div>
                                    <hr class="my-2">
                                    <div class="d-flex justify-content-between pt-1"><span class="fw-bold text-dark">Total Premi JKN</span><span class="fw-bold text-primary fs-5">Rp ${dataPeserta.nominal.toLocaleString('id-ID')}</span></div>
                                </div>
                            </div>`;
                        containerInvoice.classList.remove('d-none');
                    } else {
                        // Jika nomor salah/tidak ditemukan
                        containerInvoice.innerHTML = `<div class="alert alert-warning py-2 text-xs mb-0"><i class="bi bi-exclamation-triangle-fill me-1"></i> Nomor peserta BPJS tidak terdaftar.</div>`;
                        containerInvoice.classList.remove('d-none');
                        selectMetode.setAttribute('disabled', 'true');
                        btnSubmit.setAttribute('disabled', 'true');
                        wrapperInstruksi.innerHTML = `<p class="text-muted small m-0">Silakan isi nomor peserta di sebelah kiri untuk memeriksa total tunggakan premi.</p>`;
                    }
                });

                selectMetode.addEventListener('change', function() {
                    const metode = this.value;
                    let htmlContent = '';

                    if (metode === 'Virtual Account') {
                        const randomVA = '88012' + Math.floor(10000000 + Math.random() * 90000000);
                        htmlContent = `
                            <div class="p-3 bg-light rounded border border-info border-opacity-25">
                                <small class="text-muted d-block mb-1 fw-medium">Nomor Virtual Account</small>
                                <div class="d-flex align-items-center justify-content-between mb-1">
                                    <span class="fs-5 fw-bold text-info tracking-wide d-block">${randomVA}</span>
                                    <!-- Tombol Salin Cepat ala Aplikasi Real -->
                                    <button type="button" class="btn btn-sm btn-outline-info py-0 px-2 rounded-2" onclick="navigator.clipboard.writeText('${randomVA}'); alert('Nomor VA berhasil disalin!');">
                                        <small>Salin</small>
                                    </button>
                                </div>
                                <small class="text-xs text-muted d-block mb-3"><i class="bi bi-info-circle me-1"></i>Salin nomor di atas untuk transfer bank.</small>

                                <!-- Bagian Panduan Pembayaran Real -->
                                <div class="border-top pt-2 mt-2 text-start">
                                    <span class="text-dark small fw-semibold d-block mb-2">Petunjuk Pembayaran:</span>
                                    
                                    <div class="accordion accordion-flush" id="petunjukVA">
                                        <!-- Pilihan 1: Mobile Banking -->
                                        <div class="accordion-item bg-transparent border-bottom-0">
                                            <h2 class="accordion-header">
                                                <button class="accordion-button collapsed p-2 small text-secondary bg-transparent shadow-none" type="button" data-bs-toggle="collapse" data-bs-target="#stepMbanking">
                                                    <small><i class="bi bi-phone me-2 text-info"></i>Via Mobile Banking (m-Banking)</small>
                                                </button>
                                            </h2>
                                            <div id="stepMbanking" class="accordion-collapse collapse" data-bs-parent="#petunjukVA">
                                                <div class="accordion-body p-2 pt-0 text-muted" style="font-size: 0.8rem;">
                                                    1. Buka aplikasi m-Banking Anda.<br>
                                                    2. Pilih menu <strong>Transfer</strong> > <strong>Virtual Account</strong>.<br>
                                                    3. Masukkan atau tempel nomor VA di atas.<br>
                                                    4. Periksa data tagihan, masukkan PIN Anda, lalu konfirmasi.
                                                </div>
                                            </div>
                                        </div>

                                        <!-- Pilihan 2: ATM -->
                                        <div class="accordion-item bg-transparent border-bottom-0">
                                            <h2 class="accordion-header">
                                                <button class="accordion-button collapsed p-2 small text-secondary bg-transparent shadow-none" type="button" data-bs-toggle="collapse" data-bs-target="#stepATM">
                                                    <small><i class="bi bi-credit-card me-2 text-info"></i>Via ATM</small>
                                                </button>
                                            </h2>
                                            <div id="stepATM" class="accordion-collapse collapse" data-bs-parent="#petunjukVA">
                                                <div class="accordion-body p-2 pt-0 text-muted" style="font-size: 0.8rem;">
                                                    1. Masukkan kartu ATM dan PIN Anda.<br>
                                                    2. Pilih menu <strong>Bayar/Beli</strong> atau <strong>Transfer ke Bank Lain</strong>.<br>
                                                    3. Pilih opsi <strong>Virtual Account</strong>.<br>
                                                    4. Masukkan nomor VA, pastikan nominal sesuai, lalu tekan **Ya**.
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>`;
                    } else if (metode === 'QRIS') {
                        htmlContent = `
                            <div class="text-center">
                                <small class="text-muted d-block mb-2 fw-medium">Pindai Kode QRIS</small>
                                <div class="d-inline-block mb-2">
                                    <i class="bi bi-qr-code text-dark" style="font-size: 4.5rem;"></i>
                                </div>
                                <small class="text-xs text-muted d-block">Mendukung GoPay, OVO, Dana, LinkAja, & M-Banking</small>
                            </div>`;
                    } else if (metode === 'Kasir') {
                        const randomKodeKasir = 'TRX-' + Math.floor(100000 + Math.random() * 900000);
                        htmlContent = `
                            <div class="p-3 bg-light rounded border border-warning border-opacity-25">
                                <small class="text-muted d-block mb-1 fw-medium">Lokasi Gerai Kasir</small>
                                <span class="fw-bold text-dark d-block mb-2">Alfamart / Indomaret Terdekat</span>
                                <small class="text-muted d-block mb-1 fw-medium">Kode Pembayaran</small>
                                <span class="fs-5 fw-bold text-warning tracking-wide d-block">${randomKodeKasir}</span>
                            </div>`;
                    }
                    wrapperInstruksi.innerHTML = htmlContent;
                });
            }
        }

        // LISTENER SUBMIT FORM DENGAN LOADING & NOTIFIKASI MODERN SEPERTI PDAM
        function initFormBpjsListener(modalInstance) {
            const formBpjs = document.getElementById('form-bpjs');
            if (formBpjs) {
                formBpjs.addEventListener('submit', (e) => {
                    e.preventDefault();
                    
                    const nopes = document.getElementById('bpjs-nopes').value;
                    const nominal = parseInt(document.getElementById('bpjs-nominal-raw').value) || 0;
                    const metode = document.getElementById('bpjs-metode').value;

                    // 1. Tampilan Efek Loading Berputar Minimalis
                    Swal.fire({
                        title: 'Memproses Pembayaran',
                        html: '<span class="text-secondary" style="font-size: 0.85rem;">Sinkronisasi data iuran JKN-BPJS sedang divalidasi oleh sistem finansial...</span>',
                        allowOutsideClick: false,
                        showConfirmButton: false,
                        padding: '2rem',
                        customClass: { popup: 'rounded-4 shadow border-0', title: 'fw-bold fs-5 text-dark mb-2' },
                        didOpen: () => { Swal.showLoading(); }
                    });

                    setTimeout(() => {
                        modalInstance.hide();
                        cleanModalBackdrop();

                        // Catat Transaksi Ke Mutasi Rekening Lokal
                        if (typeof addTransaction === "function") {
                            addTransaction({
                                date: new Date().toLocaleString('id-ID'),
                                id: 'BJS' + Date.now().toString().slice(-5),
                                service: 'BPJS Kesehatan',
                                target: nopes,
                                amount: nominal,
                                type: 'debit',
                                status: 'Sukses'
                            });
                        }

                        // 2. Tampilan Alert Sukses Berukuran Kecil & Modern
                        Swal.fire({
                            icon: 'success',
                            title: 'Pembayaran Berhasil',
                            html: `<div class="text-secondary mb-1" style="font-size: 0.85rem;">Iuran jaminan kesehatan <b>BPJS KIS</b> sebesar <b>Rp ${nominal.toLocaleString('id-ID')}</b> sukses didebet via <b>${metode}</b>.</div>`,
                            confirmButtonColor: '#0ea5e9',
                            confirmButtonText: 'Selesai',
                            padding: '2rem',
                            customClass: {
                                popup: 'rounded-4 shadow border-0',
                                title: 'fw-bold fs-5 text-dark mt-2',
                                confirmButton: 'btn btn-info text-white rounded-3 px-4 py-2 fw-semibold text-sm'
                            }
                        }).then((result) => {
                            if (result.isConfirmed && typeof loadPage === "function") loadPage('bayar-tagihan');
                        });

                    }, 2000);
                });
            }
        }

        // LISTENER SUBMIT FORM DENGAN LOADING & NOTIFIKASI MODERN
        function initFormPaylaterListener(modalInstance, providerName) {
            const formPaylater = document.getElementById('form-paylater');
            if (formPaylater) {
                formPaylater.addEventListener('submit', (e) => {
                    e.preventDefault();
                    
                    const jenis = document.getElementById('paylater-jenis-tagihan');
                    const teksJenis = jenis.options[jenis.selectedIndex].text;
                    const nominal = parseInt(document.getElementById('paylater-nominal-raw').value) || 0;
                    const metode = document.getElementById('paylater-metode').value;

                    // 1. Efek Loading Berputar 2 Detik
                    Swal.fire({
                        title: 'Memverifikasi Limit',
                        html: `<span class="text-secondary" style="font-size: 0.85rem;">Sinkronisasi data tagihan ${providerName} sedang divalidasi...</span>`,
                        allowOutsideClick: false,
                        showConfirmButton: false,
                        padding: '2rem',
                        customClass: { popup: 'rounded-4 shadow border-0', title: 'fw-bold fs-5 text-dark mb-2' },
                        didOpen: () => { Swal.showLoading(); }
                    });

                    setTimeout(() => {
                        modalInstance.hide();
                        cleanModalBackdrop();

                        // Catat Transaksi
                        if (typeof addTransaction === "function") {
                            addTransaction({
                                date: new Date().toLocaleString('id-ID'),
                                id: 'PAY' + Date.now().toString().slice(-5),
                                service: `${providerName} (${teksJenis})`,
                                target: '-',
                                amount: nominal,
                                type: 'debit',
                                status: 'Sukses'
                            });
                        }

                        // 2. Alert Notifikasi Sukses Modern
                        Swal.fire({
                            icon: 'success',
                            title: 'Pelunasan Berhasil',
                            html: `<div class="text-secondary mb-1" style="font-size: 0.85rem;">Tagihan akun <b>${providerName}</b> untuk opsi <b>${teksJenis}</b> sebesar <b>Rp ${nominal.toLocaleString('id-ID')}</b> dinyatakan lunas via <b>${metode}</b>.</div>`,
                            confirmButtonColor: '#0d6efd',
                            confirmButtonText: 'Selesai',
                            padding: '2rem',
                            customClass: {
                                popup: 'rounded-4 shadow border-0',
                                title: 'fw-bold fs-5 text-dark mt-2',
                                confirmButton: 'btn btn-primary text-white rounded-3 px-4 py-2 fw-semibold text-sm'
                            }
                        }).then((result) => {
                            if (result.isConfirmed && typeof loadPage === "function") loadPage('bayar-tagihan');
                        });

                    }, 2000);
                });
            }
        }

        // Kontrol Tampilan Instruksi Metode Pembayaran Dinamis
        function initMetodePembayaranListener(idMetodeSelect, idWrapper) {
            const selectMetode = document.getElementById(idMetodeSelect);
            const wrapper = document.getElementById(idWrapper);

            if (selectMetode && wrapper) {
                selectMetode.addEventListener('change', function() {
                    const metode = this.value;
                    let htmlContent = '';

                    if (metode === 'Virtual Account') {
                        const randomVA = '88012' + Math.floor(10000000 + Math.random() * 90000000);
                        htmlContent = `
                            <div class="p-3 bg-light rounded border border-info border-opacity-25">
                                <small class="text-muted d-block mb-1 fw-medium">Nomor Virtual Account</small>
                                <div class="d-flex align-items-center justify-content-between mb-1">
                                    <span class="fs-5 fw-bold text-info tracking-wide d-block">${randomVA}</span>
                                    <!-- Tombol Salin Cepat ala Aplikasi Real -->
                                    <button type="button" class="btn btn-sm btn-outline-info py-0 px-2 rounded-2" onclick="navigator.clipboard.writeText('${randomVA}'); alert('Nomor VA berhasil disalin!');">
                                        <small>Salin</small>
                                    </button>
                                </div>
                                <small class="text-xs text-muted d-block mb-3"><i class="bi bi-info-circle me-1"></i>Salin nomor di atas untuk transfer bank.</small>

                                <!-- Bagian Panduan Pembayaran Real -->
                                <div class="border-top pt-2 mt-2 text-start">
                                    <span class="text-dark small fw-semibold d-block mb-2">Petunjuk Pembayaran:</span>
                                    
                                    <div class="accordion accordion-flush" id="petunjukVA">
                                        <!-- Pilihan 1: Mobile Banking -->
                                        <div class="accordion-item bg-transparent border-bottom-0">
                                            <h2 class="accordion-header">
                                                <button class="accordion-button collapsed p-2 small text-secondary bg-transparent shadow-none" type="button" data-bs-toggle="collapse" data-bs-target="#stepMbanking">
                                                    <small><i class="bi bi-phone me-2 text-info"></i>Via Mobile Banking (m-Banking)</small>
                                                </button>
                                            </h2>
                                            <div id="stepMbanking" class="accordion-collapse collapse" data-bs-parent="#petunjukVA">
                                                <div class="accordion-body p-2 pt-0 text-muted" style="font-size: 0.8rem;">
                                                    1. Buka aplikasi m-Banking Anda.<br>
                                                    2. Pilih menu <strong>Transfer</strong> > <strong>Virtual Account</strong>.<br>
                                                    3. Masukkan atau tempel nomor VA di atas.<br>
                                                    4. Periksa data tagihan, masukkan PIN Anda, lalu konfirmasi.
                                                </div>
                                            </div>
                                        </div>

                                        <!-- Pilihan 2: ATM -->
                                        <div class="accordion-item bg-transparent border-bottom-0">
                                            <h2 class="accordion-header">
                                                <button class="accordion-button collapsed p-2 small text-secondary bg-transparent shadow-none" type="button" data-bs-toggle="collapse" data-bs-target="#stepATM">
                                                    <small><i class="bi bi-credit-card me-2 text-info"></i>Via ATM</small>
                                                </button>
                                            </h2>
                                            <div id="stepATM" class="accordion-collapse collapse" data-bs-parent="#petunjukVA">
                                                <div class="accordion-body p-2 pt-0 text-muted" style="font-size: 0.8rem;">
                                                    1. Masukkan kartu ATM dan PIN Anda.<br>
                                                    2. Pilih menu <strong>Bayar/Beli</strong> atau <strong>Transfer ke Bank Lain</strong>.<br>
                                                    3. Pilih opsi <strong>Virtual Account</strong>.<br>
                                                    4. Masukkan nomor VA, pastikan nominal sesuai, lalu tekan **Ya**.
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>`;
                    } else if (metode === 'QRIS') {
                        htmlContent = `
                            <div class="text-center">
                                <small class="text-muted d-block mb-2 fw-medium">Pindai Kode QRIS</small>
                                <div class="d-inline-block mb-2">
                                    <i class="bi bi-qr-code text-dark" style="font-size: 4.5rem;"></i>
                                </div>
                                <small class="text-xs text-muted d-block">Mendukung GoPay, OVO, Dana, LinkAja, & M-Banking</small>
                            </div>`;
                    } else if (metode === 'Kasir') {
                        const randomKodeKasir = 'TRX-' + Math.floor(100000 + Math.random() * 900000);
                        htmlContent = `
                            <div class="p-3 bg-light rounded border border-warning border-opacity-25">
                                <small class="text-muted d-block mb-1 fw-medium">Lokasi Gerai Kasir</small>
                                <span class="fw-bold text-dark d-block mb-2">Alfamart / Indomaret Terdekat</span>
                                <small class="text-muted d-block mb-1 fw-medium">Kode Pembayaran</small>
                                <span class="fs-5 fw-bold text-warning tracking-wide d-block">${randomKodeKasir}</span>
                            </div>`;
                    }
                    wrapper.innerHTML = htmlContent;
                });
            }
        }

        function cleanModalBackdrop() {
            setTimeout(() => {
                const backdrop = document.querySelector('.modal-backdrop');
                if (backdrop) backdrop.remove();
                document.body.classList.remove('modal-open');
                document.body.style.overflow = '';
                document.body.style.paddingRight = '';
            }, 150);
        }

        // Listener Submit Form PDAM (Modern & Font Lebih Kecil)
        function initFormPdamListener(modalInstance) {
            const formPdam = document.getElementById('form-pdam');
            if (formPdam) {
                formPdam.addEventListener('submit', (e) => {
                    e.preventDefault();
                    const wilayah = document.getElementById('pdam-wilayah').value;
                    const nopel = document.getElementById('pdam-nopel').value;
                    const nominal = parseInt(document.getElementById('pdam-nominal').value);
                    const metode = document.getElementById('pdam-metode').value;

                    // 1. Tampilan Loading Modern
                    Swal.fire({
                        title: 'Memproses Pembayaran',
                        html: '<span class="text-secondary" style="font-size: 0.85rem;">Mohon tunggu sebentar, transaksi sedang dicek oleh sistem...</span>',
                        allowOutsideClick: false,
                        showConfirmButton: false, // Menghilangkan tombol ok saat loading
                        padding: '2rem',
                        customClass: {
                            popup: 'rounded-4 shadow border-0',
                            title: 'fw-bold fs-5 text-dark mb-2' // fs-5 membuat judul lebih kecil & proporsional
                        },
                        didOpen: () => {
                            Swal.showLoading();
                        }
                    });

                    // Simulasi delay 2 detik
                    setTimeout(() => {
                        modalInstance.hide();
                        cleanModalBackdrop();

                        addTransaction({
                            date: new Date().toLocaleString('id-ID'),
                            id: 'PAM' + Date.now().toString().slice(-5),
                            service: `PDAM (${wilayah})`,
                            target: nopel,
                            amount: nominal,
                            type: 'debit',
                            status: 'Sukses'
                        });

                        // 2. Tampilan Sukses Modern
                        Swal.fire({
                            icon: 'success',
                            title: 'Pembayaran Berhasil',
                            html: `<div class="text-secondary mb-1" style="font-size: 0.85rem;">Tagihan air <b>${wilayah}</b> sebesar <b>Rp ${nominal.toLocaleString('id-ID')}</b> sukses diproses via <b>${metode}</b>.</div>`,
                            confirmButtonColor: '#0ea5e9',
                            confirmButtonText: 'Selesai',
                            padding: '2rem',
                            buttonsStyling: true,
                            customClass: {
                                popup: 'rounded-4 shadow border-0',
                                title: 'fw-bold fs-5 text-dark mt-2', // Ukuran judul diperkecil
                                confirmButton: 'btn btn-info text-white rounded-3 px-4 py-2 fw-semibold text-sm' // Tombol bergaya modern minimalis
                            }
                        }).then((result) => { 
                            if (result.isConfirmed) loadPage('bayar-tagihan'); 
                        });

                    }, 2000); 
                });
            }
        }

        // Listener Submit Form PLN (Modern & Font Lebih Kecil)
        function initFormPlnListener(modalInstance) {
            const formPln = document.getElementById('form-pln');
            if (formPln) {
                formPln.addEventListener('submit', (e) => {
                    e.preventDefault();
                    const jenis = document.getElementById('pln-jenis').value;
                    const nopel = document.getElementById('pln-nopel').value;
                    const nominal = parseInt(document.getElementById('pln-nominal').value);
                    const metode = document.getElementById('pln-metode').value;

                    // 1. Tampilan Loading Modern
                    Swal.fire({
                        title: 'Memproses Transaksi',
                        html: '<span class="text-secondary" style="font-size: 0.85rem;">Permintaan Anda sedang diproses oleh sistem keamanan...</span>',
                        allowOutsideClick: false,
                        showConfirmButton: false,
                        padding: '2rem',
                        customClass: {
                            popup: 'rounded-4 shadow border-0',
                            title: 'fw-bold fs-5 text-dark mb-2'
                        },
                        didOpen: () => {
                            Swal.showLoading(); 
                        }
                    });

                    // Simulasi delay 2 detik
                    setTimeout(() => {
                        modalInstance.hide();
                        cleanModalBackdrop();

                        addTransaction({
                            date: new Date().toLocaleString('id-ID'),
                            id: 'PLN' + Date.now().toString().slice(-5),
                            service: jenis,
                            target: nopel,
                            amount: nominal,
                            type: 'debit',
                            status: 'Sukses'
                        });

                        // 2. Tampilan Sukses Modern
                        Swal.fire({
                            icon: 'success',
                            title: 'Transaksi Berhasil',
                            html: `<div class="text-secondary mb-1" style="font-size: 0.85rem;">Pembayaran <b>${jenis}</b> sebesar <b>Rp ${nominal.toLocaleString('id-ID')}</b> via <b>${metode}</b> sukses diproses.</div>`,
                            confirmButtonColor: '#0ea5e9',
                            confirmButtonText: 'Selesai',
                            padding: '2rem',
                            customClass: {
                                popup: 'rounded-4 shadow border-0',
                                title: 'fw-bold fs-5 text-dark mt-2',
                                confirmButton: 'btn btn-warning text-dark rounded-3 px-4 py-2 fw-bold text-sm'
                            }
                        }).then((result) => { 
                            if (result.isConfirmed) loadPage('bayar-tagihan'); 
                        });

                    }, 2000);
                });
            }
        }

        // Listener Submit Form Wi-Fi (Modern & Efek Loading 2 Detik)
        function initFormWifiListener(modalInstance) {
            const formWifi = document.getElementById('form-wifi');
            if (formWifi) {
                formWifi.addEventListener('submit', (e) => {
                    e.preventDefault();
                    const provider = document.getElementById('wifi-provider').value;
                    const nopel = document.getElementById('wifi-nopel').value;
                    const nominal = parseInt(document.getElementById('wifi-nominal').value);
                    const metode = document.getElementById('wifi-metode').value;

                    // Tampilan Loading Minimalis Modern
                    Swal.fire({
                        title: 'Memproses Pembayaran',
                        html: '<span class="text-secondary" style="font-size: 0.85rem;">Mohon tunggu sebentar, enkripsi transaksi wifi sedang diproses...</span>',
                        allowOutsideClick: false,
                        showConfirmButton: false,
                        padding: '2rem',
                        customClass: {
                            popup: 'rounded-4 shadow border-0',
                            title: 'fw-bold fs-5 text-dark mb-2'
                        },
                        didOpen: () => {
                            Swal.showLoading();
                        }
                    });

                    // Penundaan Transaksi 2 Detik
                    setTimeout(() => {
                        modalInstance.hide();
                        cleanModalBackdrop();

                        addTransaction({
                            date: new Date().toLocaleString('id-ID'),
                            id: 'NET' + Date.now().toString().slice(-5),
                            service: provider,
                            target: nopel,
                            amount: nominal,
                            type: 'debit',
                            status: 'Sukses'
                        });

                        // Tampilan Sukses Minimalis Modern
                        Swal.fire({
                            icon: 'success',
                            title: 'Pembayaran Berhasil',
                            html: `<div class="text-secondary mb-1" style="font-size: 0.85rem;">Tagihan internet <b>${provider}</b> sebesar <b>Rp ${nominal.toLocaleString('id-ID')}</b> sukses diproses via <b>${metode}</b>.</div>`,
                            confirmButtonColor: '#0ea5e9',
                            confirmButtonText: 'Selesai',
                            padding: '2rem',
                            customClass: {
                                popup: 'rounded-4 shadow border-0',
                                title: 'fw-bold fs-5 text-dark mt-2',
                                confirmButton: 'btn btn-primary text-white rounded-3 px-4 py-2 fw-semibold text-sm'
                            }
                        }).then((result) => { 
                            if (result.isConfirmed) loadPage('bayar-tagihan'); 
                        });

                    }, 2000); 
                });
            }
        }

        // Listener Submit Form Pendidikan (Efek Loading 2 Detik & Alert Sukses Modern)
        function initFormEduListener(modalInstance) {
            const formEdu = document.getElementById('form-pendidikan');
            if (formEdu) {
                formEdu.addEventListener('submit', (e) => {
                    e.preventDefault();
                    
                    const institusi = document.getElementById('edu-institusi').value;
                    const nim = document.getElementById('edu-nim').value;
                    const itemBayar = document.getElementById('edu-item-bayar');
                    const teksItemBayar = itemBayar.options[itemBayar.selectedIndex].text;
                    const nominal = parseInt(document.getElementById('edu-nominal-fix').value) || 0;
                    const metode = document.getElementById('edu-metode').value;

                    // 1. TAMPILAN LOADING BERPUTAR (SPINNER)
                    Swal.fire({
                        title: 'Memproses Pembayaran',
                        html: '<span class="text-secondary" style="font-size: 0.85rem;">Menghubungkan ke gateway akademis institusi, mohon tunggu...</span>',
                        allowOutsideClick: false,
                        showConfirmButton: false, // Menyembunyikan tombol OK agar fokus loading
                        padding: '2rem',
                        customClass: {
                            popup: 'rounded-4 shadow border-0',
                            title: 'fw-bold fs-5 text-dark mb-2'
                        },
                        didOpen: () => {
                            Swal.showLoading(); // Memanggil spinner internal SweetAlert2
                        }
                    });

                    // 2. EFEK DELAY SIMULASI TRANSKASI 2 DETIK (2000 ms)
                    setTimeout(() => {
                        // Sembunyikan modal Bootstrap & bersihkan backdrop gelap di belakangnya
                        modalInstance.hide();
                        cleanModalBackdrop();

                        // Catat transaksi ke sistem mutasi lokal dashboard
                        if (typeof addTransaction === "function") {
                            addTransaction({
                                date: new Date().toLocaleString('id-ID'),
                                id: 'EDU' + Date.now().toString().slice(-5),
                                service: `${institusi} - ${teksItemBayar.split(' - ')[0]}`,
                                target: nim,
                                amount: nominal,
                                type: 'debit',
                                status: 'Sukses'
                            });
                        }

                        // 3. TAMPILAN ALERT NOTIFIKASI SUKSES (HIJAU MINIMALIS)
                        Swal.fire({
                            icon: 'success',
                            title: 'Pembayaran Berhasil',
                            html: `<div class="text-secondary mb-1" style="font-size: 0.85rem;">Dana pendidikan untuk mahasiswa <b>NIM ${nim}</b> sebesar <b>Rp ${nominal.toLocaleString('id-ID')}</b> sukses disalurkan ke <b>${institusi}</b> melalui skema <b>${metode}</b>.</div>`,
                            confirmButtonColor: '#198754', // Hex warna hijau sukses standar Bootstrap
                            confirmButtonText: 'Selesai',
                            padding: '2rem',
                            customClass: {
                                popup: 'rounded-4 shadow border-0',
                                title: 'fw-bold fs-5 text-dark mt-2',
                                confirmButton: 'btn btn-success text-white rounded-3 px-4 py-2 fw-semibold text-sm'
                            }
                        }).then((result) => {
                            // Refresh komponen halaman data tagihan setelah user menekan tombol 'Selesai'
                            if (result.isConfirmed && typeof loadPage === "function") {
                                loadPage('bayar-tagihan');
                            }
                        });

                    }, 2000); 
                });
            }
        }

    //    listener multi finance
        function initEngineFinance() {
            const selectProvider = document.getElementById('fin-provider');
            const inputKontrak = document.getElementById('fin-kontrak');
            const selectMetode = document.getElementById('fin-metode');
            const containerInvoice = document.getElementById('fin-detail-invoice');
            const wrapperInstruksi = document.getElementById('fin-instruksi-wrapper');
            const btnSubmit = document.getElementById('fin-btn-submit');
            const inputNominalRaw = document.getElementById('fin-nominal-raw');

            // Aktifkan kolom input kontrak hanya jika provider leasing sudah dipilih
            selectProvider.addEventListener('change', function() {
                inputKontrak.removeAttribute('disabled');
                inputKontrak.value = '';
                jalankanPencarianFinance();
            });

            inputKontrak.addEventListener('input', jalankanPencarianFinance);

            function jalankanPencarianFinance() {
                const provValue = selectProvider.value;
                const kontrakValue = inputKontrak.value.trim();
                const dbFinance = JSON.parse(localStorage.getItem('data_finance')) || [];

                // Cari data yang cocok antara ID Kontrak DAN Perusahaan Leasingnya
                const dataCicilan = dbFinance.find(f => f.no_kontrak === kontrakValue && f.provider === provValue);

                if (dataCicilan) {
                    inputNominalRaw.value = dataCicilan.nominal;
                    selectMetode.removeAttribute('disabled');
                    btnSubmit.removeAttribute('disabled');

                    containerInvoice.innerHTML = `
                        <div class="border rounded bg-white p-3 animate__animated animate__fadeIn" style="font-size: 0.85rem;">
                            <div class="mb-2 pb-2 border-bottom">
                                <span class="badge bg-warning text-dark fw-mono mb-1">${dataCicilan.kode_tagihan}</span>
                                <div class="fw-bold text-dark fs-6">${dataCicilan.provider}</div>
                            </div>
                            <div class="text-secondary" style="font-size: 0.82rem;">
                                <div class="d-flex justify-content-between mb-1"><span>Nama Konsumen</span><span class="text-dark fw-semibold">${dataCicilan.nama_konsumen}</span></div>
                                <div class="d-flex justify-content-between mb-1"><span>Objek / Unit</span><span class="text-dark fw-medium">${dataCicilan.unit}</span></div>
                                <div class="d-flex justify-content-between mb-1"><span>Tenor Angsuran</span><span class="text-dark fw-medium">Bulan ke-${dataCicilan.angsuran_ke}</span></div>
                                <hr class="my-2">
                                <div class="d-flex justify-content-between pt-1"><span class="fw-bold text-dark">Tagihan Bulan Ini</span><span class="fw-bold text-warning fs-5 text-dark">Rp ${dataCicilan.nominal.toLocaleString('id-ID')}</span></div>
                            </div>
                        </div>`;
                    containerInvoice.classList.remove('d-none');
                } else {
                    if (kontrakValue.length > 0) {
                        containerInvoice.innerHTML = `<div class="alert alert-warning py-2 text-xs mb-0"><i class="bi bi-exclamation-triangle-fill me-1"></i> Data kontrak tidak ditemukan pada penyedia finance ini.</div>`;
                        containerInvoice.classList.remove('d-none');
                    } else {
                        containerInvoice.classList.add('d-none');
                    }
                    selectMetode.setAttribute('disabled', 'true');
                    btnSubmit.setAttribute('disabled', 'true');
                    wrapperInstruksi.innerHTML = `<p class="text-muted small m-0">Silakan pilih penyedia finance dan masukkan nomor kontrak angsuran Anda.</p>`;
                }
            }

            // Handler instruksi generator kode bayar unik di kanan bawah
                selectMetode.addEventListener('change', function() {
                    const metode = this.value;
                    let htmlContent = '';

                    if (metode === 'Virtual Account') {
                        const randomVA = '88012' + Math.floor(10000000 + Math.random() * 90000000);
                        htmlContent = `
                            <div class="p-3 bg-light rounded border border-info border-opacity-25">
                                <small class="text-muted d-block mb-1 fw-medium">Nomor Virtual Account</small>
                                <div class="d-flex align-items-center justify-content-between mb-1">
                                    <span class="fs-5 fw-bold text-info tracking-wide d-block">${randomVA}</span>
                                    <!-- Tombol Salin Cepat ala Aplikasi Real -->
                                    <button type="button" class="btn btn-sm btn-outline-info py-0 px-2 rounded-2" onclick="navigator.clipboard.writeText('${randomVA}'); alert('Nomor VA berhasil disalin!');">
                                        <small>Salin</small>
                                    </button>
                                </div>
                                <small class="text-xs text-muted d-block mb-3"><i class="bi bi-info-circle me-1"></i>Salin nomor di atas untuk transfer bank.</small>

                                <!-- Bagian Panduan Pembayaran Real -->
                                <div class="border-top pt-2 mt-2 text-start">
                                    <span class="text-dark small fw-semibold d-block mb-2">Petunjuk Pembayaran:</span>
                                    
                                    <div class="accordion accordion-flush" id="petunjukVA">
                                        <!-- Pilihan 1: Mobile Banking -->
                                        <div class="accordion-item bg-transparent border-bottom-0">
                                            <h2 class="accordion-header">
                                                <button class="accordion-button collapsed p-2 small text-secondary bg-transparent shadow-none" type="button" data-bs-toggle="collapse" data-bs-target="#stepMbanking">
                                                    <small><i class="bi bi-phone me-2 text-info"></i>Via Mobile Banking (m-Banking)</small>
                                                </button>
                                            </h2>
                                            <div id="stepMbanking" class="accordion-collapse collapse" data-bs-parent="#petunjukVA">
                                                <div class="accordion-body p-2 pt-0 text-muted" style="font-size: 0.8rem;">
                                                    1. Buka aplikasi m-Banking Anda.<br>
                                                    2. Pilih menu <strong>Transfer</strong> > <strong>Virtual Account</strong>.<br>
                                                    3. Masukkan atau tempel nomor VA di atas.<br>
                                                    4. Periksa data tagihan, masukkan PIN Anda, lalu konfirmasi.
                                                </div>
                                            </div>
                                        </div>

                                        <!-- Pilihan 2: ATM -->
                                        <div class="accordion-item bg-transparent border-bottom-0">
                                            <h2 class="accordion-header">
                                                <button class="accordion-button collapsed p-2 small text-secondary bg-transparent shadow-none" type="button" data-bs-toggle="collapse" data-bs-target="#stepATM">
                                                    <small><i class="bi bi-credit-card me-2 text-info"></i>Via ATM</small>
                                                </button>
                                            </h2>
                                            <div id="stepATM" class="accordion-collapse collapse" data-bs-parent="#petunjukVA">
                                                <div class="accordion-body p-2 pt-0 text-muted" style="font-size: 0.8rem;">
                                                    1. Masukkan kartu ATM dan PIN Anda.<br>
                                                    2. Pilih menu <strong>Bayar/Beli</strong> atau <strong>Transfer ke Bank Lain</strong>.<br>
                                                    3. Pilih opsi <strong>Virtual Account</strong>.<br>
                                                    4. Masukkan nomor VA, pastikan nominal sesuai, lalu tekan **Ya**.
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>`;
                    } else if (metode === 'QRIS') {
                        htmlContent = `
                            <div class="text-center">
                                <small class="text-muted d-block mb-2 fw-medium">Pindai Kode QRIS</small>
                                <div class="d-inline-block mb-2">
                                    <i class="bi bi-qr-code text-dark" style="font-size: 4.5rem;"></i>
                                </div>
                                <small class="text-xs text-muted d-block">Mendukung GoPay, OVO, Dana, LinkAja, & M-Banking</small>
                            </div>`;
                    } else if (metode === 'Kasir') {
                        const randomKodeKasir = 'TRX-' + Math.floor(100000 + Math.random() * 900000);
                        htmlContent = `
                            <div class="p-3 bg-light rounded border border-warning border-opacity-25">
                                <small class="text-muted d-block mb-1 fw-medium">Lokasi Gerai Kasir</small>
                                <span class="fw-bold text-dark d-block mb-2">Alfamart / Indomaret Terdekat</span>
                                <small class="text-muted d-block mb-1 fw-medium">Kode Pembayaran</small>
                                <span class="fs-5 fw-bold text-warning tracking-wide d-block">${randomKodeKasir}</span>
                            </div>`;
                    }
                    wrapperInstruksi.innerHTML = htmlContent;
                });
        }

        function initFormFinanceListener(modalInstance) {
            const formFin = document.getElementById('form-finance');
            if (formFin) {
                formFin.addEventListener('submit', (e) => {
                    e.preventDefault();
                    
                    const provider = document.getElementById('fin-provider').value;
                    const kontrak = document.getElementById('fin-kontrak').value;
                    const nominal = parseInt(document.getElementById('fin-nominal-raw').value) || 0;
                    const metode = document.getElementById('fin-metode').value;

                    // Loader SweetAlert 2 Detik
                    Swal.fire({
                        title: 'Mencocokkan Data Angsuran',
                        html: `<span class="text-secondary" style="font-size: 0.85rem;">Sedang mendaftarkan setoran kredit ke sistem internal ${provider}, harap tunggu...</span>`,
                        allowOutsideClick: false,
                        showConfirmButton: false,
                        padding: '2rem',
                        customClass: { popup: 'rounded-4 shadow border-0', title: 'fw-bold fs-5 text-dark mb-2' },
                        didOpen: () => { Swal.showLoading(); }
                    });

                    setTimeout(() => {
                        modalInstance.hide();
                        cleanModalBackdrop();

                        if (typeof addTransaction === "function") {
                            addTransaction({
                                date: new Date().toLocaleString('id-ID'),
                                id: 'FIN' + Date.now().toString().slice(-5),
                                service: provider,
                                target: kontrak,
                                amount: nominal,
                                type: 'debit',
                                status: 'Sukses'
                            });
                        }

                        // Alert Berhasil
                        Swal.fire({
                            icon: 'success',
                            title: 'Penyetoran Angsuran Sukses',
                            html: `<div class="text-secondary mb-1" style="font-size: 0.85rem;">Pembayaran cicilan berkala pada <b>${provider}</b> senilai <b>Rp ${nominal.toLocaleString('id-ID')}</b> via <b>${metode}</b> berhasil diproses.</div>`,
                            confirmButtonColor: '#ffc107',
                            confirmButtonText: '<span class="text-dark fw-bold">Selesai</span>',
                            padding: '2rem',
                            customClass: {
                                popup: 'rounded-4 shadow border-0',
                                title: 'fw-bold fs-5 text-dark mt-2',
                                confirmButton: 'btn btn-warning rounded-3 px-4 py-2'
                            }
                        }).then((result) => {
                            if (result.isConfirmed && typeof loadPage === "function") loadPage('bayar-tagihan');
                        });

                    }, 2000);
                });
            }
        }


    }












// ==========================================
// ==========================================
      // 3. HALAMAN TOP UP
// ==========================================

    if (pageName === 'top-up') {
        document.getElementById('form-topup').addEventListener('submit', (e) => {
            e.preventDefault();
            const jenis = document.getElementById('topup-jenis').value;
            const tujuan = document.getElementById('topup-tujuan').value;
            const selectedRadio = document.querySelector('input[name="topup-nom"]:checked');
            
            if(!selectedRadio) return alert('Pilih nominal!');
            const nominal = parseInt(selectedRadio.value);

            if (nominal > currentSaldo) return alert('Saldo tidak mencukupi!');

            updateSaldo(currentSaldo - nominal);
            addTransaction({
                date: new Date().toLocaleString('id-ID'),
                id: 'TRX' + Date.now().toString().slice(-6),
                service: `TopUp ${jenis}`,
                target: tujuan,
                amount: nominal,
                type: 'debit',
                status: 'Sukses'
            });
            alert(`Top up ${jenis} sukses!`);
            loadPage('top-up');
        });
    }











// ==========================================
// ==========================================
      // 4. HALAMAN PEMBELIAN PULSA DAN LISTRIK
// ==========================================

    if (pageName === 'pulsa-listrik') {
        document.getElementById('form-pulsalistrik').addEventListener('submit', (e) => {
            e.preventDefault();
            const jenis = document.getElementById('pl-jenis').value;
            const tujuan = document.getElementById('pl-tujuan').value;
            const nominal = parseInt(document.getElementById('pl-nominal').value);

            if (nominal > currentSaldo) return alert('Saldo tidak mencukupi!');

            updateSaldo(currentSaldo - nominal);
            addTransaction({
                date: new Date().toLocaleString('id-ID'),
                id: 'TRX' + Date.now().toString().slice(-6),
                service: jenis,
                target: tujuan,
                amount: nominal,
                type: 'debit',
                status: 'Sukses'
            });
            alert(`Pembelian ${jenis} berhasil diproses!`);
            loadPage('pulsa-listrik');
        });
    }


    








// ==========================================
// ==========================================
      // 5. HALAMAN RIWAYAT TRANSAKSI
// ==========================================

if (pageName === 'riwayat') {
    const tbody = document.getElementById('riwayat-table-body');
    const trxs = getTransactions(); // Mengambil data dari localStorage Anda

    tbody.innerHTML = trxs.map((t, index) => `
        <tr>
            <td class="ps-3 text-dark fw-medium">${t.date}</td>
            <td><code class="text-primary fw-bold" style="font-size: 0.8rem;">${t.id}</code></td>
            <td><span class="fw-semibold text-dark">${t.service}</span></td>
            <td><span class="font-monospace">${t.target}</span></td>
            <td class="${t.type === 'credit' ? 'text-success fw-bold' : 'text-danger fw-bold'}">
                ${t.type === 'credit' ? '+' : '-'}${formatRp(t.amount)}
            </td>
            <td><span class="badge-success-light text-xs"><i class="bi bi-check-circle-fill me-1"></i>${t.status}</span></td>
            <td class="text-end pe-3">
                <div class="d-flex gap-1 justify-content-end">
                    <button class="btn btn-sm btn-outline-primary py-1 px-2 rounded-2 text-xs" title="Cetak PDF" onclick="window.printReceipt('${t.id}')">
                        <i class="bi bi-file-earmark-pdf me-1"></i>Cetak
                    </button>
                    <button class="btn btn-sm btn-outline-danger py-1 px-2 rounded-2 text-xs" title="Hapus Data Ini" onclick="window.deleteSingleTransaction(${index})">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('') || `<tr><td colspan="7" class="text-center py-5 text-muted"><i class="bi bi-folder-x d-block mb-2 fs-2 opacity-50"></i><span class="text-xs">Belum ada riwayat transaksi.</span></td></tr>`;

    // Handler Bersihkan Semua Riwayat (Sudah berjalan aman)
    const btnClear = document.getElementById('btn-clear-history');
    if (btnClear) {
        const newBtnClear = btnClear.cloneNode(true);
        btnClear.parentNode.replaceChild(newBtnClear, btnClear);
        
        newBtnClear.addEventListener('click', () => {
            if (trxs.length === 0) return;

          Swal.fire({
                title: 'Kosongkan Semua Riwayat?',
                text: "Seluruh daftar riwayat mutasi transaksi Anda akan dihapus permanen!",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#dc3545',
                cancelButtonColor: '#6c757d',
                confirmButtonText: 'Ya, Bersihkan Semua!',
                cancelButtonText: 'Batal',
                customClass: { 
                    popup: 'rounded-4 border-0 shadow-sm',
                    title: 'fs-6 fw-bold text-dark mb-1',
                    htmlContainer: 'text-muted small px-3',
                    // Menambahkan me-2 (margin-end) pada tombol confirm agar memberikan jarak ke tombol cancel
                    confirmButton: 'btn btn-danger btn-sm rounded-3 px-3 text-xs me-2', 
                    cancelButton: 'btn btn-secondary btn-sm rounded-3 px-3 text-xs'
                },
                buttonsStyling: false
            }).then((result) => {
                if (result.isConfirmed) {
                    localStorage.setItem(STORAGE_KEY_TRX, JSON.stringify([]));
                    loadPage('riwayat');

                    Swal.fire({
                        icon: 'success',
                        title: 'Riwayat Kosong',
                        text: 'Seluruh riwayat berhasil dibersihkan dari sistem.',
                        showConfirmButton: true,      // Tampilkan tombol konfirmasi
                        confirmButtonText: 'Oke',     // Isi teks tombol
                        confirmButtonColor: '#0d6efd', // Warna biru Bootstrap
                        allowOutsideClick: false,     // Kunci agar tidak close saat klik di luar alert
                        customClass: { 
                            popup: 'rounded-4 border-0 shadow-sm',
                            title: 'fs-6 fw-bold text-dark mb-1',
                            htmlContainer: 'text-muted small',
                            confirmButton: 'px-4 py-2 rounded-3'
                        }
                    });
                }
            });
        });
    }
}

// =========================================================================
// REGISTER KE WINDOW SCOPE (Taruh ini tepat di bawah block if (pageName === 'riwayat') Anda)
// =========================================================================

// 1. Fungsi Hapus Satu Data (Didaftarkan ke window.deleteSingleTransaction)
window.deleteSingleTransaction = function(index) {
   Swal.fire({
    title: 'Hapus Riwayat Ini?',
    text: "Data transaksi tunggal ini akan dihapus secara permanen.",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#dc3545',
    cancelButtonColor: '#6c757d',
    confirmButtonText: 'Ya, Hapus!',
    cancelButtonText: 'Batal',
    // Menggunakan kelas Bootstrap untuk mengecilkan komponen di dalamnya
    customClass: { 
        popup: 'rounded-4 border-0 shadow-sm',
        title: 'fs-6 fw-bold text-dark mb-1', // Judul dikecilkan ke fs-6
        htmlContainer: 'text-muted small px-3', // Deskripsi dikecilkan ke ukuran small
        confirmButton: 'btn btn-danger btn-sm rounded-3 px-3 text-xs me-2', // Tombol kecil + jarak kanan
        cancelButton: 'btn btn-secondary btn-sm rounded-3 px-3 text-xs' // Tombol kecil
    },
    buttonsStyling: false // Menonaktifkan style bawaan SweetAlert agar kelas Bootstrap aktif
}).then((result) => {
    if (result.isConfirmed) {
        let trxs = getTransactions();
        trxs.splice(index, 1); 
        localStorage.setItem(STORAGE_KEY_TRX, JSON.stringify(trxs)); 
        
        loadPage('riwayat'); 

        // Alert Sukses setelah berhasil dihapus
        Swal.fire({
            icon: 'success',
            title: 'Berhasil Dihapus',
            text: 'Data riwayat transaksi berhasil di hapus.',
            showConfirmButton: true,      // Memunculkan tombol konfirmasi
            confirmButtonText: 'Oke',     // Mengatur teks tombol
            confirmButtonColor: '#0d6efd', // Warna tombol kustom (opsional, sesuaikan tema)
            allowOutsideClick: false,     // Mencegah close jika user klik di luar kotak alert
            customClass: { 
                popup: 'rounded-4 border-0 shadow-sm',
                title: 'fs-6 fw-bold text-dark mb-1', 
                htmlContainer: 'text-muted small',
                confirmButton: 'px-4 py-2 rounded-3' // Membuat tombol konfirmasi ikutan rapi
            }
        });
    }
});
};

// 2. Fungsi Preview PDF di Tab Baru (Tanpa Langsung Download)
window.printReceipt = function(trxId) {
    const trxs = getTransactions();
    const trx = trxs.find(t => t.id === trxId);
    if (!trx) return;

    // Loader sementara biar user tahu PDF sedang digenerate (Versi Tulisan Kecil)
    Swal.fire({
        title: 'Menyiapkan Dokumen',
        text: 'Sedang membuat pratinjau slip PDF...',
        allowOutsideClick: false,
        showConfirmButton: false,
        customClass: {
            popup: 'rounded-4 border-0 shadow-sm',
            title: 'fs-6 fw-bold text-dark mb-1', // Judul dikecilkan ke fs-6
            htmlContainer: 'text-muted small'     // Deskripsi dikecilkan ke ukuran small
        },
        didOpen: () => { 
            Swal.showLoading(); 
        }
    });

    const elementKwitansi = document.createElement('div');
    elementKwitansi.style.padding = '35px';
    elementKwitansi.style.fontFamily = 'Arial, sans-serif';
    elementKwitansi.style.color = '#333';
    
    elementKwitansi.innerHTML = `
        <div style="text-align: center; margin-bottom: 25px; border-bottom: 2px dashed #ddd; padding-bottom: 15px;">
            <h2 style="margin: 0; color: #0d6efd; font-size: 22px;">NOTA PEMBAYARAN DIGITAL</h2>
            <h4 style="margin: 0; color: #0d6efd; font-size: 22px;">Zeky Payment</h4>
            <p style="margin: 5px 0 0 0; font-size: 11px; color: #666;">Bukti transaksi berhasil diproses</p>
        </div>
        <table style="width: 100%; font-size: 13px; border-collapse: collapse;">
            <tr><td style="padding: 8px 0; color: #666;">ID Transaksi</td><td style="padding: 8px 0; text-align: right; font-weight: bold; font-family: monospace;">${trx.id}</td></tr>
            <tr><td style="padding: 8px 0; color: #666;">Waktu Transaksi</td><td style="padding: 8px 0; text-align: right;">${trx.date}</td></tr>
            <tr><td style="padding: 8px 0; color: #666;">Jenis Layanan</td><td style="padding: 8px 0; text-align: right; font-weight: bold;">${trx.service}</td></tr>
            <tr><td style="padding: 8px 0; color: #666;">Nomor Tujuan / ID</td><td style="padding: 8px 0; text-align: right; font-family: monospace; font-weight: bold;">${trx.target}</td></tr>
            <tr style="border-top: 1px solid #eee;"><td style="padding: 14px 0; font-weight: bold; font-size: 14px;">Total Nominal</td><td style="padding: 14px 0; text-align: right; font-size: 18px; font-weight: bold; color: #0ca678;">${formatRp(trx.amount)}</td></tr>
            <tr><td style="padding: 8px 0; color: #666;">Status</td><td style="padding: 8px 0; text-align: right; color: #0ca678; font-weight: bold;">${trx.status.toUpperCase()}</td></tr>
        </table>
        <div style="text-align: center; margin-top: 45px; border-top: 1px solid #eee; padding-top: 15px; font-size: 10px; color: #999;">
            <p style="margin: 0;">Resi ini dicetak otomatis dan merupakan dokumen bukti pembayaran elektronik yang sah.</p>
        </div>
    `;

    const opsiPdf = {
        margin:       10,
        filename:     `STRUK-${trx.id}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2 },
        jsPDF:        { unit: 'mm', format: 'a5', orientation: 'portrait' }
    };

   if (typeof html2pdf !== 'undefined') {
        // 1. Generate PDF terlebih dahulu menjadi format Blob
        html2pdf().set(opsiPdf).from(elementKwitansi).outputPdf('blob').then((blob) => {
            
            // 2. Gunakan setTimeout untuk menahan loading SweetAlert selama 2 detik (2000ms)
            setTimeout(() => {
                Swal.close(); // Tutup loader SweetAlert setelah 2 detik
                
                // Membuat URL sementara untuk file PDF
                const fileURL = URL.createObjectURL(blob);
                
                // Buka PDF di Tab Baru browser
                window.open(fileURL, '_blank');
            }, 2000); // 2000 milidetik = 2 detik

        }).catch((err) => {
            Swal.close();
            console.error(err);
            alert("Gagal memproses pratinjau PDF.");
        });
    } else {
        Swal.close();
        alert("Library html2pdf.js belum terpasang di file HTML utama Anda!");
    }
};






// ==========================================
// ==========================================
      // 6. HALAMAN PROFIL
// ==========================================

if (pageName === 'profil') {
    // --- 1. MEMBACA DATA (Ambil data lama + data baru) ---
    const currentName = localStorage.getItem(STORAGE_KEY_PROFILE);
    
    // Ambil data baru (jika belum ada, default-nya kosong '')
    const currentEmail = localStorage.getItem('payapps_profile_email') || '';
    const currentNoHp = localStorage.getItem('payapps_profile_nohp') || '';
    const currentTglLahir = localStorage.getItem('payapps_profile_tgllahir') || '';
    const currentAlamat = localStorage.getItem('payapps_profile_alamat') || '';

    // --- 2. MENAMPILKAN DATA KE UI ---
    document.getElementById('prof-nama').innerText = currentName;
    document.getElementById('prof-input-nama').value = currentName;
    document.getElementById('prof-input-saldo').value = currentSaldo;
    
    // Tampilkan data baru ke input masing-masing
    document.getElementById('prof-input-email').value = currentEmail;
    document.getElementById('prof-input-nohp').value = currentNoHp;
    document.getElementById('prof-input-tgllahir').value = currentTglLahir;
    document.getElementById('prof-input-alamat').value = currentAlamat;

    // --- 3. PROSES SIMPAN (SUBMIT FORM) ---
    document.getElementById('form-profil').addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Simpan data asli (Jangan diubah agar fetch data lain tidak error)
        localStorage.setItem(STORAGE_KEY_PROFILE, document.getElementById('prof-input-nama').value);
        updateSaldo(parseInt(document.getElementById('prof-input-saldo').value));
        
        // Simpan data tambahan baru secara terpisah
        localStorage.setItem('payapps_profile_email', document.getElementById('prof-input-email').value);
        localStorage.setItem('payapps_profile_nohp', document.getElementById('prof-input-nohp').value);
        localStorage.setItem('payapps_profile_tgllahir', document.getElementById('prof-input-tgllahir').value);
        localStorage.setItem('payapps_profile_alamat', document.getElementById('prof-input-alamat').value);

        // --- TAMPILAN SWEETALERT2 SESUAI REQUEST ---
        Swal.fire({
            icon: 'success',
            title: '<span style="font-size: 1.1rem; font-weight: 600;">Berhasil!</span>',
            html: '<span style="font-size: 0.9rem; color: #6c757d;">Profil berhasil diperbarui!</span>',
            confirmButtonText: 'Oke',
            confirmButtonColor: '#0d6efd',
            allowOutsideClick: false, // Tidak close otomatis jika klik di luar
            customClass: {
                popup: 'rounded-4 shadow-sm'
            }
        }).then((result) => {
            if (result.isConfirmed) {
                loadPage('profil'); // Pindah halaman setelah klik Oke
            }
        });
    });
}
}