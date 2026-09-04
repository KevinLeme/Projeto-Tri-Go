package br.com.trigo.triagem;

import jakarta.validation.constraints.NotNull;

public record ValidacaoRequest(@NotNull ClassificacaoRisco classificacaoFinal, String justificativa) {}

