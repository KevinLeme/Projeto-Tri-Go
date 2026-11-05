/* Regressões de localização do mapa Tri'Go.
 * Rodar na raiz: node --test tests/mapa-localizacao.test.cjs
 * Sem acesso externo: DOM, GPS e geocodificador são simulados.
 */
const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const source=fs.readFileSync(path.join(__dirname,"..","src","js","map-location.js"),"utf8");

function mount({mobile=false,permission="prompt",places=[]}={}){
  const nodes={},record={places:[],gpsCalls:0,queries:[],reset:0,parents:{}};
  function element(id){
    if(nodes[id])return nodes[id];
    const el={
      id,hidden:false,disabled:false,value:"",textContent:"",innerHTML:"",
      dataset:{},attributes:{},children:[],handlers:{},
      classList:{add(){},remove(){},toggle(){}},
      setAttribute(name,value){this.attributes[name]=value;},
      getAttribute(name){return this.attributes[name];},
      addEventListener(name,callback){this.handlers[name]=callback;},
      appendChild(child){this.children.push(child);record.parents[child.id]=id;return child;},
      insertBefore(child){this.children.push(child);record.parents[child.id]=id;return child;},
      replaceChildren(){this.children=[];},
      querySelector(selector){
        if(selector===".ride-sidebar-list")return element("sidebar-list");
        if(selector==="p")return element("region-description");
        return null;
      },
      focus(){}
    };
    nodes[id]=el;
    return el;
  }
  const root=element("demo-map-wrap");
  root.querySelector=selector=>({
    ".ride-map-floating":element("floating"),
    ".ride-map-sidebar":element("sidebar"),
    ".ride-map-scene":element("scene")
  })[selector]||null;
  element("sidebar").querySelector=selector=>selector===".ride-sidebar-list"?element("sidebar-list"):null;
  const document={
    getElementById:id=>id==="demo-map-wrap"?root:element(id),
    querySelector:selector=>selector.startsWith("#")?element(selector.slice(1)):null,
    createElement:tag=>element(tag+"-"+Object.keys(nodes).length),
    addEventListener(){},
    activeElement:element("ride-address-input")
  };
  const window={
    isSecureContext:true,
    matchMedia:query=>({matches:mobile?query.includes("max-width"):query.includes("min-width")}),
    TriGoMap:{
      showLocation:(...values)=>{record.places.push(values);return true;},
      resetLocation:()=>{record.reset++;}
    },
    addEventListener(){},
    TriGo:{state:{mapMode:"map"}}
  };
  const navigator={
    permissions:{query:async()=>({state:permission})},
    geolocation:{
      getCurrentPosition:onSuccess=>{
        record.gpsCalls++;
        onSuccess({coords:{latitude:-21.56,longitude:-45.43}});
      }
    }
  };
  const fetch=async url=>{
    record.queries.push(String(url));
    return {ok:true,json:async()=>places};
  };
  const execute=new Function(
    "window","document","navigator","location","fetch",
    "setTimeout","clearTimeout","AbortController","URL",
    source
  );
  execute(window,document,navigator,{hash:"#/clinics"},fetch,()=>1,()=>{},AbortController,URL);
  return {nodes,record,window};
}

test("PC exibe formulário de endereço no painel lateral",()=>{
  const {nodes,record}=mount();
  assert.equal(nodes["ride-address-panel"].hidden,false);
  const container=Object.entries(record.parents).find(([child])=>child.startsWith("div-"));
  assert.equal(container?.[1],"sidebar");
});

test("celular mantém campo manual fechado e não pede GPS sem autorização",async()=>{
  const {nodes,record}=mount({mobile:true,permission:"prompt"});
  await Promise.resolve();
  await Promise.resolve();
  assert.equal(nodes["ride-address-panel"].hidden,true);
  assert.equal(record.gpsCalls,0);
});

test("celular reutiliza GPS quando a permissão já foi concedida",async()=>{
  const {record}=mount({mobile:true,permission:"granted"});
  await Promise.resolve();
  await Promise.resolve();
  assert.equal(record.gpsCalls,1);
  assert.deepEqual(record.places[0],[-21.56,-45.43,"Sua localização aproximada"]);
});

test("busca por endereço só consulta API após envio explícito",async()=>{
  const {nodes,record}=mount({places:[{
    lat:"-21.56",lon:"-45.43",
    display_name:"Centro, Varginha, Minas Gerais, Brasil"
  }]});
  assert.equal(record.queries.length,0);
  nodes["ride-address-input"].value="Centro, Varginha, MG";
  await nodes["ride-address-panel"].handlers.submit({preventDefault(){}});
  assert.equal(record.queries.length,1);
  assert.match(record.queries[0],/nominatim\.openstreetmap\.org\/search/);
  assert.equal(nodes["ride-address-results"].children.length,1);
  const button=nodes["ride-address-results"].children[0];
  button.dataset.placeIndex="0";
  nodes["ride-address-results"].handlers.click({
    target:{closest:()=>button}
  });
  assert.deepEqual(record.places[0],[-21.56,-45.43,"Centro, Varginha, Minas Gerais"]);
  assert.equal(nodes["ride-address-panel"].hidden,true);
});

test("busca muito curta não expõe consulta externa",async()=>{
  const {nodes,record}=mount();
  nodes["ride-address-input"].value="SP";
  await nodes["ride-address-panel"].handlers.submit({preventDefault(){}});
  assert.equal(record.queries.length,0);
});

test("retornar à demonstração não conserva marcador de localização",()=>{
  const {nodes,record,window}=mount();
  window.TriGoLocation.resetToDemo();
  assert.equal(record.reset,1);
  assert.equal(Object.values(nodes).find(element=>element.id==="ride-location-region")?.hidden,true);
});
