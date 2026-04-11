package br.gov.df.guiacidadao.model.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public record FarmaciaDTO(
        String nomeFantasia,
        String endereco,
        String bairro,
        String telefone
) {}
