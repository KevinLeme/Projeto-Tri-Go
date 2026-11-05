(() => {
  "use strict";

  // Somente dados fictícios. Nenhuma informação é enviada a servidores.
  // Todos os pontos são personagens/unidades de exemplo posicionados na região da Paulista para demonstrar o mapa.
  // Não são estabelecimentos reais nem endereços verificados.
  const clinics = [
    {id:"central",name:"Hospital Central",area:"Região da Paulista · exemplo",specialty:"Ortopedia",price:200,rating:4.9,distance:5.5,availability:"Hoje",insurance:"SulAmérica",lat:-23.5659,lng:-46.6565,services:[["Consulta médica",200,30],["Teleconsulta",150,20]]},
    {id:"viva",name:"Clínica Viva • Paulista",area:"Bela Vista · exemplo",specialty:"Ortopedia",price:150,rating:4.8,distance:1.2,availability:"Amanhã",insurance:"Bradesco",lat:-23.5615,lng:-46.6541,services:[["Consulta médica",200,30],["Teleconsulta",150,20]]},
    {id:"marcos",name:"Dr. Marcos Souza",area:"Consolação · exemplo",specialty:"Ortopedia",price:180,rating:4.7,distance:2.8,availability:"Em 3 dias",insurance:"Unimed",lat:-23.5580,lng:-46.6600,services:[["Consulta médica",180,30]]},
    {id:"ortho",name:"Clínica OrthoVida",area:"Jardins · exemplo",specialty:"Ortopedia",price:150,rating:4.7,distance:7.2,availability:"Amanhã",insurance:"Particular",lat:-23.5681,lng:-46.6684,services:[["Consulta médica",150,30]]},
    {id:"saude",name:"Centro Vida Saúde",area:"Paraíso · exemplo",specialty:"Clínica geral",price:160,rating:4.8,distance:3.6,availability:"Hoje",insurance:"Unimed",lat:-23.5730,lng:-46.6410,services:[["Clínica geral",160,30],["Teleconsulta",110,20]]},
    {id:"infantil",name:"Clínica Bem Viver",area:"Bela Vista · exemplo",specialty:"Pediatria",price:170,rating:4.8,distance:4.0,availability:"Amanhã",insurance:"Bradesco",lat:-23.5559,lng:-46.6461,services:[["Consulta pediátrica",170,40]]}
  ];
  const screens = ["welcome","home","triage","result","clinics","clinic","appointment","success","bookings","profile"];
  const titles = {welcome:"Bem-vindo",home:"Início",triage:"Triagem",result:"Resultado",clinics:"Clínicas",clinic:"Detalhes da clínica",appointment:"Confirmar atendimento",success:"Agendamento demonstrativo",bookings:"Atendimentos",profile:"Perfil"};
  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => Array.from(document.querySelectorAll(selector));
  const money = (n) => Number(n).toLocaleString("pt-BR",{style:"currency",currency:"BRL",maximumFractionDigits:0});
  const escapeHtml = (value) => String(value).replace(/[&<>"']/g,(c)=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const todayLocal = () => { const d=new Date(); const z=(n)=>String(n).padStart(2,"0"); return d.getFullYear()+"-"+z(d.getMonth()+1)+"-"+z(d.getDate()); };
  const formatDate = (date) => date ? new Intl.DateTimeFormat("pt-BR",{day:"2-digit",month:"long",year:"numeric"}).format(new Date(date+"T12:00:00")) : "Não selecionada";
  const state = {sort:"distance",search:"",clinicId:"central",date:"",time:"",patient:"",booking:null,insuranceOnly:false,mapMode:"list",selectedService:"",payment:"insurance",insurance:"",favorites:new Set(),isRescheduling:false};
  const clinicById = (id) => clinics.find((c)=>c.id===id) || clinics[0];
  const currentClinic = () => clinicById(state.clinicId);
  function navigate(screen) {
    if (!screens.includes(screen)) screen="welcome";
    if (location.hash !== "#/"+screen) location.hash="/"+screen;
    else renderScreen(screen);
  }
  function currentScreen() { const screen=location.hash.replace(/^#\//,"").split("?")[0];return screens.includes(screen)?screen:"welcome"; }
  function renderScreen(screen) {
    document.body.classList.toggle("is-welcome-screen", screen === "welcome");
    document.body.classList.toggle("is-triage-screen", screen === "triage");
    $$(".screen").forEach((node)=>{const active=node.id==="screen-"+screen;node.classList.toggle("is-active",active);node.hidden=!active;});
    $$("[data-nav]").forEach((node)=>{const active=node.dataset.nav===screen || (screen==="clinic"&&node.dataset.nav==="clinics") || (screen==="success"&&node.dataset.nav==="bookings");node.classList.toggle("is-active",active);if(active)node.setAttribute("aria-current","page");else node.removeAttribute("aria-current");});
    $("#page-title").textContent=titles[screen]||"Tri-Go";
    if (screen==="result") renderResults();
    if (screen==="clinics") renderClinics();
    if (screen==="clinic") renderClinicDetails();
    if (screen==="appointment") renderConfirmation();
    if (screen==="success") renderSuccess();
    if (screen==="bookings") renderBookings();
    if (screen==="home") updateGreeting();
    window.dispatchEvent(new CustomEvent("trigo:screen",{detail:{screen}}));
    window.scrollTo(0,0);
  }
  function updateGreeting() {
    const hour=new Date().getHours();
    $(".greeting").textContent=(hour<12?"Bom dia":hour<18?"Boa tarde":"Boa noite")+", Mariana";
  }
  function clinicCard(c) {
    return '<article class="clinic-card">'+
      '<div class="card-top"><span class="clinic-symbol" aria-hidden="true">✚</span><div><h3>'+escapeHtml(c.name)+'</h3><p>'+escapeHtml(c.area)+'</p></div><span class="rating">★ '+String(c.rating).replace(".",",")+'</span></div>'+
      '<div class="card-details"><span>⌖ '+String(c.distance).replace(".",",")+' km · demonstrativo</span><span>◷ '+escapeHtml(c.availability)+'</span><span>'+escapeHtml(c.specialty)+'</span></div>'+
      '<div class="card-bottom"><div><small>Valor estimado</small><strong>'+money(c.price)+'</strong></div><button type="button" class="btn btn-primary" data-clinic="'+c.id+'">Ver horários →</button></div></article>';
  }
  function renderResults() {
    $("#result-clinics").innerHTML=clinics.slice(0,2).map(clinicCard).join("");
  }
  function renderClinics() {
    let list=clinics.filter((c)=>(c.name+" "+c.area+" "+c.specialty+" "+c.insurance).toLocaleLowerCase("pt-BR").includes(state.search.toLocaleLowerCase("pt-BR")) && (!state.insuranceOnly||c.insurance!=="Particular"));
    const orders={distance:(a,b)=>a.distance-b.distance,price:(a,b)=>a.price-b.price,available:(a,b)=>["Hoje","Amanhã","Em 3 dias"].indexOf(a.availability)-["Hoje","Amanhã","Em 3 dias"].indexOf(b.availability),rating:(a,b)=>b.rating-a.rating,insurance:(a,b)=>a.insurance.localeCompare(b.insurance)};
    list=list.sort(orders[state.sort]||orders.distance);
    $("#clinic-cards").innerHTML=list.length?list.map(clinicCard).join(""):'<div class="content-card empty-state"><h2>Nenhum resultado nesta demonstração</h2><p>Tente outra especialidade ou nome de clínica.</p></div>';
    $("#clinic-count").textContent=list.length+" exemplo(s)";
    $(".filter-button").forEach((b)=>b.classList.toggle("is-selected",b.dataset.sort==="insurance"?state.insuranceOnly:b.dataset.sort===state.sort));
    $("#clinic-search").value=state.search;
  }
  function renderClinicDetails() {
    const c=currentClinic();
    $("#clinic-title").textContent="Detalhes da clínica";
    $("#selected-clinic-name").textContent=c.name;
    $("#selected-clinic-location").textContent=c.area+" · "+String(c.distance).replace(".",",")+" km (exemplo)";
    $("#selected-clinic-rating").textContent="★ "+String(c.rating).replace(".",",")+" (fictícia)";
    $("#selected-clinic-specialty").textContent=c.specialty;
    $("#selected-clinic-price").textContent=money(c.price);
    $("#selected-clinic-insurance").textContent=c.insurance;
    const input=$("#appointment-date");
    input.min=todayLocal();
    if(state.date && state.date>=todayLocal()) input.value=state.date;
    else {input.value="";state.date="";}
    $$(".time-slot").forEach((b)=>b.classList.toggle("is-selected",b.dataset.time===state.time));
    $("#appointment-error").hidden=true;
  }
  function renderConfirmation() {
    if(!state.date || !state.time){navigate("clinic");return;}
    const c=currentClinic();
    $("#appointment-clinic").textContent=c.name;
    $("#appointment-day").textContent=formatDate(state.date);
    $("#appointment-time").textContent=state.time||"Não selecionado";
    $("#appointment-value").textContent=money(c.price);
    $("#appointment-specialty").textContent=c.specialty;
    $("#patient-name").value=state.patient;
    $("#confirm-error").hidden=true;
  }
  function renderSuccess() {
    const b=state.booking;
    if(!b){navigate("clinics");return;}
    $("#success-specialty").textContent=b.specialty;
    $("#success-clinic").textContent=b.clinic;
    $("#success-patient").textContent=b.patient;
    $("#success-date").textContent=formatDate(b.date);
    $("#success-time").textContent=b.time;
    $("#success-price").textContent=money(b.price);
  }
  function renderBookings() {
    const el=$("#booking-content");
    const b=state.booking;
    if(!b){el.className="content-card empty-state";el.innerHTML='<div class="empty-icon">▣</div><h2>Você ainda não possui agendamentos</h2><p>Explore as clínicas e simule seu primeiro atendimento.</p><button type="button" class="btn btn-primary" data-go="clinics">Explorar clínicas →</button>';return;}
    el.className="content-card";
    el.innerHTML='<span class="soft-tag">Agendamento de teste</span><h2 style="margin-top:16px">'+escapeHtml(b.clinic)+'</h2><p class="muted">'+escapeHtml(b.specialty)+' · '+escapeHtml(formatDate(b.date))+' às '+escapeHtml(b.time)+'</p><p>Paciente: <strong>'+escapeHtml(b.patient)+'</strong></p><div class="action-duo"><button type="button" class="btn btn-outline" data-action="reschedule">Remarcar</button><button type="button" class="btn btn-outline" data-action="cancel">Cancelar</button></div>';
  }
  function chooseClinic(id) {
    state.clinicId=clinicById(id).id;
    state.time="";state.date="";state.selectedService="";state.insurance="";state.isRescheduling=false;
    window.dispatchEvent(new CustomEvent("trigo:clinic",{detail:{clinicId:state.clinicId}}));
    navigate("clinic");
  }
  function validateTriage() {
    const symptoms=$$('input[name="symptom"]:checked');
    const duration=$('input[name="duration"]:checked');
    const valid=symptoms.length>0 && duration;
    $("#triage-error").hidden=!!valid;
    if(valid)navigate("result");
  }
  function continueAppointment() {
    state.date=$("#appointment-date").value;
    const valid=state.date>=todayLocal() && state.date!=="" && state.time!=="" && new Date(state.date+"T"+state.time+":00").getTime()>Date.now();
    $("#appointment-error").hidden=valid;
    if(valid) navigate("appointment");
  }
  function confirmAppointment() {
    if(!state.date || !state.time){navigate("clinic");return;}
    const name=$("#patient-name").value.trim();
    if(name.length<2){$("#confirm-error").hidden=false;return;}
    $("#confirm-error").hidden=true;
    state.patient=name;
    const c=currentClinic();
    const existing=state.booking;
    const chosenService=c.services?.find(item=>item[0]===state.selectedService);
    state.booking={clinic:c.name,clinicId:c.id,specialty:c.specialty,price:chosenService?.[1]??c.price,date:state.date,time:state.time,patient:name,service:chosenService?.[0]||"Consulta médica",payment:state.payment,insurance:state.insurance,createdAt:existing?.createdAt||Date.now()};
    state.isRescheduling=false;
    navigate("success");
  }
  function cancelBooking() {
    if(!state.booking)return;
    if(window.confirm("Cancelar o agendamento fictício?")){state.booking=null;state.time="";state.isRescheduling=false;window.dispatchEvent(new CustomEvent("trigo:cancel"));navigate("bookings");}
  }
  function reschedule() {
    if(!state.booking)return navigate("clinics");
    state.clinicId=state.booking.clinicId;state.patient=state.booking.patient;state.date=state.booking.date;state.time=state.booking.time;state.payment=state.booking.payment||"insurance";state.insurance=state.booking.insurance||"";state.selectedService=state.booking.service||"";state.isRescheduling=true;
    navigate("clinic");
  }
  function saveCalendar() {
    const b=state.booking;
    if(!b)return;
    const start=b.date.replace(/-/g,"")+"T"+b.time.replace(":","")+"00";
    const endDate=new Date(b.date+"T"+b.time+":00");endDate.setMinutes(endDate.getMinutes()+45);
    const pad=(n)=>String(n).padStart(2,"0");
    const end=endDate.getFullYear()+pad(endDate.getMonth()+1)+pad(endDate.getDate())+"T"+pad(endDate.getHours())+pad(endDate.getMinutes())+"00";
    const clean=(value)=>String(value).replace(/[,\n;\\]/g," ");
    const ics=["BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//TriGo//Demonstracao//PT-BR","BEGIN:VEVENT","UID:demo-"+Date.now()+"@trigo.local","DTSTART:"+start,"DTEND:"+end,"SUMMARY:"+clean("DEMONSTRAÇÃO Tri-Go - "+b.specialty),"DESCRIPTION:"+clean("Reserva fictícia. Nenhuma consulta real foi agendada."),"LOCATION:"+clean(b.clinic),"END:VEVENT","END:VCALENDAR"].join("\r\n");
    const url=URL.createObjectURL(new Blob([ics],{type:"text/calendar;charset=utf-8"}));
    const link=document.createElement("a");link.href=url;link.download="trigo-agendamento-demo.ics";link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  }
  document.addEventListener("click",(event)=>{
    const t=event.target.closest("button, a");
    if(!t)return;
    if(t.dataset.go){event.preventDefault();navigate(t.dataset.go);return;}
    if(t.dataset.clinic){chooseClinic(t.dataset.clinic);return;}
    if(t.dataset.sort){if(t.dataset.sort==="insurance"){state.insuranceOnly=!state.insuranceOnly;}else{state.sort=t.dataset.sort;}renderClinics();return;}
    if(t.dataset.time){state.time=t.dataset.time;$$(".time-slot").forEach((b)=>b.classList.toggle("is-selected",b.dataset.time===state.time));$("#appointment-error").hidden=true;return;}
    if(t.dataset.action==="cancel"||t.id==="cancel-appointment")cancelBooking();
    else if(t.dataset.action==="reschedule"||t.id==="reschedule")reschedule();
    else if(t.id==="complete-triage")validateTriage();
    else if(t.id==="continue-appointment")continueAppointment();
    else if(t.id==="confirm-appointment")confirmAppointment();
    else if(t.id==="save-calendar")saveCalendar();
  });
  $("#clinic-search").addEventListener("input",(e)=>{state.search=e.target.value;renderClinics();});
  $("#home-search").addEventListener("keydown",(e)=>{if(e.key==="Enter"){state.search=e.target.value;navigate("clinics");}});
  $("#home-search").addEventListener("input",(e)=>{state.search=e.target.value;});
  $("#appointment-date").addEventListener("change",(e)=>{state.date=e.target.value;$("#appointment-error").hidden=true;});
  window.addEventListener("trigo:service",(event)=>{state.selectedService=event.detail.name;});
  window.TriGo={clinics,state,navigate,chooseClinic,renderClinics,renderClinicDetails,renderConfirmation,renderBookings,clinicById,currentClinic,money,todayLocal,formatDate};
  window.addEventListener("hashchange",()=>renderScreen(currentScreen()));
  if(!location.hash)location.replace("#/welcome");
  renderScreen(currentScreen());
})();
