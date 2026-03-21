const BASE=import.meta.env.VITE_API_URL||'/api';
async function req(path,opts={}){const r=await fetch(`${BASE}${path}`,opts);const d=await r.json();if(!d.success&&r.status>=400)throw new Error(d.error||'API error');return d}
async function up(path,file,params={}){const f=new FormData();f.append('file',file);const qs=new URLSearchParams(params).toString();const r=await fetch(`${BASE}${path}${qs?'?'+qs:''}`,{method:'POST',body:f});const d=await r.json();if(!d.success)throw new Error(d.error||'Upload error');return d}
export const api={
  uploadXray:(file)=>up('/upload/xray',file),
  uploadCerebro:(file,asin)=>up('/upload/cerebro',file,asin?{asin}:{}),
  uploadBlackBox:(file)=>up('/upload/blackbox',file),
  getProducts:()=>req('/products'),
  getSellable:()=>req('/products/sellable'),
  deleteProduct:(asin)=>req(`/products/${asin}`,{method:'DELETE'}),
  compare:(asins)=>req('/products/compare',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({asins})}),
  calcProfit:(costs)=>req('/calculate/profit',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(costs)}),
  analyze:(payload)=>req('/analyze',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)}),
};
