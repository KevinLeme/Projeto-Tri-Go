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

