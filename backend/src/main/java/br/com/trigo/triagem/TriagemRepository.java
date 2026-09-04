package br.com.trigo.triagem;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TriagemRepository extends JpaRepository<Triagem, UUID> {
    List<Triagem> findTop30ByStatusNotOrderByCriadoEmDesc(StatusTriagem status);
}

