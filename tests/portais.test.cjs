/* Testes de regressão dos três acessos do Tri'Go.
 * Executar na raiz: node --test tests/portais.test.cjs
 */
const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.join(__dirname,"..");
const html=fs.readFileSync(path.join(root,"app.html"),"utf8");
const router=fs.readFileSync(path.join(root,"src/js/app.js"),"utf8");
const portal=fs.readFileSync(path.join(root,"src/js/portal.js"),"utf8");

test("os três acessos estão na tela de entrada",()=>{
  assert.match(html,/data-go="home"[\s\S]*?Acessar como paciente/);
  assert.match(html,/data-go="clinic-portal"[\s\S]*?Conhecer área da clínica/);
  assert.match(html,/data-go="professional-portal"[\s\S]*?Conhecer área profissional/);
});
test("todas as novas rotas constam da navegação",()=>{
  for(const route of ["online","clinic-portal","professional-portal"]){
    assert.match(router,new RegExp('"'+route+'"'));
    assert.match(html,new RegExp('id="screen-'+route+'"'));
  }
});
test("paciente pode acessar triagem, sala online e sua própria área",()=>{
  assert.match(html,/id="screen-home"[\s\S]*?data-go="online"/);
  assert.match(html,/id="screen-profile"[\s\S]*?data-go="bookings"/);
});
test("cadastro de clínicas é simulação e não publica no mapa",()=>{
  assert.match(html,/id="clinic-demo-form"/);
  assert.match(portal,/clinicForm\.addEventListener\("submit"/);
  assert.doesNotMatch(portal,/\bfetch\s*\(|\bXMLHttpRequest\b|localStorage|sessionStorage/);
  assert.match(html,/não envia nem armazena dados/i);
});
test("câmera não solicita microfone nem transmite vídeo",()=>{
  assert.match(portal,/getUserMedia\(\{/);
  assert.match(portal,/audio:false/);
  assert.doesNotMatch(portal,/RTCPeerConnection|MediaRecorder|WebSocket|\bfetch\s*\(/);
  assert.match(portal,/getTracks\(\)\.forEach\(track=>track\.stop\(\)\)/);
});
test("a câmera não liga na abertura e é encerrada ao sair",async()=>{
  let requested=0,stopped=0;
  const callbacks={};
  function area(role){
    const video={hidden:true,srcObject:null,paused:false,
      pause(){this.paused=true;},play:async()=>{}};
    const controls={};
    controls['[data-camera-start="'+role+'"]']={disabled:false};
    controls['[data-camera-stop="'+role+'"]']={disabled:true};
    controls['[data-camera-status="'+role+'"]']={textContent:""};
    controls["[data-camera-preview]"]=video;
    controls[".portal-camera-placeholder"]={hidden:false};
    return {controls,querySelector(query){return controls[query]||null;}};
  }
  const patientArea=area("patient"),professionalArea=area("professional");
  const form={addEventListener(name,fn){callbacks["clinic-"+name]=fn;}};
  const document={
    hidden:false,
    querySelector(query){return ({
      "#screen-online":patientArea,
      "#screen-professional-portal":professionalArea,
      "#clinic-demo-form":form
    })[query]||null;},
    addEventListener(name,fn){callbacks["document-"+name]=fn;}
  };
  const window={
    isSecureContext:true,
    addEventListener(name,fn){callbacks["window-"+name]=fn;}
  };
  const navigator={mediaDevices:{getUserMedia:async(settings)=>{
    requested++;assert.equal(settings.audio,false);
    return {getTracks:()=>[{stop(){stopped++;}}]};
  }}};
  const location={hash:"#/online"};
  new Function("window","document","navigator","location","FormData",portal)(
    window,document,navigator,location,class{}
  );
  assert.equal(requested,0,"a câmera não deve ligar automaticamente");
  assert.equal(patientArea.controls["[data-camera-preview]"].hidden,true);
  const startButton={dataset:{cameraStart:"patient"},closest(sel){return sel==="[data-camera-start]"?this:null;}};
  callbacks["document-click"]({target:startButton,preventDefault(){}});
  await Promise.resolve();await Promise.resolve();await Promise.resolve();
  assert.equal(requested,1);
  assert.equal(patientArea.controls["[data-camera-preview]"].hidden,false);
  location.hash="#/home";
  callbacks["window-trigo:screen"]({detail:{screen:"home"}});
  assert.equal(stopped,1,"sair do atendimento deve desligar a câmera");
  assert.equal(patientArea.controls["[data-camera-preview]"].hidden,true);
});
