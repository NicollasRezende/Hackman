package br.gov.df.guiacidadao.model.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public record TcuCertidaoDTO(
        String cpfCnpj,
        boolean possuiContas,
        boolean possuiIrregularidades,
        String situacao,
        String mensagem
) {}
