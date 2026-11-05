# Tri'Go — Auditoria do Figma, Front-end e Próximas Integrações

Atualizado em 05/11/2026.

## Premissas

- Referência visual: oito quadros mobile (390×844) do Figma Tri-Go.
- Repositório: `KevinLeme/Projeto-Tri-Go`.
- Alterações de UI na branch `front-end`; branch `backend` preservada.
- O sistema em Pages é um **protótipo funcional de navegação**, não um serviço de saúde apto a receber pacientes.
- Clínicas, localizações, fotos ilustrativas, disponibilidade, convênios e preços atuais são **fictícios**.
- NENHUM sintoma resulta em diagnóstico ou especialidade recomendada por algoritmo. O nome "Ortopedia" aparece somente como exemplo visual do Figma.

## Auditoria tela por tela

| Tela do Figma | Critérios visuais | Interações previstas | Estado do protótipo |
|---|---|---|---|
| Boas-vindas e localização | Logo oficial e paleta verde, banner, CTA e aviso de privacidade | Entrar, começar questionário, introdução | Logo original comprimido incorporado, início navega; cadastro real pendente |
| Início | Cabeçalho com nome, busca, callout verde, 3 especialidades, próximos agendamentos, navegação inferior | Buscar, abrir especialidade, abrir agenda | Busca, navegação e cartão de reserva da sessão; cartões iniciais fictícios |
| Questionário de sintomas | Progresso, seis opções, seleção múltipla, duração, CTA inferior | Validar, selecionar, avançar, voltar | Seleção e validação em memória; outras etapas e validação clínica pendentes |
| Resultado da triagem | Confirmação, cartão de especialidade, aviso, clínicas | Ver opções, ordenar, reservar | Exemplo de layout com aviso explícito; sem triagem clínica, sem prioridade real |
| Mapa de clínicas | Cartões brancos, filtros, preços, badges, navegação | Busca, preço, disponibilidade, convênio, lista/mapa, pin e localização com permissão | Lista e mapa com Leaflet/OSM; pinos e distâncias fictícios, geolocalização opt-in |
| Detalhes da clínica | Hero com imagem, título, especialidades, serviços, horários e favorito | Selecionar serviço, data, horário, favorito | Opções demonstrativas e galeria ilustrativa; imagem real da clínica não cadastrada |
| Confirmação de atendimento | Revisão, paciente, plano/cartão, resumo financeiro | Revisar, editar, escolher convênio ou forma de pagamento, confirmar | Simulação. Nenhuma cobrança, validação de convênio ou reserva real |
| Agendamento confirmado | Sucesso, clínica, horário, resumo e calendário | Download ICS, detalhes, remarcar, cancelar | Simulado em memória; não envia confirmação ou bloqueia agenda real |

## Análise da branch backend

O código Spring Boot existente oferece:
- Pacientes: `GET/POST /api/pacientes`, `GET/PUT /api/pacientes/{id}`.
- Triagens: `GET/POST /api/triagens`, `GET /api/triagens/{id}`, `PATCH /api/triagens/{id}/validacao`.

Não foram localizadas APIs de clínicas, profissionais, disponibilidade, reservas, convênios ou pagamentos na revisão de arquivos Java.

**ATENÇÃO — NÃO CONECTAR O FRONT-END PÚBLICO AO BACKEND ATUAL:** `SecurityConfig` usa HTTP Basic/admin e CORS apenas para localhost; `application.yml` possui valores padrão para desenvolvimento. Antes de uso público, exigir autenticação segura, separação paciente/profissional/admin, gestão de segredos, restrição CORS, auditoria e LGPD.

## Contratos recomendados para a próxima etapa

- `GET /api/clinicas?busca=&especialidade=&convenio=&lat=&lng=`: somente clínicas cadastradas e verificadas.
- `GET /api/clinicas/{id}`: detalhes, serviços e mídias reais.
- `GET /api/clinicas/{id}/disponibilidade?data=`: vagas reais, de forma segura.
- `POST /api/agendamentos`: reservar transacionalmente, impedir concorrência.
- `GET /api/me/agendamentos`, `PATCH /api/agendamentos/{id}`, `DELETE /api/agendamentos/{id}`: histórico, remarcação e cancelamento com autorização por usuário.
- `GET /api/me`, `POST /api/auth/*`: autenticação real (nunca usar senha Basic administrativa no cliente).
- `POST /api/pagamentos/intencoes`: via gateway tokenizado, com políticas de reembolso. Nunca coletar cartão bruto no servidor.
- `GET /api/clinicas/{id}/convenios`: convênios confirmados por parceiros.

### Triagem clínica
- Elaborar protocolos e textos com profissionais habilitados.
- Definir quem pode classificar urgência, responsabilidades, logs e fluxos de emergência.
- Não colocar automaticamente "Ortopedista", "Prioridade moderada" etc. com base em sintomas sem validação.
- Dados de saúde são sensíveis (LGPD): exigir minimização, base legal, controle de acesso, criptografia, políticas de retenção, consentimentos apropriados e procedimentos de incidente.

## Testes recomendados

- [ ] Tela 360/390/430px, tablet 768px, desktop 1366px.
- [ ] Navegação e botão voltar em todas as oito telas.
- [ ] Triagem sem seleções bloqueia avanço; alerta de emergência permanece visível.
- [ ] Pesquisa e ordenação de clínicas; mapa sincroniza filtros; mapa funciona com e sem CDN.
- [ ] Geolocalização só ocorre após toque do usuário; negar permissão não quebra interface.
- [ ] Serviço, data e horário permanecem ao confirmar. Data/hora passadas não são aceitas.
- [ ] Simulação de pagamento sem dados financeiros.
- [ ] Resumo, calendário .ics, remarcação e cancelamento.
- [ ] Nenhuma clínica, distância, avaliação ou convênio fictício se apresenta como verificado.
- [ ] Logo oficial e ícones nos tamanhos corretos.
- [ ] Validar contraste, teclado, labels, tela pequena e Android/iOS.

**Nota:** verificações estáticas de HTML/JS/CSS não equivalem a testes reais no navegador. Testar o deploy Cloudflare antes de declarar a versão aprovada.
