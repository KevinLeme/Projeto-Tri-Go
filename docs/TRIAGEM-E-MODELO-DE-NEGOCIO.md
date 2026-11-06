# Tri'Go — Jornada de triagem e modelo de receita acessível

Proposta de produto, **não contrato comercial nem parecer jurídico**.
Atualização: novembro de 2026. Repositório: branch `front-end`.

## 1. Jornada definitiva pretendida

Na área do paciente, a tela inicial mostra duas formas de começar:

1. **Formulário gratuito e informativo**: usuário registra sintomas, duração, evolução e sinais de alerta; o sistema apenas organiza o relato e exibe recomendações gerais de segurança. Não diagnostica, não classifica risco e não encaminha clinicamente sem validação profissional.
2. **Teletriagem por vídeo com médico**: opção futura, com médico regularmente habilitado, agendamento, consentimento, segurança, valor divulgado antecipadamente e regulação/encaminhamento sob responsabilidade do prestador. **Não** se confunde com teleconsulta e **não** está conectada na demonstração; a câmera só faz prévia local.

A etapa seguinte ocorre somente após o formulário concluído, ou, quando existir teletriagem real, após o médico finalizar a orientação:

- **Presencial**: escolha de clínica e horário, com endereço e preço reais após integração, se não houver indicação de urgência.
- **Online**: agendar **teleconsulta médica**, que é serviço distinto da triagem e depende da avaliação profissional e adequação clínica. O paciente deve poder optar pela consulta presencial; o médico decide se a teleconsulta é suficiente.

Em indícios declarados de sintomas graves, não estimular agendamento comum como alternativa a procurar urgência; exibir aviso do SAMU 192 e buscar atendimento imediato.

O paciente também pode abrir o mapa e procurar clínicas diretamente; isso não substitui a decisão de triagem profissional.

### Estado na branch front-end

- `#/home`: botões **Responder formulário** e **Vídeo com médico** (este último abre somente prévia local).
- `#/triage-choice`: explica diferenças e permite escolher modalidade.
- `#/triage`: formulário informativo com quatro etapas.
- `#/result`: resumo e escolha de presencial ou online, exceto em alerta grave quando a urgência é enfatizada.
- `#/clinics`: mapa/lista demonstrativos de clínicas fictícias para a opção presencial.
- `#/teleconsult`: explicação da futura teleconsulta, sem agenda ou profissional real.
- `#/online`: teste isolado de câmera com áudio desativado; não contém consulta, médico ou conclusão de teletriagem.

## 2. Sugestão de preços de lançamento — hipóteses a validar

| Público | Plano | Preço proposto | Entrega prevista |
|---|---|---:|---|
| Paciente | Acesso básico | Gratuito | Mapa, formulário informativo e histórico demonstrativo |
| Clínica verificada | Essencial | R$ 29,90/mês | Perfil no mapa e contato, após verificação. Sem agenda integrada |
| Clínica verificada | Gestão | R$ 99/mês | Agenda com até 2 profissionais, horários e solicitações |
| Clínica verificada | Gestão Plus | R$ 199/mês | Até 5 agendas, lembretes com franquia e relatórios |
| Médico vinculado a clínica parceira | Acesso pela clínica | Sem mensalidade extra obrigatória | Utiliza o plano contratado pela instituição |
| Médico independente | Essencial | R$ 29,90/mês | Perfil verificado, consultório próprio ou atendimento online quando habilitado |
| Médico independente | Pro | R$ 49/mês | Agenda pessoal, horários e ferramentas administrativas |

*Todos os planos pagos têm proposta de 30 dias gratuitos de teste (condições futuras ainda não implementadas). O cadastro para verificação é gratuito, mas a publicação independente de clínica/médico depende de plano após o teste. Esses valores não são preços testados em mercado. A cobrança efetiva, emissões fiscais, política de cancelamento, contrato e margens dependem de pesquisa e validação jurídica/operacional.*

- Médico já vinculado a clínica assinante **não paga outra assinatura obrigatória** para trabalhar na agenda da clínica.
- O custo da teletriagem médica por vídeo e da teleconsulta deve ser informado **antes** de contratar, de acordo com condições da prestação, remuneração médica e custos reais da plataforma. Evitar valores arbitrariamente baixos e promessas de médico grátis sem subsídio.
- Eventuais teletriagens subsidiadas por parceiros precisam ter fonte de financiamento transparente, disponibilidade real e regras éticas validadas.
- Um prestador não deve comprar uma posição escondida no ranking clínico; ordenação por distância, especialidade e disponibilidade deve ser transparente. Conteúdo publicitário, se criado, deve estar sinalizado.

### Por que evitar comissão por consulta/paciente encaminhado

O **artigo 59 do Código de Ética Médica** proíbe ao médico oferecer ou aceitar remuneração/vantagens por paciente encaminhado ou recebido. Portanto, **não utilizar comissão por indicação de paciente ou percentual do ato médico como modelo inicial** sem análise jurídica e ética detalhada, inclusive da configuração societária e dos contratos.

Preferência: **assinaturas de software e infraestrutura efetivamente prestados** à clínica e ao profissional, separadas do valor da consulta. Taxas fixas por uso de software, se consideradas no futuro, só depois de análise da estrutura do serviço e riscos de caracterização como comissão.

## 3. O que pagaria as contas do Tri'Go

Receitas potenciais:
- Assinaturas B2B de gestão de clínicas (base principal).
- Assinaturas de presença profissional e ferramentas administrativas para médicos independentes.
- Infraestrutura e ferramentas contratadas por prestadores, quando permitido e com prestação de serviço clara.

Custos importantes:
- Hospedagem, banco, backups, domínio e segurança;
- Geocodificação/mapas em produção (API pública do Nominatim não foi projetada para escala);
- Videochamadas seguras (salas, sinalização, TURN, largura de banda e provedores);
- Prontuário, proteção de dados sensíveis de saúde, auditorias, suporte e governança;
- Gateway de pagamento, inadimplência, impostos e operação;
- Verificação de médicos, clínicas e conformidade regulatória.

Os 30 dias gratuitos exigem controle de início/fim, proteção contra múltiplas contas abusivas, regras claras de cancelamento e política de cobrança previamente consentida. Nenhuma cobrança automática é aplicada no protótipo. A rentabilidade não deve ser calculada apenas pela quantidade de usuários. Precisamos medir custo por clínica ativa e por minuto/sessão de vídeo, taxas, suporte e CAC.

## 4. Segurança, medicina e privacidade antes de produção

- CFM 2.314/2022, art. 11: teletriagem é ato de médico e exige que o sistema de saúde garanta regulação para o encaminhamento. Não liberar teletriagem sem profissionais/fluxos reais.
- CFM 2.314/2022, arts. 15–17: consentimento para telemedicina, valores ajustados antes do serviço e responsabilidades/registro de prestadoras e plataformas conforme enquadramento aplicável.
- Código de Ética Médica, art. 59: evitar remuneração por encaminhamentos.
- CFM 2.336/2023: regras de publicidade e divulgação de preços, qualificação profissional e identificação adequada.
- LGPD: sintomas e prontuários são dados sensíveis; só coletar com finalidade adequada, acesso autorizado, retenção segura, consentimento/bases legais apropriadas e segurança.
- Não colocar credenciais administrativas, links genéricos de vídeo nem históricos de pacientes no front-end sem autenticação.
- Não realizar análise diagnóstica ou de risco automática com base apenas nas respostas do protótipo.

Referências:
- https://sistemas.cfm.org.br/normas/visualizar/resolucoes/BR/2022/2314
- https://transparencia.cfm.org.br/codigo-de-etica-medica/
- https://publicidademedica.cfm.org.br/manual/aplicacao-pratica/capitulo-8

## 5. Próximas fases

1. Validar visualmente `#/home`, `#/triage-choice`, `#/result`, `#/teleconsult` em desktop e celular.
2. Construir conta e verificação institucional de clínicas e profissionais.
3. Integrar clínicas aprovadas ao mapa, sem pagamentos por posição escondida.
4. Criar agenda real com reservas protegidas e autenticação por perfil.
5. Planejar teletriagem médica e teleconsulta com responsável técnico, consentimento, contrato com prestadores e infraestrutura de vídeo segura.
6. Piloto comercial com poucos parceiros para validar preços, uso, satisfação e custo antes de escalar.
