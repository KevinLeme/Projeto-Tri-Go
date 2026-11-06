/* Regressão: controle Mapa no PC e ausência de sobreposição no celular.
 * Execute: node --test tests/mapa-responsive.test.cjs
 */
const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const base=path.join(__dirname,"..");
const html=fs.readFileSync(path.join(base,"app.html"),"utf8");
const src=fs.readFileSync(path.join(base,"src/js/demo-experience.js"),"utf8");
const location=fs.readFileSync(path.join(base,"src/js/map-location.js"),"utf8");
const css=fs.readFileSync(path.join(base,"src/css/map-mobile-fix.css"),"utf8");

test("o PC recebe um botão visível e funcional para abrir o mapa",()=>{
  assert.match(src,/id="desktop-map-toggle"/);
  assert.match(src,/data-view="map"/);
  assert.match(src,/desktopToggle\.dataset\.view=show\?"list":"map"/);
  assert.match(src,/if\(button\.dataset\.view\)\{/);
  assert.match(css,/@media \(min-width:901px\)/);
  assert.match(css,/\.desktop-map-toggle\{\s*display:inline-flex!important/);
  assert.match(css,/\.clinics-view-switch\{display:flex!important/);
});
test("o botão muda para Ver lista quando o mapa está aberto",()=>{
  assert.match(src,/desktopToggle\.textContent=show\?"☷ Ver lista":"⌖ Abrir mapa"/);
});
function layout(mobile){
  const wrapper={children:[],querySelector(){return null;}};
  const scene={children:[],parentElement:wrapper,querySelector(sel){
    return {".ride-recenter":recenter,".ride-map-notice":notice}[sel]||null;
  }};
  const aside={parentElement:wrapper};
  const floating={parentElement:scene};
  const recenter={parentElement:scene};
  const sheet={parentElement:scene};
  const notice={parentElement:scene};
  wrapper.children=[aside,scene];
  scene.children=[floating,recenter,sheet,notice];
  wrapper.querySelector=sel=>({
    ".ride-map-scene":scene,
    ".ride-map-floating":floating,
    ".ride-map-sheet":sheet
  })[sel]||null;
  function remove(item){
    const arr=item.parentElement.children;
    const index=arr.indexOf(item);
    if(index>=0)arr.splice(index,1);
  }
  for(const node of [wrapper,scene]){
    node.appendChild=item=>{remove(item);node.children.push(item);item.parentElement=node;};
    node.insertBefore=(item,before)=>{
      remove(item);
      const index=node.children.indexOf(before);
      node.children.splice(index<0?node.children.length:index,0,item);
      item.parentElement=node;
    };
  }
  const window={matchMedia:()=>({matches:mobile}),addEventListener(){}};
  const start=src.indexOf("    const adjustMapLayout=()=>{");
  const end=src.indexOf("    const recenter=$(\"#map-my-location\");",start);
  assert.ok(start>=0&&end>start);
  const execute=new Function("wrapper","window","map","requestAnimationFrame",
    src.slice(start,end)+"\nreturn adjustMapLayout;");
  const apply=execute(wrapper,window,null,fn=>fn());
  return {wrapper,scene,floating,sheet,apply};
}
test("no celular a busca, o mapa e o cartão são irmãos na ordem certa",()=>{
  const ui=layout(true);
  assert.deepEqual(ui.wrapper.children.slice(1),[ui.floating,ui.scene,ui.sheet]);
  assert.equal(ui.floating.parentElement,ui.wrapper);
  assert.equal(ui.sheet.parentElement,ui.wrapper);
});
test("no PC os elementos voltam ao mapa de duas colunas",()=>{
  const ui=layout(false);
  assert.equal(ui.floating.parentElement,ui.scene);
  assert.equal(ui.sheet.parentElement,ui.scene);
});
test("o CSS separa as três áreas e mantém o mapa livre",()=>{
  assert.match(css,/grid-template-rows:auto minmax\(85px,1fr\) auto!important/);
  assert.match(css,/\.ride-map-layout > \.ride-map-floating\{/);
  assert.match(css,/\.ride-map-layout > \.ride-map-scene\{/);
  assert.match(css,/\.ride-map-layout > \.ride-map-sheet\{/);
  assert.match(css,/\.ride-map-sheet \.ride-address-panel\{/);
  assert.match(css,/position:static!important/);
  assert.match(location,/sheet\.insertBefore\(status,footer\)/);
  assert.match(location,/sheet\.insertBefore\(locationCard,footer\)/);
});
test("arquivos atualizados têm versão no HTML para evitar cache desatualizado",()=>{
  assert.match(html,/map-mobile-fix\.css\?v=20261105c/);
  assert.match(html,/demo-experience\.js\?v=20261105c/);
  assert.match(html,/map-location\.js\?v=20261105c/);
});
