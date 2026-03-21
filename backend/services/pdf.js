/**
 * PDF report generation service using pdfkit
 */

const PDFDocument = require('pdfkit');

const COLORS = {
  amber: '#c97a00',
  green: '#0a7a4a',
  red: '#c02535',
  sky: '#0762b8',
  violet: '#7040b0',
  ink: '#1a1a2e',
  sub: '#6b7280',
  border: '#e5e7eb',
  bg: '#fafaf8',
};

function fmtINR(n) {
  if (n == null) return '—';
  return '₹' + Number(n).toLocaleString('en-IN', { maximumFractionDigits: 0 });
}

/**
 * Generate a market analysis PDF
 * Returns a Buffer
 */
function generateMarketReport({ products, stats, verdict, opportunityScore, forecast, costs }) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 50, bufferPages: true });
    const chunks = [];

    doc.on('data', c => chunks.push(c));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    // ── Title page ──
    doc.fontSize(10).fillColor(COLORS.sub).text('AMAZONLENS REPORT', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(26).fillColor(COLORS.ink).text('Market Analysis Report', { align: 'center' });
    doc.moveDown(0.3);
    doc.fontSize(11).fillColor(COLORS.sub).text(new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }), { align: 'center' });
    doc.moveDown(1.5);

    // ── Verdict banner ──
    const vColor = verdict === 'ENTER' ? COLORS.green : verdict === 'WATCH' ? COLORS.amber : COLORS.red;
    doc.roundedRect(50, doc.y, 495, 60, 8).fill(vColor + '12').stroke(vColor);
    doc.fillColor(vColor).fontSize(14).text(`Verdict: ${verdict || 'N/A'}`, 70, doc.y - 50, { continued: true });
    doc.fontSize(14).text(`   Opportunity Score: ${opportunityScore || 0}/100`, { align: 'right' });
    doc.y += 25;
    doc.moveDown(1);

    // ── Market stats ──
    if (stats) {
      sectionTitle(doc, 'Market Overview');
      const statRows = [
        ['Total Products', String(stats.totalProducts || 0)],
        ['Total Revenue', fmtINR(stats.totalRevenue)],
        ['Avg Price', fmtINR(stats.avgPrice)],
        ['Avg Reviews', String(Math.round(stats.avgReviews || 0))],
        ['Avg Rating', String((stats.avgRating || 0).toFixed(1))],
        ['Sellable Products', String(stats.sellableCount || 0)],
        ['New Winners (<12mo)', String(stats.newWinners || 0)],
        ['Sponsored %', `${(stats.sponsoredPct || 0).toFixed(0)}%`],
      ];
      drawTable(doc, ['Metric', 'Value'], statRows, [300, 195]);
      doc.moveDown(1);
    }

    // ── Top products ──
    if (products?.length) {
      sectionTitle(doc, `Top Products (${Math.min(products.length, 15)} of ${products.length})`);
      const top = products
        .sort((a, b) => (b.opportunity_score || 0) - (a.opportunity_score || 0))
        .slice(0, 15);

      const prodRows = top.map(p => [
        (p.title || '').slice(0, 35),
        fmtINR(p.price),
        fmtINR(p.monthly_revenue),
        String(p.reviews || 0),
        String(p.opportunity_score || 0),
        p.verdict || '—',
      ]);
      drawTable(doc, ['Product', 'Price', 'Revenue/mo', 'Reviews', 'Score', 'Verdict'], prodRows, [150, 65, 80, 60, 50, 50]);
      doc.moveDown(1);
    }

    // ── Forecast ──
    if (forecast?.length) {
      if (doc.y > 600) doc.addPage();
      sectionTitle(doc, '12-Month Revenue Forecast');
      const fRows = forecast.map(r => [
        `Month ${r.month}`,
        fmtINR(r.revenue),
        String(r.units),
        fmtINR(r.profit),
      ]);
      drawTable(doc, ['Month', 'Revenue', 'Units', 'Profit'], fRows, [100, 140, 100, 140]);
      doc.moveDown(0.5);
      const totalRev = forecast.reduce((a, r) => a + r.revenue, 0);
      const totalPro = forecast.reduce((a, r) => a + r.profit, 0);
      doc.fontSize(10).fillColor(COLORS.ink)
        .text(`Total Revenue: ${fmtINR(totalRev)}   |   Total Profit: ${fmtINR(totalPro)}`, { align: 'right' });
    }

    // ── Footer on all pages ──
    const pageCount = doc.bufferedPageRange().count;
    for (let i = 0; i < pageCount; i++) {
      doc.switchToPage(i);
      doc.fontSize(8).fillColor(COLORS.sub)
        .text(`AmazonLens Report — Page ${i + 1} of ${pageCount}`, 50, 780, { align: 'center', width: 495 });
    }

    doc.end();
  });
}

/**
 * Generate a product comparison PDF
 */
function generateComparisonReport({ products, matrix, winCounts }) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 50, bufferPages: true });
    const chunks = [];

    doc.on('data', c => chunks.push(c));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    doc.fontSize(10).fillColor(COLORS.sub).text('AMAZONLENS REPORT', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(24).fillColor(COLORS.ink).text('Product Comparison Report', { align: 'center' });
    doc.moveDown(0.3);
    doc.fontSize(11).fillColor(COLORS.sub).text(new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }), { align: 'center' });
    doc.moveDown(1.5);

    // Winner
    if (winCounts) {
      const winner = Object.entries(winCounts).sort((a, b) => b[1] - a[1])[0];
      const wp = products.find(p => p.asin === winner?.[0]);
      if (wp) {
        doc.fontSize(12).fillColor(COLORS.amber).text(`Winner: ${(wp.title || wp.asin).slice(0, 60)} — ${winner[1]} metrics won`);
        doc.moveDown(0.8);
      }
    }

    // Products summary
    sectionTitle(doc, 'Products Compared');
    const pRows = products.map(p => [
      (p.title || '').slice(0, 40),
      p.asin,
      fmtINR(p.price),
      fmtINR(p.monthly_revenue),
      String(p.opportunity_score || 0),
    ]);
    drawTable(doc, ['Product', 'ASIN', 'Price', 'Revenue', 'Score'], pRows, [160, 80, 70, 85, 50]);
    doc.moveDown(1);

    // Matrix
    if (matrix?.length) {
      sectionTitle(doc, 'Metric Comparison');
      const colW = Math.min(80, Math.floor(380 / products.length));
      const mRows = matrix.map(row => {
        const vals = row.values.map((v, i) => {
          const formatted = v.value != null ? String(typeof v.value === 'number' ? (row.format === 'inr' ? fmtINR(v.value) : v.value.toLocaleString()) : v.value) : '—';
          return v.isWinner ? `★ ${formatted}` : formatted;
        });
        return [row.label, ...vals];
      });
      const headers = ['Metric', ...products.map((p, i) => p.brand || `P${i + 1}`)];
      const colWidths = [115, ...products.map(() => colW)];
      drawTable(doc, headers, mRows, colWidths);
    }

    const pageCount = doc.bufferedPageRange().count;
    for (let i = 0; i < pageCount; i++) {
      doc.switchToPage(i);
      doc.fontSize(8).fillColor(COLORS.sub)
        .text(`AmazonLens Comparison Report — Page ${i + 1} of ${pageCount}`, 50, 780, { align: 'center', width: 495 });
    }

    doc.end();
  });
}

/**
 * Generate a profit analysis PDF
 */
function generateProfitReport({ costs, result, productTitle }) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 50, bufferPages: true });
    const chunks = [];

    doc.on('data', c => chunks.push(c));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    doc.fontSize(10).fillColor(COLORS.sub).text('AMAZONLENS REPORT', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(24).fillColor(COLORS.ink).text('Profit Analysis Report', { align: 'center' });
    if (productTitle) {
      doc.moveDown(0.3);
      doc.fontSize(12).fillColor(COLORS.sub).text(productTitle.slice(0, 80), { align: 'center' });
    }
    doc.moveDown(0.3);
    doc.fontSize(11).fillColor(COLORS.sub).text(new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }), { align: 'center' });
    doc.moveDown(1.5);

    // Profit hero
    const profitColor = result.profit > 0 ? COLORS.green : COLORS.red;
    doc.fontSize(16).fillColor(profitColor).text(`Net Profit: ${fmtINR(result.profit)} (${result.margin}% margin)`, { align: 'center' });
    doc.moveDown(1.5);

    // Cost breakdown
    sectionTitle(doc, 'Cost Breakdown');
    const rows = [
      ['Sell Price', `+${fmtINR(costs.sellPrice)}`],
      ['Product COGS', `-${fmtINR(costs.cogs)}`],
      ['Packaging', `-${fmtINR(costs.packaging)}`],
      ['Inbound Shipping', `-${fmtINR(costs.shipping)}`],
      ['Referral Fee', `-${fmtINR(result.fees.referral)}`],
      ['Closing Fee', `-${fmtINR(result.fees.closing)}`],
      ['Pick & Pack', `-${fmtINR(result.fees.pickPack)}`],
      ['Weight Handling', `-${fmtINR(result.fees.weightFee)}`],
      ['FBA Storage', `-${fmtINR(result.fees.storage)}`],
      ['PPC', `-${fmtINR(costs.ppc)}`],
      ['Returns', `-${fmtINR(result.returnCost)}`],
      ['GST Net', `-${fmtINR(result.gstOut)}`],
      ['NET PROFIT', fmtINR(result.profit)],
    ];
    drawTable(doc, ['Item', 'Amount'], rows, [300, 195]);
    doc.moveDown(1);

    // Investment section
    const invest = costs.firstOrder * (costs.cogs + (costs.packaging || 0) + (costs.shipping || 0));
    const monthRev = costs.firstOrder * costs.sellPrice;
    const monthPro = costs.firstOrder * result.profit;

    sectionTitle(doc, `Investment Summary (${costs.firstOrder} units)`);
    drawTable(doc, ['Metric', 'Value'], [
      ['Total Investment', fmtINR(invest)],
      ['Monthly Revenue', fmtINR(monthRev)],
      ['Monthly Profit', fmtINR(monthPro)],
      ['Break-even Units', `${Math.ceil(invest / Math.max(1, result.profit))} units`],
    ], [300, 195]);

    doc.fontSize(8).fillColor(COLORS.sub)
      .text('AmazonLens Profit Report — Page 1 of 1', 50, 780, { align: 'center', width: 495 });

    doc.end();
  });
}

// ── Helpers ──

function sectionTitle(doc, text) {
  doc.fontSize(13).fillColor(COLORS.ink).text(text);
  doc.moveDown(0.3);
  doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor(COLORS.border).lineWidth(1).stroke();
  doc.moveDown(0.5);
}

function drawTable(doc, headers, rows, colWidths) {
  const startX = 50;
  const cellPadding = 6;
  const rowH = 20;
  let y = doc.y;

  // Header
  doc.fontSize(9).fillColor(COLORS.sub);
  let x = startX;
  headers.forEach((h, i) => {
    doc.text(h, x + cellPadding, y + 4, { width: colWidths[i] - cellPadding * 2 });
    x += colWidths[i];
  });
  y += rowH;
  doc.moveTo(startX, y).lineTo(startX + colWidths.reduce((a, b) => a + b, 0), y).strokeColor(COLORS.border).lineWidth(0.5).stroke();

  // Rows
  rows.forEach((row, ri) => {
    if (y > 720) {
      doc.addPage();
      y = 50;
    }
    if (ri % 2 === 0) {
      doc.rect(startX, y, colWidths.reduce((a, b) => a + b, 0), rowH).fill('#f9fafb');
    }
    x = startX;
    doc.fontSize(9).fillColor(COLORS.ink);
    row.forEach((cell, i) => {
      doc.text(String(cell), x + cellPadding, y + 4, { width: colWidths[i] - cellPadding * 2 });
      x += colWidths[i];
    });
    y += rowH;
  });

  doc.y = y + 4;
}

module.exports = {
  generateMarketReport,
  generateComparisonReport,
  generateProfitReport,
};
