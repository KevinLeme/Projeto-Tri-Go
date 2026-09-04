package br.com.trigo.paciente;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PacienteRepository extends JpaRepository<Paciente, UUID> {
    List<Paciente> findTop20ByNomeCompletoContainingIgnoreCaseAndAtivoTrueOrderByNomeCompleto(String nome);
    List<Paciente> findTop20ByAtivoTrueOrderByCriadoEmDesc();
}

