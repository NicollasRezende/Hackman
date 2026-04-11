package br.gov.df.guiacidadao.model.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonIgnoreProperties(ignoreUnknown = true)
public record TcuLicitanteInidoneDTO(
        @JsonProperty("CPF_CNPJ") String cpfCnpj,
        @JsonProperty("NOME") String nome,
        @JsonProperty("DELIBERACAO") String deliberacao,
        @JsonProperty("PROCESSO") String processo,
        @JsonProperty("DATA_INICIO") String dataInicio,
        @JsonProperty("DATA_FINAL") String dataFinal,
        @JsonProperty("TIPO_PESSOA") String tipoPessoa
) {}
