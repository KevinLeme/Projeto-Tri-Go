/* Tri'Go | catálogo de especialidades.
 * As áreas sem clínicas fictícias permanecem visíveis, mas nunca apresentam
 * disponibilidade inventada. O filtro do mapa usa a especialidade exata.
 */
(() => {
  "use strict";
  const api=window.TriGo;
  if(!api)return;
  const root=document.getElementById("screen-specialties");
  if(!root)return;
  const $=(q,from=document)=>from.querySelector(q);
  const $$=(q,from=document)=>Array.from(from.querySelectorAll(q));
  const safe=(s)=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const catalog=[
    {name:"Clínica geral",description:"Cuidados gerais e avaliação inicial.",icon:"stethoscope"},
    {name:"Pediatria",description:"Cuidados de saúde de crianças e adolescentes.",icon:"baby"},
    {name:"Ortopedia",description:"Ossos, articulações, músculos e movimento.",icon:"bone"},
    {name:"Cardiologia",description:"Cuidados relacionados ao coração.",icon:"heart"},
    {name:"Dermatologia",description:"Cuidados com pele, cabelos e unhas.",icon:"skin"},
    {name:"Ginecologia",description:"Saúde ginecológica e acompanhamento.",icon:"flower"},
    {name:"Neurologia",description:"Avaliação neurológica especializada.",icon:"brain"},
    {name:"Oftalmologia",description:"Saúde dos olhos e da visão.",icon:"eye"},
    {name:"Otorrinolaringologia",description:"Ouvidos, nariz e garganta.",icon:"ear"},
    {name:"Endocrinologia",description:"Hormônios e saúde metabólica.",icon:"flask"},
    {name:"Psiquiatria",description:"Avaliação médica em saúde mental.",icon:"mind"},
    {name:"Gastroenterologia",description:"Aparelho digestivo e condições relacionadas.",icon:"stomach"},
    {name:"Urologia",description:"Saúde do trato urinário e urológica.",icon:"drop"},
    {name:"Pneumologia",description:"Saúde dos pulmões e da respiração.",icon:"lungs"},
    {name:"Reumatologia",description:"Doenças reumáticas e articulares.",icon:"joints"},
    {name:"Geriatria",description:"Cuidados médicos voltados ao envelhecimento.",icon:"people"},
    {name:"Nefrologia",description:"Cuidados relacionados aos rins.",icon:"kidney"},
    {name:"Angiologia",description:"Saúde de vasos sanguíneos e circulação.",icon:"activity"}
  ];
  const paths={
    stethoscope:'<path d="M6 3v6a5 5 0 0 0 10 0V3M4 3h4m6 0h4"/><path d="M11 14v1.5a4.5 4.5 0 0 0 9 0V13"/><circle cx="20" cy="11.5" r="2"/>',
    baby:'<circle cx="12" cy="13" r="8"/><path d="M10 5c0-2 4-3 5 0"/><path d="M9 13h.01M15 13h.01M9.5 16c1.5 1.5 3.5 1.5 5 0"/>',
    bone:'<path d="M17.5 5.5a2.5 2.5 0 1 1 3.5 3.5l-10 10a2.5 2.5 0 1 1-3.5-3.5l10-10Z"/><path d="M7.5 15.5a2.5 2.5 0 1 0-3.5-3.5M17.5 5.5a2.5 2.5 0 1 0-3.5-3.5"/>',
    heart:'<path d="M20.8 4.5a5.3 5.3 0 0 0-7.5 0L12 5.8l-1.3-1.3a5.3 5.3 0 0 0-7.5 7.5L12 21l8.8-9a5.3 5.3 0 0 0 0-7.5Z"/><path d="M5.2 12h3l2-3 3.1 6 1.7-3h3.8"/>',
    skin:'<path d="M12 3c-4 4-7 7-7 11a7 7 0 0 0 14 0c0-4-3-7-7-11Z"/><path d="M9 15c0 1.7 1.3 3 3 3"/>',
    flower:'<circle cx="12" cy="12" r="2"/><path d="M12 10V4c-3-3-7 2-4 5l2 2M14 12h6c3-3-2-7-5-4l-2 2M12 14v6c3 3 7-2 4-5l-2-2M10 12H4c-3 3 2 7 5 4l2-2"/>',
    brain:'<path d="M12 4c-3-3-8-1-8 3-3 2-2 6 1 7-1 4 3 7 7 5 4 2 8-1 7-5 3-1 4-5 1-7 0-4-5-6-8-3Z"/><path d="M12 4v16M8 8c-1 2 0 4 2 5m6-5c1 2 0 4-2 5"/>',
    eye:'<path d="M2 12s3.7-6 10-6 10 6 10 6-3.7 6-10 6S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>',
    ear:'<path d="M10 20c0 2 4 2 5 0 1-3-1-4 1-6a6 6 0 1 0-10-5"/><path d="M11 13c-1-2-1-5 2-6 4-1 6 4 3 6"/>',
    flask:'<path d="M9 3h6M10 3v7l-6 9a2 2 0 0 0 2 3h12a2 2 0 0 0 2-3l-6-9V3M7 16h10"/>',
    mind:'<circle cx="12" cy="12" r="9"/><path d="M9 10h.01M15 10h.01M8.5 15c2 2 5 2 7 0M7 5c1-1 2-1 3-1"/>',
    stomach:'<path d="M12 3v7c0 2 2 2 3 1 3-2 6 1 5 5-1 4-4 6-8 6-5 0-9-4-9-9 0-3 2-5 5-5h1V3"/>',
    drop:'<path d="M12 2C9 6 5 11 5 15a7 7 0 0 0 14 0c0-4-4-9-7-13Z"/><path d="M9 16c0 2 1 3 3 3"/>',
    lungs:'<path d="M12 3v10M9 7c-3 0-5 3-6 8-1 5 1 7 4 7 4 0 5-4 5-9M15 7c3 0 5 3 6 8 1 5-1 7-4 7-4 0-5-4-5-9"/>',
    joints:'<circle cx="7" cy="7" r="3"/><circle cx="17" cy="17" r="3"/><path d="m9 9 6 6M6 14l3-3M15 13l3-3"/>',
    people:'<circle cx="9" cy="8" r="3"/><path d="M3 21v-2c0-4 3-6 6-6 3 0 6 2 6 6v2M16 5c3 0 5 2 5 5M18 14c2 1 3 3 3 6"/>',
    kidney:'<path d="M9 3C5 3 3 7 3 12c0 4 2 9 6 9 4 0 3-5 1-7-3-3-1-6 1-7-1-3-1-4-2-4Zm6 0c4 0 6 4 6 9 0 4-2 9-6 9-4 0-3-5-1-7 3-3 1-6-1-7 1-3 1-4 2-4Z"/>',
    activity:'<path d="M2 12h5l3-7 4 14 3-7h5"/>'
  };
  const icon=(name)=>'<svg width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+(paths[name]||paths.stethoscope)+'</svg>';
  const input=$("#specialty-search"),grid=$("#specialties-grid"),count=$("#specialties-count"),empty=$("#specialties-empty"),notice=$("#specialties-notice");
  const clearSearch=$("#specialty-search-clear");
  let mode="all",focusSuggestion="";
  const counts=()=>new Map(catalog.map(s=>[s.name,api.clinics.filter(c=>c.specialty===s.name).length]));
  function setNotice(message=""){
    notice.textContent=message;
    notice.hidden=!message;
  }
  function renderCatalog(){
    const query=input.value.trim().toLocaleLowerCase("pt-BR").normalize("NFD").replace(/[\u0300-\u036f]/g,"");
    const countByName=counts();
    const normalize=text=>text.toLocaleLowerCase("pt-BR").normalize("NFD").replace(/[\u0300-\u036f]/g,"");
    const found=catalog.filter(s=>normalize(s.name+" "+s.description).includes(query) && (mode==="all" || countByName.get(s.name)>0));
    grid.innerHTML=found.map(s=>{
      const n=countByName.get(s.name)||0;
      const available=n>0;
      const selected=focusSuggestion===s.name;
      return '<button type="button" class="specialty-catalog-card'+(selected?' is-highlighted':'')+'" data-specialty-select="'+safe(s.name)+'" aria-label="'+safe(s.name)+', '+(available?n+' clínicas fictícias disponíveis na demonstração':'sem clínicas cadastradas na demonstração')+'">'+
        '<span class="specialty-catalog-icon">'+icon(s.icon)+'</span>'+
        '<span class="specialty-catalog-content"><strong>'+safe(s.name)+'</strong><small>'+safe(s.description)+'</small><span class="specialty-catalog-meta '+(available?'has-options':'no-options')+'">'+(available?n+' '+(n===1?'clínica de exemplo':'clínicas de exemplo'):'Sem clínicas na demonstração')+'</span></span>'+
        '<span class="specialty-catalog-arrow" aria-hidden="true">→</span></button>';
    }).join("");
    count.textContent=found.length+" "+(found.length===1?"especialidade":"especialidades");
    empty.hidden=found.length!==0;
    clearSearch.hidden=!input.value;
    $$("[data-specialty-mode]",root).forEach(button=>{
      const active=button.dataset.specialtyMode===mode;
      button.classList.toggle("active",active);
      button.setAttribute("aria-pressed",String(active));
    });
  }
  function clearSpecialty(){
    api.state.specialtyFilter="";
    api.state.search="";
    api.state.insuranceOnly=false;
    api.renderClinics();
    api.navigate("clinics");
  }
  function chooseSpecialty(name){
    const item=catalog.find(s=>s.name===name);
    if(!item)return;
    const available=api.clinics.some(c=>c.specialty===item.name);
    focusSuggestion=item.name;
    if(!available){
      $$(".specialty-catalog-card",grid).forEach(card=>card.classList.toggle("is-highlighted",card.dataset.specialtySelect===name));
      setNotice("Ainda não há clínicas fictícias cadastradas em "+name+". Escolha uma das especialidades com exemplos ou veja todas as clínicas.");
      notice.scrollIntoView({block:"nearest",behavior:"smooth"});
      return;
    }
    api.state.specialtyFilter=name;
    api.state.search="";
    api.state.insuranceOnly=false;
    api.state.mapMode="map";
    setNotice();
    api.navigate("clinics");
  }
  function syncClinicsFilter(){
    let badge=$("#specialty-active-badge");
    const wrapper=$("#demo-map-wrap");
    const menu=wrapper?.querySelector(".ride-map-floating");
    if(!badge && menu){
      badge=document.createElement("div");
      badge.id="specialty-active-badge";
      badge.className="specialty-active-badge";
      badge.setAttribute("role","status");
      menu.appendChild(badge);
    }
    let listBadge=$("#specialty-active-list-badge");
    const section=$("#screen-clinics");
    const view=section?.querySelector(".clinics-view-switch");
    if(!listBadge && view){
      listBadge=document.createElement("div");
      listBadge.id="specialty-active-list-badge";
      listBadge.className="specialty-active-list-badge";
      view.before(listBadge);
    }
    for(const el of [badge,listBadge]){
      if(!el)continue;
      const active=!!api.state.specialtyFilter;
      el.hidden=!active;
      if(active){
        el.replaceChildren();
        const label=document.createElement("span");
        label.textContent="Especialidade: "+api.state.specialtyFilter;
        const clear=document.createElement("button");
        clear.type="button";
        clear.dataset.clearSpecialty="";
        clear.setAttribute("aria-label","Limpar filtro de especialidade");
        clear.textContent="×";
        const change=document.createElement("button");
        change.type="button";
        change.dataset.go="specialties";
        change.textContent="Alterar";
        el.append(label,change,clear);
      }
    }
    const homeClinicSearch=$("#clinic-search");
    if(homeClinicSearch && location.hash.startsWith("#/clinics"))homeClinicSearch.value=api.state.search;
  }
  function resetCatalog(){
    mode="all";
    input.value="";
    focusSuggestion="";
    setNotice();
    renderCatalog();
  }

  document.addEventListener("click",event=>{
    const homeCard=event.target.closest("[data-catalog-specialty]");
    if(homeCard){
      event.preventDefault();
      focusSuggestion=homeCard.dataset.catalogSpecialty||"";
      input.value="";
      mode="all";
      setNotice();
      api.navigate("specialties");
      return;
    }
    const catalogCard=event.target.closest("[data-specialty-select]");
    if(catalogCard){
      event.preventDefault();
      chooseSpecialty(catalogCard.dataset.specialtySelect);
      return;
    }
    const modeButton=event.target.closest("[data-specialty-mode]");
    if(modeButton){
      mode=modeButton.dataset.specialtyMode;
      setNotice();
      renderCatalog();
      return;
    }
    if(event.target.closest("#specialty-search-clear")){
      input.value="";
      setNotice();
      renderCatalog();
      input.focus();
      return;
    }
    if(event.target.closest("[data-specialty-reset]")){
      resetCatalog();
      return;
    }
    if(event.target.closest("[data-specialty-all-clinics]")||event.target.closest("[data-clear-specialty]")){
      clearSpecialty();
      return;
    }
  });
  input.addEventListener("input",()=>{setNotice();renderCatalog();});
  window.addEventListener("trigo:screen",event=>{
    if(event.detail?.screen==="specialties"){
      renderCatalog();
      if(focusSuggestion){
        const matching=$$(".specialty-catalog-card",grid).find(card=>card.dataset.specialtySelect===focusSuggestion);
        if(matching)requestAnimationFrame(()=>matching.scrollIntoView({block:"nearest",behavior:"smooth"}));
      }
    }
    if(event.detail?.screen==="clinics")syncClinicsFilter();
  });
  window.TriGoSpecialties={catalog,chooseSpecialty,resetCatalog,clearSpecialty,renderCatalog};
  renderCatalog();
  syncClinicsFilter();
})();
