/* Tri'Go — GPS opt-in e pesquisa manual de endereço no mapa demonstrativo.
 * Não salva coordenadas nem envia localização para o backend.
 * Pesquisa de endereço: envio APENAS após o usuário clicar em Buscar, via Nominatim/OSM.
 * API pública usada somente em demonstração, sem autocomplete e limitada localmente.
 */
(() => {
  "use strict";
  const root=document.getElementById("demo-map-wrap");
  const floating=root?.querySelector(".ride-map-floating");
  if(!root||!floating||!window.TriGoMap)return;

  const toolbar=document.createElement("div");
  toolbar.className="ride-location-tools";
  toolbar.innerHTML=
    '<div class="ride-location-buttons">'+
      '<button type="button" class="ride-gps-button" id="ride-use-gps" aria-label="Usar localização atual do aparelho"><span aria-hidden="true">⌖</span> Usar minha localização</button>'+
      '<button type="button" class="ride-address-button" id="ride-open-address" aria-expanded="false" aria-controls="ride-address-panel"><span aria-hidden="true">⌕</span> Digitar endereço</button>'+
    '</div>'+
    '<form id="ride-address-panel" class="ride-address-panel" hidden>'+
      '<label for="ride-address-input">Rua, bairro ou cidade</label>'+
      '<div class="ride-address-fields"><input id="ride-address-input" type="search" inputmode="search" autocomplete="off" maxlength="140" placeholder="Ex.: Centro, Varginha, MG" required><button id="ride-search-address" type="submit">Localizar</button></div>'+
      '<p>Busque por cidade, bairro ou rua. Ao pesquisar, o texto será enviado ao OpenStreetMap/Nominatim; evite endereços residenciais completos.</p>'+
      '<div id="ride-address-results" class="ride-address-results" role="group" aria-label="Endereços encontrados" hidden></div>'+
    '</form>';
  // No desktop, o endereço fica no painel lateral e não cobre o mapa.
  // No celular, os dois botões aparecem sobre o mapa como nos apps de mobilidade.
  function moveLocationToolbar(){
    const sidebar=root.querySelector(".ride-map-sidebar");
    const list=sidebar?.querySelector(".ride-sidebar-list");
    if(window.matchMedia("(min-width:901px)").matches && list){
      sidebar.insertBefore(toolbar,list);
      toolbar.classList.add("ride-location-in-sidebar");
    }else{
      floating.appendChild(toolbar);
      toolbar.classList.remove("ride-location-in-sidebar");
    }
  }
  moveLocationToolbar();
  window.addEventListener("resize",moveLocationToolbar);

  const status=document.createElement("div");
  status.id="ride-location-status";
  status.className="ride-location-status";
  status.setAttribute("role","status");
  status.setAttribute("aria-live","polite");
  status.hidden=true;
  root.querySelector(".ride-map-scene").appendChild(status);

  const locationCard=document.createElement("div");
  locationCard.id="ride-location-region";
  locationCard.className="ride-location-region";
  locationCard.hidden=true;
  locationCard.innerHTML=
    '<div class="ride-region-copy"><strong id="ride-region-name">Localização escolhida</strong>'+
    '<p>O mapa foi centralizado aqui. Ainda não existem clínicas reais cadastradas nesta demonstração; os estabelecimentos exibidos na lista são fictícios e ficam em São Paulo.</p></div>'+
    '<button type="button" id="ride-back-demo" class="ride-region-back">Ver mapa de exemplo</button>';
  root.querySelector(".ride-map-scene").appendChild(locationCard);

  const $=(selector)=>document.querySelector(selector);
  const addressInput=$("#ride-address-input");
  const addressResults=$("#ride-address-results");
  const addressForm=$("#ride-address-panel");
  const addressToggle=$("#ride-open-address");
  const searchButton=$("#ride-search-address");
  const gpsButton=$("#ride-use-gps");
  const demoCenter={lat:-23.563,lng:-46.655};
  let candidates=[];
  let lastLookup=0;
  let busy=false;
  let locationRequest=false;
  let autoChecked=false;
  let userPosition=null;
  let queryController=null;

  const isMobile=()=>window.matchMedia("(max-width:900px)").matches;
  function setStatus(message,type="info"){
    status.textContent=message;
    status.dataset.type=type;
    status.hidden=!message;
  }
  function setAddressOpen(open){
    addressForm.hidden=!open;
    addressToggle.setAttribute("aria-expanded",String(open));
    addressToggle.classList.toggle("is-active",open);
    if(open&&isMobile())addressInput.focus({preventScroll:true});
  }
  function distanceKm(a,b){
    const rad=degrees=>degrees*Math.PI/180;
    const dLat=rad(a.lat-b.lat),dLng=rad(a.lng-b.lng);
    const v=Math.sin(dLat/2)**2+Math.cos(rad(a.lat))*Math.cos(rad(b.lat))*Math.sin(dLng/2)**2;
    return 6371*2*Math.atan2(Math.sqrt(v),Math.sqrt(Math.max(0,1-v)));
  }
  function renderSelectedPosition(){
    if(!userPosition){locationCard.hidden=true;return;}
    // Mantemos os marcadores fictícios em São Paulo, sem insinuar clínicas reais próximas.
    const farFromDemo=distanceKm(userPosition,demoCenter)>25;
    locationCard.hidden=false;
    $("#ride-region-name").textContent=userPosition.label;
    const paragraph=locationCard.querySelector("p");
    paragraph.textContent=farFromDemo
      ?"Sua região foi localizada no mapa. Não há dados de clínicas reais nessa área. A lista e os preços são exemplos fictícios de São Paulo."
      :"Localização centralizada. Os marcadores de clínicas próximos continuam fictícios e não representam estabelecimentos verificados.";
    gpsButton.classList.toggle("is-active",userPosition.mode==="gps");
    gpsButton.setAttribute("aria-pressed",String(userPosition.mode==="gps"));
  }
  function selectCoordinates(lat,lng,label,mode){
    if(!window.TriGoMap.showLocation(lat,lng,label)){
      setStatus("Não foi possível ajustar o mapa. Tente abrir a aba de clínicas novamente.","error");
      return false;
    }
    userPosition={lat,lng,label,mode};
    renderSelectedPosition();
    setStatus(""); // O cartão de região já confirma a seleção sem cobrir o mapa.
    return true;
  }
  function resetToDemo(){
    window.TriGoMap.resetLocation();
    userPosition=null;
    renderSelectedPosition();
    setStatus("Voltamos à região de demonstração de São Paulo.","info");
    return true;
  }
  function useDeviceLocation(){
    if(locationRequest)return;
    if(!window.isSecureContext){
      setStatus("O GPS do navegador exige HTTPS. Digite um endereço para continuar.","error");
      setAddressOpen(true);
      return;
    }
    if(!navigator.geolocation){
      setStatus("Seu navegador não oferece geolocalização. Use a busca por endereço.","error");
      setAddressOpen(true);
      return;
    }
    locationRequest=true;
    gpsButton.disabled=true;
    setStatus("Buscando a localização autorizada no aparelho...","info");
    navigator.geolocation.getCurrentPosition(
      position=>{
        locationRequest=false;
        gpsButton.disabled=false;
        const lat=position.coords.latitude,lng=position.coords.longitude;
        if(!Number.isFinite(lat)||!Number.isFinite(lng)){
          setStatus("O aparelho retornou uma posição inválida. Digite um endereço.","error");
          return;
        }
        selectCoordinates(lat,lng,"Sua localização aproximada","gps");
        if(isMobile())setAddressOpen(false);
      },
      error=>{
        locationRequest=false;
        gpsButton.disabled=false;
        const msg=error?.code===1
          ?"A permissão de localização foi negada. Você pode habilitá-la nas configurações do navegador ou digitar o endereço."
          :error?.code===3
          ?"O GPS demorou a responder. Tente novamente ou digite um endereço."
          :"Não conseguimos obter a posição do aparelho. Digite um endereço para continuar.";
        setStatus(msg,"error");
        setAddressOpen(true);
      },
      {enableHighAccuracy:isMobile(),timeout:15000,maximumAge:120000}
    );
  }
  function clearCandidates(){
    candidates=[];
    addressResults.replaceChildren();
    addressResults.hidden=true;
  }
  function renderCandidates(items){
    clearCandidates();
    candidates=items.filter(item=>
      Number.isFinite(Number(item.lat))&&Number.isFinite(Number(item.lon))&&
      Math.abs(Number(item.lat))<=90&&Math.abs(Number(item.lon))<=180
    ).slice(0,5);
    if(!candidates.length){
      setStatus("Nenhum endereço encontrado. Experimente informar bairro, cidade e estado.","error");
      return;
    }
    for(const [index,item] of candidates.entries()){
      const button=document.createElement("button");
      button.type="button";
      button.className="ride-address-result";
      button.dataset.placeIndex=String(index);
      button.textContent=item.display_name||"Local encontrado";
      addressResults.appendChild(button);
    }
    addressResults.hidden=false;
    setStatus("Selecione o endereço correto entre os resultados encontrados.","info");
  }
  async function searchAddress(event){
    event.preventDefault();
    const query=addressInput.value.trim();
    if(query.length<4){
      setStatus("Digite pelo menos quatro caracteres, incluindo cidade ou bairro.","error");
      addressInput.focus();
      return;
    }
    if(busy)return;
    const now=Date.now();
    // Uma requisição apenas por ação explícita. Sem autocomplete.
    if(now-lastLookup<1500){
      setStatus("Aguarde um instante antes de fazer outra busca.","info");
      return;
    }
    lastLookup=now;
    busy=true;
    searchButton.disabled=true;
    searchButton.textContent="Buscando...";
    clearCandidates();
    if(queryController)queryController.abort();
    queryController=new AbortController();
    const timeout=setTimeout(()=>queryController.abort(),12000);
    try{
      const url=new URL("https://nominatim.openstreetmap.org/search");
      url.searchParams.set("format","jsonv2");
      url.searchParams.set("limit","5");
      url.searchParams.set("countrycodes","br");
      url.searchParams.set("accept-language","pt-BR");
      url.searchParams.set("q",query);
      const response=await fetch(url.toString(),{
        method:"GET",
        headers:{"Accept":"application/json"},
        referrerPolicy:"strict-origin-when-cross-origin",
        signal:queryController.signal
      });
      if(!response.ok)throw new Error("HTTP "+response.status);
      const items=await response.json();
      if(!Array.isArray(items))throw new Error("Resposta inválida");
      renderCandidates(items);
    }catch(error){
      setStatus(error?.name==="AbortError"
        ?"A busca demorou demais. Tente novamente."
        :"O serviço de endereços está indisponível. Tente mais tarde ou use o GPS.",
        "error");
    }finally{
      clearTimeout(timeout);
      busy=false;
      searchButton.disabled=false;
      searchButton.textContent="Localizar";
    }
  }
  function selectCandidate(index){
    const candidate=candidates[index];
    if(!candidate)return;
    const lat=Number(candidate.lat),lng=Number(candidate.lon);
    const name=String(candidate.display_name||"Endereço escolhido").split(",").slice(0,3).join(",").trim().slice(0,90);
    if(selectCoordinates(lat,lng,name,"address")){
      addressInput.value=name;
      clearCandidates();
      setAddressOpen(false);
    }
  }
  async function useGpsIfAlreadyGranted(){
    if(autoChecked||!isMobile()||userPosition||!navigator.permissions||!navigator.geolocation)return;
    autoChecked=true;
    try{
      const permission=await navigator.permissions.query({name:"geolocation"});
      // Solicitação automática apenas quando o usuário já concedeu permissão anteriormente.
      // Uma permissão em estado "prompt" NÃO dispara solicitação inesperada.
      if(permission.state==="granted"&&!userPosition&&location.hash.startsWith("#/clinics")){
        useDeviceLocation();
      }
    }catch{
      // Permissions API pode não ser suportada; botão GPS continua disponível.
    }
  }
  gpsButton.addEventListener("click",useDeviceLocation);
  addressToggle.addEventListener("click",()=>setAddressOpen(addressForm.hidden));
  addressForm.addEventListener("submit",searchAddress);
  addressResults.addEventListener("click",event=>{
    const btn=event.target.closest("button[data-place-index]");
    if(btn)selectCandidate(Number(btn.dataset.placeIndex));
  });
  $("#ride-back-demo").addEventListener("click",resetToDemo);
  document.addEventListener("keydown",event=>{
    if(event.key==="Escape"&&!addressForm.hidden&&addressForm.contains(document.activeElement)){
      setAddressOpen(false);
    }
  });
  // Tela PC: endereço já expandido. Celular: GPS e botão de endereço visíveis.
  if(!isMobile())setAddressOpen(true);
  window.addEventListener("trigo:screen",event=>{
    if(event.detail?.screen==="clinics"&&window.TriGo?.state?.mapMode==="map"){
      useGpsIfAlreadyGranted();
      if(userPosition)renderSelectedPosition();
    }
  });
  window.TriGoLocation={useDeviceLocation,resetToDemo};
  if(location.hash.startsWith("#/clinics"))useGpsIfAlreadyGranted();
})();
