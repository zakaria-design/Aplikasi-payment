// --- ASYNC ROUTER ENGINE (PENGGANTI INCLUDE PHP) ---
document.addEventListener("DOMContentLoaded", () => {
    updateGlobalUI();
    loadPage('dashboard'); // Halaman default awal

    // Ambil semua elemen navigasi sidebar
    document.querySelectorAll('#sidebar-menu .nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Ganti status kelas active penanda halaman
            document.querySelectorAll('#sidebar-menu .nav-link').forEach(l => l.classList.remove('active'));
            link.classList.add('active');

            const pageName = link.getAttribute('data-page');
            loadPage(pageName);
        });
    });
});