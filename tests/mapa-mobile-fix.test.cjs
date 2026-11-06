/* Regressões contra sobreposições e falhas de cartografia no mobile.
 * Execute: node --test tests/mapa-mobile-fix.test.cjs
 */
const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const dir=path.join(__dirname,"..");
const html=fs.readFileSync(path.join(dir,"app.html"),"utf8");
const css=fs.readFileSync(path.join(dir,"src/css/map-mobile-fix.css"),"utf8");
const location=fs.readFileSync(path.join(dir,"src/js/map-location.js"),"utf8");
const map=fs.readFileSync(path.join(dir,"src/js/demo-experience.js"),"utf8");

test("correção mobile é carregada após os estilos do mapa",()=>{
  assert.match(html,/src\/css\/map-mobile-fix\.css\?v=/);
  assert.ok(html.indexOf("map-mobile-fix.css")>html.indexOf("map-location.css"));
});
test("controles GPS e endereço saem da camada flutuante do mapa no celular",()=>{
  assert.match(location,/sheet\.insertBefore\(toolbar,footer\)/);
  assert.match(css,/\.ride-location-in-sheet/);
  assert.match(css,/\.ride-location-in-sheet \.ride-address-panel/);
  assert.match(css,/position:absolute!important/);
});
test("busca e filtros permanecem acessíveis, mas compactos",()=>{
  assert.match(css,/\.ride-map-floating/);
  assert.match(css,/\.ride-chip/);
  assert.match(css,/min-height:32px!important/);
  assert.match(css,/\.ride-map-sheet/);
});
test("não desenha barra falsa nem segundo botão de GPS em cima do mapa",()=>{
  assert.doesNotMatch(html,/<div class="device-status"/);
  assert.match(css,/\.device-status\{display:none!important\}/);
  assert.match(css,/\.ride-recenter\{display:none!important\}/);
});
test("fundo não fica preto durante falhas de carregamento dos tiles",()=>{
  assert.match(css,/background-color:#e6f1e9!important/);
  assert.match(css,/img\.leaflet-tile\{opacity:1!important\}/);
  assert.match(map,/basemaps\.cartocdn\.com\/light_all/);
  assert.match(map,/tile\.openstreetmap\.org/);
  assert.match(map,/primary\.on\("tileerror"/);
});
test("clínicas continuam clicáveis após erro do mapa",()=>{
  assert.match(map,/api\.chooseClinic\(button\.dataset\.mapFocus\)/);
  assert.match(map,/popup\.querySelector\("button"\)\.addEventListener\("click"/);
});
