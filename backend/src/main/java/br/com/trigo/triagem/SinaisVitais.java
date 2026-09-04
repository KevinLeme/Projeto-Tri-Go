package br.com.trigo.triagem;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "triagens_sinais_vitais")
public class SinaisVitais {
    @Id @GeneratedValue private UUID id;
    @OneToOne(fetch = FetchType.LAZY) @JoinColumn(name = "triagem_id", nullable = false, unique = true) private Triagem triagem;
    @Column(name = "pressao_sistolica") private Short pressaoSistolica;
    @Column(name = "pressao_diastolica") private Short pressaoDiastolica;
    @Column(name = "frequencia_cardiaca") private Short frequenciaCardiaca;
    @Column(name = "frequencia_respiratoria") private Short frequenciaRespiratoria;
    private BigDecimal temperatura;
    @Column(name = "saturacao_oxigenio") private BigDecimal saturacaoOxigenio;
    @Column(name = "escala_dor") private Short escalaDor;
    public void setTriagem(Triagem value) { triagem = value; }
    public Short getPressaoSistolica() { return pressaoSistolica; } public void setPressaoSistolica(Short v) { pressaoSistolica = v; }
    public Short getPressaoDiastolica() { return pressaoDiastolica; } public void setPressaoDiastolica(Short v) { pressaoDiastolica = v; }
    public Short getFrequenciaCardiaca() { return frequenciaCardiaca; } public void setFrequenciaCardiaca(Short v) { frequenciaCardiaca = v; }
    public Short getFrequenciaRespiratoria() { return frequenciaRespiratoria; } public void setFrequenciaRespiratoria(Short v) { frequenciaRespiratoria = v; }
    public BigDecimal getTemperatura() { return temperatura; } public void setTemperatura(BigDecimal v) { temperatura = v; }
    public BigDecimal getSaturacaoOxigenio() { return saturacaoOxigenio; } public void setSaturacaoOxigenio(BigDecimal v) { saturacaoOxigenio = v; }
    public Short getEscalaDor() { return escalaDor; } public void setEscalaDor(Short v) { escalaDor = v; }
}

