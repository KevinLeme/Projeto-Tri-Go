package br.com.trigo.paciente;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Past;
import java.time.LocalDate;

public record PacienteRequest(
    @NotBlank(message = "nome completo é obrigatório") String nomeCompleto,
    String nomeSocial,
    @NotNull(message = "data de nascimento é obrigatória") @Past(message = "data de nascimento deve estar no passado") LocalDate dataNascimento,
    String cpf, String cartaoSus, String telefone, String email, String alergias, String comorbidades) {}

