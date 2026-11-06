/* Testes de regressão do catálogo de especialidades Tri'Go.
 * Execute: node --test tests/especialidades.test.cjs
 */
const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.join(__dirname,"..");
const html=fs.readFileSync(path.join(root,"app.html"),"utf8");
const app=fs.readFileSync(path.join(root,"src/js/app.js"),"utf8");
const map=fs.readFileSync(path.join(root,"src/js/demo-experience.js"),"utf8");
const moduleSource=fs.readFileSync(path.join(root,"src/js/specialties.js"),"utf8");

function sourceBetween(source,start,end){
  const a=source.indexOf(start);
  const b=source.indexOf(end,a+start.length);
  assert.ok(a>=0&&b>a,"Função ou delimitador ausente: "+start);
  return source.slice(a,b);
}
const catalogSource=sourceBetween(moduleSource,"  const catalog=[","  const paths={");
const catalog=new Function(catalogSource+"return catalog;")();
const sampleClinics=[
  {id:"one",name:"Clínica Geral",area:"Centro",specialty:"Clínica geral",insurance:"Particular",price:160,distance:1,availability:"Hoje",rating:4.7},
  {id:"two",name:"Ortopedista",area:"Centro",specialty:"Ortopedia",insurance:"Unimed",price:200,distance:2,availability:"Amanhã",rating:4.8},
  {id:"three",name:"Pediatria",area:"Centro",specialty:"Pediatria",insurance:"Bradesco",price:150,distance:3,availability:"Hoje",rating:4.9}
];
test("Ver todas e os três cartões abrem o catálogo antes do mapa",()=>{
  assert.match(html,/Especialidades<\/h2><button[^>]+data-go="specialties"/);
  for(const spec of ["Clínica geral","Pediatria","Ortopedia"]){
    assert.ok(html.includes('data-catalog-specialty="'+spec+'"'));
  }
  assert.ok(app.includes('"specialties"'));
  assert.ok(html.includes('id="screen-specialties"'));
});
test("catálogo tem 18 especialidades distintas e pesquisa",()=>{
  assert.equal(catalog.length,18);
  assert.equal(new Set(catalog.map(x=>x.name)).size,catalog.length);
  assert.match(html,/id="specialty-search"/);
  assert.match(moduleSource,/data-specialty-mode/);
});
test("filtro exato no render das clínicas evita mostrar outras especialidades",()=>{
  const source=sourceBetween(app,"  function renderClinics() {","  function renderClinicDetails()");
  const state={search:"",insuranceOnly:false,sort:"distance",specialtyFilter:"Pediatria"};
  const nodes={
    "#clinic-cards":{innerHTML:""},
    "#clinic-count":{textContent:""},
    "#clinic-search":{value:""}
  };
  const $=selector=>nodes[selector];
  const $$=()=>[];
  new Function("$","$$","clinics","state","clinicCard",source+"renderClinics();")(
    $,$$,sampleClinics,state,c=>"<div>"+c.specialty+"</div>"
  );
  assert.equal(nodes["#clinic-cards"].innerHTML,"<div>Pediatria</div>");
  assert.equal(nodes["#clinic-count"].textContent,"1 exemplo(s)");
});
test("filtro também vale para os marcadores do mapa",()=>{
  const source=sourceBetween(map,"  function filteredClinics(){","  function initMap(){");
  const state={search:"",sort:"distance",specialtyFilter:"Ortopedia",insuranceOnly:false};
  const result=new Function("clinics","state",source+"return filteredClinics();")(sampleClinics,state);
  assert.deepEqual(result.map(c=>c.specialty),["Ortopedia"]);
});
test("seleção de especialidade existente leva ao mapa e limpa pesquisa anterior",()=>{
  const source=sourceBetween(moduleSource,"  function chooseSpecialty(name){","  function syncClinicsFilter(){");
  const state={search:"consulta",sort:"price",specialtyFilter:"",mapMode:"list",insuranceOnly:true};
  let route="";
  const api={clinics:sampleClinics,state,navigate:next=>route=next};
  new Function("catalog","api","focusSuggestion","setNotice","$$","grid","notice",source+'chooseSpecialty("Ortopedia");')(
    catalog,api,"",()=>{},()=>[],null,{scrollIntoView(){}}
  );
  assert.equal(route,"clinics");
  assert.equal(state.specialtyFilter,"Ortopedia");
  assert.equal(state.search,"");
  assert.equal(state.mapMode,"map");
  assert.equal(state.insuranceOnly,false);
});
test("especialidades sem clínicas não apresentam agendamento falso",()=>{
  const source=sourceBetween(moduleSource,"  function chooseSpecialty(name){","  function syncClinicsFilter(){");
  let route="",message="";
  const state={search:"",specialtyFilter:"",mapMode:"map",insuranceOnly:false};
  const api={clinics:sampleClinics,state,navigate:next=>route=next};
  new Function("catalog","api","focusSuggestion","setNotice","$$","grid","notice",source+'chooseSpecialty("Cardiologia");')(
    catalog,api,"",m=>message=m,()=>[],null,{scrollIntoView(){}}
  );
  assert.equal(route,"");
  assert.equal(state.specialtyFilter,"");
  assert.match(message,/Ainda não há clínicas fictícias/);
});
