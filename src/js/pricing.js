/* Tri'Go — escolha visual de planos comerciais.
 * Não registra assinatura, não cobra, não altera banco ou mapa.
 */
(() => {
  "use strict";
  const prices={
    "clinic-basic":{group:"clinic",label:"Básico",value:0},
    "clinic-management":{group:"clinic",label:"Gestão",value:99},
    "clinic-plus":{group:"clinic",label:"Gestão Plus",value:199},
    "doctor-basic":{group:"doctor",label:"Perfil básico",value:0},
    "doctor-pro":{group:"doctor",label:"Pro",value:49}
  };
  const selection={clinic:"clinic-basic",doctor:"doctor-basic"};
  const money=value=>value===0?"R$ 0/mês":"R$ "+value+"/mês";
  function choose(id){
    const plan=prices[id];
    if(!plan)return false;
    selection[plan.group]=id;
    const section=document.getElementById(plan.group==="clinic"?"clinic-pricing":"professional-pricing");
    if(!section)return false;
    section.querySelectorAll("[data-plan-card]").forEach(card=>{
      const active=card.dataset.planCard===id;
      card.classList.toggle("selected",active);
      const button=card.querySelector("[data-plan-choice]");
      if(button){
        button.setAttribute("aria-pressed",String(active));
        button.textContent=active?"Plano selecionado":"Simular este plano";
      }
    });
    const status=document.getElementById(plan.group==="clinic"?"clinic-pricing-choice":"doctor-pricing-choice");
    if(status)status.textContent="Plano para simulação: "+plan.label+" — "+money(plan.value)+".";
    return true;
  }
  document.addEventListener("click",event=>{
    const button=event.target.closest?.("[data-plan-choice]");
    if(!button)return;
    event.preventDefault();
    choose(button.dataset.planChoice);
  });
  window.TriGoPricing={
    getSelected(group){
      const id=selection[group];
      if(!id||!prices[id])return null;
      return {...prices[id],id};
    }
  };
})();
