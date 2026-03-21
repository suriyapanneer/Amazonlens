/**
 * Migration script: JSON DB → Supabase PostgreSQL
 *
 * Usage: node db/migrate.js <user-uuid>
 * The user UUID is the Supabase auth user ID to assign all products to.
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { supabase } = require('../config/supabase');

const DB_FILE = path.join(__dirname, '..', 'amazonlens-db.json');

async function migrate() {
  const userId = process.argv[2];
  if (!userId) {
    console.error('Usage: node db/migrate.js <user-uuid>');
    console.error('  Get your user UUID from Supabase Auth dashboard after signing up.');
    process.exit(1);
  }

  if (!fs.existsSync(DB_FILE)) {
    console.log('No amazonlens-db.json found — nothing to migrate.');
    process.exit(0);
  }

  const raw = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
  const products = Object.values(raw.products || {});
  console.log(`Found ${products.length} products to migrate...`);

  let migrated = 0;
  let errors = 0;
  let keywordCount = 0;

  for (const p of products) {
    try {
      const { error } = await supabase.from('products').upsert({
        user_id: userId,
        asin: p.asin,
        title: p.title || '',
        brand: p.brand || 'Unknown',
        category: p.category || '',
        price: p.price || 0,
        monthly_sales: p.monthly_sales || 0,
        monthly_revenue: p.monthly_revenue || 0,
        bsr: p.bsr || 0,
        reviews: p.reviews || 0,
        rating: p.rating || 0,
        review_vel: p.review_vel || 0,
        fulfillment: p.fulfillment || '',
        seller_age: p.seller_age || 0,
        weight: p.weight || 0,
        images: p.images || 0,
        active_sellers: p.active_sellers || 0,
        sponsored: p.sponsored === 1 || p.sponsored === true,
        url: p.url || '',
        moat_score: p.moat_score || 0,
        opportunity_score: p.opportunity_score || 0,
        profit_estimate: p.profit_estimate || 0,
        margin_estimate: p.margin_estimate || 0,
        sellable: p.sellable === 1 || p.sellable === true,
        verdict: p.verdict || 'SKIP',
        source: p.source || '',
        top_keyword: p.top_keyword || '',
        keyword_count: p.keyword_count || 0,
        zero_comp_keywords: p.zero_comp_keywords || 0,
        gold_keywords: p.gold_keywords || 0,
        bb_category: p.bb_category || '',
        bb_net_margin: p.bb_net_margin || 0,
        bb_opportunity_score: p.bb_opportunity_score || 0,
        costs_json: p.costs_json ? (typeof p.costs_json === 'string' ? JSON.parse(p.costs_json) : p.costs_json) : null,
      }, { onConflict: 'user_id,asin' });

      if (error) {
        console.error(`  Error migrating ${p.asin}: ${error.message}`);
        errors++;
      } else {
        migrated++;
      }

      // Migrate keywords if present
      if (p.keywords_json) {
        try {
          const keywords = typeof p.keywords_json === 'string' ? JSON.parse(p.keywords_json) : p.keywords_json;
          if (Array.isArray(keywords) && keywords.length > 0) {
            // Get the product id
            const { data: prod } = await supabase
              .from('products')
              .select('id')
              .eq('user_id', userId)
              .eq('asin', p.asin)
              .single();

            const rows = keywords.map(k => ({
              user_id: userId,
              product_id: prod?.id || null,
              asin: p.asin,
              keyword: k.keyword || '',
              search_vol: k.searchVol || 0,
              iq_score: k.iqScore || 0,
              competing: k.competing || 0,
              trend: k.trend || 0,
              organic_rank: k.organicRank || 0,
              sponsored_rank: k.sponsoredRank || 0,
              tier: k.tier || 'SKIP',
            }));

            const { error: kwError } = await supabase.from('keywords').insert(rows);
            if (!kwError) keywordCount += rows.length;
          }
        } catch {}
      }
    } catch (e) {
      console.error(`  Failed on ${p.asin}: ${e.message}`);
      errors++;
    }
  }

  console.log(`\nMigration complete:`);
  console.log(`  Products: ${migrated} migrated, ${errors} errors`);
  console.log(`  Keywords: ${keywordCount} rows inserted`);
}

migrate().catch(e => {
  console.error('Migration failed:', e);
  process.exit(1);
});
