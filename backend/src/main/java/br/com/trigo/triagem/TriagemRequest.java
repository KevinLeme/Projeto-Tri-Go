package br.com.trigo.triagem;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.OffsetDateTime;
import java.util.UUID;

public record TriagemRequest(@NotNull UUID pacienteId, @NotBlank String queixaPrincipal, String descricaoSintomas,
                             OffsetDateTime inicioSintomas, ClassificacaoRisco classificacaoSugerida,
                             @Valid SinaisVitaisRequest sinaisVitais) {}

