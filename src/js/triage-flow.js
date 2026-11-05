/* Fluxo demonstrativo Tri'Go — perguntas informativas, não diagnóstico.
 * Respostas somente na memória desta aba. Não há envio ao backend.
 */
(() => {
  "use strict";
  const api=window.TriGo;
  const root=document.getElementById("screen-triage");
  if(!api||!root)return;
  const $=(q,scope=root)=>scope.querySelector(q);
  const $$=(q,scope=root)=>Array.from(scope.querySelectorAll(q));
  const escapeHtml=(text)=>String(text??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  let currentStep=1;
  const total=4;
  const labels={warning:{"Sim":"Sim, percebe sinal de alerta","Não percebi":"Não percebeu os sinais citados","Não sei":"Não tem certeza"}};
  const getChecked=(name)=>$('input[name="'+name+'"]:checked')?.value||"";
  function readAnswers(){
    return {
      symptoms:$$('input[name="symptom"]:checked').map(input=>input.value),
      duration:getChecked("duration"),
      intensity:getChecked("intensity"),
      trend:getChecked("trend"),
      warning:getChecked("warning"),
      notes:$("#triage-notes").value.trim().slice(0,280)
    };
  }
  function setError(message=""){
    const error=$("#triage-error");
    error.textContent=message;
    error.hidden=!message;
  }
  function validate(step,answers){
    if(step===1 && !answers.symptoms.length)return "Selecione pelo menos um sintoma para continuar.";
    if(step===2 && (!answers.duration||!answers.intensity||!answers.trend))return "Informe há quanto tempo começou, a intensidade e a evolução.";
    if(step===3 && !answers.warning)return "Selecione uma resposta sobre os sinais de alerta.";
    if(step===4 && !$("#triage-ack").checked)return "Confirme que entendeu o caráter demonstrativo deste resumo.";
    return "";
  }
  function detailRow(label,value,step){
    return '<div class="triage-review-row"><div><span>'+escapeHtml(label)+'</span><strong>'+escapeHtml(value||"Não informado")+'</strong></div><button type="button" class="triage-edit" data-triage-edit="'+step+'">Editar</button></div>';
  }
  function renderReview(answers){
    const review=$("#triage-review");
    review.innerHTML=detailRow("Sintomas",answers.symptoms.join(", "),1)+
      detailRow("Início dos sintomas",answers.duration,2)+
      detailRow("Desconforto e evolução",(answers.intensity||"-")+" · "+(answers.trend||"-"),2)+
      detailRow("Sinais de alerta",labels.warning[answers.warning]||answers.warning,3)+
      (answers.notes?detailRow("Observações adicionais",answers.notes,3):"");
  }
  function renderStep(n){
    currentStep=Math.max(1,Math.min(total,n));
    $$(".triage-stage").forEach(node=>{node.hidden=Number(node.dataset.stage)!==currentStep;});
    $("#triage-step-count").textContent="Etapa "+currentStep+" de "+total;
    $("#triage-percent").textContent=(currentStep/total*100)+"%";
    $("#triage-progress-fill").style.width=(currentStep/total*100)+"%";
    $("#triage-progressbar").setAttribute("aria-valuenow",String(currentStep));
    const back=$("#triage-previous");
    back.hidden=currentStep===1;
    const next=$("#complete-triage");
    next.innerHTML=currentStep===total?'Visualizar resumo <span aria-hidden="true">→</span>':'Continuar <span aria-hidden="true">→</span>';
    setError();
    if(currentStep===4)renderReview(readAnswers());
    $("#triage-selected-count").textContent=$$('input[name="symptom"]:checked').length
      ? $$('input[name="symptom"]:checked').length+" sintoma(s) selecionado(s)"
      : "Nenhuma opção selecionada";
    // A posição de leitura permanece no início da etapa, sem saltos no desktop.
    if(window.matchMedia("(max-width:900px)").matches)window.scrollTo(0,0);
  }
  function nextStep(){
    const answers=readAnswers();
    const message=validate(currentStep,answers);
    if(message){setError(message);return;}
    setError();
    if(currentStep<total){renderStep(currentStep+1);return;}
    api.state.triageSymptoms=answers.symptoms.slice();
    api.state.triageReport={...answers,completedAt:Date.now()};
    api.navigate("result");
  }
  function signalChanged(){
    const value=getChecked("warning");
    const warning=$("#triage-warning-detail");
    warning.hidden=value!=="Sim"&&value!=="Não sei";
    if(value==="Não sei"){
      warning.querySelector("strong").textContent="Se estiver em dúvida, procure orientação";
      warning.querySelector("p").textContent="Esta ferramenta não avalia situações de risco. Se houver sintomas graves ou súbitos, procure urgência ou ligue 192.";
    }else{
      warning.querySelector("strong").textContent="Procure ajuda se houver sinais graves";
      warning.querySelector("p").textContent="Dor forte no peito, falta de ar intensa, desmaio ou outros sintomas graves exigem atendimento imediato. Ligue 192 em uma emergência.";
    }
  }
  function resultRow(label,value){
    return '<div class="triage-result-line"><span>'+escapeHtml(label)+'</span><strong>'+escapeHtml(value||"Não informado")+'</strong></div>';
  }
  function renderResult(){
    const screen=document.getElementById("screen-result");
    if(!screen)return;
    const reco=screen.querySelector(".recommendation");
    if(!reco)return;
    const oldPriority=screen.querySelector(".demo-priority");
    if(oldPriority)oldPriority.hidden=true;
    const report=api.state.triageReport;
    let box=screen.querySelector("#triage-result-details");
    if(!box){box=document.createElement("div");box.id="triage-result-details";reco.insertAdjacentElement("afterend",box);}
    const heading=screen.querySelector(".section-heading h2");
    if(heading)heading.textContent="Clínicas de exemplo para conhecer";
    if(!report){
      reco.innerHTML='<span class="eyebrow">DEMONSTRAÇÃO</span><h2 id="demo-specialty">Ainda não há respostas</h2><p>Preencha as perguntas para ver um resumo organizado dos sintomas. Não é um diagnóstico.</p>';
      box.innerHTML='<button type="button" class="btn btn-primary" data-triage-restart>Iniciar questionário →</button>';
      return;
    }
    reco.innerHTML='<span class="eyebrow">TRIAGEM INFORMATIVA CONCLUÍDA</span><h2 id="demo-specialty">Seu relato foi organizado</h2><p>Este resumo reúne apenas o que você informou. O Tri’Go ainda não determina diagnóstico, urgência ou especialidade adequada.</p>';
    const warning=report.warning==="Sim"
      ?'<div class="triage-result-warning"><strong>Você indicou um possível sinal de alerta.</strong><p>Não espere pela plataforma se estiver com sintomas graves. Procure atendimento imediato ou ligue <a href="tel:192">192</a>.</p></div>'
      : report.warning==="Não sei"
      ?'<div class="triage-result-warning"><strong>Você informou que não sabe avaliar os sinais de alerta.</strong><p>Em caso de sintomas graves ou súbitos, procure urgência ou ligue <a href="tel:192">192</a>.</p></div>'
      :'<div class="triage-result-neutral">Não ter percebido sinais de alerta não descarta problemas de saúde. Apenas um profissional pode avaliar seu caso.</div>';
    box.innerHTML='<div class="triage-result-card"><div class="triage-result-top"><div><span class="eyebrow">RESUMO DA CONVERSA</span><h3>Informações relatadas</h3></div><span class="triage-result-check" aria-hidden="true">✓</span></div>'+
      resultRow("Sintomas",report.symptoms.join(", "))+resultRow("Há quanto tempo",report.duration)+resultRow("Desconforto",report.intensity)+resultRow("Evolução",report.trend)+resultRow("Sinais de alerta",labels.warning[report.warning]||report.warning)+
      (report.notes?resultRow("Observações",report.notes):"")+'</div>'+warning+
      '<div class="triage-result-actions"><button type="button" class="btn btn-outline" data-triage-restart>Refazer perguntas</button><button type="button" class="btn btn-primary" data-go="clinics">Explorar clínicas no mapa →</button></div>'+
      '<p class="triage-result-footnote">Clínicas, especialidades, preços e horários abaixo são exemplos de navegação e não foram selecionados com base nos seus sintomas.</p>';
  }
  $("#complete-triage").addEventListener("click",event=>{
    event.preventDefault();
    event.stopPropagation(); // Impede acionar também o manipulador legado do app.js.
    nextStep();
  });
  $("#triage-previous").addEventListener("click",()=>renderStep(currentStep-1));
  root.addEventListener("click",event=>{
    const button=event.target.closest("[data-triage-edit]");
    if(button)renderStep(Number(button.dataset.triageEdit));
  });
  root.addEventListener("change",event=>{
    if(event.target.name==="symptom"){
      $("#triage-selected-count").textContent=$$('input[name="symptom"]:checked').length
        ?$$('input[name="symptom"]:checked').length+" sintoma(s) selecionado(s)"
        :"Nenhuma opção selecionada";
    }
    if(event.target.name==="warning")signalChanged();
    if(!$("#triage-error").hidden)setError();
  });
  $("#triage-notes").addEventListener("input",event=>{$("#triage-notes-length").textContent=event.target.value.length;});
  document.getElementById("screen-result")?.addEventListener("click",event=>{
    if(!event.target.closest("[data-triage-restart]"))return;
    $("#triage-questionnaire").reset();
    api.state.triageReport=null;
    api.state.triageSymptoms=[];
    $("#triage-notes-length").textContent="0";
    $("#triage-warning-detail").hidden=true;
    renderStep(1);
    api.navigate("triage");
  });
  window.addEventListener("trigo:screen",event=>{
    if(event.detail.screen==="result")renderResult();
    if(event.detail.screen==="triage")renderStep(currentStep);
  });
  window.TriGoTriage={readAnswers,validate,get currentStep(){return currentStep;}};
  renderStep(1);
  if(location.hash.startsWith("#/result"))renderResult();
})();