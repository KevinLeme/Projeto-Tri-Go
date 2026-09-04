package br.com.trigo.triagem;

import br.com.trigo.paciente.Paciente;
import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "triagens")
public class Triagem {
    @Id @GeneratedValue private UUID id;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "paciente_id", nullable = false) private Paciente paciente;
    @Column(name = "queixa_principal", nullable = false) private String queixaPrincipal;
    @Column(name = "descricao_sintomas") private String descricaoSintomas;
    @Column(name = "inicio_sintomas") private OffsetDateTime inicioSintomas;
    @Enumerated(EnumType.STRING) @Column(name = "classificacao_sugerida") private ClassificacaoRisco classificacaoSugerida;
    @Enumerated(EnumType.STRING) @Column(name = "classificacao_final") private ClassificacaoRisco classificacaoFinal;
    @Column(name = "justificativa_classificacao") private String justificativaClassificacao;
    @Column(name = "algoritmo_versao") private String algoritmoVersao = "MVP-1";
    @Enumerated(EnumType.STRING) private StatusTriagem status = StatusTriagem.EM_TRIAGEM;
    @Column(name = "criado_em", updatable = false) private OffsetDateTime criadoEm;
    @Column(name = "finalizado_em") private OffsetDateTime finalizadoEm;
    @OneToOne(mappedBy = "triagem", cascade = CascadeType.ALL, orphanRemoval = true) private SinaisVitais sinaisVitais;
    @PrePersist void prePersist() { criadoEm = OffsetDateTime.now(); }
    public UUID getId() { return id; }
    public Paciente getPaciente() { return paciente; }
    public void setPaciente(Paciente value) { paciente = value; }
    public String getQueixaPrincipal() { return queixaPrincipal; }
    public void setQueixaPrincipal(String value) { queixaPrincipal = value; }
    public String getDescricaoSintomas() { return descricaoSintomas; }
    public void setDescricaoSintomas(String value) { descricaoSintomas = value; }
    public OffsetDateTime getInicioSintomas() { return inicioSintomas; }
    public void setInicioSintomas(OffsetDateTime value) { inicioSintomas = value; }
    public ClassificacaoRisco getClassificacaoSugerida() { return classificacaoSugerida; }
    public void setClassificacaoSugerida(ClassificacaoRisco value) { classificacaoSugerida = value; }
    public ClassificacaoRisco getClassificacaoFinal() { return classificacaoFinal; }
    public void setClassificacaoFinal(ClassificacaoRisco value) { classificacaoFinal = value; }
    public String getJustificativaClassificacao() { return justificativaClassificacao; }
    public void setJustificativaClassificacao(String value) { justificativaClassificacao = value; }
    public StatusTriagem getStatus() { return status; }
    public void setStatus(StatusTriagem value) { status = value; }
    public OffsetDateTime getCriadoEm() { return criadoEm; }
    public OffsetDateTime getFinalizadoEm() { return finalizadoEm; }
    public void setFinalizadoEm(OffsetDateTime value) { finalizadoEm = value; }
    public SinaisVitais getSinaisVitais() { return sinaisVitais; }
    public void setSinaisVitais(SinaisVitais value) { sinaisVitais = value; if (value != null) value.setTriagem(this); }
}

