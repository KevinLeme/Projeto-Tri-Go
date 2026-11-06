/* Tri'Go — três entradas e demonstração da sala de teleatendimento.
 * Sem autenticação, cadastro real, chamada remota ou transmissão de dados clínicos.
 * A prévia usa getUserMedia somente por ação explícita do usuário. Vídeo local sem áudio.
 */
(() => {
  "use strict";
  const $=(q,root=document)=>root.querySelector(q);
  const $$=(q,root=document)=>Array.from(root.querySelectorAll(q));
  let cameraStream=null;
  let cameraRole=null;
  let requestId=0;

  const cameraAreas={
    patient:$("#screen-online"),
    professional:$("#screen-professional-portal")
  };

  function setCameraMessage(role,message){
    const area=cameraAreas[role];
    if(!area)return;
    const feedback=$('[data-camera-status="'+role+'"]',area);
    if(feedback)feedback.textContent=message;
  }

  function setCameraControls(role,active){
    const area=cameraAreas[role];
    if(!area)return;
    const start=$('[data-camera-start="'+role+'"]',area);
    const stop=$('[data-camera-stop="'+role+'"]',area);
    const video=$("[data-camera-preview]",area);
    const placeholder=$(".portal-camera-placeholder",area);
    if(start)start.disabled=active;
    if(stop)stop.disabled=!active;
    if(video)video.hidden=!active;
    if(placeholder)placeholder.hidden=active;
  }

  function stopCamera(){
    requestId++;
    if(cameraStream){
      cameraStream.getTracks().forEach(track=>track.stop());
      cameraStream=null;
    }
    for(const role of ["patient","professional"]){
      const video=$("[data-camera-preview]",cameraAreas[role]);
      if(video){video.pause();video.srcObject=null;}
      setCameraControls(role,false);
    }
    if(cameraRole)setCameraMessage(cameraRole,"Câmera desligada. Nenhuma imagem foi transmitida ou gravada.");
    cameraRole=null;
  }

  async function startCamera(role){
    if(!cameraAreas[role])return;
    // A câmera não é acionada automaticamente, nem quando a pessoa entra na tela.
    stopCamera();
    cameraRole=role;
    const currentRequest=++requestId;
    setCameraMessage(role,"Solicitando acesso à câmera...");
    if(!window.isSecureContext||!navigator.mediaDevices?.getUserMedia){
      setCameraMessage(role,"Prévia indisponível. Para testar, abra esta página em HTTPS e use um navegador com câmera.");
      return;
    }
    try{
      // Nunca solicitar microfone nesta versão: áudio não está ligado a nenhum serviço.
      const stream=await navigator.mediaDevices.getUserMedia({
        video:{facingMode:"user",width:{ideal:640},height:{ideal:360}},
        audio:false
      });
      // Se a pessoa saiu da tela enquanto o diálogo de permissão estava aberto, encerrar.
      const expectedScreen=role==="patient"?"online":"professional-portal";
      const currentScreen=location.hash.replace(/^#\//,"").split("?")[0];
      if(currentRequest!==requestId||currentScreen!==expectedScreen){
        stream.getTracks().forEach(track=>track.stop());
        return;
      }
      cameraStream=stream;
      const area=cameraAreas[role];
      const video=$("[data-camera-preview]",area);
      video.srcObject=stream;
      setCameraControls(role,true);
      try{await video.play();}catch{/* Safari ou navegador móvel podem exigir novo toque */}
      setCameraMessage(role,"Prévia local ativada. Sua imagem não sai deste dispositivo e não é gravada.");
    }catch(error){
      const message=error?.name==="NotAllowedError"||error?.name==="PermissionDeniedError"
        ?"Acesso à câmera negado. Se desejar testar, permita a câmera nas configurações do navegador."
        :error?.name==="NotFoundError"
        ?"Nenhuma câmera foi encontrada neste dispositivo."
        :"Não foi possível iniciar a câmera. Verifique se outro aplicativo está usando o dispositivo.";
      setCameraMessage(role,message);
      setCameraControls(role,false);
    }
  }

  document.addEventListener("click",event=>{
    const start=event.target.closest("[data-camera-start]");
    if(start){
      event.preventDefault();
      startCamera(start.dataset.cameraStart);
      return;
    }
    const stop=event.target.closest("[data-camera-stop]");
    if(stop){
      event.preventDefault();
      stopCamera();
      return;
    }
    if(event.target.closest("[data-clinic-form-reset]")){
      const form=$("#clinic-demo-form");
      form?.reset();
      const preview=$("#clinic-demo-preview");
      if(preview)preview.hidden=true;
    }
  });

  const clinicForm=$("#clinic-demo-form");
  clinicForm?.addEventListener("submit",event=>{
    event.preventDefault();
    if(!clinicForm.reportValidity())return;
    const formData=new FormData(clinicForm);
    const clinic=String(formData.get("clinic")||"").trim().slice(0,75);
    const city=String(formData.get("city")||"").trim().slice(0,60);
    const state=String(formData.get("state")||"").trim();
    const specialty=String(formData.get("specialty")||"").trim();
    const services=formData.getAll("service").map(x=>String(x));
    const preview=$("#clinic-demo-preview");
    if(!preview||clinic.length<2||city.length<2||!state||!specialty)return;
    preview.innerHTML=
      '<strong>✓ Prévia da solicitação (não enviada)</strong>'+
      '<p>Se fosse um cadastro real, sua clínica entraria em uma fila de verificação antes de aparecer no mapa.</p>'+
      '<ul><li>Clínica: <span data-preview-name></span></li>'+
      '<li>Localização: <span data-preview-location></span></li>'+
      '<li>Especialidade: <span data-preview-specialty></span></li>'+
      '<li>Serviços: <span data-preview-services></span></li>'+
      '<li>Plano simulado: <span data-preview-plan></span></li></ul>'+
      '<button type="button" data-clinic-form-reset>Editar / limpar demonstração</button>';
    $("[data-preview-name]",preview).textContent=clinic;
    $("[data-preview-location]",preview).textContent=city+" — "+state;
    $("[data-preview-specialty]",preview).textContent=specialty;
    $("[data-preview-services]",preview).textContent=services.join(", ")||"Nenhum";
    const chosenPlan=window.TriGoPricing?.getSelected("clinic");
    $("[data-preview-plan]",preview).textContent=chosenPlan?(chosenPlan.label+" — "+(chosenPlan.value===0?"R$ 0/mês":"R$ "+chosenPlan.value+"/mês")):"Básico — R$ 0/mês";
    preview.hidden=false;
    preview.scrollIntoView({behavior:"smooth",block:"nearest"});
  });

  window.addEventListener("trigo:screen",event=>{
    const screen=event.detail?.screen;
    if(cameraRole && (screen!=="online"&&screen!=="professional-portal" ||
      (cameraRole==="patient"&&screen!=="online") ||
      (cameraRole==="professional"&&screen!=="professional-portal"))){
      stopCamera();
    }
  });
  window.addEventListener("pagehide",stopCamera);
  document.addEventListener("visibilitychange",()=>{
    if(document.hidden&&cameraStream)stopCamera();
  });

  // Mantém somente utilidades de teste; não há transmissão WebRTC nesta etapa.
  window.TriGoPortal={stopCamera};
})();
