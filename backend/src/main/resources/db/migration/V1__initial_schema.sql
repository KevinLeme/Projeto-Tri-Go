CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE TABLE pacientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), nome_completo VARCHAR(180) NOT NULL, nome_social VARCHAR(180),
  data_nascimento DATE NOT NULL, cpf VARCHAR(14), cartao_sus VARCHAR(30), telefone VARCHAR(20), email VARCHAR(180),
  alergias TEXT, comorbidades TEXT, ativo BOOLEAN NOT NULL DEFAULT TRUE,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(), atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW());
CREATE UNIQUE INDEX uq_paciente_cpf ON pacientes(cpf) WHERE cpf IS NOT NULL;
CREATE TABLE triagens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), paciente_id UUID NOT NULL REFERENCES pacientes(id), queixa_principal TEXT NOT NULL,
  descricao_sintomas TEXT, inicio_sintomas TIMESTAMPTZ, classificacao_sugerida VARCHAR(30), classificacao_final VARCHAR(30),
  justificativa_classificacao TEXT, algoritmo_versao VARCHAR(30) NOT NULL DEFAULT 'MVP-1', status VARCHAR(30) NOT NULL DEFAULT 'EM_TRIAGEM',
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(), finalizado_em TIMESTAMPTZ,
  CONSTRAINT chk_triagem_status CHECK (status IN ('EM_TRIAGEM','CLASSIFICADO','EM_ATENDIMENTO','FINALIZADO','CANCELADO')),
  CONSTRAINT chk_risco_sugerido CHECK (classificacao_sugerida IS NULL OR classificacao_sugerida IN ('EMERGENCIA','MUITO_URGENTE','URGENTE','POUCO_URGENTE','NAO_URGENTE')),
  CONSTRAINT chk_risco_final CHECK (classificacao_final IS NULL OR classificacao_final IN ('EMERGENCIA','MUITO_URGENTE','URGENTE','POUCO_URGENTE','NAO_URGENTE')));
CREATE INDEX idx_triagens_paciente ON triagens(paciente_id);
CREATE INDEX idx_triagens_status ON triagens(status);
CREATE INDEX idx_triagens_criado_em ON triagens(criado_em DESC);
CREATE TABLE triagens_sinais_vitais (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), triagem_id UUID NOT NULL UNIQUE REFERENCES triagens(id) ON DELETE CASCADE,
  pressao_sistolica SMALLINT, pressao_diastolica SMALLINT, frequencia_cardiaca SMALLINT, frequencia_respiratoria SMALLINT,
  temperatura NUMERIC(4,1), saturacao_oxigenio NUMERIC(5,2), escala_dor SMALLINT,
  CONSTRAINT chk_escala_dor CHECK (escala_dor IS NULL OR escala_dor BETWEEN 0 AND 10));
CREATE TABLE auditoria (
  id BIGSERIAL PRIMARY KEY, entidade VARCHAR(100) NOT NULL, entidade_id UUID NOT NULL, acao VARCHAR(50) NOT NULL,
  dados JSONB, criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW());
