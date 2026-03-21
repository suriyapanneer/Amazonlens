const db = require('../db/queries');
const { supabase } = require('../config/supabase');

// Free tier limits
const LIMITS = {
  products: 500,
  keywords: 25000,
  analyses: 50,
  reports: 20,
  storageMB: 500, // Supabase free tier DB
  fileStorageMB: 1024, // Supabase free tier storage bucket
};

async function getStorageOverview(req, res) {
  try {
    const userId = req.user.id;
    const stats = await db.getStorageStats(userId);

    // Estimate row sizes (approximate bytes per row)
    const estProductBytes = stats.products.count * 1200;  // ~1.2KB per product row
    const estKeywordBytes = stats.keywords.count * 200;   // ~200B per keyword row
    const estAnalysisBytes = stats.analyses.count * 2000;  // ~2KB per analysis (JSONB)
    const estReportBytes = stats.reports.count * 500;     // ~500B per report row
    const totalEstBytes = estProductBytes + estKeywordBytes + estAnalysisBytes + estReportBytes;

    // Get file storage usage
    let fileStorageBytes = 0;
    try {
      const { data: files } = await supabase.storage
        .from('amazonlens')
        .list(`reports/${userId}`, { limit: 1000 });
      if (files) {
        fileStorageBytes = files.reduce((sum, f) => sum + (f.metadata?.size || 0), 0);
      }
    } catch {}

    // Identify stale data (products not updated in 30+ days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const staleProducts = await db.getOldProducts(userId, thirtyDaysAgo);

    res.json({
      success: true,
      usage: {
        products: { used: stats.products.count, limit: LIMITS.products, bytes: estProductBytes },
        keywords: { used: stats.keywords.count, limit: LIMITS.keywords, bytes: estKeywordBytes },
        analyses: { used: stats.analyses.count, limit: LIMITS.analyses, bytes: estAnalysisBytes },
        reports: { used: stats.reports.count, limit: LIMITS.reports, bytes: estReportBytes },
        database: {
          usedBytes: totalEstBytes,
          usedMB: +(totalEstBytes / (1024 * 1024)).toFixed(2),
          limitMB: LIMITS.storageMB,
        },
        fileStorage: {
          usedBytes: fileStorageBytes,
          usedMB: +(fileStorageBytes / (1024 * 1024)).toFixed(2),
          limitMB: LIMITS.fileStorageMB,
        },
      },
      details: {
        products: stats.products.rows,
        analyses: stats.analyses.rows,
        reports: stats.reports.rows,
      },
      staleProducts,
      limits: LIMITS,
    });
  } catch (e) {
    console.error('Storage overview error:', e);
    res.status(500).json({ error: e.message });
  }
}

async function deleteData(req, res) {
  try {
    const userId = req.user.id;
    const { type, id, asin } = req.body;

    switch (type) {
      case 'product':
        if (!asin) return res.status(400).json({ error: 'ASIN required' });
        await db.deleteKeywordsByAsin(userId, asin);
        await db.deleteProduct(userId, asin);
        break;
      case 'analysis':
        if (!id) return res.status(400).json({ error: 'ID required' });
        await db.deleteAnalysis(userId, id);
        break;
      case 'report':
        if (!id) return res.status(400).json({ error: 'ID required' });
        // Delete PDF file from storage
        try {
          const reports = await db.getReports(userId);
          const report = reports.find(r => r.id === id);
          if (report?.pdf_url) {
            const fileName = `reports/${userId}/${id}.pdf`;
            await supabase.storage.from('amazonlens').remove([fileName]);
          }
        } catch {}
        await db.deleteReport(userId, id);
        break;
      case 'all_keywords':
        await db.deleteAllKeywords(userId);
        break;
      case 'all_products':
        await db.deleteAllProducts(userId);
        break;
      case 'all_analyses':
        await db.deleteAllAnalyses(userId);
        break;
      case 'all_reports':
        // Delete all PDF files
        try {
          const { data: files } = await supabase.storage
            .from('amazonlens')
            .list(`reports/${userId}`, { limit: 1000 });
          if (files?.length) {
            await supabase.storage.from('amazonlens')
              .remove(files.map(f => `reports/${userId}/${f.name}`));
          }
        } catch {}
        await db.deleteAllReports(userId);
        break;
      case 'stale_products': {
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
        const stale = await db.getOldProducts(userId, thirtyDaysAgo);
        for (const p of stale) {
          await db.deleteKeywordsByAsin(userId, p.asin);
          await db.deleteProduct(userId, p.asin);
        }
        break;
      }
      default:
        return res.status(400).json({ error: 'Invalid delete type' });
    }

    res.json({ success: true });
  } catch (e) {
    console.error('Delete data error:', e);
    res.status(500).json({ error: e.message });
  }
}

module.exports = { getStorageOverview, deleteData };
