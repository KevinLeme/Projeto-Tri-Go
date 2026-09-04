package br.com.trigo.triagem;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import java.math.BigDecimal;

public record SinaisVitaisRequest(Short pressaoSistolica, Short pressaoDiastolica, Short frequenciaCardiaca,
    Short frequenciaRespiratoria, BigDecimal temperatura, BigDecimal saturacaoOxigenio,
    @Min(value = 0, message = "dor deve ser entre 0 e 10") @Max(value = 10, message = "dor deve ser entre 0 e 10") Short escalaDor) {}

