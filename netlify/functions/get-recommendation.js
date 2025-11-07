// File: netlify/functions/get-recommendation.js
// Ini adalah KODE BACKEND (Juru Kunci Anda)
// Kode ini berjalan di server Netlify, BUKAN di browser.

exports.handler = async function(event, context) {

    // 1. Ambil API key rahasia dari Netlify Environment
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${GEMINI_API_KEY}`;

    // 2. Ambil prompt pengguna yang dikirim dari frontend (script.js)
    let userPrompt, productListForAI;
    try {
        const body = JSON.parse(event.body);
        userPrompt = body.prompt;
        productListForAI = body.productList; // Ambil daftar produk dari frontend

        if (!userPrompt || !productListForAI) { 
            throw new Error("Prompt atau daftar produk tidak ada."); 
        }
    } catch (error) {
        return {
            statusCode: 400, // Bad Request
            body: JSON.stringify({ error: "Permintaan tidak valid: " + error.message })
        };
    }

    // 3. Siapkan System Prompt (Sekarang aman di backend)
    const systemPrompt = `Anda adalah "Asisten AI FHARYSH STORE". Ramah, sopan, dan membantu.
    Tugas Anda adalah membaca permintaan pengguna dan merekomendasikan produk TERBAIK dari daftar katalog di bawah.
    SELALU jelaskan *mengapa* Anda merekomendasikan produk itu.
    JANGAN berikan harga, cukup sebutkan nama produknya.
    Gunakan format **Judul** dan poin * untuk list.
    Selalu akhiri dengan ajakan ramah untuk mengecek katalog atau memesan via WhatsApp.

    **Katalog Kami:**
    ${productListForAI}`; // Gunakan daftar produk yang dikirim frontend

    // 4. Siapkan payload untuk Google Gemini
    const payload = {
        contents: [{ parts: [{ text: userPrompt }] }],
        systemInstruction: {
            parts: [{ text: systemPrompt }]
        }
    };

    // 5. Panggil Google Gemini dari Backend
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error("Gemini API Error:", errorData);
            throw new Error(`Gemini API error! status: ${response.status}`);
        }

        const result = await response.json();
        const text = result.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!text) {
            throw new Error("Respons AI tidak valid atau kosong.");
        }

        // 6. Kembalikan jawaban ke Frontend
        return {
            statusCode: 200,
            body: JSON.stringify({ recommendation: text })
        };

    } catch (error) {
        console.error("Error di serverless function:", error);
        return {
            statusCode: 500, // Internal Server Error
            body: JSON.stringify({ error: "Maaf, Asisten AI sedang mengalami gangguan." })
        };
    }
};