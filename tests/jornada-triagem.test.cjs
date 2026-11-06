/* Jornada Tri'Go: escolha da triagem e do atendimento sem simular um médico.
 * Executar na raiz: node --test tests/jornada-triagem.test.cjs
 */
const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.join(__dirname,"..");
const html=fs.readFileSync(path.join(root,"app.html"),"utf8");
const app=fs.readFileSync(path.join(root,"src/js/app.js"),"utf8");
const triage=fs.readFileSync(path.join(root,"src/js/triage-flow.js"),"utf8");
const camera=fs.readFileSync(path.join(root,"src/js/portal.js"),"utf8");

function renderReport(report){
  const reco={innerHTML:"",insertAdjacentElement(){}};
  const older={hidden:false},examples={hidden:false};
  const heading={textContent:""};
  const box={innerHTML:"",id:"triage-result-details"};
  const screen={
    querySelector(selector){
      return ({
        ".recommendation":reco,
        ".demo-priority":older,
        "#triage-map-preview":examples,
        "#triage-result-details":box,
        ".section-heading h2":heading
      })[selector]||null;
    }
  };
  const document={getElementById:id=>id==="screen-result"?screen:null,createElement:()=>box};
  const api={state:{triageReport:report}};
  const labels={warning:{"Sim":"Sim, percebe sinal de alerta","Não percebi":"Não percebeu os sinais citados","Não sei":"Não tem certeza"}};
  const resultRow=(label,value)=>"<span>"+label+": "+value+"</span>";
  const a=triage.indexOf("  function renderResult(){");
  const b=triage.indexOf('  $("#complete-triage").addEventListener',a);
  assert.ok(a>=0 && b>a,"renderResult não encontrado");
  new Function("document","api","resultRow","labels",triage.slice(a,b)+"\nrenderResult();")(document,api,resultRow,labels);
  return {reco,box,examples};
}
const report={
  symptoms:["Febre"],duration:"Hoje",intensity:"Leve",
  trend:"Está igual",warning:"Não percebi",notes:""
};

test("início oferece formulário gratuito e vídeo com médico, sem botão independente de consulta",()=>{
  const home=html.slice(html.indexOf('id="screen-home"'),html.indexOf('id="screen-specialties"'));
  assert.match(home,/class="home-triage-actions"/);
  assert.match(home,/data-go="triage"/);
  assert.match(home,/data-go="online"/);
  assert.match(home,/Em desenvolvimento · prévia/);
  assert.doesNotMatch(home,/class="home-telehealth"/);
});
test("rota intermediária esclarece as duas formas de triagem",()=>{
  assert.match(html,/id="screen-triage-choice"/);
  assert.match(html,/COM MÉDICO · EM DESENVOLVIMENTO/);
  assert.match(app,/"triage-choice"/);
});
test("sem respostas não apresenta escolha de atendimento",()=>{
  const {box}=renderReport(null);
  assert.match(box.innerHTML,/Iniciar questionário/);
  assert.doesNotMatch(box.innerHTML,/data-go="teleconsult"/);
});
test("após formulário sem sinais relatados oferece presencial ou teleconsulta",()=>{
  const {box,examples}=renderReport(report);
  assert.match(box.innerHTML,/data-go="clinics"/);
  assert.match(box.innerHTML,/data-go="teleconsult"/);
  assert.equal(examples.hidden,true);
});
test("sinal de alerta não direciona a agendamento de rotina",()=>{
  for(const warning of ["Sim","Não sei"]){
    const {box}=renderReport({...report,warning});
    assert.match(box.innerHTML,/triage-care-urgent/);
    assert.match(box.innerHTML,/192/);
    assert.doesNotMatch(box.innerHTML,/data-go="teleconsult"/);
    assert.doesNotMatch(box.innerHTML,/data-go="clinics"/);
  }
});
test("teletriagem por vídeo não finge ser consulta concluída",()=>{
  const video=html.slice(html.indexOf('id="screen-online"'),html.indexOf('id="screen-clinic-portal"'));
  const future=html.slice(html.indexOf('id="screen-teleconsult"'),html.indexOf('id="screen-online"'));
  assert.match(video,/não existe atendimento médico conectado/i);
  assert.match(video,/apenas teste local de câmera/i);
  assert.match(future,/Ainda não temos profissionais ou horários reais conectados/);
  assert.match(camera,/audio:false/);
});
