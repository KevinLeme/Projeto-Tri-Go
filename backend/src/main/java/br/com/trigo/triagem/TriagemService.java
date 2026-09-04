package br.com.trigo.triagem;

import br.com.trigo.common.NotFoundException;
import br.com.trigo.paciente.PacienteService;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class TriagemService {
    private final TriagemRepository repository; private final PacienteService pacientes;
    public TriagemService(TriagemRepository repository, PacienteService pacientes) { this.repository = repository; this.pacientes = pacientes; }
    public TriagemResponse create(TriagemRequest request) {
        Triagem triagem = new Triagem(); triagem.setPaciente(pacientes.getEntity(request.pacienteId())); triagem.setQueixaPrincipal(request.queixaPrincipal());
        triagem.setDescricaoSintomas(request.descricaoSintomas()); triagem.setInicioSintomas(request.inicioSintomas()); triagem.setClassificacaoSugerida(request.classificacaoSugerida());
        if (request.sinaisVitais() != null) triagem.setSinaisVitais(toEntity(request.sinaisVitais()));
        return TriagemResponse.from(repository.save(triagem));
    }
    @Transactional(readOnly = true) public List<TriagemResponse> queue() { return repository.findTop30ByStatusNotOrderByCriadoEmDesc(StatusTriagem.FINALIZADO).stream().map(TriagemResponse::from).toList(); }
    @Transactional(readOnly = true) public TriagemResponse get(UUID id) { return TriagemResponse.from(entity(id)); }
    public TriagemResponse validate(UUID id, ValidacaoRequest request) {
        Triagem triagem = entity(id); triagem.setClassificacaoFinal(request.classificacaoFinal()); triagem.setJustificativaClassificacao(request.justificativa()); triagem.setStatus(StatusTriagem.CLASSIFICADO); return TriagemResponse.from(triagem);
    }
    private Triagem entity(UUID id) { return repository.findById(id).orElseThrow(() -> new NotFoundException("Triagem não encontrada")); }
    private SinaisVitais toEntity(SinaisVitaisRequest r) { SinaisVitais s = new SinaisVitais(); s.setPressaoSistolica(r.pressaoSistolica()); s.setPressaoDiastolica(r.pressaoDiastolica()); s.setFrequenciaCardiaca(r.frequenciaCardiaca()); s.setFrequenciaRespiratoria(r.frequenciaRespiratoria()); s.setTemperatura(r.temperatura()); s.setSaturacaoOxigenio(r.saturacaoOxigenio()); s.setEscalaDor(r.escalaDor()); return s; }
}

