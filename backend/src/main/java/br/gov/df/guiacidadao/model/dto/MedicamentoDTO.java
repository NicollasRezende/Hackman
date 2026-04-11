package br.gov.df.guiacidadao.model.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public record MedicamentoDTO(
        String nomeProduto,
        String empresa,
        String processo,
        String registro
) {}
