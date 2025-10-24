document.addEventListener('DOMContentLoaded', () => {

    // --- 1. PRELOADER ---
    const preloader = document.getElementById('preloader');
    if (preloader) {
        window.addEventListener('load', () => preloader.classList.add('hidden'));
        // Fallback timeout in case 'load' event is slow or fails
        setTimeout(() => preloader.classList.add('hidden'), 1500);
    }

    // --- 2. INISIALISASI AOS (ANIMASI SCROLL - LOOPING) ---
    AOS.init({ duration: 800, once: false, offset: 80 });

    // --- 3. INISIALISASI TYPED.JS (EFEK KETIK) ---
    const typedTarget = document.querySelector('.typed-text');
    if (typedTarget) {
        new Typed('.typed-text', {
            strings: ['Hiburan.', 'Kreativitas.', 'Produktivitas.'],
            typeSpeed: 70, backSpeed: 50, backDelay: 1500, loop: true
        });
    }

    // --- 4. NAVBAR SHRINK ON SCROLL ---
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) { navbar.classList.add('navbar-scrolled'); }
            else { navbar.classList.remove('navbar-scrolled'); }
        });
    }

    // --- 5. BACK TO TOP BUTTON ---
    const backToTopButton = document.getElementById('back-to-top');
    if (backToTopButton) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) { backToTopButton.classList.add('visible'); }
            else { backToTopButton.classList.remove('visible'); }
        });
        backToTopButton.addEventListener('click', (e) => {
             e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // --- 6. KODE FUNGSI PENCARIAN (SEARCH BAR) ---
    const searchBar = document.getElementById('search-bar');
    if (searchBar) {
        const productSections = document.querySelectorAll('.product-section');
        const kontakSection = document.getElementById('kontak'); // Assuming 'kontak' is the ID for the info section

        searchBar.addEventListener('keyup', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            const filterSection = (section, cardSelector, titleSelector) => {
                let matchFoundInSection = false;
                const cards = section.querySelectorAll(cardSelector);
                cards.forEach(card => {
                    const titleElement = card.querySelector(titleSelector);
                    if (titleElement) {
                        const title = titleElement.textContent.toLowerCase();
                        if (title.includes(searchTerm)) {
                            card.style.display = (cardSelector === '.product-card') ? "flex" : "";
                            matchFoundInSection = true;
                        } else { card.style.display = "none"; }
                    } else { card.style.display = "none"; }
                });
                // Show/hide the entire section based on matches within it
                if (matchFoundInSection || searchTerm === "") { section.style.display = ""; }
                else { section.style.display = "none"; }
            };
            // Apply filter to all relevant sections
            productSections.forEach(section => filterSection(section, '.product-card', 'h2'));
            if (kontakSection) { filterSection(kontakSection, '.info-card', '.info-card'); } // Info cards act as their own title
        });
    }

    // --- 7. KODE FUNGSI HAMBURGER MENU ---
    const hamburger = document.querySelector('.hamburger-menu');
    const navLinksContainer = document.querySelector('.nav-links');
    const searchContainerNav = document.querySelector('.search-container-nav');

    // Utility function to close all dropdowns and remove noscroll
    const closeAllDropdownsAndEnableScroll = () => {
        closeAllDropdowns(); // Closes main and category dropdowns
        document.body.classList.remove('noscroll'); // Ensure scroll is enabled
    };

    if (hamburger && navLinksContainer && searchContainerNav) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navLinksContainer.classList.toggle('active');
            searchContainerNav.classList.toggle('active');
            // If hamburger menu is closed, ensure all dropdowns are closed and scroll is enabled
            if (!navLinksContainer.classList.contains('active')) {
                 closeAllDropdownsAndEnableScroll();
            } else {
                 // If hamburger opened AND main dropdown was active, ensure noscroll is applied
                 if (dropdownWrapper && dropdownWrapper.classList.contains('active')) {
                     document.body.classList.add('noscroll');
                 }
            }
        });
    }

    // --- 8. KODE FUNGSI DROPDOWN KATALOG (Perbaikan Tutup Kategori & Noscroll) ---
    const catalogToggle = document.getElementById('catalog-toggle');
    const catalogMenu = document.getElementById('catalog-menu');
    const dropdownWrapper = catalogToggle ? catalogToggle.closest('.dropdown') : null;
    const categoryToggles = document.querySelectorAll('.category-toggle');

    const closeAllCategoryDropdowns = (exceptThisCategory = null) => {
        categoryToggles.forEach(toggle => {
            const category = toggle.closest('.dropdown-category');
            if (category !== exceptThisCategory) {
                category.classList.remove('active');
            }
        });
    };

     const closeMainDropdown = () => {
         if (dropdownWrapper && catalogMenu && dropdownWrapper.classList.contains('active')) { // Check if it's currently active before closing
             dropdownWrapper.classList.remove('active');
             document.body.classList.remove('noscroll'); // Remove noscroll when main dropdown closes
         }
     };

     const closeAllDropdowns = () => {
         closeMainDropdown();
         closeAllCategoryDropdowns();
         // No need to remove noscroll here again, closeMainDropdown handles it
     };


    if (catalogToggle && catalogMenu && dropdownWrapper) {
        catalogToggle.addEventListener('click', (e) => {
            // Prevent default scroll behavior for the catalog link itself
            if (e.target.tagName === 'A' || e.target === catalogToggle || e.target.closest('#catalog-toggle')) {
                 e.preventDefault();
            }

            const isActive = dropdownWrapper.classList.toggle('active');
            if (!isActive) { // If closing the main dropdown
                 closeAllCategoryDropdowns(); // Ensure subcategories are closed too
                 document.body.classList.remove('noscroll');
            } else { // If opening the main dropdown
                 document.body.classList.add('noscroll');
                 catalogMenu.scrollTop = 0; // Reset scroll position of the dropdown menu
            }
        });

        // Event listener for category toggles (accordion behavior)
        categoryToggles.forEach(toggle => {
            toggle.addEventListener('click', () => {
                const parentCategory = toggle.closest('.dropdown-category');
                const currentlyActive = parentCategory.classList.contains('active');

                // Always close other categories first
                closeAllCategoryDropdowns(parentCategory);

                // Then toggle the clicked category
                if (!currentlyActive) {
                    parentCategory.classList.add('active');
                } else {
                    parentCategory.classList.remove('active'); // Close if already open
                }
            });
        });


        // Event listener for product links inside the dropdown
        const productLinksInDropdown = catalogMenu.querySelectorAll('.category-links a');
        productLinksInDropdown.forEach(link => {
            link.addEventListener('click', () => {
                 closeAllDropdownsAndEnableScroll(); // Close dropdowns and enable body scroll
                 // Smooth scroll to the product will be handled by the listener below (#9)
            });
        });
    }

    // Close dropdown if clicked outside of it
    document.addEventListener('click', (e) => {
        // Check if the click is outside the dropdown wrapper AND not on the hamburger icon or inside it
        if (dropdownWrapper && !dropdownWrapper.contains(e.target) && hamburger && !hamburger.contains(e.target) && !e.target.closest('.hamburger-menu')) {
             closeAllDropdownsAndEnableScroll();
        }
    });


    // --- 9. KODE FUNGSI SMOOTH SCROLL (Untuk SEMUA Link #) ---
    const scrollLinks = document.querySelectorAll('a[href^="#"]');
    let navHeight = 0;
    if (navbar) { navHeight = navbar.offsetHeight; } // Initial height

    scrollLinks.forEach(link => {
        // Exclude the main catalog toggle button from this specific scroll listener
        // because its click is already handled to open/close the dropdown
        if (link.id !== 'catalog-toggle') {
            link.addEventListener('click', function(e) {
                const targetId = this.getAttribute('href');

                // Check if it's a valid internal hash link longer than just '#'
                if (targetId && targetId.startsWith('#') && targetId.length > 1) {
                    const targetElement = document.querySelector(targetId);
                    if (targetElement) {
                         e.preventDefault(); // Prevent default jump only if target exists
                         // Recalculate navbar height dynamically in case it shrunk
                         if (navbar) { navHeight = navbar.offsetHeight; }
                         const targetPosition = targetElement.offsetTop - navHeight - 15; // Offset for navbar
                         window.scrollTo({ top: targetPosition, behavior: 'smooth' });
                    }
                    // If targetElement is null (e.g., link to a non-existent ID), let the default browser behavior handle it (or do nothing)
                } else if (targetId === '#hero' || targetId === '#') { // Specific handling for link to top
                     e.preventDefault();
                     window.scrollTo({ top: 0, behavior: 'smooth' });
                }
                // If it's not a hash link starting with #, allow default behavior (e.g., external links)

                // Close hamburger menu on mobile after any link click (if it's open)
                if (navLinksContainer && hamburger && searchContainerNav && navLinksContainer.classList.contains('active')) {
                    hamburger.classList.remove('active');
                    navLinksContainer.classList.remove('active');
                    searchContainerNav.classList.remove('active');
                     closeAllDropdownsAndEnableScroll(); // Also close dropdown and enable scroll
                }
            });
        }
    });

}); // Akhir dari document.addEventListener('DOMContentLoaded')
