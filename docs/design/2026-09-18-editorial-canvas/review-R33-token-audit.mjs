/* =====================================================================
   R-33 · ui-qa 对 docs/design/2026-09-18-editorial-canvas/ 的可验证性复核
   独立重算 design.md §7 的每一个对比度声明，并补测「未覆盖组合」。
   用法：node review-R33-token-audit.mjs
   只读：不修改仓库任何文件。
   数值口径：WCAG 2.1 相对亮度（sRGB 线性化），alpha 用 over 合成。
   ===================================================================== */
function parseHex(h){h=h.replace('#','');if(h.length===3)h=h.split('').map(c=>c+c).join('');return [parseInt(h.slice(0,2),16),parseInt(h.slice(2,4),16),parseInt(h.slice(4,6),16)];}
function parseColor(s){s=String(s).trim();const m=s.match(/^rgba?\(([^)]+)\)$/i);if(m){const p=m[1].split(',').map(x=>parseFloat(x.trim()));return{rgb:[p[0],p[1],p[2]],a:p.length>3?p[3]:1};}return{rgb:parseHex(s),a:1};}
function over(fg,bg){const f=parseColor(fg),b=parseColor(bg);return [0,1,2].map(i=>f.rgb[i]*f.a+b.rgb[i]*(1-f.a));}
function lin(c){c/=255;return c<=0.04045?c/12.92:Math.pow((c+0.055)/1.055,2.4);}
function lum(rgb){return 0.2126*lin(rgb[0])+0.7152*lin(rgb[1])+0.0722*lin(rgb[2]);}
function ratio(fg,bg){const f=parseColor(fg).a===1?parseColor(fg).rgb:over(fg,bg);const b=parseColor(bg).rgb;const L1=Math.max(lum(f),lum(b)),L2=Math.min(lum(f),lum(b));return (L1+0.05)/(L2+0.05);}
const r2=n=>Math.round(n*100)/100;
function lab(h){const [r,g,b]=parseHex(h).map(lin);const X=(0.4124*r+0.3576*g+0.1805*b)/0.95047,Y=(0.2126*r+0.7152*g+0.0722*b),Z=(0.0193*r+0.1192*g+0.9505*b)/1.08883;
  const f=t=>t>0.008856?Math.cbrt(t):(7.787*t+16/116);const fx=f(X),fy=f(Y),fz=f(Z);return [116*fy-16,500*(fx-fy),200*(fy-fz)];}
function dE(a,b){const A=lab(a),B=lab(b);return Math.sqrt((A[0]-B[0])**2+(A[1]-B[1])**2+(A[2]-B[2])**2);}
function hue(h){const [r,g,b]=parseHex(h).map(v=>v/255);const mx=Math.max(r,g,b),mn=Math.min(r,g,b),dd=mx-mn;let H=0;
  if(dd===0)H=0;else if(mx===r)H=60*(((g-b)/dd)%6);else if(mx===g)H=60*((b-r)/dd+2);else H=60*((r-g)/dd+4);return Math.round((H+360)%360);}

// ---- tokens.css 原值 ----
const L={shell:'#fbfaf7',canvas:'#f5f2ec',panel:'#ffffff',hover:'#ebe7dc',control:'#fbfaf7',
  text:'#24231f',muted:'#767571',border:'rgba(36,35,31,0.15)',borderStrong:'rgba(36,35,31,0.38)',
  accent:'#4a42b8',ctaInk:'#ffffff',accentDeep:'#3f38a8',decoText:'#c9334e',
  plateCoral:'#ef6b7a',plateAcid:'#d9f23a',plateTeal:'#65b9aa',plateBrick:'#dca56a',
  nodeMain:'#ffffff',nodeInner:'#fbfaf7',nodeInnerHover:'#f1eee6',nodeText:'#24231f',nodeMuted:'#767571',nodeAccent:'#4a42b8',
  edge:'#4a42b8',handleRing:'rgba(74,66,184,0.75)',handleMid:'#7d76e0',
  queued:'#a16207',running:'#3b82f6',retry:'#ea8a00',success:'#1d7a3e',error:'#c9334e',unknown:'#0f766e',idle:'#8a8880',warn:'#92600a'};
const D={shell:'#1d1a17',canvas:'#23201b',panel:'#2b2823',hover:'#38342d',control:'#262320',
  text:'#f5f2ec',muted:'#a09d98',border:'rgba(245,242,236,0.16)',borderStrong:'rgba(245,242,236,0.38)',
  accent:'#9c96f2',ctaInk:'#1d1a17',accentDeep:'#b3aef7',decoText:'#f28390',
  plateCoral:'#f28390',plateAcid:'#d9f23a',plateTeal:'#7ccabf',plateBrick:'#e0b384',
  nodeMain:'#fbfaf7',nodeInner:'#f1eee6',nodeInnerHover:'#e7e2d6',nodeText:'#24231f',nodeMuted:'#767571',nodeAccent:'#5149cf',
  edge:'#9c96f2',handleRing:'rgba(156,150,242,0.75)',handleMid:'#9c96f2',
  queued:'#f5b83d',running:'#60a5fa',retry:'#fb923c',success:'#34d399',error:'#f28390',unknown:'#5eead4',idle:'#8a8880',warn:'#fbbf24'};

const out=[];
const P=(s='')=>out.push(s);

P('=== 1. §7 声明值 vs 实测（同一 token 集重算）===');
const claims=[
  ['浅 正文 ink on shell','#24231f',L.shell,15.07],
  ['浅 muted on shell',L.muted,L.shell,4.42],
  ['浅 accent on shell',L.accent,L.shell,7.28],
  ['浅 白字 on CTA 紫',L.ctaInk,L.accent,7.60],
  ['浅 白字 on hover 紫',L.ctaInk,L.accentDeep,8.96],
  ['浅 紫 on 卡其带(panel-hover)',L.accent,L.hover,5.30],
  ['浅 queued on shell',L.queued,L.shell,4.72],
  ['浅 unknown on shell',L.unknown,L.shell,5.24],
  ['浅 deco-text on shell',L.decoText,L.shell,4.95],
  ['浅 珊瑚原色 on shell',L.plateCoral,L.shell,2.85],
  ['深 米白墨 on canvas',D.text,D.canvas,15.02],
  ['深 muted on canvas',D.muted,D.canvas,6.21],
  ['深 accent on canvas',D.accent,D.canvas,6.23],
  ['深 queued on canvas',D.queued,D.canvas,9.44],
  ['深 unknown on canvas',D.unknown,D.canvas,11.35],
  ['深 装饰珊瑚 on canvas',D.plateCoral,D.canvas,6.51],
];
for(const [n,fg,bg,c] of claims){const m=ratio(fg,bg);const d=r2(m-c);
  P(`  ${n.padEnd(32)} 声明 ${String(c).padStart(6)}  实测 ${m.toFixed(3).padStart(8)}  差 ${String(d).padStart(6)}  ${Math.abs(d)<=0.02?'可复现':'★不可复现'}`);}

P('');
P('=== 2. 不可复现项的「隐含底色」（反解：声明值要求底色亮度是多少）===');
for(const [n,fg,c] of [['深 米白墨','#f5f2ec',15.02],['深 muted',D.muted,6.21],['深 queued',D.queued,9.44],['深 unknown',D.unknown,11.35],['深 accent',D.accent,6.23],['深 装饰珊瑚',D.plateCoral,6.51]]){
  const implied=(lum(parseColor(fg).rgb)+0.05)/c-0.05;
  P(`  ${n.padEnd(14)} 隐含底亮度 Y=${implied.toFixed(4)}   --gc-canvas #23201b 实际 Y=${lum(parseColor(D.canvas).rgb).toFixed(4)}  差 ${(lum(parseColor(D.canvas).rgb)-implied).toFixed(4)}`);}
P('  → 同一段落里出现两种底色：accent/coral 两条对得上 #23201b，其余四条要求比它更暗一档的底。');
P(`  浅「紫 on 卡其带 5.30」：accent Y=${lum(parseColor(L.accent).rgb).toFixed(4)}，5.30 要求底 Y=${(5.30*(lum(parseColor(L.accent).rgb)+0.05)-0.05).toFixed(3)}（≈等亮灰 #d7d7d7），tokens.css 无此底色；在声明色号 panel-hover #ebe7dc 上实测 ${ratio(L.accent,L.hover).toFixed(2)}`);

P('');
P('=== 3. 全量矩阵：载文本 token × 真实底色（AA 4.5 / 3:1 大字号）===');
const mat=(label,T,grounds,rows)=>{P(`-- ${label} --`);
  P('  ' + 'token'.padEnd(12) + Object.keys(grounds).map(k=>k.padEnd(11)).join(''));
  for(const [tn,tv] of rows){const cells=[tn.padEnd(12)];
    for(const gv of Object.values(grounds)){const m=ratio(tv,gv);cells.push(`${m.toFixed(2)}${m>=4.5?' AA':m>=3?' lg':' XX'}`.padEnd(11));}
    P('  '+cells.join(''));}};
mat('浅色 paper',L,{shell:L.shell,canvas:L.canvas,panel:L.panel,hover:L.hover,nodeInner:L.nodeInner},
  Object.entries({text:L.text,muted:L.muted,accent:L.accent,queued:L.queued,running:L.running,retry:L.retry,success:L.success,error:L.error,unknown:L.unknown,idle:L.idle,warn:L.warn,plateCoral:L.plateCoral}));
mat('深色 paper-dark',D,{shell:D.shell,canvas:D.canvas,panel:D.panel,hover:D.hover,nodeCard:D.nodeMain},
  Object.entries({text:D.text,muted:D.muted,accent:D.accent,queued:D.queued,running:D.running,retry:D.retry,success:D.success,error:D.error,unknown:D.unknown,idle:D.idle,warn:D.warn,plateCoral:D.plateCoral,nodeText:D.nodeText,nodeMuted:D.nodeMuted,nodeAccent:D.nodeAccent}));

P('');
P('=== 4. 未覆盖组合 A：paper-dark 的「米白纸卡」上的状态点 / 状态色（10px 实心点，1.4.11 需 3:1）===');
const darkStatuses={queued:D.queued,running:D.running,retry:D.retry,success:D.success,error:D.error,unknown:D.unknown,idle:D.idle,warn:D.warn};
for(const [k,v] of Object.entries(darkStatuses)){const m=ratio(v,D.nodeMain);
  P(`  --gc-status-${k.padEnd(8)} ${v} on node-main ${D.nodeMain} = ${m.toFixed(2).padStart(6)}  ${m>=3?'OK(3:1)':'★<3:1'}`);}
P('  （对照：既有 current 主题同一组合 —— 白卡 #ffffff 上）');
for(const [k,v] of Object.entries({queued:'#2dd4bf',running:'#60a5fa',retry:'#fb923c',success:'#34d399',error:'#f87171',unknown:'#a78bfa',idle:'#8b9198',warn:'#fbbf24'}))
  P(`  current --gc-status-${k.padEnd(8)} ${v} on node-main #ffffff = ${ratio(v,'#ffffff').toFixed(2).padStart(6)}  ${ratio(v,'#ffffff')>=3?'OK(3:1)':'★<3:1'}`);

P('');
P('=== 5. 未覆盖组合 B：端口环 / 焦点环（同一根因：环画在浅色卡上还是深色画布上）===');
for(const [n,fg,bg] of [
  ['paper 端口环(rgba(74,66,184,.75)) on 白卡',L.handleRing,L.nodeMain],
  ['paper 端口环 on 画布',L.handleRing,L.canvas],
  ['paper-dark 端口环(rgba(156,150,242,.75)) on 米白卡',D.handleRing,D.nodeMain],
  ['paper-dark 端口环 on 画布',D.handleRing,D.canvas],
  ['paper-dark handle-mid #9c96f2 on 米白卡',D.handleMid,D.nodeMain],
  ['paper 焦点环 accent on 白卡',L.accent,L.nodeMain],
  ['paper-dark 焦点环 accent on 米白卡',D.accent,D.nodeMain],
  ['current 焦点环 accent #FFC940 on 白卡（基线）','#FFC940','#ffffff'],
]) P(`  ${n.padEnd(52)} ${ratio(fg,bg).toFixed(2).padStart(6)}  ${ratio(fg,bg)>=3?'OK(3:1)':'★<3:1'}`);

P('');
P('=== 6. 覆盖缺口 C：浅底主题的 8 个状态槽位（§7 只列了 queued/unknown/error 三个）===');
const lightStatuses={queued:L.queued,running:L.running,retry:L.retry,success:L.success,error:L.error,unknown:L.unknown,idle:L.idle,warn:L.warn};
for(const [k,v] of Object.entries(lightStatuses)){const a=ratio(v,L.panel),b=ratio(v,L.canvas),c=ratio(v,L.nodeMain);
  P(`  --gc-status-${k.padEnd(8)} ${v}  面板 ${a.toFixed(2)} / 画布 ${b.toFixed(2)} / 白卡 ${c.toFixed(2)}   ${a>=4.5&&b>=4.5?'AA':'★有 <4.5 的底'}`);}

P('');
P('=== 7. 既有三主题基线（区分「本主题新增」与「项目既有」）===');
const T={current:{panel:'#21242a',canvas:'#16181d',nodeMain:'#ffffff',ring:'rgba(255,201,64,0.75)',accent:'#FFC940'},
  white:{panel:'#ffffff',canvas:'#f5f5f7',nodeMain:'#ffffff',ring:'rgba(0,113,227,0.75)',accent:'#0071e3'},
  eye:{panel:'#ffffff',canvas:'#E9F1EA',nodeMain:'#ffffff',ring:'rgba(11,122,67,0.75)',accent:'#0B7A43'},
  paper:{panel:L.panel,canvas:L.canvas,nodeMain:L.nodeMain,ring:L.handleRing,accent:L.accent}};
for(const [t,v] of Object.entries(T))
  P(`  ${t.padEnd(8)} muted ${ratio(t==='current'?'#9ba1a9':t==='white'?'#6e6e73':t==='eye'?'#47685A':'#767571',v.panel).toFixed(2)} / running ${ratio(t==='current'?'#60a5fa':t==='white'?'#3b82f6':t==='eye'?'#2f6db5':'#3b82f6',v.panel).toFixed(2)} / retry ${ratio(t==='current'?'#fb923c':t==='white'?'#ea8a00':t==='eye'?'#c07a10':'#ea8a00',v.panel).toFixed(2)} / idle ${ratio(t==='current'?'#8b9198':t==='white'?'#8e8e93':t==='eye'?'#6d8d7c':'#8a8880',v.panel).toFixed(2)}   | 端口环 on 白卡 ${ratio(v.ring,v.nodeMain).toFixed(2)}  焦点环 on 白卡 ${ratio(v.accent,v.nodeMain).toFixed(2)}`);

P('');
P('=== 8. 状态点两两可辨识度（CIELAB ΔE76）与五主题 accent 色相角 ===');
for(const [t,c] of [['current','#FFC940'],['white','#0071E3'],['eye','#0B7A43'],['paper','#4a42b8'],['paper-dark','#9c96f2']]) P(`  ${t.padEnd(11)} ${c} H=${hue(c)}°`);
for(const [name,S] of [['paper 状态色',lightStatuses],['paper-dark 状态色',darkStatuses]]){
  const ks=Object.keys(S),pairs=[];
  for(let i=0;i<ks.length;i++)for(let j=i+1;j<ks.length;j++)pairs.push([ks[i],ks[j],dE(S[ks[i]],S[ks[j]])]);
  pairs.sort((a,b)=>a[2]-b[2]);
  P(`  ${name} 最相近 3 对: ` + pairs.slice(0,3).map(([a,b,d])=>`${a}↔${b} ΔE=${d.toFixed(1)}`).join('  '));
}
{
  const S={queued:'#2dd4bf',running:'#60a5fa',retry:'#fb923c',success:'#34d399',error:'#f87171',unknown:'#a78bfa',idle:'#8b9198',warn:'#fbbf24'};
  const ks=Object.keys(S),pairs=[];
  for(let i=0;i<ks.length;i++)for(let j=i+1;j<ks.length;j++)pairs.push([ks[i],ks[j],dE(S[ks[i]],S[ks[j]])]);
  pairs.sort((a,b)=>a[2]-b[2]);
  P(`  current 状态色（基线）最相近 3 对: ` + pairs.slice(0,3).map(([a,b,d])=>`${a}↔${b} ΔE=${d.toFixed(1)}`).join('  '));
}

console.log(out.join('\n'));
