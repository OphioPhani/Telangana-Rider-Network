/* TRN route geography — static gazetteer of verified Telangana places [lng,lat]
   + deterministic per-route geo builder. Every route gets a UNIQUE map config:
   start, typed waypoints (break/fuel/food/mechanic/puncture), destination,
   return legs, GeoJSON lines and bounds. Corridor-interpolated points are
   approximations (flagged), gazetteer points are verified towns/landmarks. */
(function(){
"use strict";
/* [key, lng, lat] — towns, junctions, landmarks across Telangana */
const G=[
["saroornagar",78.526,17.356],["kothapet",78.545,17.371],["kothapet water tank",78.545,17.371],
["lb nagar",78.552,17.345],["dilsukhnagar",78.522,17.366],["malakpet",78.488,17.372],
["old city",78.474,17.361],["charminar",78.474,17.361],["kothapet water tank junction",78.545,17.371],
["gandipet",78.298,17.377],["osman sagar",78.298,17.377],["gandipet bund",78.298,17.377],["gandipet x rd",78.320,17.375],
["kokapet",78.332,17.390],["kokapet lakefront",78.332,17.390],["neopolis",78.335,17.395],
["narsingi",78.355,17.385],["manikonda",78.375,17.398],["gachibowli",78.352,17.440],["financial district",78.360,17.425],
["chilkur",78.297,17.354],["chilkur balaji",78.297,17.354],["mrugavani",78.290,17.360],
["himayat sagar",78.347,17.312],["himayat sagar bund",78.347,17.312],
["nagarjuna sagar rd",78.500,17.300],["nh65",78.520,17.340],["inner ring rd",78.480,17.360],
["uppal",78.553,17.398],["ecil",78.583,17.470],["medchal",78.481,17.629],["shamirpet",78.576,17.586],
["shamirpet lake",78.576,17.586],["deer park",78.580,17.590],["hyderabad public school",78.550,17.420],
["shamshabad",78.392,17.260],["shamshabad lake",78.390,17.255],["moinabad",78.276,17.324],
["chevella",78.141,17.306],["chevella temple",78.141,17.306],["anantha padmanabha",78.141,17.306],
["shankarpally",78.130,17.450],["mominpet",78.050,17.480],["vikarabad",77.905,17.908],
["kotpally",77.830,17.950],["kotpally reservoir",77.830,17.950],["ananthagiri",77.865,17.313],["ananthagiri hills",77.865,17.313],
["tandur",77.580,17.240],["tandur fort",77.580,17.240],["shadnagar",78.205,17.072],
["maheshwaram",78.420,17.130],["maheshwaram temple",78.420,17.130],["abdullapurmet",78.660,17.300],
["ramoji",78.685,17.250],["ramoji film city",78.685,17.250],["keesara",78.650,17.520],["keesaragutta",78.660,17.520],
["keesaragutta temple",78.660,17.520],["ghatkesar",78.685,17.450],["bibinagar",78.790,17.470],
["bhongir",78.890,17.510],["bhuvanagiri",78.890,17.510],["bhongir fort",78.890,17.510],
["yadadri",78.940,17.580],["yadagirigutta",78.940,17.580],["kolanupaka",79.040,17.590],["kolanupaka jain temple",79.040,17.590],
["aler",79.050,17.630],["choutuppal",78.900,17.250],["choutuppal lake",78.900,17.250],
["nalgonda",79.260,17.050],["suryapet",79.610,17.140],["kodad",79.960,16.990],
["nagarjuna sagar",79.310,16.575],["vijay vihar",79.310,16.575],["devarakonda",78.930,16.700],
["srisailam",78.870,16.070],["srisailam temple",78.870,16.070],["amrabad",78.830,16.370],
["farahabad",78.700,16.200],["farahabad viewpoint",78.700,16.200],["mannanur",78.780,16.280],
["medak",78.260,18.040],["medak fort",78.260,18.040],["medak cathedral",78.255,18.045],
["pocharam",78.200,18.100],["pocharam dam",78.200,18.100],["sangareddy",78.080,17.610],
["manjeera",78.050,17.620],["manjeera reservoir",78.050,17.620],["zaheerabad",77.610,17.680],
["ketaki sangameshwar",77.600,17.700],["bidar",77.520,17.910],["bidar fort",77.520,17.910],
["ameenpur",78.320,17.520],["ameenpur lake",78.320,17.520],["narsapur",78.280,17.740],["narsapur forest",78.280,17.740],
["wargal",78.620,17.750],["wargal saraswati",78.620,17.750],["markook",78.550,17.950],
["kondapochamma",78.550,17.960],["kondapochamma reservoir",78.550,17.960],["gajwel",78.680,17.850],
["siddipet",78.850,18.100],["komati cheruvu",78.850,18.100],["karimnagar",79.130,18.440],
["lower manair",79.120,18.420],["manair dam",79.120,18.420],["vemulawada",78.860,18.470],
["vemulawada temple",78.860,18.470],["dharmapuri",79.090,18.950],["dharmapuri temple",79.090,18.950],
["ramagundam",79.470,18.800],["godavari riverfront",79.470,18.800],["nizamabad",78.090,18.670],
["alisagar",78.050,18.650],["nizamabad fort",78.090,18.670],["nirmal",78.340,19.090],["nirmal fort",78.340,19.090],
["basara",77.960,18.880],["basara saraswati",77.960,18.880],["kuntala",78.350,19.220],["kuntala waterfall",78.350,19.220],
["warangal",79.590,17.960],["thousand pillar",79.590,17.960],["bhadrakali",79.580,17.950],
["ramappa",79.950,18.260],["palampet",79.950,18.260],["laknavaram",80.060,18.170],["laknavaram lake",80.060,18.170],
["bogatha",80.200,18.050],["bogatha waterfall",80.200,18.050],["khammam",80.150,17.250],
["khammam fort",80.150,17.250],["lakaram lake",80.150,17.250],["bhadrachalam",80.880,17.670],
["bhadrachalam temple",80.880,17.670],["kinnerasani",80.650,17.750],["kinnerasani dam",80.650,17.750],
["jangaon",79.150,17.720],["secunderabad",78.500,17.440],["kompally",78.490,17.550],
["toopran",78.450,17.600],["dabirpura",78.480,17.350],["falaknuma",78.470,17.330],
["tukkuguda",78.420,17.100],["maheshwaram sez",78.415,17.125],["kandukur",78.410,17.190],
["yacharam",78.660,17.050],["ibrahimpatnam",78.620,17.100],["turkayamjal",78.580,17.260],["adergul",78.550,17.280],
["adibatla",78.650,17.230],["orr",78.450,17.380],["nehru orr",78.450,17.380],["shamirpet x rd",78.540,17.560],
["golconda",78.404,17.383],["golconda fort",78.404,17.383],["qutb shahi",78.402,17.394],["salar jung",78.480,17.371],
["chowmahalla",78.471,17.357],["hussain sagar",78.473,17.423],["tank bund",78.473,17.423],["birla mandir",78.469,17.406],
["kbr",78.430,17.423],["nehru zoo",78.449,17.350],["shilparamam",78.381,17.450],["nizam museum",78.474,17.359],
["purani haveli",78.474,17.359],["sanghi",78.684,17.279],["botanical garden",78.335,17.452],["kondapur",78.335,17.452],
["taramati",78.341,17.372],["pochampally",78.807,17.386],["mothkur",79.270,17.450],["ghanpur",79.380,17.850],
["palakurthy",79.430,17.650],["zaffargarh",79.485,17.775],["panagal",79.285,17.095],["cheruvugattu",79.340,17.190],
["vadapally",79.420,16.680],["phanigiri",79.479,17.098],["mattapalli",79.520,16.650],["mellacheruvu",79.750,16.770],
["wyra",80.380,17.180],["palair",79.900,17.230],["nelakondapalli",80.080,17.100],["parnasala",80.890,17.930],
["pakhal",79.990,17.950],["kuravi",79.960,17.660],["inavolu",79.630,17.990],["dharmasagar",79.470,18.000],
["pandavula",79.418,18.235],["kaleshwaram",79.900,18.810],["medaram",80.242,18.253],["mallur",80.550,18.190],
["kondagattu",78.970,18.500],["jagityal",78.910,18.790],["elgandal",79.050,18.420],["odela",79.620,18.470],
["sircilla",78.810,18.380],["mid manair",78.980,18.350],["komuravelli",78.960,17.930],["edupayala",78.100,17.920],
["kulcharam",78.150,17.900],["jharasangam",77.650,17.720],["narayankhed",77.770,18.050],["nizam sagar",77.930,18.470],
["domakonda",78.420,18.250],["yellareddy",78.430,18.080],["dichpally",78.230,18.580],["armoor",78.280,18.790],
["kadem",78.330,19.100],["pochera",78.550,19.320],["jainath",78.560,19.550],["utnoor",78.770,19.370],
["jodeghat",79.880,19.280],["kawal",78.650,19.100],["jannaram",78.650,19.100],["yellampalli",79.480,18.750],
["kannepally",79.550,18.780],["chennur",79.790,18.850],["koilkonda",77.780,16.750],["manyamkonda",77.990,16.630],
["makthal",77.510,16.500],["alampur",78.130,15.880],["beechupally",77.850,16.000],["umamaheshwaram",78.550,16.380],
["mallela",78.580,16.220],["somasila",78.330,16.070],["kollapur",78.330,16.070],["pangal",78.060,16.270],
["durgam",78.386,17.437],["paigah",78.469,17.372],["state museum",78.470,17.398],["public gardens",78.470,17.398],
["fox sagar",78.470,17.530],["kompally",78.470,17.530],["mir alam",78.460,17.340],["kapra",78.570,17.490],
["sainikpuri",78.570,17.490],["kothur",78.350,17.150],["kusumanchi",79.880,17.220],["manuguru",80.750,17.950],
["dornakal",79.990,17.430],["manthani",79.660,18.650],["cheriyal",78.770,17.870],["bodhan",78.550,18.660],
["kerameri",79.100,19.350],["janpahad",79.350,17.050],["shaikpet",78.410,17.400],["tolichowki",78.410,17.400],
["narsingi lake",78.355,17.387],["safilguda",78.530,17.460],["malkajgiri",78.530,17.460],["kazipet",79.510,17.970],
["mahadevpur",79.980,18.800],["kandi",78.080,17.600],["pochampad",78.343,18.967],["sriram sagar",78.343,18.967],
["udaya samudram",79.250,17.060],["pembarthi",79.280,17.720],["padmakshi",79.570,17.990],["kotilingala",79.200,18.430],
["gadwal",77.800,16.230],["jurala",77.708,16.328],["kohir",77.720,17.600],["jadcherla",77.850,16.770],
["kalwakurthy",78.490,16.120],["narketpally",79.340,17.190],["nakrekal",79.340,17.190],["huzurnagar",79.520,16.650],
["miryalaguda",79.420,16.680],["narsampet",79.990,17.950],["parkal",79.980,18.800],["regonda",79.418,18.235]
];
const BASE=[78.526,17.356];
const norm=s=>String(s||"").toLowerCase();
function findPlace(label){
  const s=norm(label);
  let best=null;
  for(const [k,lng,lat] of G){
    if(s.includes(k)){if(!best||k.length>best.k.length)best={k,lng,lat};}
  }
  if(best)return{lng:best.lng,lat:best.lat,verified:true,name:best.k};
  /* "A → B" labels: try destination side, then origin side */
  const parts=s.split(/→|->|↩/).map(x=>x.trim());
  for(const p of parts.slice(1).concat(parts.slice(0,1))){
    for(const [k,lng,lat] of G){
      if(p.includes(k))return{lng,lat,verified:true,name:k};
    }
  }
  return null;
}
function hash(n){let h=n*2654435761%4294967296;return()=>{h^=h<<13;h>>>=0;h^=h>>17;h^=h<<5;h>>>=0;return(h%1000)/1000;};}
function interp(a,b,f,off){return[a[0]+(b[0]-a[0])*f+off[0],a[1]+(b[1]-a[1])*f+off[1]];}
function stopType(label,why){
  const s=norm(label+" "+(why||""));
  if(/start|base|rendezvous/.test(s))return"start";
  if(/fuel|petrol|pump|top-up|topup|tank|refill|refuel/.test(s))return"fuel";
  if(/puncture/.test(s))return"puncture";
  if(/mechanic|workshop|service/.test(s))return"mechanic";
  if(/breakfast|brunch|tiffin|dhaba|food|haritha|lunch|dinner|chai|coffee|tea|meals|snack|restaurant|biryani/.test(s))return"food";
  return"break";
}
/* Build unique geo config for one trip record */
function build(t){
  const dest=[t.lon,t.lat];
  const rnd=hash(t.n||1);
  function placeRow(row,idx,total){
    const[label,why,dist,time,halt]=row;
    const hit=findPlace(label);
    const type=stopType(label,why);
    if(hit)return{name:label,why:why||"",dist:dist||"",time:time||"",halt:halt||"",type,coords:[hit.lng,hit.lat],verified:true};
    const f=(idx+1)/(total+1);
    const off=[(rnd()-0.5)*0.14,(rnd()-0.5)*0.12];
    const c=interp(BASE,dest,f,off);
    return{name:label,why:why||"",dist:dist||"",time:time||"",halt:halt||"",type,coords:c,verified:false};
  }
  const out=(t.route||[]).map((r,i)=>placeRow(r,i,(t.route||[]).length));
  const back=(t.back||[]).map((r,i)=>{
    /* return legs run dest→base: mirror fraction */
    const[label,why,dist,time,halt]=r;
    const hit=findPlace(label);
    const type=stopType(label,why);
    if(hit)return{name:label,why:why||"",dist:dist||"",time:time||"",halt:halt||"",type,coords:[hit.lng,hit.lat],verified:true};
    const f=1-(i+1)/((t.back||[]).length+1);
    const off=[(rnd()-0.5)*0.14,(rnd()-0.5)*0.12];
    return{name:label,why:why||"",dist:dist||"",time:time||"",halt:halt||"",type,coords:interp(BASE,dest,f,off),verified:false};
  });
  /* mechanic markers from verified support towns (no invention) */
  const mech=[];
  if(t.support){
    const s=norm(t.support);
    for(const [k,lng,lat] of G){
      if(k.length>5&&s.includes(k)){mech.push({name:k.replace(/\b\w/g,c=>c.toUpperCase())+" support cluster",why:"Town workshops / puncture — verify live on Maps",dist:"",time:"",halt:"",type:"mechanic",coords:[lng,lat],verified:true});}
      if(mech.length>=3)break;
    }
  }
  /* Separate the two corridor lines laterally so outbound (cyan) and return
     (magenta) render as two distinct journeys instead of one overlapping line.
     Only corridor-interpolated (approximate) points are shifted — verified
     gazetteer towns are never moved. */
  const dx=dest[0]-BASE[0],dy=dest[1]-BASE[1];
  const len=Math.hypot(dx,dy)||1;
  const perp=[-dy/len,dx/len];
  const span=Math.max(Math.abs(dx),Math.abs(dy));
  const sep=Math.min(0.05,Math.max(0.008,span*0.06));
  const shift=(pts,sign)=>{
    pts.forEach(w=>{
      if(w.verified)return;
      w.coords=[w.coords[0]+perp[0]*sep*sign,w.coords[1]+perp[1]*sep*sign];
    });
  };
  shift(out,+1);shift(back,-1);
  const outLineSep=[BASE,...out.map(w=>w.coords),dest];
  const retLineSep=[dest,...back.map(w=>w.coords),BASE];
  const all=[BASE,dest,...out.map(w=>w.coords),...back.map(w=>w.coords),...mech.map(w=>w.coords)];
  const lngs=all.map(c=>c[0]),lats=all.map(c=>c[1]);
  const outKm=(t.oneWay||0),retKm=Math.max(0,(t.total||0)-(t.oneWay||0));
  return{
    id:t.n,slug:t.slug||"",name:t.name,
    start:{name:"Saroornagar, Hyderabad (base)",type:"start",coords:BASE,verified:true},
    waypoints:out,returnWaypoints:back,mechanics:mech,
    destination:{name:t.dest,type:"destination",coords:dest,verified:true},
    outLine:outLineSep,retLine:retLineSep,
    /* Explicit two-leg trip structure: the return leg owns its waypoints and
       geometry — it is never a reversed copy of the outbound leg. */
    outboundRoute:{start:"Saroornagar, Hyderabad",destination:t.dest,
      waypoints:out,coordinates:outLineSep,distanceKm:outKm},
    returnRoute:{start:t.dest,destination:"Saroornagar, Hyderabad",
      waypoints:back,coordinates:retLineSep,distanceKm:retKm},
    totalDistanceKm:(t.total||0),
    approximate:true,
    geometryNote:"Corridor-interpolated approximate planning geometry — not surveyed road centerlines. Verify turn-by-turn navigation in a maps app before departure.",
    bounds:[[Math.min(...lngs),Math.min(...lats)],[Math.max(...lngs),Math.max(...lats)]],
    verifiedCount:out.filter(w=>w.verified).length+back.filter(w=>w.verified).length
  };
}
window.RouteGeo={BASE,build,findPlace,stopType,GAZETTEER_SIZE:G.length};
})();
