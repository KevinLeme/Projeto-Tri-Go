/* Teste do provedor real de tiles do Tri-Go.
 * node --test tests/mapa-tiles.test.cjs
 */
const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const src=fs.readFileSync(path.join(__dirname,"..","src/js/demo-experience.js"),"utf8");
function initialize(){
  const first=src.indexOf("  function initMap(){");
  const last=src.indexOf("  function renderFeaturedClinic(){",first);
  assert.ok(first>=0&&last>first);
  const notice={
    hidden:true,
    dataset:{},
    textContent:"",
    classList:{classes:new Set(),add(x){this.classes.add(x)},remove(x){this.classes.delete(x)}}
  };
  let url="",options;
  const listeners={};
  let layerAdded=false;
  const layer={
    on(name,fn){listeners[name]=fn;return this},
    addTo(){layerAdded=true;return this}
  };
  const L={
    map(){return {setView(){return this}}},
    control:{zoom(){return {addTo(){}}}},
    tileLayer(tileURL,opts){url=tileURL;options=opts;return layer}
  };
  const $=q=>q==="#trigo-map"?{}:q==="#map-note"?notice:null;
  const window={L,matchMedia:()=>({matches:false})};
  const load=new Function("$","L","window","map",src.slice(first,last)+"\nreturn initMap();");
  return {success:load($,L,window,null),url,options,listeners,notice,layerAdded};
}
test("mapa usa camada OpenStreetMap sem necessidade de chave",()=>{
  const result=initialize();
  assert.equal(result.success,true);
  assert.equal(result.url,"https://tile.openstreetmap.org/{z}/{x}/{y}.png");
  assert.equal(result.layerAdded,true);
  assert.match(result.options.attribution,/OpenStreetMap/);
  assert.doesNotMatch(src,/basemaps\.cartocdn\.com/);
});
test("falhas reais de rede são avisadas e aviso some ao restabelecer tiles",()=>{
  const {listeners,notice}=initialize();
  listeners.tileerror();
  listeners.tileerror();
  assert.equal(notice.hidden,true);
  listeners.tileerror();
  assert.equal(notice.hidden,false);
  assert.match(notice.textContent,/mapa está indisponível/);
  listeners.tileload();
  assert.equal(notice.hidden,true);
});
