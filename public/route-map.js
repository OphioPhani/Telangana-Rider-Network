/* TRN reusable MapLibre component — <RouteMap route={geo} /> equivalent.
   Renders one route's unique geo config on OpenFreeMap (no API key):
   outbound line (cyan), return line (magenta), geometric markers, popups,
   zoom + fullscreen controls, auto-fit bounds. */
(function(){
"use strict";
const STYLE="https://tiles.openfreemap.org/styles/liberty";
const ATTR='© <a href="https://openfreemap.org/" target="_blank">OpenFreeMap</a> © <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>';
const GLYPH={start:["◆","#00E5FF","START"],break:["◇","#7A3CFF","BREAK"],fuel:["⬢","#FF7A18","FUEL"],
  food:["⬡","#FF3D81","FOOD"],mechanic:["⚙","#00A8FF","MECHANIC"],puncture:["✚","#FF3D81","PUNCTURE"],
  destination:["★","#D82CFF","DESTINATION"]};
function el(tag,cls,html){const e=document.createElement(tag);if(cls)e.className=cls;if(html!=null)e.innerHTML=html;return e;}
function markerEl(type){
  const[g,color]=GLYPH[type]||GLYPH.break;
  const d=el("div","ml-mk");
  d.innerHTML=`<span style="color:${color}">${g}</span>`;
  return d;
}
function popupHTML(w){
  const[g,color,label]=GLYPH[w.type]||GLYPH.break;
  return `<div class="ml-pop"><span class="ml-type" style="color:${color}">${g} ${label}</span>`
    +`<strong>${String(w.name||"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}</strong>`
    +(w.why?`<span>${String(w.why).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}</span>`:"")
    +((w.dist&&w.dist!=="—")?`<span class="mut">LEG ${String(w.dist).replace(/[&<>"]/g,"")}</span>`:"")
    +((w.halt&&w.halt!=="—")?`<span class="mut">HALT ${String(w.halt).replace(/[&<>"]/g,"")} MIN</span>`:"")
    +(w.verified===false?`<span class="mut">CORRIDOR POINT (APPROX)</span>`:"")
    +`</div>`;
}
/* Full round-trip map. Returns a controller {map, setMode, fitBoth, geo}.
   setMode("both"|"outbound"|"return") toggles the two neon journey lines and
   their markers; "both" is the default and fits the complete round-trip box. */
function renderRouteMap(container,geo,opts){
  opts=opts||{};
  if(!window.maplibregl||!container||!geo)return null;
  const ctrl={map:null,mode:"both",geo,setMode:()=>{},fitBoth:()=>{}};
  const map=new window.maplibregl.Map({
    container,style:STYLE,attributionControl:{compact:true},
    bounds:geo.bounds,fitBoundsOptions:{padding:opts.padding||44},
    dragPan:!opts.static,scrollZoom:!opts.static,keyboard:!opts.static
  });
  ctrl.map=map;
  map.addControl(new window.maplibregl.NavigationControl({showCompass:false}),"top-right");
  if(opts.fullscreen!==false){try{map.addControl(new window.maplibregl.FullscreenControl(),"top-right");}catch(e){}}
  const outMarkers=[],retMarkers=[];
  ctrl.fitBoth=()=>{try{map.fitBounds(geo.bounds,{padding:opts.padding||44});}catch(e){}};
  /* Leg visibility: "both" (default) | "outbound" | "return". Start,
     destination and support markers stay visible in every mode. */
  ctrl.setMode=mode=>{
    ctrl.mode=(mode==="outbound"||mode==="return")?mode:"both";
    const showOut=ctrl.mode!=="return",showRet=ctrl.mode!=="outbound";
    [["out",showOut],["out-glow",showOut],["ret",showRet],["ret-glow",showRet]].forEach(([id,vis])=>{
      try{if(map.getLayer(id))map.setLayoutProperty(id,"visibility",vis?"visible":"none");}catch(e){}
    });
    outMarkers.forEach(m=>{try{m.getElement().style.display=showOut?"":"none";}catch(e){}});
    retMarkers.forEach(m=>{try{m.getElement().style.display=showRet?"":"none";}catch(e){}});
    ctrl.fitBoth();
  };
  map.on("load",()=>{
    map.addSource("out",{type:"geojson",data:{type:"Feature",geometry:{type:"LineString",coordinates:geo.outLine}}});
    map.addLayer({id:"out-glow",type:"line",source:"out",paint:{"line-color":"#00E5FF","line-width":9,"line-opacity":0.22}});
    map.addLayer({id:"out",type:"line",source:"out",paint:{"line-color":"#00E5FF","line-width":3.5}});
    map.addSource("ret",{type:"geojson",data:{type:"Feature",geometry:{type:"LineString",coordinates:geo.retLine}}});
    map.addLayer({id:"ret-glow",type:"line",source:"ret",paint:{"line-color":"#D82CFF","line-width":9,"line-opacity":0.20}});
    map.addLayer({id:"ret",type:"line",source:"ret",paint:{"line-color":"#D82CFF","line-width":3,"line-dasharray":[2.5,2]}});
    const pts=[{...geo.start,leg:"shared"},...geo.waypoints.map(w=>({...w,leg:"out"})),
      ...geo.mechanics.map(w=>({...w,leg:"shared"})),
      ...geo.returnWaypoints.map(w=>({...w,leg:"ret"})),{...geo.destination,leg:"shared"}];
    const seen=new Set();
    pts.forEach(w=>{
      const k=w.coords.join(",")+w.type;
      if(seen.has(k))return;seen.add(k);
      const m=new window.maplibregl.Marker({element:markerEl(w.type)})
        .setLngLat(w.coords)
        .setPopup(new window.maplibregl.Popup({offset:18,maxWidth:"260px"}).setHTML(popupHTML(w)))
        .addTo(map);
      if(w.leg==="out")outMarkers.push(m);else if(w.leg==="ret")retMarkers.push(m);
    });
    /* Re-apply the requested mode once layers/markers exist (user may have
       switched before tiles loaded). */
    if(ctrl.mode!=="both")ctrl.setMode(ctrl.mode);
    else ctrl.fitBoth();
  });
  return ctrl;
}
window.RouteMap={render:renderRouteMap,STYLE,ATTRIBUTION:ATTR,GLYPH};
})();
