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
  let map=null, markers=[], userMarker=null, initialized=false, selectedMapId=null;
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
      check:'<path d="m4 12 5 5L20 6"/>',
      medical:'<path d="M6 4v6a5 5 0 0 0 10 0V4M4 4h4m6 0h4"/><path d="M11 15v1a4.5 4.5 0 0 0 9 0v-2"/><circle cx="20" cy="12" r="2"/>',
      video:'<rect x="3" y="5" width="13" height="14" rx="3"/><path d="m16 10 5-3v10l-5-3"/><path d="M7 12h5"/>',
      hospital:'<path d="M4 21V5h16v16M9 5V2h6v3M9 11h6M12 8v6M8 21v-5h8v5"/>',
      location:'<circle cx="12" cy="12" r="7"/><circle cx="12" cy="12" r="2"/><path d="M12 1v4M12 19v4M1 12h4M19 12h4"/>',
      search:'<circle cx="10.8" cy="10.8" r="7"/><path d="m16 16 5 5"/>',
      sliders:'<path d="M4 7h10M18 7h2M4 17h2m4 0h10"/><path d="M14 4v6M8 14v6"/>'

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
    if(heading)heading.innerHTML='<div><span class="eyebrow">CLÍNICAS</span><h1 id="clinics-title">Explore no mapa</h1><p class="muted">Pontos e clínicas fictícios para demonstração.</p></div>';
    const bar=$(".filter-bar",screen);
    if(bar&&!bar.querySelector('[data-sort="insurance"]')){
      bar.querySelector('[data-sort="rating"]')?.remove();
      bar.insertAdjacentHTML("beforeend",'<button type="button" class="filter-button" data-sort="insurance">Convênio</button>');
    }
    const cards=$("#clinic-cards");
    if(!cards)return;
    const holder=document.createElement("div");
    holder.className="clinics-view-switch";
    holder.innerHTML='<div class="view-toggle" role="group" aria-label="Visualização das clínicas"><button type="button" class="view-choice" data-view="list" aria-pressed="false">☷ Lista</button><button type="button" class="view-choice selected" data-view="map" aria-pressed="true">⌖ Mapa</button></div><span class="view-demo-label">Demonstração · Região da Paulista</span>';
    cards.before(holder);
    const wrapper=document.createElement("div");
    wrapper.className="demo-map-wrap ride-map-layout";
    wrapper.id="demo-map-wrap";
    wrapper.hidden=true;
    wrapper.innerHTML="\n  <aside class=\"ride-map-sidebar\" aria-label=\"Clínicas demonstrativas\">\n    <div class=\"ride-sidebar-heading\"><span class=\"ride-sidebar-overline\">EXPLORAR CLÍNICAS</span><h2>Escolha seu atendimento</h2><p>Clique em uma clínica para ver horários e agendar.</p></div>\n    <div class=\"ride-sidebar-list\" id=\"map-clinic-list\"></div>\n    <p class=\"ride-sidebar-disclaimer\">Pontos, valores e disponibilidade fictícios.</p>\n  </aside>\n  <div class=\"ride-map-scene\">\n    <div id=\"trigo-map\" role=\"region\" aria-label=\"Mapa interativo de clínicas fictícias na região da Avenida Paulista\"></div>\n    <div id=\"trigo-map-fallback\" class=\"map-fallback\" hidden><strong>Mapa temporariamente indisponível</strong><p>Consulte as clínicas pelo botão Lista.</p><button type=\"button\" data-view=\"list\">Ver lista de clínicas</button></div>\n    <div class=\"ride-map-floating\">\n      <div class=\"ride-map-search\">\n        <button id=\"map-back-to-list\" type=\"button\" aria-label=\"Ver clínicas em lista\">‹</button>\n        <label class=\"sr-only\" for=\"map-search\">Buscar clínica ou especialidade</label>\n        <input id=\"map-search\" type=\"search\" placeholder=\"Buscar clínica ou especialidade\" autocomplete=\"off\">\n        <button type=\"button\" id=\"map-toggle-filters\" class=\"ride-filter-toggle\" aria-controls=\"map-filters\" aria-expanded=\"true\" aria-label=\"Mostrar ou ocultar filtros\">☷</button>\n      </div>\n      <div class=\"ride-map-filters\" id=\"map-filters\" role=\"group\" aria-label=\"Filtros rápidos\">\n        <button type=\"button\" class=\"ride-chip active\" data-map-filter=\"distance\">⌖ Perto no mapa</button>\n        <button type=\"button\" class=\"ride-chip\" data-map-filter=\"price\">R$ Menor preço</button>\n        <button type=\"button\" class=\"ride-chip\" data-map-filter=\"available\">◷ Disponibilidade</button>\n        <button type=\"button\" class=\"ride-chip\" data-map-filter=\"insurance\">✚ Convênio</button>\n      </div>\n    </div>\n    <button class=\"ride-recenter\" id=\"map-my-location\" type=\"button\" aria-label=\"Localizar-me no mapa\" title=\"Minha localização\">⌖</button>\n    <div class=\"ride-map-sheet\" id=\"map-bottom-sheet\" aria-label=\"Clínica selecionada\">\n      <div class=\"ride-sheet-handle\" aria-hidden=\"true\"></div>\n      <div class=\"ride-sheet-header\"><div><span class=\"ride-sheet-overline\">CLÍNICAS NA REGIÃO DE EXEMPLO</span><strong id=\"ride-results-count\">6 opções para explorar</strong></div><span id=\"ride-position-count\">1 de 6</span></div>\n      <div id=\"map-featured-card\"></div>\n      <div class=\"ride-sheet-footer\">\n        <div class=\"ride-sheet-paging\"><button type=\"button\" data-map-step=\"-1\" aria-label=\"Clínica anterior\">‹</button><button type=\"button\" data-map-step=\"1\" aria-label=\"Próxima clínica\">›</button></div>\n        <button type=\"button\" class=\"ride-booking-button\" id=\"ride-book-selected\">Ver horários <span>→</span></button>\n      </div>\n    </div>\n    <div class=\"ride-map-notice\" role=\"note\"><span class=\"ride-info-badge\" aria-hidden=\"true\">i</span><span><strong>Mapa ilustrativo</strong><small>Não representa clínicas reais.</small></span></div>\n    <p id=\"map-note\" class=\"ride-map-access-note\" role=\"status\" aria-live=\"polite\" hidden></p>\n  </div>";
    cards.before(wrapper);
    const recenter=$("#map-my-location");
    if(recenter)recenter.innerHTML=svgIcon("location");
    const toggle=$("#map-toggle-filters");
    if(toggle)toggle.innerHTML=svgIcon("sliders");
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
    map=L.map(node,{scrollWheelZoom:window.matchMedia("(min-width:901px)").matches,zoomControl:false}).setView([-23.563,-46.655],13);
    L.control.zoom({position:"topright"}).addTo(map);
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png",{
      attribution:'&copy; <a href="https://www.openstreetmap.org/copyright" rel="noopener" target="_blank">OpenStreetMap</a> contributors',
      maxZoom:19
    }).addTo(map);
    return true;
  }
  function renderFeaturedClinic(){
    const list=filteredClinics();
    const card=$("#map-featured-card");
    const count=$("#ride-results-count");
    const pos=$("#ride-position-count");
    const book=$("#ride-book-selected");
    if(!card)return;
    if(!list.length){
      selectedMapId=null;
      count.textContent="Nenhuma clínica para este filtro";
      pos.textContent="0 de 0";
      card.innerHTML='<div class="ride-empty-state">Nenhum exemplo encontrado. Experimente outro filtro.</div>';
      if(book){book.disabled=true;delete book.dataset.clinic;}
      $$(".ride-sidebar-card").forEach(el=>el.classList.remove("selected"));
      return;
    }
    if(!list.some(c=>c.id===selectedMapId))selectedMapId=list[0].id;
    const c=list.find(c=>c.id===selectedMapId)||list[0],idx=list.findIndex(v=>v.id===c.id);
    count.textContent=list.length+" clínicas demonstrativas";
    pos.textContent=(idx+1)+" de "+list.length;
    card.innerHTML='<div class="ride-featured-main"><span class="ride-featured-logo" aria-hidden="true">'+svgIcon("medical")+'</span><div class="ride-featured-copy"><strong>'+safe(c.name)+'</strong><span>'+safe(c.specialty)+' · '+safe(c.area)+'</span><div class="ride-featured-badges"><span>★ '+String(c.rating).replace(".",",")+'</span><span>◷ '+safe(c.availability)+'</span><span>'+safe(c.insurance)+'</span></div></div><div class="ride-featured-price"><small>A partir de</small><strong>'+money(c.price)+'</strong></div></div>';
    if(book){book.disabled=false;book.dataset.clinic=c.id;}
    $$(".ride-sidebar-card").forEach(el=>{const selected=el.dataset.mapFocus===c.id;el.classList.toggle("selected",selected);el.setAttribute("aria-pressed",selected?"true":"false");});
    markers.forEach(marker=>{
      const el=marker.getElement()?.querySelector(".ride-price-pin");
      if(el)el.classList.toggle("selected",marker.options.trigoClinic===c.id);
    });
  }
  function selectMapClinic(id,center=true){
    selectedMapId=id;
    renderFeaturedClinic();
    const c=clinics.find(clinic=>clinic.id===id);
    if(c && map && center)map.panTo([c.lat,c.lng],{animate:true,duration:.45});
    const node=$('#map-clinic-list [data-map-focus="'+id+'"]');
    if(node && !matchMedia("(max-width:900px)").matches)node.scrollIntoView({block:"nearest",behavior:"smooth"});
  }
  function renderMapPins(){
    if(!map||!window.L)return;
    markers.forEach(marker=>marker.remove());markers=[];
    const list=filteredClinics();
    if(!list.some(c=>c.id===selectedMapId))selectedMapId=list[0]?.id||null;
    list.forEach(c=>{
      const html='<div class="ride-price-pin '+(c.id===selectedMapId?"selected":"")+'"><span class="ride-pin-cross" aria-hidden="true">'+svgIcon("medical")+'</span><span>'+money(c.price)+'</span></div>';
      const ico=L.divIcon({className:"ride-pin-wrapper",html,iconSize:[116,44],iconAnchor:[58,39],popupAnchor:[0,-36]});
      const marker=L.marker([c.lat,c.lng],{icon:ico,keyboard:true,title:c.name+" — "+money(c.price),trigoClinic:c.id}).addTo(map);
      const popup=document.createElement("div");
      popup.className="ride-clinic-popup";
      popup.innerHTML='<strong>'+safe(c.name)+'</strong><span>'+safe(c.specialty)+' · '+money(c.price)+'</span><button type="button" data-clinic="'+safe(c.id)+'">Ver horários →</button>';
      popup.querySelector("button").addEventListener("click",(event)=>{event.preventDefault();api.chooseClinic(c.id);});
      marker.bindPopup(popup,{autoPan:true,closeButton:true,maxWidth:260});

      marker.on("click",()=>{selectMapClinic(c.id,true);marker.openPopup();});
      markers.push(marker);
    });
  }
  function renderMapView(){
    const wrapper=$("#demo-map-wrap"),listBox=$("#clinic-cards"),screen=$("#screen-clinics");
    if(!wrapper||!listBox||!screen)return;
    const show=state.mapMode==="map";
    listBox.hidden=show;
    wrapper.hidden=!show;
    screen.classList.toggle("is-map-active",show);
    $$("[data-view]").forEach(b=>{
      const pressed=b.dataset.view===state.mapMode;
      b.classList.toggle("selected",pressed);
      b.setAttribute("aria-pressed",pressed?"true":"false");
    });
    if(!show)return;
    const input=$("#map-search");
    if(input && input.value!==state.search)input.value=state.search;
    const ok=initMap();
    $("#trigo-map-fallback").hidden=ok;
    $("#trigo-map").hidden=!ok;
    const visible=filteredClinics();
    const sidebar=$("#map-clinic-list");
    if(sidebar){
      sidebar.innerHTML=visible.map(c=>'<button type="button" class="ride-sidebar-card" aria-label="Abrir detalhes e agendar em '+safe(c.name)+'" data-map-focus="'+safe(c.id)+'"><span class="ride-sidebar-symbol">'+svgIcon("hospital")+'</span><span class="ride-sidebar-details"><strong>'+safe(c.name)+'</strong><small>'+safe(c.specialty)+' · '+safe(c.availability)+'</small><span>★ '+String(c.rating).replace(".",",")+' · '+safe(c.insurance)+'</span></span><strong class="ride-sidebar-price">'+money(c.price)+'</strong></button>').join("")||'<p class="ride-empty-state">Nenhuma clínica encontrada neste exemplo.</p>';
    }
    $$(".ride-chip").forEach(b=>{
      const active=b.dataset.mapFilter==="insurance"?state.insuranceOnly:b.dataset.mapFilter===state.sort;
      b.classList.toggle("active",active);b.setAttribute("aria-pressed",active?"true":"false");
    });
    if(ok){
      renderMapPins();
      setTimeout(()=>{
        if(!map)return;
        map.invalidateSize(true);
        if(markers.length){
          const bounds=L.latLngBounds(visible.map(c=>[c.lat,c.lng]));
          map.fitBounds(bounds,{paddingTopLeft:[26,65],paddingBottomRight:[26,165],maxZoom:13,animate:false});

        }
      },120);
    }
    renderFeaturedClinic();
  }
  function locateOnMap(){
    const node=$("#map-note");
    if(node){node.hidden=false;node.classList.add("is-visible");}
    if(!navigator.geolocation){if(node)node.textContent="Este navegador não oferece geolocalização.";return;}
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
      services.innerHTML='<h3>Serviços oferecidos</h3>'+options.map(service=>'<button type="button" class="service-row '+(state.selectedService===service[0]?"selected":"")+'" data-service="'+safe(service[0])+'"><span class="service-symbol">'+svgIcon(service[0].toLowerCase().includes("tele")?"video":"medical")+'</span><span><strong>'+safe(service[0])+'</strong><small>Presencial / demonstração · '+service[2]+' min</small></span><strong class="service-price">'+money(service[1])+'</strong></button>').join("");
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
    if(button.id==="map-back-to-list"){
      state.mapMode="list";
      renderMapView();return;
    }
    if(button.id==="map-toggle-filters"){
      const filters=$("#map-filters");
      const open=button.getAttribute("aria-expanded")!=="true";
      button.setAttribute("aria-expanded",String(open));
      filters.hidden=!open;
      return;
    }
    if(button.dataset.mapFocus){
      event.preventDefault();
      event.stopPropagation();
      api.chooseClinic(button.dataset.mapFocus);
      return;
    }
    if(button.dataset.mapStep){
      const visible=filteredClinics();
      if(!visible.length)return;
      const currentIndex=Math.max(0,visible.findIndex(c=>c.id===selectedMapId));
      const delta=Number(button.dataset.mapStep);
      const next=visible[(currentIndex+delta+visible.length)%visible.length];
      selectMapClinic(next.id);return;
    }
    if(button.dataset.mapFilter){
      const type=button.dataset.mapFilter;
      if(type==="insurance")state.insuranceOnly=!state.insuranceOnly;
      else state.sort=type;
      api.renderClinics();
      renderMapView();return;
    }
    if(button.id==="ride-book-selected"){
      event.preventDefault();
      event.stopPropagation();
      if(selectedMapId)api.chooseClinic(selectedMapId);
      return;
    }
    if(button.id==="map-my-location"){locateOnMap();return;}
    if(button.id==="map-reset"){
      if(map)map.setView([-23.563,-46.655],13);
      $("#map-note").textContent="Mapa de exemplo restaurado. Nenhuma clínica real é representada.";
      $("#map-note").classList.add("is-visible");
      $("#map-note").hidden=false;
      setTimeout(()=>{const notice=$("#map-note");if(notice){notice.classList.remove("is-visible");notice.hidden=true;}},3500);
      return;
    }
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
  // O campo flutuante mantém a mesma pesquisa do modo lista.
  $("#map-search")?.addEventListener("input",event=>{
    state.search=event.target.value;
    const regular=$("#clinic-search");
    if(regular)regular.value=state.search;
    api.renderClinics();
    renderMapView();
  });
  $("#map-search")?.addEventListener("keydown",event=>{
    if(event.key==="Escape"&&event.target.value){
      event.target.value="";
      event.target.dispatchEvent(new Event("input",{bubbles:true}));
    }
  });
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