const db = require('../db/queries');
const { supabase } = require('../config/supabase');
const { generateMarketReport, generateComparisonReport, generateProfitReport } = require('../services/pdf');

async function generateReport(req, res) {
  try {
    const { type, title, data } = req.body;
    const userId = req.user.id;

    let pdfBuffer = null;
    let pdfUrl = null;

    // Generate PDF based on report type
    if (type === 'market' && data) {
      pdfBuffer = await generateMarketReport(data);
    } else if (type === 'comparison' && data) {
      pdfBuffer = await generateComparisonReport(data);
    } else if (type === 'profit' && data) {
      pdfBuffer = await generateProfitReport(data);
    }

    // Upload PDF to Supabase Storage if generated
    if (pdfBuffer) {
      const fileName = `reports/${userId}/${Date.now()}_${type}.pdf`;

      const { error: uploadError } = await supabase.storage
        .from('amazonlens')
        .upload(fileName, pdfBuffer, {
          contentType: 'application/pdf',
          upsert: false,
        });

      if (uploadError) {
        // If bucket doesn't exist, try to create it
        if (uploadError.message?.includes('not found') || uploadError.statusCode === '404') {
          await supabase.storage.createBucket('amazonlens', { public: false });
          await supabase.storage.from('amazonlens').upload(fileName, pdfBuffer, {
            contentType: 'application/pdf',
            upsert: false,
          });
        } else {
          console.error('Storage upload error:', uploadError);
        }
      }

      // Get signed URL (valid for 7 days)
      const { data: signedData } = await supabase.storage
        .from('amazonlens')
        .createSignedUrl(fileName, 7 * 24 * 60 * 60);

      pdfUrl = signedData?.signedUrl || null;
    }

    const report = await db.saveReport(userId, {
      title: title || `${type} Report`,
      reportType: type || 'market',
      pdfUrl,
      metadata: data || null,
    });

    res.json({ success: true, report, pdfUrl });
  } catch (e) {
    console.error('Report generation error:', e);
    res.status(500).json({ error: e.message });
  }
}

async function getReports(req, res) {
  try {
    const reports = await db.getReports(req.user.id);
    res.json({ success: true, reports });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

async function downloadReport(req, res) {
  try {
    const { id } = req.params;
    const reports = await db.getReports(req.user.id);
    const report = reports.find(r => r.id === id);

    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    if (!report.pdf_url) {
      return res.status(404).json({ error: 'No PDF available for this report' });
    }

    // Refresh signed URL
    const fileName = `reports/${req.user.id}/${report.id}.pdf`;
    const { data: signedData } = await supabase.storage
      .from('amazonlens')
      .createSignedUrl(fileName, 60 * 60); // 1 hour

    if (signedData?.signedUrl) {
      return res.redirect(signedData.signedUrl);
    }

    // Fallback to stored URL
    res.redirect(report.pdf_url);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

module.exports = { generateReport, getReports, downloadReport };
