/* Tri-Go: interfaces adicionais e fluxos demonstrativos.
 * Nenhum dado é enviado a servidor; clínicas e coordenadas são fictícias.
 * A triagem NÃO diagnostica, classifica risco ou indica especialidade.
 */
(() => {
  "use strict";
  const api=window.TriGo;
  if(!api) return;
  const {$state}= { $state: api.state };
  const state=$state, clinics=api.clinics;
  const $=(q,root=document)=>root.querySelector(q);
  const $$=(q,root=document)=>Array.from(root.querySelectorAll(q));
  const safe=(s)=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  let map=null, markers=[], userMarker=null, initialized=false;
  const demoLogo="./src/image/trigo-logo.jpg";
  function iso(d){const p=n=>String(n).padStart(2,"0");return d.getFullYear()+"-"+p(d.getMonth()+1)+"-"+p(d.getDate());}
  function dPlus(n){const d=new Date();d.setHours(12,0,0,0);d.setDate(d.getDate()+n);return d;}
  const current=()=>location.hash.replace(/^#\//,"").split("?")[0]||"welcome";
  const money=n=>api.money(n);
  const cNow=()=>api.currentClinic();
  function svgIcon(which){
    const s={
      heart:'<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/>',
      pin:'<path d="M20 10c0 5.5-8 12-8 12S4 15.5 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/>',
      photo:'<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="m21 16-5-5-9 9"/>',
      check:'<path d="m4 12 5 5L20 6"/>'
    };
    return '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+(s[which]||s.check)+'</svg>';
  }

  function branding(){
    const welcome=$("#screen-welcome");
    if(welcome && !welcome.querySelector(".welcome-logo-bar")){
      welcome.insertAdjacentHTML("afterbegin",'<div class="welcome-logo-bar"><img src="'+demoLogo+'" alt="Logo oficial do Tri-Go"><strong>Tri\'Go</strong></div>');
    }
    // O JPEG enviado foi incorporado ao projeto sem alterar a arte.
    $$(".brand-mark").forEach(el=>{el.innerHTML='<img alt="" src="'+demoLogo+'">';el.classList.add("official-logo-mark")});
    const art=$(".illustration-circle");
    if(art){art.innerHTML='<img class="official-logo-large" alt="Logo oficial Tri-Go: triagem, cuidado e saúde" src="'+demoLogo+'">';}
    const brand=$(".brand>span:last-child");
    if(brand){brand.innerHTML="Tri'<span class='brand-em'>Go</span><small>Triagem • Cuidado • Saúde</small>";}
    const mobile=$(".mobile-brand");
    if(mobile){mobile.innerHTML='<span class="brand-mark official-logo-mark"><img src="'+demoLogo+'" alt=""></span> Tri\'<span>Go</span>';}
    const intro=$("#screen-welcome .welcome-copy");
    if(intro){
      const actions=$$(".btn",intro);
      if(actions[1]){actions[1].textContent="JÁ TENHO CONTA — ENTRAR";actions[1].dataset.go="profile";actions[1].title="Acesso de demonstração: a autenticação real virá com o backend.";}
    }
  }
  function prepareHome(){
    const home=$(".preview-appointments");
    if(home){home.setAttribute("aria-label","Agendamentos exemplificativos. Não são consultas reais.");}
    const buttons=$$("#screen-home .specialty-grid button");
    const fields=["Clínica geral","Pediatria","Ortopedia"];
    buttons.forEach((b,i)=>b.addEventListener("click",()=>{state.search=fields[i]||"";},true));
  }
  function prepareResult(){
    const result=$("#screen-result");
    if(!result)return;
    const reco=$(".recommendation",result);
    if(reco && !$("#demo-specialty")) {
      reco.innerHTML='<span class="eyebrow">EXEMPLO DO FIGMA — NÃO É UMA RECOMENDAÇÃO</span><h2 id="demo-specialty">Ortopedia</h2><p>Este é um exemplo visual fixo do protótipo. O sistema ainda não interpreta sintomas nem determina qual especialidade procurar.</p><span class="soft-tag">Triagem real dependerá de validação clínica</span>';
      reco.insertAdjacentHTML("afterend",'<div class="demo-priority"><span class="priority-dot">!</span><p><strong>Classificação de risco não disponível</strong><span>A orientação de urgência deve ser definida por profissionais habilitados.</span></p></div>');
    }
    const heading=$("#screen-result .section-heading h2");
    if(heading)heading.textContent="Clínicas encontradas para você:";
    const head=$("#screen-result .section-heading");
    if(head&&!$("#result-sort")){
      head.insertAdjacentHTML("beforeend",'<label class="result-sort-label"><span class="sr-only">Ordenar clínicas</span><select id="result-sort" aria-label="Ordenar clínicas"><option value="distance">Mais próximo</option><option value="price">Menor preço</option><option value="rating">Melhor avaliação</option></select></label>');
      $("#result-sort").addEventListener("change",sortResultCards);
    }
  }
  function sortResultCards(){
    const node=$("#result-clinics");
    if(!node)return;
    const sort=$("#result-sort")?.value||"distance";
    const compare={distance:(a,b)=>a.distance-b.distance,price:(a,b)=>a.price-b.price,rating:(a,b)=>b.rating-a.rating}[sort];
    const nodes=$("[data-clinic-card]",node);
    nodes.sort((a,b)=>compare(api.clinicById(a.dataset.clinicCard),api.clinicById(b.dataset.clinicCard))).forEach(el=>node.appendChild(el));
  }
  function renderResultSafety(){
    const title=$("#demo-specialty"),reco=$("#screen-result .recommendation p");
    if(!title||!reco)return;
    const symptoms=state.triageSymptoms||[];
    const attention=symptoms.includes("Dor no peito")||symptoms.includes("Falta de ar");
    if(attention){
      title.textContent="Orientação profissional necessária";
      reco.textContent="Como você marcou um sintoma que pode exigir atenção, este protótipo não mostra especialidade de exemplo. Se houver dor intensa no peito, falta de ar importante ou piora súbita, procure urgência ou ligue 192.";
    }else{
      title.textContent="Ortopedia (exemplo)";
      reco.textContent="Especialidade fictícia mostrada apenas para reproduzir o Figma, independentemente das respostas. Não é resultado de análise médica.";
    }
    sortResultCards();
  }
  function renderHomeAppointments(){
    const b=state.booking;
    const root=$("#screen-home .preview-appointments");
    if(!root||!b)return;
    root.innerHTML='<button type="button" data-go="bookings" class="preview-appointment actual-demo-booking"><div class="appointment-person"><span class="doctor-avatar teal">✓</span><div><strong>'+safe(b.clinic)+'</strong><small>'+safe(b.service||b.specialty)+'</small></div><span class="appointment-state ok">Simulado</span></div><div class="appointment-info"><span>'+safe(api.formatDate(b.date))+' · '+safe(b.time)+'</span><span>Ver agendamento →</span></div></button>';
  }
  function prepareClinics(){
    const screen=$("#screen-clinics");
    if(!screen)return;
    const heading=$(".page-heading",screen);
    if(heading){heading.innerHTML='<div><span class="eyebrow">CLÍNICAS</span><h1 id="clinics-title">Encontre seu atendimento</h1><p class="muted">Clínicas e pontos do mapa são fictícios.</p></div>';}
    const bar=$(".filter-bar",screen);
    if(bar&&!bar.querySelector('[data-sort="insurance"]')){
      bar.querySelector('[data-sort="rating"]')?.remove();
      bar.insertAdjacentHTML("beforeend",'<button type="button" class="filter-button" data-sort="insurance">Convênio</button>');
    }
    const title=$("#clinic-cards");
    if(!title)return;
    const holder=document.createElement("div");
    holder.className="clinics-view-switch";
    holder.innerHTML='<div class="view-toggle" role="group" aria-label="Visualização das clínicas"><button type="button" class="view-choice selected" data-view="list" aria-pressed="true">☷ Lista</button><button type="button" class="view-choice" data-view="map" aria-pressed="false">⌖ Mapa</button></div><span class="view-demo-label">Pontos ilustrativos · Av. Paulista</span>';
    title.parentElement.insertBefore(holder,title);
    const wrapper=document.createElement("div");
    wrapper.className="demo-map-wrap";
    wrapper.id="demo-map-wrap";
    wrapper.hidden=true;
    wrapper.innerHTML='<div class="map-toolbar"><span>Mapa demonstrativo da região da Paulista</span><button class="map-location" id="map-my-location" type="button">⌖ Minha localização</button></div><div id="trigo-map" role="region" aria-label="Mapa de clínicas fictícias na região da Avenida Paulista"></div><div id="trigo-map-fallback" class="map-fallback" hidden><strong>Mapa indisponível</strong><p>Não foi possível carregar os mapas neste navegador. Você ainda pode selecionar uma clínica pela lista.</p></div><p id="map-note" class="map-note">Os marcadores são ilustrativos e não representam endereços de estabelecimentos reais. Dados cartográficos: © OpenStreetMap contributors.</p><div id="map-clinic-list" class="map-clinic-list"></div>';
    title.parentElement.insertBefore(wrapper,title);
  }
  function filteredClinics(){
    const query=state.search.toLocaleLowerCase("pt-BR");
    const arr=clinics.filter(c=>(c.name+" "+c.area+" "+c.specialty+" "+c.insurance).toLocaleLowerCase("pt-BR").includes(query)&&(!state.insuranceOnly||c.insurance!=="Particular"));
    const order={distance:(a,b)=>a.distance-b.distance,price:(a,b)=>a.price-b.price,available:(a,b)=>["Hoje","Amanhã","Em 3 dias"].indexOf(a.availability)-["Hoje","Amanhã","Em 3 dias"].indexOf(b.availability),rating:(a,b)=>b.rating-a.rating};
    return arr.sort(order[state.sort]||order.distance);
  }
  function initMap(){
    if(map)return true;
    const node=$("#trigo-map");
    if(!node || !window.L)return false;
    map=L.map(node,{scrollWheelZoom:false}).setView([-23.563,-46.655],13);
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png",{attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',maxZoom:19}).addTo(map);
    renderMapPins();
    return true;
  }
  function renderMapPins(){
    if(!map||!window.L)return;
    markers.forEach(marker=>marker.remove());markers=[];
    filteredClinics().forEach(c=>{
      const marker=L.circleMarker([c.lat,c.lng],{radius:10,color:"#ffffff",weight:2,fillColor:"#0e7c58",fillOpacity:1}).addTo(map);
      const pop=document.createElement("div");
      pop.className="map-popup";
      pop.innerHTML='<strong>'+safe(c.name)+'</strong><span>'+safe(c.specialty)+' · '+money(c.price)+'</span><button type="button" data-clinic="'+safe(c.id)+'">Ver horários →</button>';
      marker.bindPopup(pop,{autoPan:true});
      marker.on("click",()=>{});
      markers.push(marker);
    });
  }
  function renderMapView(){
    const show=state.mapMode==="map";
    $("#clinic-cards").hidden=show;
    $("#demo-map-wrap").hidden=!show;
    $$("[data-view]").forEach(b=>{const pressed=b.dataset.view===state.mapMode;b.classList.toggle("selected",pressed);b.setAttribute("aria-pressed",pressed?"true":"false");});
    if(show){
      const ok=initMap();
      $("#trigo-map-fallback").hidden=ok;
      $("#trigo-map").hidden=!ok;
      if(ok){renderMapPins();setTimeout(()=>map.invalidateSize(true),90);}
      const root=$("#map-clinic-list");
      root.innerHTML=filteredClinics().map(c=>'<button class="map-list-item" type="button" data-clinic="'+safe(c.id)+'"><span><strong>'+safe(c.name)+'</strong><small>'+safe(c.specialty)+'</small></span><strong>'+money(c.price)+'</strong><span>→</span></button>').join("")||'<p>Nenhum ponto corresponde ao filtro.</p>';
    }
  }
  function locateOnMap(){
    const node=$("#map-note");
    if(!navigator.geolocation){node.textContent="Este navegador não oferece geolocalização.";return;}
    node.textContent="Solicitando permissão para mostrar sua posição no mapa...";
    navigator.geolocation.getCurrentPosition(position=>{
      if(!map||!window.L)return;
      if(userMarker)userMarker.remove();
      const pos=[position.coords.latitude,position.coords.longitude];
      userMarker=L.circleMarker(pos,{radius:9,color:"#fff",weight:3,fillColor:"#2774db",fillOpacity:1}).addTo(map);
      userMarker.bindPopup("Sua posição aproximada (não compartilhada com clínicas)");
      map.setView(pos,13);
      node.innerHTML='Sua localização aparece em azul. <button type="button" id="map-reset" class="inline-text-button">Voltar ao mapa de exemplo</button>. Nenhum dado é enviado ao Tri-Go.';
    },()=>{
      node.textContent="A localização não foi autorizada. O mapa demonstrativo continua disponível.";
    },{enableHighAccuracy:false,timeout:10000,maximumAge:60000});
  }

  function prepareClinicDetails(){
    const screen=$("#screen-clinic");
    if(!screen)return;
    const hero=$(".clinic-detail-hero",screen);
    if(hero){
      hero.innerHTML='<div class="clinic-gallery-art"><span class="clinic-building" aria-hidden="true">✚</span><small>Imagem ilustrativa de clínica</small></div><div class="clinic-gallery-toolbar"><span class="soft-tag">Demonstração</span><button type="button" id="clinic-favorite" class="favorite-button" aria-label="Favoritar clínica">'+svgIcon("heart")+'</button></div>';
    }
    const first=$(".content-card",screen);
    if(first){
      first.insertAdjacentHTML("beforeend",'<div id="clinic-specialties" class="clinic-specialties"></div><div id="clinic-service-list" class="clinic-service-list"></div><div id="clinic-accepted" class="clinic-accepted"></div>');
    }
    const second=$$(".content-card",screen)[1];
    if(second){
      const title=$("h2",second);
      if(title)title.textContent="Horários disponíveis";
      second.insertAdjacentHTML("afterbegin",'<div class="clinic-date-scroller" id="clinic-date-scroller" role="group" aria-label="Selecione o dia da consulta"></div>');
      const input=$("#appointment-date");
      if(input){input.classList.add("date-under-carousel");}
      const times=$("#time-slots");
      if(times){
        times.insertAdjacentHTML("beforeend",'<button type="button" class="time-slot" data-time="11:00">11:00</button><button type="button" class="time-slot" data-time="16:15">16:15</button>');
      }
    }
  }
  function renderDetailsExtras(){
    const c=cNow();
    const favorites=state.favorites;
    const fav=$("#clinic-favorite");
    if(fav){fav.classList.toggle("is-favorite",favorites.has(c.id));fav.setAttribute("aria-pressed",favorites.has(c.id)?"true":"false");fav.setAttribute("aria-label",favorites.has(c.id)?"Remover dos favoritos":"Adicionar aos favoritos");}
    const specs=$("#clinic-specialties");
    if(specs){specs.innerHTML='<h3>Especialidades disponíveis</h3><div class="choice-chips"><span class="selected">'+safe(c.specialty)+'</span><span>Clínica geral</span><span>Pediatria</span></div><p class="mini-disclaimer">Especialidades adicionais exibidas apenas para reproduzir o layout.</p>';}
    const services=$("#clinic-service-list");
    if(services){
      const options=c.services||[["Consulta médica",c.price,30]];
      if(!state.selectedService||!options.some(x=>x[0]===state.selectedService))state.selectedService=options[0][0];
      services.innerHTML='<h3>Serviços oferecidos</h3>'+options.map(service=>'<button type="button" class="service-row '+(state.selectedService===service[0]?"selected":"")+'" data-service="'+safe(service[0])+'"><span class="service-symbol">✚</span><span><strong>'+safe(service[0])+'</strong><small>Presencial / demonstração · '+service[2]+' min</small></span><strong class="service-price">'+money(service[1])+'</strong></button>').join("");
    }
    const accepted=$("#clinic-accepted");
    if(accepted){accepted.innerHTML='<span class="accepted-icon">✓</span><div><strong>Convênio exibido no protótipo</strong><small>'+safe(c.insurance)+' · aceitação não verificada</small></div><span>›</span>';}
    renderDateScroller();
  }
  function renderDateScroller(){
    const bar=$("#clinic-date-scroller");
    if(!bar)return;
    const selected=state.date;
    bar.innerHTML=Array.from({length:7},(_,i)=>{
      const d=dPlus(i),v=iso(d),weekday=d.toLocaleDateString("pt-BR",{weekday:"short"}).replace(".",""),number=d.getDate();
      return '<button type="button" class="date-chip '+(selected===v?"selected":"")+'" data-date="'+v+'"><small>'+safe(weekday)+'</small><strong>'+number+'</strong><small>'+safe(d.toLocaleDateString("pt-BR",{month:"short"}).replace(".",""))+'</small></button>';
    }).join("");
  }
  function dateClick(date){
    state.date=date;
    const field=$("#appointment-date");
    if(field){field.value=date;field.dispatchEvent(new Event("change",{bubbles:true}));}
    $$(".date-chip").forEach(btn=>btn.classList.toggle("selected",btn.dataset.date===date));
  }
  function chooseService(name){
    const c=cNow();
    const found=c.services?.find(s=>s[0]===name);
    if(!found)return;
    state.selectedService=name;
    $$(".service-row").forEach(b=>b.classList.toggle("selected",b.dataset.service===name));
    window.dispatchEvent(new CustomEvent("trigo:service",{detail:{name}}));
  }

  function prepareConfirm(){
    const screen=$("#screen-appointment");
    if(!screen)return;
    const second=$$(".content-card",screen)[1];
    if(!second)return;
    second.insertAdjacentHTML("beforebegin",'<div class="content-card confirm-demo-summary"><h2>Data e horário</h2><div id="confirm-picked" class="confirm-picked"></div><button type="button" class="text-link" data-go="clinic">Alterar data ou horário</button></div>');
    const info=$(".footnote",second);
    if(info)info.textContent="Insira apenas um nome fictício. Não há cadastro real nesta versão.";
    const button=$("#confirm-appointment");
    if(button)button.textContent="Confirmar simulação →";
    $("#confirm-appointment").insertAdjacentHTML("beforebegin",'<div class="payment-preview"><h2>Pagamento</h2><div class="payment-options" role="group" aria-label="Forma de pagamento"><button class="payment-card" type="button" data-payment="insurance"><span class="payment-icon">✚</span><span><strong>Plano de Saúde</strong><small>Simulação de convênio</small></span><span class="payment-radio"></span></button><button class="payment-card" type="button" data-payment="credit"><span class="payment-icon">▣</span><span><strong>Cartão de crédito</strong><small>Para simular consulta particular</small></span><span class="payment-radio"></span></button></div><div id="insurance-choice"><label for="demo-insurance">Convênio (exemplo)</label><select id="demo-insurance"><option value="">Selecione uma opção</option><option value="SulAmérica">SulAmérica</option><option value="Bradesco">Bradesco</option><option value="Unimed">Unimed</option></select></div><div id="demo-payment-summary" class="payment-summary"></div><p class="mini-disclaimer">Não cobramos, solicitamos dados de cartão ou validamos coberturas nesta demonstração.</p></div>');
  }
  function renderConfirmExtras(){
    const c=cNow();
    const chosen=c.services?.find(s=>s[0]===state.selectedService);
    const price=chosen?.[1]??c.price;
    $("#appointment-value").textContent=money(price);
    $("#appointment-specialty").textContent=chosen?.[0]??c.specialty;
    const picked=$("#confirm-picked");
    if(picked)picked.innerHTML='<div><small>Data</small><strong>'+safe(api.formatDate(state.date))+'</strong></div><div><small>Horário</small><strong>'+safe(state.time)+'</strong></div>';
    $$("[data-payment]").forEach(btn=>btn.classList.toggle("selected",btn.dataset.payment===state.payment));
    const choice=$("#insurance-choice");
    if(choice)choice.hidden=state.payment!=="insurance";
    const selector=$("#demo-insurance");
    if(selector)selector.value=state.insurance||c.insurance.replace(/Particular/g,"");
    const summary=$("#demo-payment-summary");
    if(summary)summary.innerHTML='<div><span>'+safe(chosen?.[0]??"Consulta")+'</span><strong>'+money(price)+'</strong></div><div><span>Cobertura do convênio</span><strong>Não verificada</strong></div><div><span>Valor ilustrativo</span><strong>'+money(price)+'</strong></div>';
  }
  function prepareSuccess(){
    const success=$("#screen-success");
    const summary=$(".appointment-summary",success);
    if(!summary||$("#success-additional"))return;
    summary.insertAdjacentHTML("beforeend",'<div id="success-additional"></div>');
    const title=$("#success-title");
    if(title)title.textContent="Agendamento confirmado!";
  }
  function renderSuccessExtras(){
    const b=state.booking;
    if(!b)return;
    const label=$("#success-additional");
    if(label)label.innerHTML='<div class="summary-line"><span>Serviço</span><strong>'+safe(b.service||b.specialty)+'</strong></div><div class="summary-line"><span>Forma de pagamento</span><strong>'+safe(b.payment==="credit"?"Cartão (simulado)":"Convênio (simulado)")+'</strong></div><div class="summary-line"><span>Endereço</span><strong>Local fictício · região da Paulista</strong></div>';
  }
  function refresh(){
    const screen=current();
    if(screen==="home")renderHomeAppointments();
    if(screen==="result")renderResultSafety();
    if(screen==="clinics")renderMapView();
    if(screen==="clinic")renderDetailsExtras();
    if(screen==="appointment")renderConfirmExtras();
    if(screen==="success")renderSuccessExtras();
  }
  document.addEventListener("click",event=>{
    const button=event.target.closest("button");
    if(!button)return;
    if(button.dataset.view){
      state.mapMode=button.dataset.view;
      renderMapView();return;
    }
    if(button.id==="map-my-location"){locateOnMap();return;}
    if(button.id==="map-reset"){if(map)map.setView([-23.563,-46.655],13);$("#map-note").textContent="Os marcadores são fictícios. © OpenStreetMap contributors.";return;}
    if(button.dataset.date){dateClick(button.dataset.date);return;}
    if(button.dataset.service){chooseService(button.dataset.service);return;}
    if(button.id==="clinic-favorite"){const id=cNow().id;if(state.favorites.has(id))state.favorites.delete(id);else state.favorites.add(id);renderDetailsExtras();return;}
    if(button.dataset.payment){state.payment=button.dataset.payment;renderConfirmExtras();return;}
  },true);
  document.addEventListener("change",event=>{
    if(event.target.id==="demo-insurance")state.insurance=event.target.value;
  });
  // Os botões de ordenação e busca também atualizam o modo mapa.
  document.addEventListener("click",event=>{
    if(event.target.closest("[data-sort]"))setTimeout(renderMapView,10);
    if(event.target.closest("[data-clinic]"))setTimeout(refresh,10);
  });
  $("#clinic-search")?.addEventListener("input",()=>setTimeout(renderMapView,10));
  window.addEventListener("trigo:screen",()=>{refresh();});
  branding();
  prepareHome();
  prepareResult();
  prepareClinics();
  prepareClinicDetails();
  prepareConfirm();
  prepareSuccess();
  initialized=true;
  refresh();
})();