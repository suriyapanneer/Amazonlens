/**
 * CSV parsing and column mapping — preserved verbatim from server.js v3
 */

const { parse } = require('csv-parse/sync');

function n(v) {
  if (!v && v !== 0) return 0;
  return parseFloat(String(v).replace(/[,₹%$\s]/g, '')) || 0;
}

function findCol(row, ...candidates) {
  const keys = Object.keys(row);
  for (const c of candidates) {
    const norm = s => s.toLowerCase().replace(/[\s_\-()]/g, '');
    const k = keys.find(k => norm(k).includes(norm(c)));
    if (k !== undefined && row[k] !== '' && row[k] !== null && row[k] !== undefined) return row[k];
  }
  return '';
}

function parseCSV(buffer) {
  const text = buffer.toString('utf8');
  return parse(text, { columns: true, skip_empty_lines: true, trim: true, bom: true });
}

function mapXray(row) {
  return {
    asin:          String(findCol(row,'asin') || '').trim(),
    title:         String(findCol(row,'productdetails','title','product name','name') || ''),
    brand:         String(findCol(row,'brand','brandname','seller name') || 'Unknown'),
    price:         n(findCol(row,'price','sellingprice','price inr','price₹')),
    sales:         n(findCol(row,'sales','monthly sales','units sold','monthlysales')),
    revenue:       n(findCol(row,'revenue','monthly revenue','monthlyrevenue')),
    bsr:           n(findCol(row,'bsr','best seller rank','bestseller')),
    reviews:       n(findCol(row,'review count','reviews','reviewcount','no of reviews')),
    rating:        n(findCol(row,'rating','star rating','ratings')),
    reviewVel:     n(findCol(row,'review velocity','reviewvelocity','monthly reviews')),
    fulfillment:   String(findCol(row,'fulfillment','fba','fulfilled by') || ''),
    sellerAge:     n(findCol(row,'seller age','sellerage','months on amazon','age')),
    sponsored:     ['yes','true','1','sponsored'].includes(String(findCol(row,'sponsored','is sponsored')).toLowerCase().trim()),
    images:        n(findCol(row,'images','image count')),
    activeSellers: n(findCol(row,'active sellers','activesellers','sellers')),
    weight:        n(findCol(row,'weight','item weight')),
    url:           String(findCol(row,'url','product url','link') || ''),
  };
}

function mapCerebro(row) {
  return {
    keyword:      String(findCol(row,'keyword','search term','keywords') || ''),
    searchVol:    n(findCol(row,'search volume','searchvolume','monthly searches')),
    iqScore:      n(findCol(row,'iq score','iqscore','iq')),
    competing:    n(findCol(row,'competing products','competitors','competing')),
    trend:        n(findCol(row,'trend','trend %','30 day trend')),
    organicRank:  n(findCol(row,'organic rank','organicrank')),
    sponsoredRank:n(findCol(row,'sponsored rank','sponsoredrank')),
  };
}

function mapBlackBox(row) {
  return {
    asin:        String(findCol(row,'asin') || '').trim(),
    title:       String(findCol(row,'productdetails','title','product name','name') || ''),
    brand:       String(findCol(row,'brand','brandname') || 'Unknown'),
    category:    String(findCol(row,'category','niche','main category') || ''),
    price:       n(findCol(row,'price','sellingprice','price inr')),
    sales:       n(findCol(row,'sales','monthly sales','units sold','monthlysales')),
    revenue:     n(findCol(row,'revenue','monthly revenue','monthlyrevenue')),
    reviews:     n(findCol(row,'review count','reviews','reviewcount')),
    rating:      n(findCol(row,'rating','star rating','ratings')),
    bsr:         n(findCol(row,'bsr','best seller rank')),
    netMargin:   n(findCol(row,'net','net margin','net profit %','net%')),
    fulfillment: String(findCol(row,'fulfillment','fba') || ''),
    sellerAge:   n(findCol(row,'seller age','sellerage','age')),
    weight:      n(findCol(row,'weight','item weight')),
    activeSellers: n(findCol(row,'active sellers','activesellers')),
    sponsored:   ['yes','true','1'].includes(String(findCol(row,'sponsored')).toLowerCase().trim()),
    url:         String(findCol(row,'url','product url','link') || ''),
  };
}

module.exports = {
  n,
  findCol,
  parseCSV,
  mapXray,
  mapCerebro,
  mapBlackBox,
};
