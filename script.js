// Menampilkan pesan di konsol browser untuk memastikan file JS terhubung
console.log("Selamat Datang di Website FHARYSH STORE!");

// ===========================================
// FUNGSI UTAMA (dijalankan saat Halaman Siap)
// ===========================================
document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. KODE FUNGSI PENCARIAN (SEARCH BAR) ---
    const searchBar = document.getElementById('search-bar');
    if (searchBar) { // Cek apakah search bar ada
        const productSections = document.querySelectorAll('.product-section');
        const infoSection = document.getElementById('info-tambahan');

        searchBar.addEventListener('keyup', (e) => {
            const searchTerm = e.target.value.toLowerCase();

            // Loop untuk section produk
            productSections.forEach(section => {
                let matchFoundInSection = false;
                const products = section.querySelectorAll('.product-card');

                products.forEach(card => {
                    const title = card.querySelector('h2').textContent.toLowerCase();
                    if (title.includes(searchTerm)) {
                        card.style.display = "flex";
                        matchFoundInSection = true;
                    } else {
                        card.style.display = "none";
                    }
                });

                if (matchFoundInSection || searchTerm === "") {
                    section.style.display = ""; 
                } else {
                    section.style.display = "none";
                }
            });

            // Loop untuk section info
            if (infoSection) {
                let infoMatchFound = false;
                const infoCards = infoSection.querySelectorAll('.info-card');

                infoCards.forEach(card => {
                    const infoText = card.textContent.toLowerCase();
                    if (infoText.includes(searchTerm)) {
                        card.style.display = "";
                        infoMatchFound = true;
                    } else {
                        card.style.display = "none";
                    }
                });

                if (infoMatchFound || searchTerm === "") {
                    infoSection.style.display = "";
                } else {
                    infoSection.style.display = "none";
                }
            }
        });
    }

    // --- 2. KODE FUNGSI HAMBURGER MENU (BARU) ---
    const hamburger = document.querySelector('.hamburger-menu');
    const navLinksContainer = document.querySelector('.nav-links');

    if (hamburger && navLinksContainer) {
        hamburger.addEventListener('click', () => {
            // Togel kelas 'active' untuk animasi 'X'
            hamburger.classList.toggle('active'); 
            // Togel kelas 'active' untuk memunculkan/menyembunyikan menu
            navLinksContainer.classList.toggle('active');
        });
    }

    // --- 3. KODE FUNGSI SMOOTH SCROLL (DIPERBARUI) ---
    const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');
    const navBar = document.querySelector('.navbar');
    let navHeight = 0;
    if (navBar) {
        navHeight = navBar.offsetHeight; // Ambil tinggi nav bar
    }

    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                const targetPosition = targetElement.offsetTop - navHeight - 15; // 15px extra space

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });

                // (BARU) Otomatis tutup menu di HP setelah link diklik
                if (navLinksContainer.classList.contains('active')) {
                    hamburger.classList.remove('active');
                    navLinksContainer.classList.remove('active');
                }
            }
        });
    });

});