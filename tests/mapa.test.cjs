/* Regressões de filtros do mapa Tri'Go.
 * Execute na raiz: node --test tests/mapa.test.cjs
 */
const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const source=fs.readFileSync(path.join(__dirname,"..","src","js","demo-experience.js"),"utf8");
const start=source.indexOf("  function filteredClinics(){");
const end=source.indexOf("  function initMap(){",start);
assert.ok(start>=0&&end>start,"Função de filtros do mapa não encontrada");
const filterSource=source.slice(start,end);
const clinicList=[
 {id:"a",name:"Clínica Alpha",area:"Centro",specialty:"Ortopedia",insurance:"Unimed",distance:8,price:200,rating:4.4,availability:"Amanhã"},
 {id:"b",name:"Clínica Beta",area:"Jardins",specialty:"Pediatria",insurance:"Particular",distance:1,price:100,rating:4.9,availability:"Em 3 dias"},
 {id:"c",name:"Centro Saúde",area:"Bela Vista",specialty:"Clínica geral",insurance:"Bradesco",distance:3,price:150,rating:4.6,availability:"Hoje"}
];
function list(overrides={}){
 const state={search:"",insuranceOnly:false,sort:"distance",...overrides};
 return new Function("state","clinics",filterSource+"\nreturn filteredClinics();")(state,clinicList).map(c=>c.id);
}
test("ordem de distância coloca o exemplo mais próximo primeiro",()=>assert.deepEqual(list(),["b","c","a"]));
test("filtro de preço reorganiza cartões e marcadores",()=>assert.deepEqual(list({sort:"price"}),["b","c","a"]));
test("disponibilidade prioriza Hoje, depois Amanhã",()=>assert.deepEqual(list({sort:"available"}),["c","a","b"]));
test("pesquisa encontra nome ou especialidade",()=>assert.deepEqual(list({search:"pediatria"}),["b"]));
test("filtro de convênio esconde particular no modo exemplo",()=>assert.deepEqual(list({insuranceOnly:true}),["c","a"]));
test("pesquisa sem resultados retorna lista vazia",()=>assert.deepEqual(list({search:"inexistente"}),[]));
