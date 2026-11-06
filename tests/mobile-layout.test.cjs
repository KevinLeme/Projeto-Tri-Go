/* Validações regressivas da interface mobile Tri'Go.
 * Execute na raiz do projeto: node --test tests/mobile-layout.test.cjs
 */
const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.join(__dirname,"..");
const html=fs.readFileSync(path.join(root,"app.html"),"utf8");
const figma=fs.readFileSync(path.join(root,"src/css/figma-refinement.css"),"utf8");
const mapCss=fs.readFileSync(path.join(root,"src/css/map-ride.css"),"utf8");

test("não duplica a barra de status do sistema no aplicativo",()=>{
  assert.doesNotMatch(html,/device-status|device-time|signal-bars|battery-symbol/);
  assert.doesNotMatch(figma,/\.device-status\s*\{/);
});
test("não reserva 44px falsos acima do mapa no celular",()=>{
  assert.match(mapCss,/inset:0 0 calc\(73px \+ env\(safe-area-inset-bottom\)\)/);
  assert.doesNotMatch(mapCss,/inset:44px 0/);
});
test("mantém as cores definidas pelo design mesmo com Android em modo escuro",()=>{
  assert.match(html,/<meta name="color-scheme" content="light">/);
  assert.match(figma,/:root\{color-scheme:only light\}/);
});
test("preserva navegação inferior e respeita área segura do aparelho",()=>{
  assert.match(figma,/\.bottom-nav\{position:fixed/);
  assert.match(figma,/safe-area-inset-bottom/);
});
