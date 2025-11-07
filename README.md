# FHARYSH STORE - Website Katalog Dinamis & AI

![FHARYSH STORE Logo](images/logo-fharysh-store.png)

Website katalog resmi untuk FHARYSH STORE. Menyediakan akses mudah dan terjangkau ke berbagai akun layanan digital premium favorit Anda. Sekarang didukung oleh database dinamis (Google Sheets) dan Asisten AI (Gemini).

**🔗 Website Live (Baru):** [https://fharyshstore.netlify.app/](https://fharyshstore.netlify.app/)

---

## ✨ Fitur Unggulan

* **🗃️ Database Dinamis (Google Sheets):**
    * Seluruh 50+ produk dikelola 100% dari Google Sheet (kemampuan **CRUD**).
    * Harga dan produk di website otomatis update saat GSheet diubah, tanpa perlu *commit* kode.
* **🤖 Asisten AI (Gemini):**
    * Fitur "Asisten AI" membantu pengunjung menemukan produk yang tepat berdasarkan kebutuhan mereka.
* **🔐 Backend Aman (Netlify Functions):**
    * **API Key Gemini 100% AMAN** di *backend* (serverless function), tidak terlihat di frontend.
* **📱 UI/UX Modern & Responsif:**
    * Desain responsif penuh untuk Desktop, Tablet, dan Mobile.
    * Navigasi Dropdown *on-click* & *nested* yang juga dimuat secara dinamis.
    * *Hero Section* dengan efek ketik (Typed.js).
    * Animasi *scroll* (AOS) yang *looping* pada elemen.
    * Dukungan *Dark Mode* otomatis 🌙.
* **⚡ Performa & Fitur Profesional:**
    * *Preloader* halaman dan tombol *Back-to-Top* (▲).
    * *Lazy Loading* gambar untuk mempercepat waktu muat.
    * *Cache Busting* (`?v=...`) untuk CSS/JS.

---

## 🛠️ Teknologi yang Digunakan

* **Frontend:** HTML5, CSS3 (Flexbox, Grid), JavaScript (ES6+)
* **Database (CRUD):** Google Sheets API
* **Backend (AI):** Netlify Functions (Serverless JavaScript)
* **Hosting:** Netlify (Deploy dari GitHub)
* **AI:** Google Gemini API
* **Libraries:** AOS (Animasi Scroll), Typed.js (Efek Ketik)

---

## 🚀 Cara Mengelola Produk (CRUD)

1.  Buka file Google Sheet `FHARYSH_STORE_DB`.
2.  **Create:** Tambahkan produk baru di baris baru.
3.  **Update:** Edit sel (misal: ganti harga di kolom `hargaRange`).
4.  **Delete:** Hapus baris produk.
5.  Perubahan akan otomatis tampil di website (mungkin perlu beberapa menit untuk *cache* GSheet).

---

## 📄 Lisensi

Proyek ini dilisensikan di bawah [MIT License](LICENSE).

---

_Dibuat oleh Muhammad Iqbal Alfarizi (FHARYSH STORE)_
