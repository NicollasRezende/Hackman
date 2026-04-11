package br.gov.df.guiacidadao.model.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public record CepResponse(
        String cep, String state, String city,
        String neighborhood, String street
) {}
