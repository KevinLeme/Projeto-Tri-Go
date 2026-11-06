# Tri'Go — Três acessos e teleatendimento (MVP)

Referência: reformulação da tela inicial em novembro de 2026. Branch `front-end`.

## Objetivo de produto

Organizar a plataforma em **três perfis de acesso** sem criar três sistemas desconectados:

| Perfil | Entrada | Recursos principais | Implementado no protótipo |
|---|---|---|---|
| Paciente | `#/home` e `#/profile` | Busca e mapa, triagem informativa, consultas, histórico, sala online | Navegação e reserva fictícia, triagem e prévia local de câmera |
| Clínica | `#/clinic-portal` | Solicitação de parceria, unidade, serviços, convênios, profissionais, agenda | Formulário de exemplo com validação e prévia local, não enviado |
| Profissional | `#/professional-portal` | Verificação de credenciais, agenda, atendimentos, teletriagem ou consulta sob habilitação | Fila ilustrativa e teste local de câmera, sem paciente remoto |

Acesso inicial: `#/welcome`, com três cartões clicáveis. Paciente pode escolher triagem por perguntas, explorar clínicas ou conhecer a sala online (`#/online`).

## O que esta etapa NÃO faz

- Não existe login, autenticação, recuperação de senha ou autorização real.
- O formulário da clínica não grava nem envia cadastro; concluir a prévia **não** adiciona a clínica ao mapa.
- A sala online não realiza ligação, não conecta pacientes a profissionais e não armazena prontuário.
- O teste de câmera pede acesso somente após clique; solicita vídeo sem áudio, reproduz apenas no dispositivo local e encerra as trilhas ao sair da tela/ocultar a aba.
- Qualquer pessoa consegue navegar pelas telas de demonstração de profissional/clínica. **Nunca colocar informações reais nessas telas antes da autenticação.**

## Fluxos futuros

### Paciente
1. Entrar/criar conta (sessão e autenticação seguras).
2. Aceitar avisos de privacidade e consentimentos aplicáveis.
3. Fazer uma triagem informativa ou solicitar agendamento/teleatendimento.
4. Visualizar clínicas reais cadastradas, verificadas e próximas, além de disponibilidade atualizada.
5. Marcar, confirmar, remarcar e cancelar consultas.
6. Entrar na sala online somente quando houver profissional/atendimento agendado e autorização válida.

### Clínica
1. Criar conta institucional com verificação de identidade e papéis.
2. Enviar documentos e comprovações conforme exigido pela operação e legislação.
3. Receber status **pendente de verificação**; painel administrativo analisa.
4. Após aprovação e contratação de um plano com teste gratuito, cadastrar unidade física, geolocalização e especialidades; então exibir no mapa.
5. Gerenciar profissionais vinculados (cada profissional autenticado), horários, agenda e convênios.
6. Renovar/verificar cadastro quando informações forem alteradas.

### Profissional habilitado
1. Criar conta e vincular identidade e registro profissional compatíveis com o serviço prestado; validação manual ou via fonte competente.
2. Vincular-se a uma clínica ou atender por meio de estrutura devidamente responsável.
3. Definir disponibilidade para teleatendimento.
4. Receber apenas atendimentos para os quais está autorizado; consultar histórico conforme permissões.
5. Entrar em videossala segura com autenticação e autorização de ambas as partes.
6. Documentar o atendimento em sistemas conformes, indicar necessidade de atendimento presencial e cumprir procedimentos de segurança.

## Backend recomendado — implementar depois do front-end

- `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/me`
- `POST /api/clinics/applications` — solicitações de clínicas com status PENDENTE/EM_REVISAO/APROVADA/REJEITADA
- `GET /api/admin/clinics/applications`, `PATCH /api/admin/clinics/applications/{id}` — aprovação com log
- `GET /api/clinics` — somente clínicas aprovadas, com coordenadas verificadas
- `GET/POST /api/clinics/{id}/services`, `GET/POST /api/clinics/{id}/professionals`
- `GET /api/availability`, `POST /api/appointments` — reservas concorrentes protegidas por transação
- `POST /api/telehealth/sessions` — token efêmero vinculado a paciente, profissional e agendamento autorizados
- `POST /api/telehealth/consent` — registro de termos exigidos, sem criar uma mera caixa que substitui consentimento apropriado
- `GET /api/me/appointments`, `GET /api/professional/appointments`

### Segurança obrigatória

- Permissões no servidor por identidade, papel e vínculo com clínica: paciente jamais acessa prontuário de terceiros; clínica não acessa demais estabelecimentos.
- Isolamento de dados de pacientes, criptografia em trânsito e em repouso, registro de acesso, backups e retenção apropriada.
- Revisar LGPD para dados pessoais sensíveis de saúde e práticas de telemedicina. Não transportar imagens/dados pessoais por serviços públicos de mapa.
- Teletriagem médica é atividade própria de médico, na forma definida pela Resolução CFM 2.314/2022. A decisão de modalidade de atendimento cabe ao profissional e não deve ser determinada por protótipo.
- Para vídeo real: WebRTC via provedor seguro ou infraestrutura própria com TURN, gerenciamento de salas, autenticação, tratamento de falhas e consentimento; verificar custos, suporte e obrigações antes de contratar.
- Não usar o HTTP Basic administrativo do backend atual como autenticação de paciente ou clínica.
- Realizar testes de acessibilidade, Android/iOS, conexão instável e cancelamento de permissões.

Fonte para orientação regulatória: https://sistemas.cfm.org.br/normas/visualizar/resolucoes/BR/2022/2314

## Critérios de revisão da etapa visual

- [ ] Abertura `#/welcome` com os três acessos navegáveis.
- [ ] Paciente entra em `#/home`; encontra clínica, triagem e demonstração online.
- [ ] Perfil do paciente contém atalhos para histórico, triagem, online e clínicas.
- [ ] Clínica preenche dados fictícios, recebe prévia e pode limpar tudo; nada aparece no mapa.
- [ ] Profissional vê fila fictícia; sem paciente real associado.
- [ ] Câmera **não** é solicitada ao abrir a página.
- [ ] Câmera funciona somente com autorização explícita; desligar ou sair encerra todas as trilhas.
- [ ] Falha de permissão não trava a navegação.
- [ ] Testar responsividade em 360, 390, 430, 768 e 1366px.
- [ ] Testar com teclado e leitor de tela.
- [ ] Branch `backend` intacta.

## Ordem sugerida de implementação real

1. Aprovar fluxo de cadastro/login com perfis e verificação institucional/profissional.
2. API de clínicas aprovadas e agenda real, integrada ao mapa.
3. Agenda e reserva transacional dos profissionais.
4. Teleatendimento por vídeo, consentimento e regulação clínica.
5. Integração entre triagem, teleatendimento e agendamento com segurança e auditoria.

## Médicos independentes e planos de entrada

- Clínica verificada: Essencial R$ 29,90/mês, Gestão R$ 99/mês, Gestão Plus R$ 199/mês (30 dias grátis propostos).
- Médico vinculado à clínica: acesso pelo contrato da clínica sem segunda assinatura obrigatória.
- Médico independente: Essencial R$ 29,90/mês ou Pro R$ 49/mês (30 dias grátis propostos), com cadastro e verificação gratuitos.
- Consultório próprio: só posicionar no mapa após verificação de endereço e habilitação. Médico que atua somente online não recebe marcador de consultório fictício.
- Na demonstração, o formulário `doctor-demo-form` usa dados inventados, não registra CRM e não envia solicitações reais. Não existe pagamento, período de teste ativo nem conta autêntica.
