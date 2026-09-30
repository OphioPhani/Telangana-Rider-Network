/* TELANGANA RIDER NETWORK — premium travel platform (local-only, no tracking) */
(function(){
"use strict";
const TRIPS=[...(window.TRIPS1||[]),...(window.TRIPS2||[]),...(window.TRIPS3||[]),...(window.TRIPS4||[]),...(window.TRIPS5||[])].sort((a,b)=>a.n-b.n);
const ORIGIN="Saroornagar, Hyderabad, Telangana";
const $=s=>document.querySelector(s);
const $$=s=>[...document.querySelectorAll(s)];
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const slugify=s=>String(s).toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"");
TRIPS.forEach(t=>{t.slug=slugify(t.name);if(!t.district&&window.TRIP_DISTRICTS)t.district=window.TRIP_DISTRICTS[t.n]||"";});
const reduced=window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- geometric route graphics: COMPLETE route, data-driven ----------
   Every waypoint (start → outbound stops → destination → return stops → base)
   is projected through bbox auto-fit into a 600×240 viewport. Nothing truncated. */
const TYPE_COLOR={start:"#00E5FF",break:"#7A3CFF",fuel:"#FF7A18",food:"#FF3D81",mechanic:"#00A8FF",puncture:"#FF3D81",destination:"#D82CFF"};
const ACCENTS=[["#00E5FF","#7A3CFF"],["#7A3CFF","#D82CFF"],["#FF7A18","#FF3D81"],["#00A8FF","#00E5FF"],["#D82CFF","#FF3D81"],["#246BFF","#00E5FF"]];
function accentFor(t){return ACCENTS[(t.n||0)%ACCENTS.length];}
function routeSVG(t){
  try{
  const W=600,H=240,P=36;
  let pts,kinds;
  if(window.RouteGeo){
    const G=RouteGeo.build(t);
    pts=[G.start.coords,...G.waypoints.map(w=>w.coords),G.destination.coords,...G.returnWaypoints.map(w=>w.coords),G.start.coords];
    kinds=["start",...G.waypoints.map(w=>w.type),"destination",...G.returnWaypoints.map(w=>w.type),"start"];
  }else{
    /* fallback: deterministic schematic (route-geo.js always ships, so rarely used) */
    let seed=t.n*7919+13;const rnd=()=>{seed=(seed*9301+49297)%233280;return seed/233280;};
    pts=[];kinds=[];
    const n=4+Math.floor(rnd()*3);
    for(let i=0;i<=n;i++){pts.push([i/n,0.2+rnd()*0.6]);kinds.push(i===0?"start":(i===n?"destination":"break"));}
  }
  const xs=pts.map(p=>p[0]),ys=pts.map(p=>p[1]);
  let minX=Math.min(...xs),maxX=Math.max(...xs),minY=Math.min(...ys),maxY=Math.max(...ys);
  if(maxX-minX<1e-6){minX-=0.01;maxX+=0.01;}
  if(maxY-minY<1e-6){minY-=0.01;maxY+=0.01;}
  const s=Math.min((W-2*P)/(maxX-minX),(H-2*P)/(maxY-minY));
  const ox=P+((W-2*P)-s*(maxX-minX))/2,oy=P+((H-2*P)-s*(maxY-minY))/2;
  const X=x=>ox+(x-minX)*s,Y=y=>oy+(maxY-y)*s;
  const P2=p=>X(p[0]).toFixed(1)+" "+Y(p[1]).toFixed(1);
  const di=kinds.indexOf("destination");
  const outD="M"+pts.slice(0,di+1).map(P2).join(" L");
  const retD="M"+pts.slice(di).map(P2).join(" L");
  const id="g"+t.n;
  const node=(p,k)=>{
    const x=X(p[0]).toFixed(1),y=Y(p[1]).toFixed(1),c=TYPE_COLOR[k]||"#7A3CFF";
    if(k==="start")return `<polygon points="${x},${y-8} ${+x+8},${y} ${x},${+y+8} ${+x-8},${y}" fill="${c}"/>`;
    if(k==="destination")return `<polygon points="${x},${y-9} ${+x+3},${y-3} ${+x+9},${y} ${+x+3},${+y+3} ${x},${+y+9} ${+x-3},${+y+3} ${+x-9},${y} ${+x-3},${y-3}" fill="none" stroke="${c}" stroke-width="2"/>`;
    return `<rect x="${+x-4}" y="${+y-4}" width="8" height="8" transform="rotate(45 ${x} ${y})" fill="none" stroke="${c}" stroke-width="1.8"/>`;
  };
  let nodes="";pts.forEach((p,i)=>{nodes+=node(p,kinds[i]);});
  return `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Complete route diagram for ${esc(t.name)}">
    <defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#00E5FF"/><stop offset=".5" stop-color="#246BFF"/><stop offset=".8" stop-color="#7A3CFF"/><stop offset="1" stop-color="#D82CFF"/></linearGradient></defs>
    <path d="${retD}" fill="none" stroke="#D82CFF" stroke-width="2" stroke-dasharray="6 4" opacity=".85"/>
    <path d="${outD}" fill="none" stroke="url(#${id})" stroke-width="2.6" class="route-draw"/>
    ${nodes}
    <text x="${W-10}" y="${H-10}" text-anchor="end" fill="#8D96AE" font-size="13" font-family="Space Grotesk">${t.total} KM LOOP</text>
    <text x="10" y="18" fill="#8D96AE" font-size="11" font-family="Space Grotesk">△ HYD → ✦ DEST · ${pts.length} PTS</text></svg>`;
  }catch(e){
    /* fallback: never let a malformed route blank the card */
    return `<svg viewBox="0 0 600 240" role="img" aria-label="Route diagram unavailable"><path d="M40 120 L300 120 L560 120" stroke="#00E5FF" stroke-width="2.6"/><polygon points="40,112 48,120 40,128 32,120" fill="#00E5FF"/><polygon points="560,111 563,117 569,120 563,123 560,129 557,123 551,120 557,117" fill="none" stroke="#D82CFF" stroke-width="2"/><text x="590" y="230" text-anchor="end" fill="#8D96AE" font-size="13" font-family="Space Grotesk">△ START ───── ✦ DESTINATION</text></svg>`;
  }
}
function tagsFor(t){
  const s=(t.name+" "+t.dest+" "+t.desc+" "+t.attract).toLowerCase();
  const tags=new Set(t.cat||[]);
  if(/hill|ghat|viewpoint|ananthagiri|vikarabad|narsapur/.test(s))tags.add("hills");
  if(/waterfall|falls|bogatha|kuntala/.test(s))tags.add("waterfalls");
  if(/lake|sagar|reservoir|dam|cheruvu|manair|laknavaram|osman|himayat|shamirpet|pocharam|koilsagar|alisagar/.test(s))tags.add("lakes");
  if(/temple|balaji|church|cathedral|mosque|dargah|swamy|basara|vemulawada|yadadri|chilkur|wargal|dharmapuri|kolanupaka|sangameshwar/.test(s))tags.add("temples");
  if(/fort|bhongir|bidar|rachakonda|tandur|medak|khammam|nirmal|golconda/.test(s))tags.add("forts");
  if(/deer|sanctuary|forest|wildlife|kinnerasani|amrabad|nals?|tiger/.test(s))tags.add("wildlife");
  if(/dhaba|food|biryani|breakfast|lunch|meals|restaurant/.test(s))tags.add("food");
  if(/heritage|unesco|thousand|ramappa|warangal|old city|qutb|charminar/.test(s))tags.add("heritage");
  if(/scenic|sunrise|sunset|lake|hill/.test(s))tags.add("scenic");
  return [...tags];
}
function typeLabel(t){
  const tags=tagsFor(t);
  if(tags.includes("waterfalls"))return"Waterfall";
  if(tags.includes("forts"))return"Fort";
  if(tags.includes("temples"))return"Temple";
  if(tags.includes("lakes"))return"Lake";
  if(tags.includes("wildlife"))return"Wildlife";
  if(tags.includes("hills"))return"Hills";
  if(tags.includes("heritage"))return"Heritage";
  if(tags.includes("food"))return"Food ride";
  return"Scenic";
}

/* ---------- theme ---------- */
function initTheme(){
  const root=document.documentElement;
  const saved=localStorage.getItem("trn-theme");
  root.dataset.theme=saved||"dark";
  syncThemeBtn();
}
function syncThemeBtn(){
  const b=$("#themeToggle");if(!b)return;
  b.textContent=document.documentElement.dataset.theme==="dark"?"☀":"◑";
}
document.addEventListener("click",e=>{
  if(e.target.closest("#themeToggle")){
    const r=document.documentElement;
    r.dataset.theme=r.dataset.theme==="dark"?"light":"dark";
    localStorage.setItem("trn-theme",r.dataset.theme);
    syncThemeBtn();refreshTiles();
  }
});

/* ---------- settings / fuel math (driven by My Bike) ---------- */
const state={mileage:26,petrol:110,riders:2,bikes:2,tank:13,dist:180};
function myBike(){return window.BikeStore?BikeStore.selected():null;}
function syncInputsFromBike(){
  const b=myBike();if(!b||!window.BikeStore)return;
  const S=BikeStore.state;
  if($("#inMileage"))$("#inMileage").value=BikeStore.mileage(b);
  if($("#inTank"))$("#inTank").value=b.tank;
  if($("#inPetrol"))$("#inPetrol").value=S.petrol;
  if($("#petrolPrice"))$("#petrolPrice").value=S.petrol;
  if($("#mileageMode"))$("#mileageMode").value=S.mode;
  if($("#actualMileage"))$("#actualMileage").value=S.actual||"";
}
function readSettings(){
  state.mileage=Math.max(10,parseFloat($("#inMileage")?.value)||26);
  state.petrol=Math.max(1,parseFloat($("#inPetrol")?.value)||110);
  state.riders=Math.max(1,parseInt($("#inRiders")?.value)||1);
  state.bikes=Math.max(1,parseInt($("#inBikes")?.value)||1);
  state.tank=Math.max(5,parseFloat($("#inTank")?.value)||13);
  state.dist=Math.max(10,parseFloat($("#cDist")?.value)||0);
}
const fuelL=km=>km/state.mileage;
const fuelRs=km=>fuelL(km)*state.petrol;
const money=n=>"₹"+Math.round(n).toLocaleString("en-IN");
const gDir=(dest,wp)=>{const u=new URL("https://www.google.com/maps/dir/");u.searchParams.set("api","1");u.searchParams.set("origin",ORIGIN);u.searchParams.set("destination",dest);if(wp&&wp.length)u.searchParams.set("waypoints",wp.join("|"));u.searchParams.set("travelmode","driving");return u.toString();};
const gSearch=q=>"https://www.google.com/maps/search/?api=1&query="+encodeURIComponent(q);
function animateNum(el,to,fmt){
  if(!el)return;
  if(reduced){el.textContent=fmt(to);return;}
  const from=parseFloat(el.dataset.v||0);el.dataset.v=to;
  const t0=performance.now(),dur=600;
  (function f(t){const p=Math.min(1,(t-t0)/dur),e=1-Math.pow(1-p,3);
    el.textContent=fmt(from+(to-from)*e);if(p<1)requestAnimationFrame(f);})(t0);
}

/* ---------- filters ---------- */
const F={q:"",dist:"",dur:"",exp:"",type:"",district:"",sort:"n"};
function chipGroup(id,key){
  const box=$(id);if(!box)return;
  box.addEventListener("click",e=>{
    const b=e.target.closest(".chip");if(!b)return;
    box.querySelectorAll(".chip").forEach(c=>c.setAttribute("aria-pressed","false"));
    b.setAttribute("aria-pressed","true");
    F[key]=b.dataset.dist??b.dataset.dur??b.dataset.exp??b.dataset.type??"";
    renderCards();
  });
}
function matchDist(t){
  if(!F.dist)return true;
  if(F.dist==="u100")return t.total<100;
  if(F.dist==="100-200")return t.total>=100&&t.total<=200;
  if(F.dist==="200-300")return t.total>200&&t.total<=300;
  if(F.dist==="300p")return t.total>300;
  return true;
}
function matchExp(t){
  if(!F.exp)return true;
  if(F.exp==="adv")return (t.cat||[]).includes("adventure")||t.diff==="Challenging";
  if(F.exp==="long")return (t.cat||[]).includes("long")||t.total>300;
  return t.diff===F.exp;
}
function filtered(){
  readSettings();
  let r=TRIPS.filter(t=>t&&t.name&&typeof t.total==="number").filter(t=>{
    if(F.q){
      const hay=(t.name+" "+t.dest+" "+t.desc+" "+t.attract+" "+typeLabel(t)+" "+(t.district||"")).toLowerCase();
      if(!F.q.toLowerCase().split(/\s+/).every(w=>hay.includes(w)))return false;
    }
    if(!matchDist(t))return false;
    if(F.dur&&t.durKey!==F.dur)return false;
    if(!matchExp(t))return false;
    if(F.type&&!tagsFor(t).includes(F.type))return false;
    if(F.district&&(t.district||"")!==F.district)return false;
    return true;
  });
  if(F.sort==="short")r.sort((a,b)=>a.total-b.total);
  else if(F.sort==="long")r.sort((a,b)=>b.total-a.total);
  else if(F.sort==="easy")r.sort((a,b)=>({Easy:0,Moderate:1,Challenging:2}[a.diff]-{Easy:0,Moderate:1,Challenging:2}[b.diff])||a.total-b.total);
  else r.sort((a,b)=>a.n-b.n);
  return r;
}
function diffPill(d){return d==="Easy"?'<span class="pill green">★ Easy</span>':d==="Moderate"?'<span class="pill orange">● Moderate</span>':'<span class="pill red">▲ Challenging</span>';}
function durLabel(k){return k==="half"?"Half day":k==="full"?"1 day":k==="1n"?"2 days":"3 days";}

/* ---------- cards ---------- */
function cardHTML(t,i){
  try{
  if(!t||!t.name)return "";
  const b=myBike();
  const retKm=t.total-t.oneWay;
  const fuel=b?`⬢ ${fuelL(t.total).toFixed(1)} L · ${money(fuelRs(t.total))}`:`<a href="#mybike" style="color:var(--cyan)">◇ SELECT BIKE FOR FUEL</a>`;
  return `<article class="rcard reveal in">
    <div class="rcard-top"><span class="rcard-num">R-${String(t.n).padStart(3,"0")}</span><span class="rcard-cat">${esc(typeLabel(t)).toUpperCase()}</span></div>
    <h3>${esc(t.name)}</h3><p class="rcard-dest">◉ ${esc(t.dest)}${t.district?` · ${esc(t.district)}`:""}</p>
    <div class="rcard-map">${routeSVG(t)}</div>
    <div class="rcard-meta">
      <div><span>Round trip</span><strong>${t.total} KM</strong></div>
      <div><span>Duration</span><strong>${esc(durLabel(t.durKey)).toUpperCase()}</strong></div>
      <div><span>Level</span><strong>${esc(t.diff).toUpperCase()}</strong></div>
    </div>
    <div class="rcard-body">
      <div class="meta-row">${diffPill(t.diff)}<span class="pill teal">◈ OUT ${t.oneWay} · RET ${retKm} KM</span></div>
      <p class="rcard-desc">${esc(t.desc.slice(0,140))}${t.desc.length>140?"…":""}</p>
      <div class="card-foot"><a class="btn btn-primary btn-sm" href="trip.html?slug=${t.slug}">PLAN THIS RIDE →</a><span class="fuel-tag">${fuel}</span></div>
    </div></article>`;
  }catch(e){
    return `<article class="rcard reveal in"><div class="rcard-top"><span class="rcard-num">R-???</span></div><div class="rcard-body"><h3>Route data unavailable</h3><div class="card-foot"><a class="btn btn-primary btn-sm" href="#routes">BROWSE ROUTES →</a></div></div></article>`;
  }
}
function renderCards(){
  const list=filtered();
  $("#countLine").textContent=`${list.length} / ${TRIPS.length} routes`;
  $("#cards").innerHTML=list.map(cardHTML).join("")||`<div class="card"><h3>No rides match</h3><p class="muted">Try widening the distance or clearing the search.</p></div>`;
  renderCompare();
}

/* ---------- featured / long / beginner / adventure ---------- */
function featCard(t,cta){
  return `<div class="hcard"><div class="hcard-art">${routeSVG(t)}</div>
    <div class="hcard-body"><span class="rcard-num">${esc(typeLabel(t)).toUpperCase()} · ${t.total} KM</span>
    <h3>${esc(t.name)}</h3><p>${esc(t.desc.slice(0,90))}…</p>
    <p><strong>${t.total} km</strong> · ${esc(durLabel(t.durKey))} · ${esc(t.diff)}</p>
    <a class="btn btn-glass" href="trip.html?slug=${t.slug}">${cta||"Plan this ride"} →</a></div></div>`;
}
function miniRow(t){
  return `<a class="mini" href="trip.html?slug=${t.slug}">
    <span class="geo-idx">R-${String(t.n).padStart(3,"0")}</span>
    <span><strong>${esc(t.name)}</strong><span class="mut">${t.total} km · ${esc(t.diff)} · ${esc(durLabel(t.durKey))}</span></span><span class="go">→</span></a>`;
}
function renderSections(){
  const bySlug=n=>TRIPS.find(t=>t.n===n);
  const picks=[9,35,16].map(bySlug).filter(Boolean);
  $("#featuredRow").innerHTML=picks.map(t=>`<div class="rcard reveal in">
    <div class="rcard-top"><span class="rcard-num">R-${String(t.n).padStart(3,"0")}</span><span class="rcard-cat">THIS WEEKEND</span></div>
    <h3>${esc(t.name)}</h3><p class="rcard-dest">${t.total} km · ${esc(durLabel(t.durKey))}</p>
    <div class="rcard-map">${routeSVG(t)}</div>
    <div class="rcard-body"><p class="muted" style="margin:0">${esc(t.desc.slice(0,110))}…</p>
    <div class="card-foot"><a class="btn btn-primary btn-sm" href="trip.html?slug=${t.slug}">PLAN THIS RIDE →</a></div></div></div>`).join("");
  const longs=TRIPS.filter(t=>t.total>300||t.durKey==="1n"||t.durKey==="2n").slice(0,10);
  $("#longRow").innerHTML=longs.map(t=>featCard(t,"View route")).join("");
  const beginners=TRIPS.filter(t=>t.diff==="Easy"&&t.total<=130).slice(0,5);
  $("#beginnerRow").innerHTML=beginners.map(miniRow).join("");
  const adv=TRIPS.filter(t=>(t.cat||[]).includes("adventure")||t.diff==="Challenging").slice(0,5);
  $("#adventureRow").innerHTML=adv.map(miniRow).join("");
}

/* ---------- main map: MapLibre + OpenFreeMap (lazy) ---------- */
let map=null;
function pinColor(d){return d==="Easy"?"#00E5FF":d==="Moderate"?"#FF7A18":"#FF3D81";}
function refreshTiles(){/* OpenFreeMap liberty style is theme-neutral; nothing to swap */}
function initMap(){
  const el=$("#mainMap");if(!el||!window.maplibregl||!window.RouteGeo)return;
  if(!("IntersectionObserver" in window)){buildMainMap(el);return;}
  const io=new IntersectionObserver(es=>es.forEach(e=>{
    if(e.isIntersecting){io.disconnect();buildMainMap(el);}
  }),{rootMargin:"300px"});
  io.observe(el);
}
function buildMainMap(el){
  if(map)return;
  try{
  map=new window.maplibregl.Map({container:el,style:window.RouteMap.STYLE,
    center:[79.2,17.9],zoom:6.4,attributionControl:{compact:true}});
  map.addControl(new window.maplibregl.NavigationControl({showCompass:false}),"top-right");
  try{map.addControl(new window.maplibregl.FullscreenControl(),"top-right");}catch(e){}
  map.on("load",()=>{
    TRIPS.forEach(t=>{
      const d=document.createElement("div");d.className="ml-mk";
      d.innerHTML=`<span style="color:${pinColor(t.diff)};font-size:15px">⬢</span>`;
      d.title=`R-${String(t.n).padStart(3,"0")} ${t.name}`;
      const mk=new window.maplibregl.Marker({element:d}).setLngLat([t.lon,t.lat]).addTo(map);
      mk.getElement().addEventListener("click",()=>showPreview(t, true));
    });
  });
  }catch(e){
    map=null;
    el.innerHTML=`<div class="map-preview-empty"><span class="hex">◇</span><h3>MAP TEMPORARILY UNAVAILABLE</h3><p>Route list below is unaffected — pick any route to continue.</p></div>`;
  }
}
function showPreview(t,fly){
  const box=$("#mapPreview");if(!box)return;
  const b=myBike();
  box.innerHTML=`<div class="map-preview-art">${routeSVG(t)}</div>
    <div class="map-preview-body"><span class="rcard-num">R-${String(t.n).padStart(3,"0")} · ${esc(typeLabel(t)).toUpperCase()}</span>
    <h3>${esc(t.name)}</h3><p class="muted">${esc(t.dest)}</p>
    <div class="meta-row">${diffPill(t.diff)}<span class="pill">${t.total} KM ROUND TRIP</span><span class="pill teal">${esc(durLabel(t.durKey)).toUpperCase()}</span></div>
    ${b?`<p class="fuel-tag">⬢ ${b.model}: ${(t.total/BikeStore.mileage(b)).toFixed(1)} L · ${money(t.total/BikeStore.mileage(b)*BikeStore.state.petrol)}</p>`:`<p class="hint">◇ <a href="#mybike">Select a bike</a> for fuel estimate.</p>`}
    <div class="card-foot"><a class="btn btn-primary btn-sm" href="trip.html?slug=${t.slug}">VIEW ROUTE</a>
    <a class="btn btn-ghost btn-sm" target="_blank" rel="noopener" href="${gDir(t.dest)}">NAVIGATE</a></div></div>`;
  if(fly&&map){try{map.flyTo({center:[t.lon,t.lat],zoom:9,duration:reduced?0:900});}catch(e){}}
}

/* ---------- MY BIKE engine ---------- */
const BF={q:"",band:"all"};
const POPULAR=["hero-splendor-plus","honda-sp-125","yamaha-mt-15","tvs-apache-rtr-160","ktm-duke-200","re-classic-350","triumph-scrambler-400x","re-himalayan-450","ktm-390-duke","kawasaki-ninja-650"];
function bikeHex(b){const[a]=accentFor({n:b.cc|0});return `<span class="hex" style="width:56px;height:62px;font-size:.62rem;font-family:var(--font-head);font-weight:700;" aria-hidden="true">${b.cc}<br>CC</span>`;}
function bandOf(cc){return (window.BIKE_BANDS||[]).find(b=>b.id!=="all"&&cc>=b.min&&cc<=b.max);}
function renderBikePill(){
  const b=myBike();
  const pb=$("#plannerBike");
  if(pb)pb.innerHTML=b?`⬢ <strong>${esc(b.brand)} ${esc(b.model)}</strong><span class="muted">· ${b.cc} cc · ${BikeStore.mileage(b)} km/l (${esc(BikeStore.mileageLabel().toLowerCase())}) · <a href="#mybike">change</a></span>`
    :`◇ <strong>NO BIKE SELECTED</strong><span class="muted">· manual cockpit values · <a href="#mybike">select a bike</a></span>`;
}
function renderBikeProfile(){
  const box=$("#bikeProfile");if(!box||!window.BikeStore)return;
  const b=myBike(),S=BikeStore.state;
  if(!b){
    box.innerHTML=`<span class="bp-brand">MY BIKE // GARAGE SLOT EMPTY</span>
    <h3>NO BIKE<br>SELECTED</h3>
    <div class="bp-empty"><p style="color:rgba(255,255,255,.75)">Select your motorcycle to unlock personalized fuel, range and cost telemetry across all 150 routes.</p>
    <div class="about-cta"><a class="btn btn-glass btn-sm" href="bikes.html">OPEN BIKE DATABASE →</a></div>
    <p class="hint" style="color:rgba(255,255,255,.6)">Specs last verified ${esc(window.BIKE_LAST_VERIFIED||"September 2026")} · stored locally only.</p></div>`;
    return;
  }
  const C=window.BikeCalc;
  const m=BikeStore.mileage(b),theo=C.theoretical(b,BikeStore.mileage(b)),use=C.usable(b,BikeStore.mileage(b));
  const stops=C.stops(b,state.dist||180,BikeStore.mileage(b));
  const pct=Math.min(100,Math.round(use/500*100));
  box.innerHTML=`<span class="bp-brand">${esc(b.brand)}</span>
    <h3>${esc(b.model)}</h3>
    <span class="bp-cc">${b.cc} CC · ${esc(b.seg).toUpperCase()}</span>
    <div class="bike-gauge" role="img" aria-label="Planning range ${Math.round(use)} kilometres"><i style="width:${pct}%"></i></div>
    <div class="bp-grid">
      <div class="bp-cell"><span>Tank</span><strong>${b.tank} L</strong></div>
      <div class="bp-cell"><span>Planning mileage</span><strong>${m} km/l</strong></div>
      <div class="bp-cell"><span>Est. range</span><strong>${Math.round(theo)} km</strong></div>
      <div class="bp-cell"><span>Planning range</span><strong>${Math.round(use)} km</strong></div>
      <div class="bp-cell"><span>Cost / km</span><strong>${money(S.petrol/m)}</strong></div>
      <div class="bp-cell"><span>Refuels · ${state.dist||180} km</span><strong>${stops.points.length?stops.points.length+" ×":"0"}</strong></div>
    </div>
    <p class="hint" style="color:rgba(255,255,255,.8)">Claimed ${b.claimed} km/l · planning ${b.planning} km/l${S.mode==="actual"?" · using your actual "+m+" km/l":""} · ${esc(b.src||"")}. Specs verified ${esc(window.BIKE_LAST_VERIFIED||"Sept 2026")}.</p>
    <div class="about-cta"><button class="btn btn-glass btn-sm" id="bpCompare" type="button">+ Compare</button>
    <button class="btn btn-glass btn-sm" id="bpGarage" type="button">+ Group</button></div>`;
  $("#bpCompare")?.addEventListener("click",()=>{BikeStore.toggleCompare(b.id);renderCompareBikes();});
  $("#bpGarage")?.addEventListener("click",()=>BikeStore.garageAdd(b.id));
}
function bikeMatches(b){
  if(BF.band!=="all"){const bd=bandOf(b.cc);if(!bd||bd.id!==BF.band)return false;}
  if(BF.q){const hay=(b.brand+" "+b.model+" "+(b.variant||"")+" "+b.cc+"cc "+b.seg).toLowerCase();
    const toks=BF.q.toLowerCase().split(/\s+/);
    if(!toks.every(w=>{if(/^\d{2,4}$/.test(w)){const n=parseInt(w);return Math.abs(b.cc-n)<=30;}return hay.includes(w);}))return false;}
  return true;
}
function renderBikeBands(){
  const box=$("#bikeBands");if(!box)return;
  box.innerHTML=(window.BIKE_BANDS||[]).map(b=>`<button class="chip" data-band="${b.id}" aria-pressed="${BF.band===b.id}">${esc(b.label)}</button>`).join("");
}
function renderBikePopular(){
  const box=$("#bikePopular");if(!box||!window.BIKES)return;
  box.innerHTML=POPULAR.map(id=>{const b=window.BIKES.find(x=>x.id===id);if(!b)return"";
    return`<button class="chip" data-pop="${b.id}" aria-pressed="false">${esc(b.model)}</button>`;}).join("");
}
function renderBikeResults(){
  const box=$("#bikeResults");if(!box||!window.BIKES)return;
  const list=window.BIKES.filter(b=>b.st==="current").filter(bikeMatches).slice(0,14);
  const total=window.BIKES.filter(bikeMatches).length;
  box.innerHTML=(list.map(b=>{
    const sel=BikeStore.state.bikeId===b.id,inCmp=BikeStore.state.compare.includes(b.id);
    return`<div class="bike-row ${sel?"sel":""}">
      ${bikeHex(b)}
      <div class="binfo"><strong>${esc(b.brand)} ${esc(b.model)}</strong>
      <span>${b.cc} cc · ${b.tank} L · ${b.planning} km/l plan · ~${Math.round(window.BikeCalc.usable(b))} km range</span></div>
      <button class="btn ${sel?"btn-ghost":"btn-primary"} btn-sm" data-bike-sel="${b.id}" type="button">${sel?"✓":"Select"}</button>
      <button class="btn btn-ghost btn-sm" data-bike-cmp="${b.id}" type="button" title="Add to compare">${inCmp?"−":"+"}</button>
    </div>`;}).join("")||'<p class="hint">No bikes match — try a different search or band.</p>')
    +`<p class="hint">Showing ${list.length} of ${total} matching bikes.</p>`;
}
function renderCompareBikes(){
  const tb=$("#compareBikesTable tbody");if(!tb||!window.BikeStore)return;
  const S=BikeStore.state,C=window.BikeCalc,km=state.dist||180;
  const ids=[S.bikeId,...S.compare.filter(id=>id!==S.bikeId)].filter(Boolean).slice(0,4);
  $("#cmpTripHead").textContent=`${km} km fuel`;
  if(!ids.length){tb.innerHTML=`<tr><td colspan="7" class="muted">◇ No bikes selected yet — pick a bike above or tap + on any result.</td></tr>`;return;}
  tb.innerHTML=ids.map(id=>{const b=window.BIKES.find(x=>x.id===id);if(!b)return"";
    const m=(id===S.bikeId)?BikeStore.mileage(b):b.planning;
    return`<tr><td><strong>${esc(b.model)}</strong><br><span class="muted">${b.cc} cc</span></td>
    <td>${m} km/l</td><td>${b.tank} L</td><td>${Math.round(C.usable(b,m))} km</td>
    <td>${C.fuelFor(b,km,m).toFixed(2)} L</td><td>${money(C.costFor(b,km,S.petrol,m))}</td>
    <td>${id===S.bikeId?'<span class="pill green">Yours</span>':`<button class="linkbtn" data-cmp-rm="${id}" type="button">Remove</button>`}</td></tr>`;}).join("");
}
function renderGarage(){
  const list=$("#garageList"),tb=$("#garageTable tbody"),tot=$("#garageTotal");
  if(!list||!tb)return;
  const S=BikeStore.state,C=window.BikeCalc,km=state.dist||180;
  $("#garageTripKm").textContent=km;
  if(!S.garage.length){list.innerHTML='<p class="hint">No bikes in the group yet — use + Group on any bike, or add your bike below.</p>';tb.innerHTML="";if(tot)tot.textContent="";return;}
  list.innerHTML=S.garage.map((id,i)=>{const b=window.BIKES.find(x=>x.id===id);if(!b)return"";
    return`<div class="mini">${bikeHex(b)}
    <span><strong>${i+1}. ${esc(b.brand)} ${esc(b.model)}</strong><span class="mut">${b.cc} cc · ${b.planning} km/l</span></span>
    <button class="linkbtn go" data-garage-rm="${i}" type="button">Remove</button></div>`;}).join("");
  let totF=0,totC=0,minR=Infinity;
  tb.innerHTML=S.garage.map(id=>{const b=window.BIKES.find(x=>x.id===id);if(!b)return"";
    const f=C.fuelFor(b,km),c=C.costFor(b,km,S.petrol),r=C.usable(b);
    totF+=f;totC+=c;minR=Math.min(minR,r);
    return`<tr><td><strong>${esc(b.model)}</strong></td><td>${f.toFixed(2)} L</td><td>${money(c)}</td><td></td></tr>`;}).join("")
    +`<tr><td><strong>Total (${S.garage.length} bikes)</strong></td><td><strong>${totF.toFixed(1)} L</strong></td><td><strong>${money(totC)}</strong></td><td></td></tr>`;
  if(tot)tot.innerHTML=`Total group fuel <strong>${totF.toFixed(1)} L</strong> · cost <strong>${money(totC)}</strong> at ${money(S.petrol)}/L. Shortest planning range in group: <strong>${Math.round(minR)} km</strong> — plan refuel stops within that range.`;
}
function initBike(){
  if(!window.BIKES||!window.BikeStore)return;
  renderBikeBands();renderBikePopular();
  const bs=$("#bikeSearch");
  bs?.addEventListener("input",e=>{BF.q=e.target.value;renderBikeResults();});
  $("#bikeBands")?.addEventListener("click",e=>{const c=e.target.closest("[data-band]");if(!c)return;
    BF.band=c.dataset.band;renderBikeBands();renderBikeResults();});
  $("#bikePopular")?.addEventListener("click",e=>{const c=e.target.closest("[data-pop]");if(!c)return;
    BikeStore.select(c.dataset.pop);document.getElementById("mybike").scrollIntoView({behavior:reduced?"auto":"smooth"});});
  document.addEventListener("click",e=>{
    const s=e.target.closest("[data-bike-sel]");if(s){BikeStore.select(s.dataset.bikeSel);return;}
    const c=e.target.closest("[data-bike-cmp]");if(c){if(!BikeStore.toggleCompare(c.dataset.bikeCmp))alert("Compare holds up to 4 bikes — remove one first.");renderCompareBikes();renderBikeResults();return;}
    const r=e.target.closest("[data-cmp-rm]");if(r){BikeStore.toggleCompare(r.dataset.cmpRm);renderCompareBikes();renderBikeResults();return;}
    const g=e.target.closest("[data-garage-rm]");if(g){BikeStore.garageRemove(+g.dataset.garageRm);return;}
  });
  $("#petrolPrice")?.addEventListener("input",e=>{BikeStore.setPetrol(e.target.value);if($("#inPetrol"))$("#inPetrol").value=BikeStore.state.petrol;renderCalc();});
  $("#mileageMode")?.addEventListener("change",e=>{BikeStore.setMode(e.target.value,$("#actualMileage")?.value);});
  $("#actualMileage")?.addEventListener("input",e=>{if(BikeStore.state.mode!=="actual"){BikeStore.setMode("actual",e.target.value);if($("#mileageMode"))$("#mileageMode").value="actual";}else BikeStore.setMode("actual",e.target.value);});
  $("#garageAddCurrent")?.addEventListener("click",()=>{
    if(!BikeStore.state.bikeId){document.getElementById("bikeSearch")?.focus();
      document.getElementById("mybike").scrollIntoView({behavior:reduced?"auto":"smooth"});return;}
    BikeStore.garageAdd(BikeStore.state.bikeId);});
  $("#garageClear")?.addEventListener("click",()=>BikeStore.garageClear());
  document.addEventListener("trn:bike",()=>{syncInputsFromBike();readSettings();renderBikePill();renderBikeProfile();renderBikeResults();renderCompareBikes();renderCards();renderCalc();});
  document.addEventListener("trn:petrol",()=>{readSettings();renderBikeProfile();renderCompareBikes();renderGarage();renderCards();renderCalc();});
  document.addEventListener("trn:compare",renderCompareBikes);
  document.addEventListener("trn:garage",renderGarage);
  syncInputsFromBike();readSettings();
  renderBikePill();renderBikeProfile();renderBikeResults();renderCompareBikes();renderGarage();
}

/* ---------- planner + compare ---------- */
function renderCalc(){
  readSettings();
  const d=state.dist||0;
  const b=myBike();
  const useRange=b&&window.BikeCalc?window.BikeCalc.usable(b,BikeStore.mileage(b)):state.tank*state.mileage;
  const refuels=d>0&&useRange>0?(d<=useRange?0:Math.ceil(d/useRange)-1):0;
  animateNum($("#oFuel"),fuelL(d),v=>v.toFixed(1)+" L");
  animateNum($("#oCost"),fuelRs(d),v=>money(v));
  animateNum($("#oRange"),useRange,v=>Math.round(v)+" km");
  animateNum($("#oStops"),refuels,v=>Math.round(v)+"");
  const food=700,bikes=state.bikes,riders=state.riders;
  const perBike=fuelRs(d);
  $("#calcOut").innerHTML=`<dt>Fuel / bike</dt><dd>${money(perBike)}</dd><dt>Fuel × ${bikes} bikes</dt><dd>${money(perBike*bikes)}</dd><dt>Food guide</dt><dd>${money(food)} / head / day</dd><dt>Group food (${riders} riders)</dt><dd>${money(food*riders)}</dd>`;
  const echo=$("#fuelPriceEcho");if(echo)echo.textContent="₹"+state.petrol+"/L";
  renderCompare();renderCompareBikes();renderGarage();renderBikeProfile();
}
function renderCompare(){
  const tb=$("#compareTable tbody");if(!tb)return;
  readSettings();
  tb.innerHTML=TRIPS.map(t=>{const ret=Math.max(0,t.total-t.oneWay);return `<tr><td>${t.n}</td><td><strong>${esc(t.dest.split(",")[0])}</strong><br><span class="muted">${esc(t.name)}</span></td><td>${t.oneWay} km</td><td>${ret} km</td><td>${t.total} km</td><td>${esc(t.ride)}</td><td>${esc(t.dur)}</td><td>${esc(t.diff)}</td><td>${fuelL(t.total).toFixed(1)} L</td><td>${money(fuelRs(t.total))}</td></tr>`;}).join("");
}

/* ---------- search / nav ---------- */
function initSearch(){
  const overlay=$("#navSearch"),inp=$("#q"),hero=$("#qHero");
  $("#searchToggle")?.addEventListener("click",()=>{overlay.hidden=!overlay.hidden;if(!overlay.hidden)inp.focus();});
  $("#searchClose")?.addEventListener("click",()=>{overlay.hidden=true;});
  const apply=v=>{F.q=v;const h=$("#heroSearchForm");if(h&&v!==hero.value&&document.activeElement!==hero)hero.value=v;
    if(inp&&v!==inp.value&&document.activeElement!==inp)inp.value=v;renderCards();};
  inp?.addEventListener("input",e=>apply(e.target.value));
  hero?.addEventListener("input",e=>apply(e.target.value));
  $("#heroSearchForm")?.addEventListener("submit",e=>{e.preventDefault();apply(hero.value);document.getElementById("routes").scrollIntoView({behavior:reduced?"auto":"smooth"});});
  $("#menuBtn")?.addEventListener("click",e=>{const m=$("#mobileMenu");m.hidden=!m.hidden;e.currentTarget.setAttribute("aria-expanded",String(!m.hidden));});
  $("#mobileMenu")?.addEventListener("click",()=>{$("#mobileMenu").hidden=true;});
}

/* ---------- misc: reveal, counters, checklist, export ---------- */
function initReveal(){
  const els=$$(".reveal");
  const showAll=()=>els.forEach(el=>el.classList.add("in"));
  if(!("IntersectionObserver" in window)){showAll();return;}
  const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add("in");io.unobserve(e.target);}}),{threshold:.12});
  els.forEach(el=>io.observe(el));
  /* failsafe: never leave content invisible (e.g. observer quirks, errors above) */
  setTimeout(showAll,2500);
}
function initStats(){
  const totalKm=TRIPS.reduce((s,t)=>s+t.total,0);
  const el=$("#statKm");if(el)el.textContent=(totalKm>=10000?(totalKm/1000).toFixed(1).replace(/\.0$/,"")+"k+":""+totalKm)+"+";
  const dd=$("#statDest");if(dd)dd.textContent=new Set(TRIPS.map(t=>t.dest)).size;
  const sr=$("#statRoutes");if(sr)sr.textContent=TRIPS.length;
  $("#ldjson").textContent=JSON.stringify({"@context":"https://schema.org","@type":"ItemList",name:TRIPS.length+" Weekend Motorcycle Routes Across Telangana",numberOfItems:TRIPS.length,itemListElement:TRIPS.map((t,i)=>({"@type":"ListItem",position:i+1,url:"trip.html?slug="+t.slug,item:{"@type":"TouristTrip",name:"Hyderabad to "+t.name+" Bike Ride",description:t.desc}}))});
}
function initSpy(){
  const links=$$(".nav-links a[data-nav]");if(!links.length||!("IntersectionObserver" in window))return;
  const map={mybike:"mybike",routes:"routes",map:"map-section",planner:"planner"};
  const obs=new IntersectionObserver(es=>es.forEach(e=>{
    if(!e.isIntersecting)return;
    links.forEach(a=>a.classList.toggle("active",map[a.dataset.nav]===e.target.id));
  }),{rootMargin:"-40% 0px -55% 0px"});
  Object.values(map).forEach(id=>{const s=document.getElementById(id);if(s)obs.observe(s);});
}
function initChecklist(){
  const items=["Helmets on every rider","Bikes fuelled, tyres + chain checked","DL / RC / insurance / PUC carried","Phones charged, live location shared","Puncture kit + inflator on one bike","Lead + sweep assigned","Return-before-dark plan agreed"];
  $("#gChecks").innerHTML=items.map(g=>`<label><input type="checkbox"> ${esc(g)}</label>`).join("");
}
/* ---------- init ---------- */
initTheme();initSearch();
chipGroup("#chipDist","dist");chipGroup("#chipDur","dur");chipGroup("#chipExp","exp");chipGroup("#chipType","type");
$("#fSort")?.addEventListener("change",e=>{F.sort=e.target.value;renderCards();});
(function initDistrict(){
  const sel=$("#fDistrict");if(!sel)return;
  [...new Set(TRIPS.map(t=>t.district||"").filter(Boolean))].sort().forEach(d=>{
    const o=document.createElement("option");o.value=d;o.textContent=d.toUpperCase();sel.appendChild(o);});
  sel.addEventListener("change",e=>{F.district=e.target.value;renderCards();});
})();
$("#btnReset")?.addEventListener("click",()=>{Object.assign(F,{q:"",dist:"",dur:"",exp:"",type:"",district:"",sort:"n"});$("#q").value="";$("#qHero").value="";$("#fSort").value="n";const fd=$("#fDistrict");if(fd)fd.value="";$$(".chips .chip").forEach(c=>c.setAttribute("aria-pressed",c.dataset.dist===""||c.dataset.dur===""||c.dataset.exp===""||c.dataset.type===""?"true":"false"));renderCards();});
["inMileage","inPetrol","inRiders","inBikes","inTank","cDist"].forEach(id=>$("#"+id)?.addEventListener("input",()=>{
  if(id==="inPetrol"&&window.BikeStore){const v=parseFloat($("#inPetrol").value);if(v>=50&&v<=250){BikeStore.state.petrol=v;try{localStorage.setItem("trn-bike-store-v1",JSON.stringify(BikeStore.state));}catch(e){}const pp=$("#petrolPrice");if(pp)pp.value=v;}}
  renderCalc();
}));
$("#btnFill120")?.addEventListener("click",()=>{$("#cDist").value=120;renderCalc();});
$("#btnFill400")?.addEventListener("click",()=>{$("#cDist").value=400;renderCalc();});
/* init — each stage isolated so one failure can never blank the page */
["renderSections","initBike","renderCards","renderCalc","initMap","initStats","initChecklist","initReveal","initSpy"].forEach(fn=>{
  try{({renderSections,initBike,renderCards,renderCalc,initMap,initStats,initChecklist,initReveal,initSpy})[fn]();}
  catch(e){console.error("[TRN init:"+fn+"]",e&&e.message);}
});
console.log("Routes loaded:",TRIPS.length,"· Bikes:",(window.BIKES||[]).length);
})();
