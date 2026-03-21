export const fmtINR=(n)=>{if(!n&&n!==0)return'₹0';if(n>=10000000)return`₹${(n/10000000).toFixed(1)}Cr`;if(n>=100000)return`₹${(n/100000).toFixed(1)}L`;if(n>=1000)return`₹${(n/1000).toFixed(1)}K`;return`₹${Math.round(n)}`};
export const fmtNum=(n)=>{if(!n&&n!==0)return'0';if(n>=1000000)return`${(n/1000000).toFixed(1)}M`;if(n>=1000)return`${(n/1000).toFixed(1)}K`;return String(Math.round(n))};
export const fmtPct=(n,d=1)=>`${Number(n).toFixed(d)}%`;
export const vColor=(v)=>({ENTER:'#0a7a4a',WATCH:'#c97a00',SKIP:'#c02535',UNKNOWN:'#7a7068'}[v]||'#7a7068');
export const vBg   =(v)=>({ENTER:'rgba(10,122,74,.08)',WATCH:'rgba(201,122,0,.08)',SKIP:'rgba(192,37,53,.08)',UNKNOWN:'rgba(0,0,0,.04)'}[v]||'rgba(0,0,0,.04)');
export const vBorder=(v)=>({ENTER:'rgba(10,122,74,.2)',WATCH:'rgba(201,122,0,.2)',SKIP:'rgba(192,37,53,.2)',UNKNOWN:'rgba(0,0,0,.1)'}[v]||'rgba(0,0,0,.1)');
export const tierColor=(t)=>({ZERO_COMP:'#0a7a4a',GOLD:'#c97a00',SILVER:'#7a7068',BRONZE:'#8b5e2a',SKIP:'#b8b0a6'}[t]||'#7a7068');
export const tierBg=(t)=>({ZERO_COMP:'rgba(10,122,74,.08)',GOLD:'rgba(201,122,0,.08)',SILVER:'rgba(0,0,0,.04)',BRONZE:'rgba(139,94,42,.08)',SKIP:'rgba(0,0,0,.03)'}[t]||'rgba(0,0,0,.04)');
export const tierLabel=(t)=>({ZERO_COMP:'🎯 Zero Competition',GOLD:'🥇 Gold',SILVER:'🥈 Silver',BRONZE:'🥉 Bronze',SKIP:'Skip'}[t]||t);
