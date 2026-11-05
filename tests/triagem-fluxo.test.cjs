/* Regressões das quatro etapas informativas do Tri'Go.
 * Execute: node --test tests/triagem-fluxo.test.cjs
 * Utiliza somente módulos nativos do Node.js.
 */
const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");

const source=fs.readFileSync(path.join(__dirname,"..","src","js","triage-flow.js"),"utf8");
const begin=source.indexOf("  function validate(step,answers){");
const end=source.indexOf("  function detailRow(",begin);
assert.ok(begin>=0 && end>begin,"A função de validação deve existir");
const validator=source.slice(begin,end);
function check(step,answers,ack=false){
  const $=selector=>selector==="#triage-ack"?{checked:ack}:null;
  return new Function("$","step","answers",validator+"\nreturn validate(step,answers);")($,step,answers);
}
const full={symptoms:["Febre","Náusea"],duration:"2–3 dias",intensity:"Leve",trend:"Está igual",warning:"Não percebi",notes:""};

test("etapa 1 exige pelo menos um sintoma",()=>{
  assert.match(check(1,{...full,symptoms:[]}),/sintoma/i);
  assert.equal(check(1,full),"");
});
test("etapa 2 exige duração, intensidade e evolução",()=>{
  assert.match(check(2,{...full,duration:""}),/há quanto tempo/i);
  assert.match(check(2,{...full,intensity:""}),/intensidade/i);
  assert.match(check(2,{...full,trend:""}),/evolução/i);
  assert.equal(check(2,full),"");
});
test("etapa 3 exige resposta explícita sobre sinais de alerta",()=>{
  assert.match(check(3,{...full,warning:""}),/alerta/i);
  assert.equal(check(3,{...full,warning:"Sim"}),"");
  assert.equal(check(3,{...full,warning:"Não sei"}),"");
});
test("etapa 4 exige ciência de que não há diagnóstico",()=>{
  assert.match(check(4,full,false),/demonstrativo/i);
  assert.equal(check(4,full,true),"");
});
test("não contém conexão remota para submissão das respostas",()=>{
  assert.doesNotMatch(source,/\bfetch\s*\(|\bXMLHttpRequest\b|\blocalStorage\b/);
});
