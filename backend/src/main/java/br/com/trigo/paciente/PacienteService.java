package br.com.trigo.paciente;

import br.com.trigo.common.NotFoundException;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class PacienteService {
    private final PacienteRepository repository;
    public PacienteService(PacienteRepository repository) { this.repository = repository; }
    public PacienteResponse create(PacienteRequest request) { Paciente p = new Paciente(); apply(p, request); return PacienteResponse.from(repository.save(p)); }
    @Transactional(readOnly = true) public List<PacienteResponse> list(String busca) {
        List<Paciente> result = busca == null || busca.isBlank() ? repository.findTop20ByAtivoTrueOrderByCriadoEmDesc() : repository.findTop20ByNomeCompletoContainingIgnoreCaseAndAtivoTrueOrderByNomeCompleto(busca);
        return result.stream().map(PacienteResponse::from).toList();
    }
    @Transactional(readOnly = true) public Paciente getEntity(UUID id) { return repository.findById(id).filter(Paciente::isAtivo).orElseThrow(() -> new NotFoundException("Paciente não encontrado")); }
    @Transactional(readOnly = true) public PacienteResponse get(UUID id) { return PacienteResponse.from(getEntity(id)); }
    public PacienteResponse update(UUID id, PacienteRequest request) { Paciente p = getEntity(id); apply(p, request); return PacienteResponse.from(p); }
    private void apply(Paciente p, PacienteRequest r) { p.setNomeCompleto(r.nomeCompleto()); p.setNomeSocial(r.nomeSocial()); p.setDataNascimento(r.dataNascimento()); p.setCpf(blankToNull(r.cpf())); p.setCartaoSus(blankToNull(r.cartaoSus())); p.setTelefone(blankToNull(r.telefone())); p.setEmail(blankToNull(r.email())); p.setAlergias(blankToNull(r.alergias())); p.setComorbidades(blankToNull(r.comorbidades())); }
    private String blankToNull(String value) { return value == null || value.isBlank() ? null : value.trim(); }
}

