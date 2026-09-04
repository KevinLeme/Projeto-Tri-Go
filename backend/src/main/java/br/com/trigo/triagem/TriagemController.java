package br.com.trigo.triagem;

import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/triagens")
public class TriagemController {
    private final TriagemService service;
    public TriagemController(TriagemService service) { this.service = service; }
    @GetMapping public List<TriagemResponse> queue() { return service.queue(); }
    @GetMapping("/{id}") public TriagemResponse get(@PathVariable UUID id) { return service.get(id); }
    @PostMapping @ResponseStatus(HttpStatus.CREATED) public TriagemResponse create(@Valid @RequestBody TriagemRequest request) { return service.create(request); }
    @PatchMapping("/{id}/validacao") public TriagemResponse validate(@PathVariable UUID id, @Valid @RequestBody ValidacaoRequest request) { return service.validate(id, request); }
}
