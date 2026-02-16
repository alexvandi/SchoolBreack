const fs = require('fs');
const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');

// --- Configuration ---
const CARDS_TO_GENERATE = 5;
const OUTPUT_FILE = 'tessere_da_stampare.pdf';
// const BASE_URL = 'http://localhost:3000/activate'; // CHANGE THIS TO YOUR REAL DOMAIN WHEN DEPLOYED
const BASE_URL = 'https://school-breack.netlify.app/activate';

const CARD_WIDTH = 85.6 * 2.83465; // mm to points (1mm = 2.83465pt)
const CARD_HEIGHT = 53.98 * 2.83465;
const MARGIN_X = 50;
const MARGIN_Y = 50;
const SPACING_Y = 20;

async function generateQR(data) {
    return await QRCode.toDataURL(data, { errorCorrectionLevel: 'H' });
}

async function createPDF() {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const stream = fs.createWriteStream(OUTPUT_FILE);
    doc.pipe(stream);

    console.log(`Generating ${CARDS_TO_GENERATE} cards...`);

    let currentY = MARGIN_Y;

    for (let i = 1; i <= CARDS_TO_GENERATE; i++) {
        // Generate Unique ID (e.g., SB-0001, SB-0002...)
        // In production, use a random string or UUID
        const uniqueId = `SB-${String(i).padStart(4, '0')}`;
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
    }

    doc.end();
    console.log(`PDF created successfully: ${OUTPUT_FILE}`);
}

createPDF().catch(console.error);
