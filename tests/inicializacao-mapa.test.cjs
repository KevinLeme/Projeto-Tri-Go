/* Regressões de execução: seletores múltiplos devem retornar arrays.
 * Execute: node --test tests/inicializacao-mapa.test.cjs
 */
const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const source=fs.readFileSync(path.join(__dirname,"..","src/js/demo-experience.js"),"utf8");
function extract(start,end){
  const a=source.indexOf("  function "+start+"(){");
  const b=source.indexOf("  function "+end+"(){",a+12);
  assert.ok(a>=0 && b>a,"Função ausente: "+start);
  return source.slice(a,b);
}
function element(){
  return {
    dataset:{},attrs:{},hidden:false,
    classList:{changes:[],toggle(name,active){this.changes.push([name,active]);}},
    setAttribute(name,value){this.attrs[name]=value;},
    textContent:"",innerHTML:"",value:""
  };
}
test("prepareHome não interrompe a inicialização ao encontrar cards de especialidade",()=>{
  const buttons=[element(),element(),element()];
  buttons[0].textContent="Ortopedia";
  buttons[1].textContent="Clínica geral";
  buttons[2].textContent="Pediatria";
  const home=element();
  const $=key=>key===".preview-appointments"?home:undefined;
  const $$=key=>key==="#screen-home .specialty-grid button"?buttons:[];
  const callback=new Function("$","$$",extract("prepareHome","prepareResult")+"\nreturn prepareHome;")($,$$);
  assert.doesNotThrow(callback);
  assert.equal(buttons[0].attrs["aria-label"],"Ver catálogo de especialidades. Destaque: Ortopedia");
  assert.equal(buttons[1].attrs["aria-label"],"Ver catálogo de especialidades. Destaque: Clínica geral");
  assert.match(home.attrs["aria-label"],/exemplificativos/);
});
test("renderMapView alterna botões de lista e mapa sem exceção de forEach",()=>{
  const wrapper=element(),listBox=element(),screen=element(),toggle=element();
  const views=[element(),element()];
  views[0].dataset.view="list";
  views[1].dataset.view="map";
  const fallback=element(),tile=element(),input=element(),sidebar=element();
  const items={
    "#demo-map-wrap":wrapper,"#clinic-cards":listBox,"#screen-clinics":screen,
    "#desktop-map-toggle":toggle,"#trigo-map-fallback":fallback,
    "#trigo-map":tile,"#map-search":input,"#map-clinic-list":sidebar
  };
  const $=key=>items[key]||null;
  const $$=key=>key==="[data-view]"?views:key===".ride-chip"?[]:[];
  const state={mapMode:"map",search:"",sort:"distance",insuranceOnly:false};
  let rendered=0;
  const callback=new Function("$","$$","state","initMap","filteredClinics","renderFeaturedClinic","safe","money","svgIcon","setTimeout",
    extract("renderMapView","locateOnMap")+"\nreturn renderMapView;")(
      $,$$,state,()=>false,()=>[],()=>{rendered++;},String,String,()=>"",()=>{}
    );
  assert.doesNotThrow(callback);
  assert.equal(wrapper.hidden,false);
  assert.equal(listBox.hidden,true);
  assert.equal(views[1].attrs["aria-pressed"],"true");
  assert.equal(toggle.textContent,"☷ Ver lista");
  assert.equal(rendered,1);
  state.mapMode="list";
  assert.doesNotThrow(callback);
  assert.equal(wrapper.hidden,true);
  assert.equal(listBox.hidden,false);
  assert.equal(views[0].attrs["aria-pressed"],"true");
  assert.equal(toggle.textContent,"⌖ Abrir mapa");
});
test("nenhum querySelector singular pode ser iterado como uma coleção",()=>{
  assert.doesNotMatch(source,/(?<!\$)\$\((?:[^()]|\([^()]*\))*\)\.(?:forEach|map|filter|reduce|some|every)/);
  assert.match(source,/\$\$\("#screen-home \.specialty-grid button"\)\.forEach/);
  assert.match(source,/\$\$\("\[data-view\]"\)\.forEach/);
});
