/* Regressão para os problemas de filtros e navegação do mapa.
 * Executar na raiz: node --test tests/clinicas-interacao.test.cjs
 */
const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const source=fs.readFileSync(path.join(__dirname,"..","src","js","app.js"),"utf8");
const map=fs.readFileSync(path.join(__dirname,"..","src","js","demo-experience.js"),"utf8");
const from=source.indexOf("  function renderClinics() {");
const until=source.indexOf("  function renderClinicDetails()",from);
assert.ok(from>=0&&until>from,"A função de renderização das clínicas precisa existir");
const renderClinicsSource=source.slice(from,until);

function simulateRender(sort="distance",insuranceOnly=false){
  const elements={"#clinic-cards":{innerHTML:""},"#clinic-count":{textContent:""},"#clinic-search":{value:""}};
  const buttons=["distance","price","available","insurance"].map(sort=>({dataset:{sort},classList:{toggle(name,on){this.active=on;}}}));
  const $=selector=>elements[selector];
  const $$=selector=>selector===".filter-button"?buttons:[];
  const state={search:"",sort,insuranceOnly};
  const clinics=[
    {id:"a",name:"Alpha",area:"A",specialty:"Clínica geral",insurance:"Unimed",price:220,distance:1,availability:"Amanhã",rating:4.6},
    {id:"b",name:"Beta",area:"B",specialty:"Clínica geral",insurance:"Particular",price:120,distance:5,availability:"Hoje",rating:4.9}
  ];
  const fn=new Function("$","$$","clinics","state","clinicCard",renderClinicsSource+"\nrenderClinics();");
  fn($,$$,clinics,state,c=>"<div>"+c.id+"</div>");
  return {html:elements["#clinic-cards"].innerHTML,count:elements["#clinic-count"].textContent,buttons};
}
test("listar clínicas não lança exceção no seletor de filtros",()=>{
  const rendered=simulateRender();
  assert.equal(rendered.count,"2 exemplo(s)");
  assert.deepEqual(rendered.buttons.map(b=>b.classList.active),[true,false,false,false]);
});
test("menor preço muda de fato a ordem dos cartões",()=>{
  assert.equal(simulateRender("distance").html,"<div>a</div><div>b</div>");
  assert.equal(simulateRender("price").html,"<div>b</div><div>a</div>");
});
test("convênio altera os resultados da lista",()=>{
  const rendered=simulateRender("distance",true);
  assert.equal(rendered.count,"1 exemplo(s)");
  assert.equal(rendered.html,"<div>a</div>");
  assert.equal(rendered.buttons.at(-1).classList.active,true);
});
test("clínica da lista abre o detalhe, e marcador oferece agendamento",()=>{
  assert.match(map,/api\.chooseClinic\(button\.dataset\.mapFocus\)/);
  assert.match(map,/popup\.querySelector\("button"\)\.addEventListener\("click"/);
  assert.match(map,/api\.chooseClinic\(c\.id\)/);
});
test("desktop habilita zoom pelo scroll e exibe controle superior",()=>{
  assert.match(map,/scrollWheelZoom:window\.matchMedia\("\(min-width:901px\)"\)\.matches/);
  assert.match(map,/L\.control\.zoom\(\{position:"topright"\}\)/);
});
