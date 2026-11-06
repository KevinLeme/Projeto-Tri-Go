/* Cadastro de médico autônomo: prévia local sem armazenamento.
 * Execute: node --test tests/medico-independente.test.cjs
 */
const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const source=fs.readFileSync(path.join(__dirname,"..","src","js","doctor-onboarding.js"),"utf8");
function prepare(plan={group:"doctor",label:"Independente Essencial",value:29.9,trialDays:30}){
  const events={};
  const form={
    addEventListener(event,cb){events[event]=cb;},
    reportValidity(){return true;},
    reset(){this.didReset=true;}
  };
  const preview={
    hidden:true,children:[],
    replaceChildren(){this.children=[];},
    append(...children){this.children.push(...children);},
    scrollIntoView(){}
  };
  const document={
    getElementById:id=>({"doctor-demo-form":form,"doctor-demo-preview":preview})[id]||null,
    createElement:tag=>({
      tag,textContent:"",children:[],listeners:{},
      append(...parts){this.children.push(...parts)},
      addEventListener(name,cb){this.listeners[name]=cb}
    }),
    createTextNode:text=>({text})
  };
  const values={
    name:"Dra. Exemplo",specialty:"Cardiologia",city:"Varginha",state:"MG",mode:"online"
  };
  class FormDataMock{constructor(){}get(key){return values[key]}}
  const window={TriGoPricing:{getSelected:()=>plan}};
  new Function("window","document","FormData",source)(window,document,FormDataMock);
  return {form,preview,events,window,values};
}
test("simula médico sem clínica com consulta somente online",()=>{
  const {preview,events}=prepare();
  events.submit({preventDefault(){}});
  assert.equal(preview.hidden,false);
  assert.equal(preview.children[0].textContent,"Prévia do perfil — não enviado");
  const lines=preview.children[2].children;
  assert.ok(lines.some(line=>line.children.some(c=>c.text==="Somente atendimento online (quando habilitado)")));
  assert.ok(lines.some(line=>line.children.some(c=>String(c.text).includes("R$ 29,90/mês"))));
});
test("não envia dados, não coleta CRM real e permite limpar a prévia",()=>{
  const {form,preview,events}=prepare();
  events.submit({preventDefault(){}});
  assert.ok(!preview.hidden);
  const reset=preview.children.find(item=>item.tag==="button");
  reset.listeners.click();
  assert.equal(preview.hidden,true);
  assert.equal(form.didReset,true);
  assert.doesNotMatch(source,/\bfetch\s*\(|\bXMLHttpRequest\b|localStorage|sessionStorage/);
});
test("modalidade consultório próprio permanece identificada no resumo",()=>{
  const {preview,events,values}=prepare({label:"Independente Pro",value:49,trialDays:30});
  values.mode="consultorio";
  events.submit({preventDefault(){}});
  const lines=preview.children[2].children;
  assert.ok(lines.some(line=>line.children.some(c=>c.text==="Consultório próprio")));
  assert.ok(lines.some(line=>line.children.some(c=>String(c.text).includes("R$ 49/mês"))));
});
