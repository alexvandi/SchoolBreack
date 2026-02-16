const fs = require('fs');
const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');
const { createClient } = require('@supabase/supabase-js');

// --- Configuration ---
const CARDS_TO_GENERATE = 5;
const OUTPUT_FILE = 'tessere_da_stampare.pdf';
// const BASE_URL = 'http://localhost:3000/activate'; // CHANGE THIS TO YOUR REAL DOMAIN WHEN DEPLOYED
const BASE_URL = 'https://school-breack.netlify.app/activate';

// --- Supabase Config (Hardcoded for script simplicity, or use dotenv) ---
const SUPABASE_URL = 'https://bohsivvtuqcoelopzkth.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJvaHNpdnZ0dXFjb2Vsb3B6a3RoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzExODIwODksImV4cCI6MjA4Njc1ODA4OX0.QTQt4y5-aHcLsWWQIv3YG6MY8zHx_j7XrtQK0dFh_qs';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const CARD_WIDTH = 85.6 * 2.83465; // mm to points (1mm = 2.83465pt)
const CARD_HEIGHT = 53.98 * 2.83465;
const MARGIN_X = 50;
const MARGIN_Y = 50;
const SPACING_Y = 20;

async function generateQR(data) {
    return await QRCode.toDataURL(data, { errorCorrectionLevel: 'H' });
}

async function createPDF() {
    console.log(`Generating ${CARDS_TO_GENERATE} cards and syncing with Supabase...`);

    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const stream = fs.createWriteStream(OUTPUT_FILE);
    doc.pipe(stream);

    let currentY = MARGIN_Y;

    for (let i = 1; i <= CARDS_TO_GENERATE; i++) {
        // Generate Unique ID (e.g., SB-0001, SB-0002...)
        // Using timestamp to avoid collisions if run multiple times
        // const uniqueId = `SB-${Date.now().toString().slice(-4)}-${String(i).padStart(3, '0')}`;
        const uniqueId = `SB-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`;

        // 1. Insert into Supabase (Pre-register card)
        const { error } = await supabase
            .from('users')
            .upsert({
                card_id: uniqueId,
                name: '',
                surname: ''
                // other fields left null/default
            }, { onConflict: 'card_id' });

        if (error) {
            console.error(`Error registering card ${uniqueId}:`, error.message);
            continue; // Skip this card if DB fails
        }

        const activationUrl = `${BASE_URL}/${uniqueId}`;
        const qrImage = await generateQR(activationUrl);

        // Check if we need a new page
        if (currentY + CARD_HEIGHT > doc.page.height - MARGIN_Y) {
            doc.addPage();
            currentY = MARGIN_Y;
        }

        // Draw Cut Lines (Outer Border)
        doc.lineWidth(1)
            .strokeColor('#ccc')
            .dash(5, { space: 5 })
            .rect(MARGIN_X, currentY, CARD_WIDTH, CARD_HEIGHT)
            .stroke();

        // Card Content Background (Black)
        doc.rect(MARGIN_X, currentY, CARD_WIDTH, CARD_HEIGHT)
            .fill('#000000');

        // Reset dash
        doc.undash();

        // Add Logo Text
        doc.fillColor('#FFFFFF')
            .fontSize(16)
            .font('Helvetica-Bold')
            .text('SCHOOLBREAK', MARGIN_X + 20, currentY + 20);

        doc.fontSize(10)
            .font('Helvetica')
            .text('TESSERA SCONTI', MARGIN_X + 20, currentY + 40);

        // Add QR Code
        doc.image(qrImage, MARGIN_X + CARD_WIDTH - 90, currentY + 10, { width: 70 });

        // Add Card ID
        doc.fillColor('#CCCCCC')
            .fontSize(8)
            .text(`ID: ${uniqueId}`, MARGIN_X + 20, currentY + CARD_HEIGHT - 20);

        // Add URL Text
        doc.text('Scansiona per attivare', MARGIN_X + CARD_WIDTH - 100, currentY + 85, { width: 90, align: 'center' });

        currentY += CARD_HEIGHT + SPACING_Y;
        console.log(`Generated card ${uniqueId}`);
    }

    doc.end();
    console.log(`PDF created successfully: ${OUTPUT_FILE}`);
}

createPDF().catch(console.error);
