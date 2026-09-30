/* TRN bike store — shared localStorage state. No default bike: initial state is
   NO BIKE SELECTED. Local only, no tracking. */
(function(){
"use strict";
const KEY="trn-bike-store-v1";
const DEFAULT_PETROL=110;
function load(){
  try{const s=JSON.parse(localStorage.getItem(KEY)||"{}");return Object.assign(
    {bikeId:null,petrol:DEFAULT_PETROL,mode:"db",actual:"",compare:[],garage:[]},s);}
  catch(e){return{bikeId:null,petrol:DEFAULT_PETROL,mode:"db",actual:"",compare:[],garage:[]};}
}
let S=load();
function save(){try{localStorage.setItem(KEY,JSON.stringify(S));}catch(e){}}
const Store={
  get state(){return S;},
  bikes(){return window.BIKES||[];},
  get(id){if(!id)return null;return this.bikes().find(b=>b.id===id)||null;},
  selected(){return this.get(S.bikeId);},
  select(id){S.bikeId=id;save();document.dispatchEvent(new CustomEvent("trn:bike",{detail:{id}}));},
  clear(){S.bikeId=null;save();document.dispatchEvent(new CustomEvent("trn:bike",{detail:{id:null}}));},
  setPetrol(v){v=Math.max(1,parseFloat(v)||DEFAULT_PETROL);S.petrol=v;save();document.dispatchEvent(new CustomEvent("trn:petrol",{detail:{v}}));},
  setMode(mode,actual){S.mode=mode;if(actual!==undefined)S.actual=actual;save();document.dispatchEvent(new CustomEvent("trn:bike",{detail:{mode}}));},
  /* effective planning mileage for a bike under current override mode */
  mileage(bike){if(!bike)return 26;if(S.mode==="actual"){const a=parseFloat(S.actual);if(a>=10&&a<=120)return a;}return bike.planning;},
  mileageLabel(){return S.mode==="actual"?"My actual mileage":"Database planning mileage";},
  toggleCompare(id){const i=S.compare.indexOf(id);if(i>=0)S.compare.splice(i,1);else{if(S.compare.length>=4)return false;S.compare.push(id);}save();document.dispatchEvent(new CustomEvent("trn:compare"));return true;},
  garageAdd(id){if(!id||S.garage.includes(id))return;S.garage.push(id);save();document.dispatchEvent(new CustomEvent("trn:garage"));},
  garageRemove(i){S.garage.splice(i,1);save();document.dispatchEvent(new CustomEvent("trn:garage"));},
  garageClear(){S.garage=[];save();document.dispatchEvent(new CustomEvent("trn:garage"));}
};
window.BikeStore=Store;
})();
