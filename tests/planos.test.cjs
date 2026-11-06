/* Testes de regressão para os preços demonstrativos do Tri'Go.
 * Execute: node --test tests/planos.test.cjs
 */
const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.join(__dirname,"..");
const html=fs.readFileSync(path.join(root,"app.html"),"utf8");
const pricing=fs.readFileSync(path.join(root,"src/js/pricing.js"),"utf8");
const portal=fs.readFileSync(path.join(root,"src/js/portal.js"),"utf8");
function mount(){
  const sections={},status={},handlers={};
  const planIDs=["clinic-basic","clinic-management","clinic-plus","doctor-basic","doctor-pro"];
  const buttons={};
  const cards=planIDs.map(id=>{
    const button={textContent:"",attributes:{},setAttribute(k,v){this.attributes[k]=v;}};
    buttons[id]=button;
    return {dataset:{planCard:id},classList:{selected:false,toggle(key,v){this.selected=v;}},querySelector:()=>button};
  });
  sections["clinic-pricing"]={querySelectorAll:()=>cards.slice(0,3)};
  sections["professional-pricing"]={querySelectorAll:()=>cards.slice(3)};
  status["clinic-pricing-choice"]={textContent:""};
  status["doctor-pricing-choice"]={textContent:""};
  const document={
    getElementById:id=>sections[id]||status[id]||null,
    addEventListener:(event,callback)=>{handlers[event]=callback;}
  };
  const window={};
  new Function("window","document",pricing)(window,document);
  return {window,handlers,cards,buttons,status};
}
test("planos visíveis para clínicas com valores mensais propostos",()=>{
  const area=html.slice(html.indexOf('id="clinic-pricing"'),html.indexOf('class="clinic-portal-highlights"'));
  for(const text of ["R$ 0/mês","R$ 99","R$ 199","/mês"]){
    assert.ok(area.includes(text),"Valor ausente: "+text);
  }
  assert.equal((area.match(/data-plan-choice=/g)||[]).length,3);
});
test("planos visíveis para médicos com R$ 0 e R$ 49",()=>{
  const area=html.slice(html.indexOf('id="professional-pricing"'),html.indexOf('class="professional-demo-summary"'));
  assert.ok(area.includes("R$ 0/mês"));
  assert.ok(area.includes("R$ 49"));
  assert.equal((area.match(/data-plan-choice=/g)||[]).length,2);
});
test("planos têm rótulo de valores em estudo, sem compra ou pagamento",()=>{
  assert.match(html,/Preços em estudo/);
  assert.match(html,/nenhum pagamento é processado/);
  assert.match(pricing,/Não registra assinatura, não cobra/);
  assert.doesNotMatch(pricing,/\bfetch\s*\(|\bXMLHttpRequest\b|localStorage|sessionStorage/);
});
test("escolher Gestão seleciona R$ 99, desmarcando o Básico",()=>{
  const {window,handlers,cards,buttons,status}=mount();
  const trigger={dataset:{planChoice:"clinic-management"}};
  handlers.click({target:{closest:()=>trigger},preventDefault(){}});
  assert.equal(window.TriGoPricing.getSelected("clinic").value,99);
  assert.equal(cards[0].classList.selected,false);
  assert.equal(cards[1].classList.selected,true);
  assert.equal(buttons["clinic-management"].attributes["aria-pressed"],"true");
  assert.match(status["clinic-pricing-choice"].textContent,/Gestão — R\$ 99\/mês/);
});
test("médico Pro é independente da escolha da clínica",()=>{
  const {window,handlers,status}=mount();
  const trigger={dataset:{planChoice:"doctor-pro"}};
  handlers.click({target:{closest:()=>trigger},preventDefault(){}});
  assert.equal(window.TriGoPricing.getSelected("doctor").value,49);
  assert.equal(window.TriGoPricing.getSelected("clinic").value,0);
  assert.match(status["doctor-pricing-choice"].textContent,/Pro — R\$ 49\/mês/);
});
test("a prévia da solicitação usa o plano escolhido sem gravar dados",()=>{
  assert.match(portal,/data-preview-plan/);
  assert.match(portal,/TriGoPricing\?\.getSelected\("clinic"\)/);
  assert.doesNotMatch(portal,/\bfetch\s*\(|\bXMLHttpRequest\b/);
});
test("custo do vídeo para pacientes não é apresentado como disponível",()=>{
  const choose=html.slice(html.indexOf('id="screen-triage-choice"'),html.indexOf('id="screen-triage"'));
  assert.match(choose,/Valor da teletriagem médica: a definir/);
  assert.match(html,/não tem preço definido nem médico disponível/);
});
