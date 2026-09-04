package br.com.trigo.triagem;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

public record TriagemResponse(UUID id, UUID pacienteId, String pacienteNome, String queixaPrincipal, String descricaoSintomas,
    OffsetDateTime inicioSintomas, ClassificacaoRisco classificacaoSugerida, ClassificacaoRisco classificacaoFinal,
    String justificativaClassificacao, StatusTriagem status, OffsetDateTime criadoEm, SinaisVitaisResponse sinaisVitais) {
    static TriagemResponse from(Triagem t) {
        SinaisVitais s = t.getSinaisVitais();
        SinaisVitaisResponse vitais = s == null ? null : new SinaisVitaisResponse(s.getPressaoSistolica(), s.getPressaoDiastolica(), s.getFrequenciaCardiaca(), s.getFrequenciaRespiratoria(), s.getTemperatura(), s.getSaturacaoOxigenio(), s.getEscalaDor());
        return new TriagemResponse(t.getId(), t.getPaciente().getId(), t.getPaciente().getNomeCompleto(), t.getQueixaPrincipal(), t.getDescricaoSintomas(), t.getInicioSintomas(), t.getClassificacaoSugerida(), t.getClassificacaoFinal(), t.getJustificativaClassificacao(), t.getStatus(), t.getCriadoEm(), vitais);
    }
    public record SinaisVitaisResponse(Short pressaoSistolica, Short pressaoDiastolica, Short frequenciaCardiaca, Short frequenciaRespiratoria, BigDecimal temperatura, BigDecimal saturacaoOxigenio, Short escalaDor) {}
}

