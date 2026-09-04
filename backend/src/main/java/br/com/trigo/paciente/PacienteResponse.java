package br.com.trigo.paciente;

import java.time.LocalDate;
import java.util.UUID;

public record PacienteResponse(UUID id, String nomeCompleto, String nomeSocial, LocalDate dataNascimento, String cpf,
                               String cartaoSus, String telefone, String email, String alergias, String comorbidades) {
    static PacienteResponse from(Paciente p) {
        return new PacienteResponse(p.getId(), p.getNomeCompleto(), p.getNomeSocial(), p.getDataNascimento(), p.getCpf(),
            p.getCartaoSus(), p.getTelefone(), p.getEmail(), p.getAlergias(), p.getComorbidades());
    }
}

