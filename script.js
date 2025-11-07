// ===================================================
// --- 0. KONFIGURASI ---
// ===================================================

// URL Google Sheet CSV Anda (Pastikan ini sudah benar)
const GOOGLE_SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTJM96AooAlxUb0Vq9PRuvZofejCc01FytrE4FjmysgvFUAhsqiyJePy6ZmxGoqdyTdZjHoandHExwo/pub?gid=0&single=true&output=csv';

// API Key Dihapus dari sini! (Sekarang aman di backend Netlify)

const preloader = document.getElementById('preloader');
let allProductsList = []; // Array untuk menyimpan data produk (objek)
let allProductsString = ""; // String untuk dikirim ke backend AI

// --- Mulai Eksekusi ---
document.addEventListener('DOMContentLoaded', () => {

    // --- 1. FUNGSI UTAMA: AMBIL & TAMPILKAN PRODUK ---
    
    /**
     * Mengubah teks CSV mentah menjadi array objek produk.
     */
    function parseCSV(csvText) {
        try {
            const rows = csvText.trim().split('\n');
            if (rows.length < 2) return []; 
            const headers = rows.shift().split(',').map(h => h.trim().replace(/^"|"$/g, ''));
            return rows.map(row => {
                const values = row.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(v => v.trim().replace(/^"|"$/g, ''));
                if (values.length === headers.length) {
                    const obj = {};
                    headers.forEach((header, index) => {
                        obj[header] = values[index];
                    });
                    return obj;
                }
                return null;
            }).filter(Boolean); // Hapus baris yang tidak valid
        } catch (error) { 
            console.error("Error parsing CSV:", error, csvText); 
            return []; 
        }
    }

    /**
     * Mengambil data dari Google Sheet dan merender kartu produk DAN link dropdown.
     */
    async function fetchAndDisplayProducts() {
        // Objek untuk menampung HTML
        const categoryGridHtml = { editing: '', streaming: '', edukasi: '', utilitas: '' };
        const categoryLinksHtml = { editing: '', streaming: '', edukasi: '', utilitas: '' };
        let productsLoaded = false;
        let productListTemp = []; // List string untuk AI

        try {
            const response = await fetch(GOOGLE_SHEET_CSV_URL);
            if (!response.ok) { throw new Error(`HTTP error! status: ${response.status}`); }
            const csvText = await response.text();
            const products = parseCSV(csvText);
            if (products.length === 0 && csvText.length > 0) { throw new Error("Data CSV tidak bisa di-parse. Cek format Sheet."); }
            
            allProductsList = products; // Simpan sebagai array objek

            products.forEach(product => {
                if (!product.id || !product.kategori || !categoryGridHtml.hasOwnProperty(product.kategori)) {
                    console.warn("Produk dilewati (data tidak lengkap/kategori salah):", product.nama);
                    return; 
                }
                
                // Siapkan data untuk AI
                productListTemp.push(`- ${product.nama} (Kategori: ${product.kategori}, Deskripsi: ${product.deskripsi})`);

                const waMessage = encodeURIComponent(`Halo FHARYSH STORE, saya mau order ${product.nama}`);
                const waLink = `https://wa.me/6285853409699?text=${waMessage}`;
                
                // 1. Buat HTML Card
                categoryGridHtml[product.kategori] += `
                    <div class="product-card" id="${product.id}" data-aos="fade-up">
                        <img src="${product.linkGambar}" alt="Logo ${product.nama}" loading="lazy">
                        <h2>${product.nama}</h2>
                        <p class="description">${product.deskripsi}</p>
                        <p class="price">${product.hargaRange}</p>
                        <a href="${waLink}" class="btn-order" target="_blank">Order via WA</a>
                    </div>`;
                
                // 2. Buat HTML Link Dropdown
                categoryLinksHtml[product.kategori] += `<a href="#${product.id}">${product.nama}</a>`;
            });
            
            allProductsString = productListTemp.join('\n'); // Simpan string produk di global

            // 3. Masukkan HTML ke Grid
            for (const categoryId in categoryGridHtml) {
                const gridElement = document.getElementById(`${categoryId}-grid`);
                if (gridElement) { gridElement.innerHTML = categoryGridHtml[categoryId] || "<p>Belum ada produk untuk kategori ini.</p>"; }
            }
            
            // 4. Masukkan HTML ke Dropdown
            for (const categoryId in categoryLinksHtml) {
                 const linksContainer = document.getElementById(`${categoryId}-links-container`);
                 if (linksContainer) { linksContainer.innerHTML = categoryLinksHtml[categoryId] || "<p style='padding-left:15px; font-size:0.85rem; color: #888;'>Kosong</p>"; }
            }
            productsLoaded = true;

        } catch (error) {
            console.error("Error mengambil produk dari Google Sheet: ", error);
            for (const categoryId in categoryGridHtml) {
                 const gridElement = document.getElementById(`${categoryId}-grid`);
                 if (gridElement) { gridElement.innerHTML = "<p>Gagal memuat produk. Coba refresh halaman.</p>"; }
            }
        } finally {
            if (preloader) { preloader.classList.add('hidden'); }
            if (productsLoaded) {
                setTimeout(() => { AOS.refresh(); }, 100);
                setupSmoothScroll(); // Panggil ulang setup scroll untuk link baru
            }
        }
    }
    // Panggil fungsi untuk memuat produk
    fetchAndDisplayProducts();


    // --- 2. INISIALISASI AOS, TYPED.JS, NAVBAR, BACK-TO-TOP ---
    AOS.init({ duration: 800, once: false, offset: 80 });
    const typedTarget = document.querySelector('.typed-text');
    if (typedTarget) { new Typed('.typed-text', { strings: ['Hiburan.', 'Kreativitas.', 'Produktivitas.'], typeSpeed: 70, backSpeed: 50, backDelay: 1500, loop: true }); }
    const navbar = document.querySelector('.navbar');
    if (navbar) { window.addEventListener('scroll', () => { if (window.scrollY > 50) { navbar.classList.add('navbar-scrolled'); } else { navbar.classList.remove('navbar-scrolled'); } }); }
    const backToTopButton = document.getElementById('back-to-top');
    if (backToTopButton) { window.addEventListener('scroll', () => { if (window.scrollY > 300) { backToTopButton.classList.add('visible'); } else { backToTopButton.classList.remove('visible'); } }); backToTopButton.addEventListener('click', (e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }); }

    // --- 3. FUNGSI ASISTEN AI GEMINI (Panggil Backend Netlify) ---
    const aiPromptInput = document.getElementById('ai-prompt-input');
    const aiGenerateBtn = document.getElementById('ai-generate-btn');
    const aiResponseContainer = document.getElementById('ai-response-container');
    const aiBtnText = aiGenerateBtn ? aiGenerateBtn.querySelector('.btn-text') : null;
    const aiBtnLoader = aiGenerateBtn ? aiGenerateBtn.querySelector('.loader-ai') : null;

    if (aiGenerateBtn && aiPromptInput && aiResponseContainer) {
        aiGenerateBtn.addEventListener('click', async () => {
            const userPrompt = aiPromptInput.value;
            if (!userPrompt.trim()) {
                aiResponseContainer.innerHTML = "<p>Harap masukkan kebutuhan Anda di kotak teks.</p>";
                aiResponseContainer.style.display = "block";
                return;
            }
            
            // Tampilkan loading
            aiBtnText.style.display = 'none';
            aiBtnLoader.style.display = 'block';
            aiGenerateBtn.disabled = true;
            aiResponseContainer.style.display = 'none';

            try {
                // Panggil "Juru Kunci" (backend) Anda
                const response = await fetch('/.netlify/functions/get-recommendation', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        prompt: userPrompt,
                        productList: allProductsString // Kirim daftar produk dari GSheet ke backend
                    }) 
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(errorData.error || `Error: ${response.statusText}`);
                }

                const result = await response.json();
                const formattedHtml = simpleMarkdownToHtml(result.recommendation);
                aiResponseContainer.innerHTML = formattedHtml;
                aiResponseContainer.style.display = 'block';
                
            } catch (error) {
                console.error("Error:", error);
                aiResponseContainer.innerHTML = `<p><strong>Maaf, terjadi kesalahan.</strong> ${error.message}</p>`;
                aiResponseContainer.style.display = 'block';
            } finally {
                // Sembunyikan loading
                aiBtnText.style.display = 'block';
                aiBtnLoader.style.display = 'none';
                aiGenerateBtn.disabled = false;
            }
        });
    }
    
    // Fungsi Konverter Markdown Sederhana
    function simpleMarkdownToHtml(text) {
        if (!text) return "";
        return text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') 
            .replace(/\*(.*?)\*/g, '<em>$1</em>')     
            .replace(/^- (.*?)($|\n)/gm, '<li>$1</li>') 
            .replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>') 
            .replace(/\n/g, '<br>'); 
    }

    // --- 4. KODE FUNGSI HAMBURGER, DROPDOWN, & SMOOTH SCROLL ---
    const hamburger = document.querySelector('.hamburger-menu');
    const navLinksContainer = document.querySelector('.nav-links');
    const closeAllDropdownsAndEnableScroll = () => { closeAllDropdowns(); document.body.classList.remove('noscroll'); };
    if (hamburger && navLinksContainer) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active'); navLinksContainer.classList.toggle('active');
            if (!navLinksContainer.classList.contains('active')) { closeAllDropdownsAndEnableScroll(); }
            else { if (dropdownWrapper && dropdownWrapper.classList.contains('active')) { document.body.classList.add('noscroll'); } }
        });
    }
    const catalogToggle = document.getElementById('catalog-toggle');
    const catalogMenu = document.getElementById('catalog-menu');
    const dropdownWrapper = catalogToggle ? catalogToggle.closest('.dropdown') : null;
    const categoryToggles = document.querySelectorAll('.category-toggle');
    const closeAllCategoryDropdowns = (exceptThisCategory = null) => { categoryToggles.forEach(toggle => { const category = toggle.closest('.dropdown-category'); if (category !== exceptThisCategory) { category.classList.remove('active'); } }); };
    const closeMainDropdown = () => { if (dropdownWrapper && catalogMenu && dropdownWrapper.classList.contains('active')) { dropdownWrapper.classList.remove('active'); document.body.classList.remove('noscroll'); } };
    const closeAllDropdowns = () => { closeMainDropdown(); closeAllCategoryDropdowns(); };
    if (catalogToggle && catalogMenu && dropdownWrapper) {
        catalogToggle.addEventListener('click', (e) => {
             if (e.target.tagName === 'A' || e.target === catalogToggle || e.target.closest('#catalog-toggle')) { e.preventDefault(); }
             const isActive = dropdownWrapper.classList.toggle('active');
             if (!isActive) { closeAllCategoryDropdowns(); document.body.classList.remove('noscroll'); } 
             else { document.body.classList.add('noscroll'); catalogMenu.scrollTop = 0; }
        });
        categoryToggles.forEach(toggle => { toggle.addEventListener('click', () => { const parentCategory = toggle.closest('.dropdown-category'); const currentlyActive = parentCategory.classList.contains('active'); closeAllCategoryDropdowns(parentCategory); if (!currentlyActive) { parentCategory.classList.add('active'); } else { parentCategory.classList.remove('active'); } }); });
    }
    document.addEventListener('click', (e) => { if (dropdownWrapper && !dropdownWrapper.contains(e.target) && hamburger && !hamburger.contains(e.target) && !e.target.closest('.hamburger-menu')) { closeAllDropdownsAndEnableScroll(); } });
    
    // Fungsi Smooth Scroll di-setup di sini
    function setupSmoothScroll() {
        const scrollLinks = document.querySelectorAll('a[href^="#"]'); 
        let navHeight = navbar ? navbar.offsetHeight : 0;
        scrollLinks.forEach(link => { if (link.id !== 'catalog-toggle') { link.removeEventListener('click', handleScrollLinkClick); link.addEventListener('click', handleScrollLinkClick); } });
    }
    // Fungsi Handler Smooth Scroll
    function handleScrollLinkClick(e) {
        const targetId = this.getAttribute('href');
        if (targetId && targetId.startsWith('#') && targetId.length > 1) {
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                 e.preventDefault(); let navHeight = navbar ? navbar.offsetHeight : 0;
                 const targetPosition = targetElement.offsetTop - navHeight - 15;
                 window.scrollTo({ top: targetPosition, behavior: 'smooth' });
            }
        } else if (targetId === '#hero' || targetId === '#') { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }
        if (navLinksContainer && hamburger && navLinksContainer.classList.contains('active')) {
            hamburger.classList.remove('active'); navLinksContainer.classList.remove('active');
            closeAllDropdownsAndEnableScroll();
        }
        if (this.closest('.dropdown-menu')) { closeAllDropdownsAndEnableScroll(); }
    }
    // Panggil sekali saat DOM load untuk link statis
    setupSmoothScroll(); 

}); // Akhir DOMContentLoaded
