package br.gov.df.guiacidadao.model.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public record PessoaFisicaDTO(
        String nome,
        String cpfFormatado,
        String nis
) {}
