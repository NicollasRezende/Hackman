package br.gov.df.guiacidadao.model.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public record BolsaFamiliaDTO(
        String mesReferencia,
        String municipio,
        String uf,
        Double valor
) {}
