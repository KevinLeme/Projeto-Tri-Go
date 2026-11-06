/* Cadastro fictício do médico independente — sem persistência ou envio.
 * Nunca solicitar CRM real, documentos ou dados sensíveis na demonstração.
 */
(() => {
  "use strict";
  const form=document.getElementById("doctor-demo-form");
  const preview=document.getElementById("doctor-demo-preview");
  if(!form||!preview)return;
  const formatMoney=value=>"R$ "+value.toLocaleString("pt-BR",{minimumFractionDigits:value%1?2:0,maximumFractionDigits:2})+"/mês";
  const labels={
    consultorio:"Consultório próprio",
    online:"Somente atendimento online (quando habilitado)",
    ambos:"Consultório e atendimento online"
  };
  function appendField(list,title,value){
    const item=document.createElement("li");
    const bold=document.createElement("strong");
    bold.textContent=title+": ";
    item.append(bold,document.createTextNode(value));
    list.appendChild(item);
  }
  function clear(){
    form.reset();
    preview.replaceChildren();
    preview.hidden=true;
  }
  form.addEventListener("submit",event=>{
    event.preventDefault();
    if(!form.reportValidity())return;
    const values=new FormData(form);
    const name=String(values.get("name")||"").trim().slice(0,70);
    const specialty=String(values.get("specialty")||"").trim();
    const city=String(values.get("city")||"").trim().slice(0,60);
    const state=String(values.get("state")||"").trim();
    const mode=String(values.get("mode")||"").trim();
    if(name.length<3||city.length<2||!specialty||!state||!labels[mode])return;
    const plan=window.TriGoPricing?.getSelected("doctor");
    const planDescription=plan
      ?plan.label+" — 30 dias gratuitos; depois "+formatMoney(plan.value)
      :"Independente Essencial — 30 dias gratuitos; depois R$ 29,90/mês";

    preview.replaceChildren();
    const heading=document.createElement("strong");
    heading.textContent="Prévia do perfil — não enviado";
    const text=document.createElement("p");
    text.textContent="Na versão real, seu registro médico será verificado antes da publicação. Esta simulação não reserva vaga nem inicia período de teste.";
    const list=document.createElement("ul");
    appendField(list,"Profissional fictício",name);
    appendField(list,"Especialidade",specialty);
    appendField(list,"Localidade",city+" — "+state);
    appendField(list,"Modalidade",labels[mode]);
    appendField(list,"Plano demonstrativo",planDescription);
    const foot=document.createElement("p");
    foot.textContent=mode==="online"
      ?"Sem consultório físico para marcar no mapa; a futura busca online só listará profissionais regularmente habilitados."
      :"Na versão real, um consultório físico e sua localização também precisarão de verificação.";
    const reset=document.createElement("button");
    reset.type="button";
    reset.textContent="Editar / limpar demonstração";
    reset.addEventListener("click",clear);
    preview.append(heading,text,list,foot,reset);
    preview.hidden=false;
    preview.scrollIntoView?.({block:"nearest",behavior:"smooth"});
  });
  window.TriGoDoctorDemo={clear};
})();
