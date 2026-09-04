package br.com.trigo.paciente;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "pacientes")
public class Paciente {
    @Id @GeneratedValue private UUID id;
    @Column(name = "nome_completo", nullable = false) private String nomeCompleto;
    @Column(name = "nome_social") private String nomeSocial;
    @Column(name = "data_nascimento", nullable = false) private LocalDate dataNascimento;
    private String cpf;
    @Column(name = "cartao_sus") private String cartaoSus;
    private String telefone;
    private String email;
    private String alergias;
    private String comorbidades;
    private boolean ativo = true;
    @Column(name = "criado_em", updatable = false) private OffsetDateTime criadoEm;
    @Column(name = "atualizado_em") private OffsetDateTime atualizadoEm;

    @PrePersist void prePersist() { criadoEm = OffsetDateTime.now(); atualizadoEm = criadoEm; }
    @PreUpdate void preUpdate() { atualizadoEm = OffsetDateTime.now(); }
    public UUID getId() { return id; }
    public String getNomeCompleto() { return nomeCompleto; }
    public void setNomeCompleto(String value) { nomeCompleto = value; }
    public String getNomeSocial() { return nomeSocial; }
    public void setNomeSocial(String value) { nomeSocial = value; }
    public LocalDate getDataNascimento() { return dataNascimento; }
    public void setDataNascimento(LocalDate value) { dataNascimento = value; }
    public String getCpf() { return cpf; }
    public void setCpf(String value) { cpf = value; }
    public String getCartaoSus() { return cartaoSus; }
    public void setCartaoSus(String value) { cartaoSus = value; }
    public String getTelefone() { return telefone; }
    public void setTelefone(String value) { telefone = value; }
    public String getEmail() { return email; }
    public void setEmail(String value) { email = value; }
    public String getAlergias() { return alergias; }
    public void setAlergias(String value) { alergias = value; }
    public String getComorbidades() { return comorbidades; }
    public void setComorbidades(String value) { comorbidades = value; }
    public boolean isAtivo() { return ativo; }
    public OffsetDateTime getCriadoEm() { return criadoEm; }
}

