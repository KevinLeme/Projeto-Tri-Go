package br.com.trigo.paciente;

import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/pacientes")
public class PacienteController {
    private final PacienteService service;
    public PacienteController(PacienteService service) { this.service = service; }
    @GetMapping public List<PacienteResponse> list(@RequestParam(required = false) String busca) { return service.list(busca); }
    @GetMapping("/{id}") public PacienteResponse get(@PathVariable UUID id) { return service.get(id); }
    @PostMapping @ResponseStatus(HttpStatus.CREATED) public PacienteResponse create(@Valid @RequestBody PacienteRequest request) { return service.create(request); }
    @PutMapping("/{id}") public PacienteResponse update(@PathVariable UUID id, @Valid @RequestBody PacienteRequest request) { return service.update(id, request); }
}
