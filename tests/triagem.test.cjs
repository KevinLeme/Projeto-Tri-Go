/*
 * Smoke/regressão do questionário de sintomas.
 * Executar na raiz do repositório: node --test tests/triagem.test.cjs
 * Não exige dependências e não envia dados ao backend.
 */
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const source = fs.readFileSync(path.join(__dirname, "..", "src", "js", "app.js"), "utf8");
const first = source.indexOf("  function validateTriage() {");
const last = source.indexOf("  function continueAppointment()", first);
assert.ok(first >= 0 && last > first, "Não foi possível localizar a função de triagem");
const validator = source.slice(first, last);

function simulate(symptomValues, durationValue) {
  const state = {};
  const error = { hidden: true };
  let destination = null;
  const $ = (selector) => {
    if (selector === "#triage-error") return error;
    if (selector === 'input[name="duration"]:checked')
      return durationValue ? { value: durationValue } : null;
    return null;
  };
  const $$ = (selector) =>
    selector === 'input[name="symptom"]:checked'
      ? symptomValues.map((value) => ({ value }))
      : [];
  const handler = new Function(
    "$", "$$", "state", "navigate",
    validator + "\nvalidateTriage();"
  );
  handler($, $$, state, (route) => { destination = route; });
  return { destination, error, state };
}

test("continua para o resultado com sintoma e duração selecionados", () => {
  const response = simulate(["Falta de ar"], "2–3 dias");
  assert.equal(response.destination, "result");
  assert.equal(response.error.hidden, true);
  assert.deepEqual(response.state.triageSymptoms, ["Falta de ar"]);
});

test("aceita seleção múltipla de sintomas", () => {
  const response = simulate(["Febre", "Náusea"], "Hoje");
  assert.equal(response.destination, "result");
  assert.deepEqual(response.state.triageSymptoms, ["Febre", "Náusea"]);
});

test("não permite avançar sem sintoma", () => {
  const response = simulate([], "Hoje");
  assert.equal(response.destination, null);
  assert.equal(response.error.hidden, false);
});

test("não permite avançar sem duração", () => {
  const response = simulate(["Dor de cabeça"], null);
  assert.equal(response.destination, null);
  assert.equal(response.error.hidden, false);
});
