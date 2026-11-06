# Tri-Go — Front-end

Primeira versão navegável do Tri-Go, inspirada nas telas do Figma e preparada para celular e computador.

## Como abrir

O projeto é estático (HTML, CSS e JavaScript), sem necessidade de instalação de dependências.

- Abra o arquivo `index.html` no navegador para visualizar a landing page.
- Clique em **Iniciar Triagem** para ir ao aplicativo, ou abra `app.html`.
- No aplicativo, navegue pelas telas de início, questionário, resultado, clínicas, detalhes, simulação de agendamento, confirmação, atendimentos e perfil.
- Os links com `#/...` também permitem abrir telas diretamente, como `app.html#/clinics`.

Para hospedar: publique **a pasta raiz da branch `front-end`** em um servidor de arquivos estáticos (ex.: Cloudflare Pages). Não há etapa de build.

## Arquivos

- `index.html` — página institucional responsiva.
- `src/css/style.css` — estilos para desktop e celular da página institucional.
- `src/js/script.js` — navegação da página institucional e menu mobile.
- `app.html` — telas e componentes do aplicativo.
- `src/css/app.css` — layout responsivo das telas do aplicativo.
- `src/js/app.js` — navegação, busca, filtros, seleção de horários e agendamentos fictícios.

## Limites da versão

**Demonstração de interface — não é um serviço de saúde em produção.**

- Clínicas, avaliações, preços e horários são fictícios.
- Não há login, backend, banco de dados, reserva verdadeira ou pagamento.
- O questionário não analisa sintomas nem indica diagnósticos ou especialidades.
- Os dados digitados no aplicativo permanecem somente na memória da aba e são perdidos ao recarregar.
- O agendamento e o arquivo de calendário são apenas exemplos.
- A triagem real exigirá definição e validação de protocolos por profissionais habilitados, privacidade/LGPD e medidas de segurança antes de coletar dados de saúde.

## Verificações recomendadas

1. Abrir `index.html` no PC e no celular; testar menu e CTA.
2. No aplicativo, testar todas as abas e a navegação de voltar.
3. Testar questionário vazio, múltiplas seleções e duração.
4. Filtrar clínicas por nome, especialidade, distância e preço.
5. Selecionar uma data futura e um horário; confirmar uma reserva fictícia.
6. Testar remarcação, cancelamento e download do calendário.
7. Revisar layout em 360px, 390px, 768px e 1366px.

Branch `backend`: não modificada nesta etapa.

## Atualização — Experiência Figma (novembro/2026)

Foi adicionada a camada de demonstração das oito telas do Figma: logo oficial (arquivo JPG otimizado), filtros e cartões de clínicas, alternância lista/mapa com Leaflet e OpenStreetMap, galerias ilustrativas, especialidades, serviços, seleção de datas e horários, favoritos, convênio e cartão simulados, confirmação, calendário, remarcação e cancelamento.

- `src/js/demo-experience.js` — interações e UI complementares de todas as telas.
- `src/css/demo-experience.css` — aparência fiel ao estilo mobile e adaptação desktop.
- `src/image/trigo-logo.jpg` — versão otimizada do logo fornecido.
- `docs/FIGMA-E-FUNCIONALIDADES.md` — auditoria tela a tela, contratos de API e pontos pendentes.

**Mapa:** usa Leaflet 1.9.4 por CDN com tiles OpenStreetMap e atribuição. Depende de conexão à internet. Os pinos correspondem a locais fictícios na região da Avenida Paulista e NÃO são estabelecimentos verificados. Para produção, contratar serviço de tiles adequado à demanda e conectar a clínicas reais com endereços autorizados.

**NÃO CONECTAR DIRETAMENTE O BACKEND ATUAL À PÁGINA PÚBLICA.** A branch `backend` possui endpoints de pacientes e triagens, mas autenticação administrativa Basic e configuração de desenvolvimento; revise segurança e privacidade primeiro.


## Revisão do mapa e da triagem (novembro/2026)

- A rota `app.html#/clinics` abre o mapa demonstrativo por padrão. Em celular, a interface ocupa a tela com busca, filtros, marcadores de preço e cartão inferior; em desktop, mostra lista lateral.
- Tocar em marcador destaca a clínica no cartão e clicar em **Ver horários** abre os detalhes. Também é possível avançar e voltar entre opções.
- **Lista** retorna aos cartões tradicionais; o mapa tem fallback caso Leaflet ou os tiles externos não carreguem.
- O campo de pesquisa e os filtros atualizam os resultados do mapa. Solicitação de localização ocorre apenas quando o usuário toca no controle.
- Os ícones de sintomas e dos serviços de consulta presencial/teleconsulta foram diferenciados.
- A correção do botão **Continuar** usa `querySelectorAll` corretamente para ler várias seleções.

Regressão do questionário sem dependências extras:

```bash
node --test tests/triagem.test.cjs
```

O mapa utiliza Leaflet e OpenStreetMap. Pinos, valores, distâncias, convênios e disponibilidade são fictícios; nada representa clínicas verificadas ou diagnóstico médico.
## Atualização: mapa refinado e triagem em quatro etapas

- Mapa: aviso informativo dentro da área cartográfica (não comprimido no rodapé), ícones consistentes, marcadores fictícios mais espaçados, controle para abrir/fechar filtros, seleção de clínicas e pesquisa.
- Triagem: 1) sintomas (seleção múltipla), 2) duração/intensidade/evolução, 3) sinais de alerta e observações opcionais, 4) revisão e confirmação de caráter demonstrativo.
- Resultado: mostra **apenas o resumo das respostas**, com aviso de emergência quando aplicável. **Não gera diagnóstico, indicação de especialidade ou classificação automática de risco.**
- Respostas de sintomas permanecem somente em memória durante a sessão da aba. Nenhum dado médico é enviado ao backend, mapa ou serviço externo.
- Fluxo de demonstração: `app.html#/triage` e `app.html#/clinics`.

Verificações locais usando o Node.js (sem dependências):

```bash
node --test tests/triagem.test.cjs tests/triagem-fluxo.test.cjs tests/mapa.test.cjs
```

A publicação em Cloudflare Pages deve ser validada em navegador mobile e desktop. Para uso real é indispensável projeto clínico supervisionado, avaliação de urgências por profissionais habilitados, autenticação e requisitos legais/LGPD.
## Localização no mapa (GPS e endereço)

- **Celular:** o mapa oferece o botão **Usar minha localização**. Após o usuário autorizar a localização para o site, nas próximas visitas da mesma sessão/permissão o aplicativo pode centralizar automaticamente. Caso a permissão esteja no estado `prompt`, o sistema só solicita acesso quando a pessoa tocar no botão.
- **Computador:** a busca **Digitar endereço** fica visível no painel lateral, com pesquisa por rua, bairro ou cidade. O endereço pode ser utilizado também no celular, e o GPS pode ser utilizado no computador caso o navegador suporte.
- O endereço é consultado somente após pressionar **Localizar**. A pessoa escolhe um dos resultados; não há autocomplete nem geocodificação reversa automática.
- A busca de endereços usa a API pública **Nominatim/OpenStreetMap** apenas no protótipo. O endereço é enviado a esse terceiro ao solicitar a pesquisa, com aviso explícito na tela. Nunca informe dados sensíveis ou endereço residencial detalhado para testes. Atribuição cartográfica aparece no Leaflet.
- O protótipo usa uma busca por ação, evita consultas automáticas por tecla e limita requisições por sessão. A API pública tem limite de uso de 1 requisição/segundo e não é adequada como infraestrutura de geocodificação de um produto com usuários simultâneos; antes de lançar, contratar provedor geográfico ou executar uma instância própria.
- Coordenadas do GPS e do endereço selecionado ficam apenas na memória da aba; não são enviadas ao backend Tri-Go. O serviço de tiles recebe requisições cartográficas conforme a região mostrada, como acontece em mapas comuns.
- **Clínicas exibidas continuam fictícias em São Paulo:** localizar-se em outra cidade mostra essa região no mapa, mas **não** cria nem sugere clínicas reais próximas. É possível retornar ao mapa de demonstração.
- O serviço precisa de HTTPS e da autorização do navegador para acessar localização. Se a autorização for negada, a busca manual permanece disponível.

Regressão sem dependências: `node --test tests/mapa-localizacao.test.cjs`.


## Três acessos na tela inicial

A URL `app.html#/welcome` apresenta três perfis de navegação **demonstrativos**:

- **Paciente** → `#/home`, triagem por perguntas, clínicas, atendimentos, área pessoal e sala online `#/online`.
- **Clínica** → `#/clinic-portal`, formulário de exemplo para solicitar parceria, com prévia local, sem gravar/enviar ou publicar no mapa.
- **Profissional de saúde** → `#/professional-portal`, painel com agenda ilustrativa e teste local de câmera.

A sala online usa a API do navegador `getUserMedia` **somente após clique**, com `audio:false`. Nenhuma videoconferência WebRTC é estabelecida, nenhuma imagem é gravada ou enviada a servidores e a câmera é desligada ao sair da tela ou ocultar a aba.

Não há cadastro, login ou validação reais nesta versão. Os três acessos podem ser abertos livremente porque não possuem informações reais.

Documentação da arquitetura futura e riscos: `docs/PORTAIS-E-TELEATENDIMENTO.md`.

Verificações de regressão:
`node --test tests/portais.test.cjs`.

**Antes do lançamento:** autenticação e autorização por papel, verificação de clínicas e profissionais, backend com registros e segurança, LGPD, consentimento para teleatendimento e vídeo via infraestrutura apropriada.


## Catálogo de especialidades — navegação antes do mapa

O botão **Ver todas** da seção Especialidades da tela inicial agora abre `app.html#/specialties`, e os três cartões iniciais abrem o catálogo com a especialidade destacada.

- Catálogo visual com **18 especialidades**, pesquisa e filtro **Com clínicas de exemplo**.
- Cada cartão informa se existe clínica demonstrativa para aquela especialidade. Isso é calculado a partir das clínicas fictícias do front-end.
- Ao escolher uma especialidade com clínica de exemplo, o usuário vai ao mapa `#/clinics` com um filtro **exato** por especialidade. O filtro acompanha tanto a lista quanto os marcadores do mapa.
- O mapa permite **Alterar** a especialidade no catálogo ou **Limpar** o filtro para mostrar todas as clínicas.
- Especialidades ainda sem clínicas demonstrativas mostram um aviso no catálogo, sem sugerir disponibilidade falsa e sem criar agendamento.
- **O backend não foi alterado.** Futuramente o catálogo deverá vir de especialidades e serviços reais das clínicas verificadas.
- Testes: `node --test tests/especialidades.test.cjs`.

Para testar:
- `app.html#/home` — clicar em **Ver todas**;
- `app.html#/specialties` — buscar e escolher a especialidade;
- `app.html#/clinics` — filtrar o mapa e limpar ou trocar a seleção.



## Nova jornada (novembro/2026) — duas triagens e atendimento depois

A tela inicial do paciente `#/home` mostra **duas opções de triagem**, e não um botão independente de teleconsulta:

- **Responder formulário** `#/triage`: relato informativo gratuito, sem diagnóstico, classificação de risco ou médico remoto.
- **Vídeo com médico** `#/online`: **teletriagem médica futura**; a versão atual permite apenas prévia local da própria câmera. Não há médico conectado nem conclusão de teletriagem por vídeo.
- `#/triage-choice`: página explicativa dos dois caminhos.

Após completar o formulário, `#/result` oferece **ir até uma clínica** (mapa demonstrativo) ou **conhecer atendimento online** `#/teleconsult` (agendamento ainda não disponível). Quando a teletriagem médica real estiver funcionando, somente a conclusão do médico poderá alimentar a etapa seguinte. Se o usuário sinalizar alerta grave ou não souber avaliar os sinais, a tela prioriza procurar atendimento de urgência e não oferece agendamento não emergencial como orientação.

Modelo comercial proposto (a validar): **pacientes gratuitos para mapa/formulário**, clínica **básica gratuita** e assinatura opcional de gestão, médico com **perfil verificado gratuito** e ferramentas opcionais. Não usar comissão por pacientes encaminhados como monetização inicial.

Detalhes do fluxo, preços candidatos e restrições éticas/regulatórias: `docs/TRIAGEM-E-MODELO-DE-NEGOCIO.md`.

Teste de regressão: `node --test tests/jornada-triagem.test.cjs`.


## Planos e valores visíveis na demonstração

Os valores propostos foram incorporados à interface pública dos portais comerciais:
- `app.html#/clinic-portal`: **Básico R$ 0/mês**, **Gestão R$ 99/mês**, **Gestão Plus R$ 199/mês**;
- `app.html#/professional-portal`: **Perfil básico R$ 0/mês**, **Pro R$ 49/mês**;
- `app.html#/triage-choice` e `#/online`: formulário gratuito e teletriagem médica por vídeo com **valor ainda a definir** com os parceiros;
- `app.html#/teleconsult`: teleconsulta médica futura, com preço dependente de profissional e disponibilidade.

A seleção de planos é **apenas visual** e aparece na prévia do formulário fictício da clínica: não registra contas, não publica clínicas, não cobra, não armazena assinatura ou dados de faturamento. Os preços são **hipóteses para testes de mercado**, não oferta comercial final.

Teste: `node --test tests/planos.test.cjs`.
